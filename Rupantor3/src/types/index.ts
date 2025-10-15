export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'volunteer' | 'public';
  team?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  speakers?: string[];
  agenda?: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  registrations: Registration[];
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface Registration {
  user_id?: string; // Optional for guest registrations
  user_name: string;
  registered_at: string;
  // Guest registration fields
  is_guest?: boolean;
  email?: string;
  whatsapp?: string;
  class?: string;
  school?: string;
}

export interface Instruction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assigned_to: string; // Legacy field for backward compatibility
  assigned_teams?: string[];
  assigned_volunteers?: string[];
  assigned_to_name?: string;
  created_by: string;
  created_by_name: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at?: string;
  updates?: InstructionUpdate[];
  updates_locked?: boolean;
  individual_statuses?: IndividualStatus[];
}

export interface IndividualStatus {
  user_id: string;
  user_name: string;
  user_team?: string;
  status: 'todo' | 'in_progress' | 'completed';
  updated_at: string;
}

export interface InstructionUpdate {
  id: string;
  user_id: string;
  user_name: string;
  user_team?: string | null;
  update: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id?: string;
  group_id?: string;
  message: string;
  timestamp: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  member_ids: string[];
  created_by: string;
  created_at: string;
}
