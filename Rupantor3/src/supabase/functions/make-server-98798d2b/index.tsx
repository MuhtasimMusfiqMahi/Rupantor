import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Root health check - test if function is responding
app.get('/', (c) => {
  return c.json({ 
    status: 'Edge Function is running', 
    timestamp: new Date().toISOString(),
    message: 'make-server-98798d2b function is running'
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper to verify auth
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Signup
app.post('/signup', async (c) => {
  try {
    const { email, password, name, role, team } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (!['admin', 'volunteer', 'public'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role, team },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user info in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      team,
      created_at: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user by email
app.get('/users/by-email/:email', async (c) => {
  try {
    const email = decodeURIComponent(c.req.param('email'));
    console.log('Looking up user by email:', email);
    
    // Get all users and find by email
    const users = await kv.getByPrefix('user:');
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user });
  } catch (error) {
    console.log('Get user by email error:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// Get all events
app.get('/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    return c.json({ events: events || [] });
  } catch (error) {
    console.log('Get events error:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Create event (admin only)
app.post('/events', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const eventData = await c.req.json();
    const eventId = `event:${Date.now()}`;
    
    const event = {
      id: eventId,
      ...eventData,
      likes: [],
      comments: [],
      registrations: [],
      created_at: new Date().toISOString()
    };

    await kv.set(eventId, event);
    return c.json({ event });
  } catch (error) {
    console.log('Create event error:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Update event (admin only)
app.patch('/events/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const eventId = c.req.param('id');
    const event = await kv.get(eventId);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const updates = await c.req.json();
    const updatedEvent = {
      ...event,
      ...updates,
      // Preserve these fields
      id: event.id,
      likes: event.likes,
      comments: event.comments,
      registrations: event.registrations,
      created_at: event.created_at
    };

    await kv.set(eventId, updatedEvent);
    return c.json({ event: updatedEvent });
  } catch (error) {
    console.log('Update event error:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

// Like event
app.post('/events/:id/like', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    const event = await kv.get(eventId);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const likes = event.likes || [];
    if (likes.includes(user.id)) {
      // Unlike
      event.likes = likes.filter((id: string) => id !== user.id);
    } else {
      // Like
      event.likes = [...likes, user.id];
    }

    await kv.set(eventId, event);
    return c.json({ event });
  } catch (error) {
    console.log('Like event error:', error);
    return c.json({ error: 'Failed to like event' }, 500);
  }
});

// Comment on event
app.post('/events/:id/comment', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const eventId = c.req.param('id');
    const { comment } = await c.req.json();
    
    const event = await kv.get(eventId);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const comments = event.comments || [];
    const newComment = {
      id: `comment:${Date.now()}`,
      user_id: user.id,
      user_name: userData?.name || 'Anonymous',
      comment,
      created_at: new Date().toISOString()
    };

    event.comments = [...comments, newComment];
    await kv.set(eventId, event);
    return c.json({ event });
  } catch (error) {
    console.log('Comment error:', error);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// Register for event (authenticated users)
app.post('/events/:id/register', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const eventId = c.req.param('id');
    const event = await kv.get(eventId);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const registrations = event.registrations || [];
    if (!registrations.find((r: any) => r.user_id === user.id)) {
      event.registrations = [...registrations, {
        user_id: user.id,
        user_name: userData?.name,
        email: userData?.email,
        registered_at: new Date().toISOString(),
        is_guest: false
      }];
      await kv.set(eventId, event);
    }

    return c.json({ event });
  } catch (error) {
    console.log('Register error:', error);
    return c.json({ error: 'Failed to register' }, 500);
  }
});

// Unregister from event (authenticated users)
app.post('/events/:id/unregister', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    const event = await kv.get(eventId);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const registrations = event.registrations || [];
    event.registrations = registrations.filter((r: any) => r.user_id !== user.id);
    
    await kv.set(eventId, event);
    return c.json({ event });
  } catch (error) {
    console.log('Unregister error:', error);
    return c.json({ error: 'Failed to unregister' }, 500);
  }
});

// Register for event (guest users - no authentication required)
app.post('/events/:id/register-guest', async (c) => {
  try {
    const eventId = c.req.param('id');
    console.log('Guest registration attempt for event:', eventId);
    
    const body = await c.req.json();
    console.log('Request body:', body);
    
    const { name, email, whatsapp, class: userClass, school } = body;
    
    if (!name || !email || !whatsapp) {
      console.log('Missing required fields:', { name, email, whatsapp });
      return c.json({ error: 'Name, email, and WhatsApp number are required' }, 400);
    }

    const event = await kv.get(eventId);
    if (!event) {
      console.log('Event not found:', eventId);
      return c.json({ error: 'Event not found' }, 404);
    }

    const registrations = event.registrations || [];
    
    // Check if this email is already registered
    if (registrations.find((r: any) => r.email === email)) {
      console.log('Email already registered:', email);
      return c.json({ error: 'This email is already registered for this event' }, 400);
    }

    const newRegistration = {
      user_name: name,
      email,
      whatsapp,
      class: userClass,
      school,
      registered_at: new Date().toISOString(),
      is_guest: true
    };

    console.log('Adding new registration:', newRegistration);

    event.registrations = [...registrations, newRegistration];
    
    await kv.set(eventId, event);
    console.log('Registration successful');
    
    return c.json({ event, success: true });
  } catch (error) {
    console.log('Guest register error:', error);
    return c.json({ error: 'Failed to register', details: String(error) }, 500);
  }
});

// Unregister from event (guest users - no authentication required)  
app.post('/events/:id/unregister-guest', async (c) => {
  console.log('🔴 UNREGISTER-GUEST ENDPOINT HIT');
  try {
    const eventId = c.req.param('id');
    console.log('===== GUEST UNREGISTER START =====');
    console.log('Event ID:', eventId);
    
    const body = await c.req.json();
    console.log('Request body:', JSON.stringify(body));
    
    const { email } = body;
    
    if (!email) {
      console.log('Missing email in request');
      return c.json({ error: 'Email is required' }, 400);
    }

    const event = await kv.get(eventId);
    if (!event) {
      console.log('Event not found:', eventId);
      return c.json({ error: 'Event not found' }, 404);
    }

    console.log('Event found, checking registrations...');
    const registrations = event.registrations || [];
    console.log('Total registrations:', registrations.length);
    console.log('All registrations:', JSON.stringify(registrations, null, 2));
    console.log('Searching for email:', email);
    
    // Normalize email for comparison (trim and lowercase)
    const normalizedSearchEmail = email.trim().toLowerCase();
    console.log('Normalized search email:', normalizedSearchEmail);
    
    // Find the registration with normalized comparison
    const foundRegistration = registrations.find((r: any) => {
      const regEmail = (r.email || '').trim().toLowerCase();
      const isGuest = r.is_guest === true;
      console.log(`  Checking: "${regEmail}" (is_guest: ${isGuest}) vs "${normalizedSearchEmail}"`);
      return regEmail === normalizedSearchEmail && isGuest;
    });
    
    if (!foundRegistration) {
      console.log('❌ Registration not found');
      const anyEmailMatch = registrations.find((r: any) => 
        (r.email || '').trim().toLowerCase() === normalizedSearchEmail
      );
      console.log('Any email match (regardless of is_guest):', anyEmailMatch);
      
      return c.json({ 
        error: 'Guest registration not found for this email',
        debug: {
          email_searched: email,
          normalized_email: normalizedSearchEmail,
          total_registrations: registrations.length,
          has_email_match: !!anyEmailMatch,
          email_has_guest_flag: anyEmailMatch?.is_guest,
          all_emails: registrations.map((r: any) => ({ 
            email: r.email, 
            is_guest: r.is_guest 
          }))
        }
      }, 404);
    }

    console.log('✓ Found registration:', foundRegistration);

    // Remove the registration using normalized comparison
    const beforeCount = registrations.length;
    event.registrations = registrations.filter((r: any) => {
      const regEmail = (r.email || '').trim().toLowerCase();
      const isGuest = r.is_guest === true;
      const shouldKeep = !(regEmail === normalizedSearchEmail && isGuest);
      return shouldKeep;
    });
    const afterCount = event.registrations.length;
    
    console.log(`Registrations: ${beforeCount} → ${afterCount}`);
    
    await kv.set(eventId, event);
    console.log('✓ Unregistration successful');
    console.log('===== GUEST UNREGISTER END =====');
    
    return c.json({ event, success: true });
  } catch (error) {
    console.log('❌ Guest unregister error:', error);
    return c.json({ error: 'Failed to unregister', details: String(error) }, 500);
  }
});

// Get instructions
app.get('/instructions', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const allInstructions = await kv.getByPrefix('instruction:');
    
    console.log(`Fetching instructions for user: ${user.id}, role: ${userData?.role}, team: ${userData?.team}`);
    console.log(`Total instructions found: ${allInstructions?.length || 0}`);
    
    // Filter based on role
    let instructions = allInstructions || [];
    if (userData?.role === 'volunteer') {
      instructions = instructions.filter((inst: any) => {
        console.log(`Checking instruction ${inst.id}: assigned_teams=${JSON.stringify(inst.assigned_teams)}, assigned_volunteers=${JSON.stringify(inst.assigned_volunteers)}`);
        
        // Check legacy assigned_to field
        if (inst.assigned_to === user.id || inst.assigned_to === 'all') {
          console.log(`Matched via legacy assigned_to`);
          return true;
        }
        
        // Check if user is in assigned_volunteers array
        if (inst.assigned_volunteers && inst.assigned_volunteers.includes(user.id)) {
          console.log(`Matched via assigned_volunteers`);
          return true;
        }
        
        // Check if user's team is in assigned_teams array or if "All teams" is selected
        if (userData?.team && inst.assigned_teams) {
          if (inst.assigned_teams.includes('All teams') || inst.assigned_teams.includes(userData.team)) {
            console.log(`Matched via team assignment`);
            return true;
          }
        }
        
        console.log(`No match for this instruction`);
        return false;
      });
    }

    console.log(`Filtered instructions count: ${instructions.length}`);
    
    // Sort by creation date (newest first)
    instructions.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ instructions });
  } catch (error) {
    console.log('Get instructions error:', error);
    return c.json({ error: 'Failed to fetch instructions' }, 500);
  }
});

// Create instruction (admin only)
app.post('/instructions', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const instructionData = await c.req.json();
    const instructionId = `instruction:${Date.now()}`;
    
    const instruction = {
      id: instructionId,
      ...instructionData,
      created_by: user.id,
      created_by_name: userData?.name,
      status: 'todo',
      created_at: new Date().toISOString()
    };

    await kv.set(instructionId, instruction);
    return c.json({ instruction });
  } catch (error) {
    console.log('Create instruction error:', error);
    return c.json({ error: 'Failed to create instruction' }, 500);
  }
});

// Update instruction (status update by volunteers, full edit by admins)
app.patch('/instructions/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const instructionId = c.req.param('id');
    const updates = await c.req.json();
    
    const instruction = await kv.get(instructionId);
    if (!instruction) {
      return c.json({ error: 'Instruction not found' }, 404);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    // If admin, allow full edit; otherwise only status update
    if (userData?.role === 'admin') {
      const updatedInstruction = {
        ...instruction,
        ...updates,
        // Preserve these fields
        id: instruction.id,
        created_by: instruction.created_by,
        created_by_name: instruction.created_by_name,
        created_at: instruction.created_at,
        updated_at: new Date().toISOString()
      };
      await kv.set(instructionId, updatedInstruction);
      return c.json({ instruction: updatedInstruction });
    } else {
      // Volunteers can only update their individual status
      if (updates.status) {
        // Initialize individual_statuses array if it doesn't exist
        if (!instruction.individual_statuses) {
          instruction.individual_statuses = [];
        }
        
        // Find existing status for this user or create new one
        const existingStatusIndex = instruction.individual_statuses.findIndex(
          (s: any) => s.user_id === user.id
        );
        
        const statusUpdate = {
          user_id: user.id,
          user_name: userData?.name || 'Unknown',
          user_team: userData?.team || null,
          status: updates.status,
          updated_at: new Date().toISOString()
        };
        
        if (existingStatusIndex >= 0) {
          instruction.individual_statuses[existingStatusIndex] = statusUpdate;
        } else {
          instruction.individual_statuses.push(statusUpdate);
        }
        
        instruction.updated_at = new Date().toISOString();
        await kv.set(instructionId, instruction);
      }
      return c.json({ instruction });
    }
  } catch (error) {
    console.log('Update instruction error:', error);
    return c.json({ error: 'Failed to update instruction' }, 500);
  }
});

// Add update to instruction (for volunteers to provide progress updates)
app.post('/instructions/:id/update', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const instructionId = c.req.param('id');
    const instruction = await kv.get(instructionId);
    
    if (!instruction) {
      return c.json({ error: 'Instruction not found' }, 404);
    }

    // Check if updates are locked (only admins can bypass this)
    if (instruction.updates_locked && userData?.role !== 'admin') {
      return c.json({ error: 'Updates are locked for this instruction' }, 403);
    }

    const { update } = await c.req.json();
    
    if (!update || !update.trim()) {
      return c.json({ error: 'Update text is required' }, 400);
    }

    const updates = instruction.updates || [];
    const newUpdate = {
      id: `update:${Date.now()}`,
      user_id: user.id,
      user_name: userData?.name || 'Unknown',
      user_team: userData?.team || null,
      update: update.trim(),
      created_at: new Date().toISOString()
    };

    instruction.updates = [...updates, newUpdate];
    await kv.set(instructionId, instruction);

    return c.json({ instruction });
  } catch (error) {
    console.log('Add instruction update error:', error);
    return c.json({ error: 'Failed to add update' }, 500);
  }
});

// Toggle updates lock for instruction (admin only)
app.patch('/instructions/:id/toggle-lock', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const instructionId = c.req.param('id');
    const instruction = await kv.get(instructionId);
    
    if (!instruction) {
      return c.json({ error: 'Instruction not found' }, 404);
    }

    instruction.updates_locked = !instruction.updates_locked;
    await kv.set(instructionId, instruction);

    return c.json({ instruction });
  } catch (error) {
    console.log('Toggle updates lock error:', error);
    return c.json({ error: 'Failed to toggle lock' }, 500);
  }
});

// Get all volunteers (admin only)
app.get('/volunteers', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const allUsers = await kv.getByPrefix('user:');
    const volunteers = (allUsers || []).filter((u: any) => 
      u.role === 'volunteer' || u.role === 'admin'
    );

    return c.json({ volunteers });
  } catch (error) {
    console.log('Get volunteers error:', error);
    return c.json({ error: 'Failed to fetch volunteers' }, 500);
  }
});

// Get chat messages
app.get('/make-server-98798d2b/chat/messages', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const conversationId = c.req.query('conversation_id');
    const groupId = c.req.query('group_id');

    let messages;
    if (groupId) {
      messages = await kv.getByPrefix(`chat:group:${groupId}:`);
    } else if (conversationId) {
      messages = await kv.getByPrefix(`chat:conv:${conversationId}:`);
    } else {
      return c.json({ error: 'Missing conversation or group id' }, 400);
    }

    return c.json({ messages: messages || [] });
  } catch (error) {
    console.log('Get messages error:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Send chat message
app.post('/make-server-98798d2b/chat/messages', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const { to_user_id, group_id, message } = await c.req.json();

    const timestamp = Date.now();
    let messageId;
    
    if (group_id) {
      messageId = `chat:group:${group_id}:${timestamp}`;
    } else {
      // Create conversation ID from sorted user IDs
      const ids = [user.id, to_user_id].sort();
      const conversationId = `${ids[0]}_${ids[1]}`;
      messageId = `chat:conv:${conversationId}:${timestamp}`;
    }

    const chatMessage = {
      id: messageId,
      from_user_id: user.id,
      from_user_name: userData?.name,
      to_user_id,
      group_id,
      message,
      timestamp: new Date().toISOString()
    };

    await kv.set(messageId, chatMessage);
    return c.json({ message: chatMessage });
  } catch (error) {
    console.log('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get user profile
app.get('/make-server-98798d2b/profile', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    return c.json({ user: userData });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Create chat group (admin only)
app.post('/make-server-98798d2b/chat/groups', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin only' }, 403);
    }

    const { name, member_ids } = await c.req.json();
    const groupId = `group:${Date.now()}`;
    
    const group = {
      id: groupId,
      name,
      member_ids,
      created_by: user.id,
      created_at: new Date().toISOString()
    };

    await kv.set(groupId, group);
    return c.json({ group });
  } catch (error) {
    console.log('Create group error:', error);
    return c.json({ error: 'Failed to create group' }, 500);
  }
});

// Get chat groups
app.get('/make-server-98798d2b/chat/groups', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allGroups = await kv.getByPrefix('group:');
    const userGroups = (allGroups || []).filter((g: any) => 
      g.member_ids && g.member_ids.includes(user.id)
    );

    return c.json({ groups: userGroups });
  } catch (error) {
    console.log('Get groups error:', error);
    return c.json({ error: 'Failed to fetch groups' }, 500);
  }
});

Deno.serve(app.fetch);
