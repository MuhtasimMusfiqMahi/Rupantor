import { useState, useEffect } from 'react';
import { User, Event, Instruction } from '../types';
import { projectId } from '../utils/supabase/info';
import { Mail, Calendar, Shield, Users, ClipboardList, ArrowLeft, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { formatDateTime } from '../utils/dateFormatter';

interface UserProfileProps {
  email: string;
  currentUser: User | null;
  accessToken: string | null;
  onNavigate: (page: string) => void;
}

export function UserProfile({ email, currentUser, accessToken, onNavigate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [assignedInstructions, setAssignedInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [email]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user by email
      console.log('Fetching user profile for:', email);
      console.log('API URL:', `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/users/by-email/${encodeURIComponent(email)}`);
      
      const userResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/users/by-email/${encodeURIComponent(email)}`,
        {
          headers: accessToken ? {
            'Authorization': `Bearer ${accessToken}`
          } : {}
        }
      );

      console.log('User response status:', userResponse.status);
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('User fetch error:', errorText);
        throw new Error('User not found');
      }

      const userData = await userResponse.json();
      console.log('User data received:', userData);
      setUser(userData.user);

      // Fetch user's registered events
      console.log('Fetching events...');
      const eventsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events`
      );
      console.log('Events response status:', eventsResponse.status);
      
      if (!eventsResponse.ok) {
        const errorText = await eventsResponse.text();
        console.error('Events fetch error:', errorText);
        throw new Error('Failed to fetch events');
      }
      
      const eventsData = await eventsResponse.json();
      console.log('Events data received:', eventsData);
      
      // Filter events where this user is registered
      const userEvents = eventsData.events.filter((event: Event) => 
        event.registrations.some(reg => 
          !reg.is_guest && reg.email === email
        )
      );
      setRegisteredEvents(userEvents);

      // If user is volunteer or admin, fetch assigned instructions
      if (userData.user.role === 'volunteer' || userData.user.role === 'admin') {
        const instructionsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/instructions`,
          {
            headers: accessToken ? {
              'Authorization': `Bearer ${accessToken}`
            } : {}
          }
        );
        const instructionsData = await instructionsResponse.json();
        
        // Filter instructions assigned to this user
        const userInstructions = instructionsData.instructions.filter((instr: Instruction) => 
          instr.assigned_volunteers?.includes(userData.user.id)
        );
        setAssignedInstructions(userInstructions);
      }

    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. The Edge Function may not be deployed yet. Please wait a moment and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'volunteer':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <Card className="p-8 text-center space-y-4">
            <p className="text-red-600">{error || 'User not found'}</p>
            <button
              onClick={fetchUserProfile}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <Card className="p-8 mb-6 bg-gradient-to-br from-white to-emerald-50/30 border-emerald-100">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-slate-900 mb-2">{user.name}</h1>
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.team && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Team: {user.team}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={`${getRoleBadgeColor(user.role)} border capitalize`}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
              <span className="text-xs text-slate-500">
                Joined {formatDateTime(user.created_at)}
              </span>
            </div>
          </div>
        </Card>

        {/* Registered Events */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="text-slate-900">Registered Events ({registeredEvents.length})</h2>
          </div>
          {registeredEvents.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No registered events</p>
          ) : (
            <div className="space-y-3">
              {registeredEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-lg border border-emerald-100"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-slate-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📅 {event.date}</span>
                        <span>🕐 {event.time}</span>
                        <span>📍 {event.location}</span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border shrink-0">
                      {event.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Assigned Instructions (only for volunteers/admins) */}
        {(user.role === 'volunteer' || user.role === 'admin') && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <h2 className="text-slate-900">Assigned Tasks ({assignedInstructions.length})</h2>
            </div>
            {assignedInstructions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No assigned tasks</p>
            ) : (
              <div className="space-y-3">
                {assignedInstructions.map((instruction) => {
                  // Get individual status for this user
                  const userStatus = instruction.individual_statuses?.find(
                    status => status.user_id === user.id
                  );
                  const status = userStatus?.status || instruction.status;

                  return (
                    <div
                      key={instruction.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-slate-900">{instruction.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          <Badge className={`${getPriorityBadge(instruction.priority)} border capitalize`}>
                            {instruction.priority}
                          </Badge>
                          <Badge
                            className={`border capitalize ${
                              status === 'completed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{instruction.description}</p>
                      <div className="text-xs text-slate-500">
                        Assigned by {instruction.created_by_name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
