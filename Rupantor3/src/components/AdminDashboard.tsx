import { useState, useEffect } from 'react';
import { User, Instruction, Event } from '../types';
import { Users, ClipboardList, Calendar, MessageSquare, Plus, BarChart3, Heart, MessageCircle, UserCheck, Edit2, Eye, AlertCircle, Lock, Unlock } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { CompleteSeedData } from './CompleteSeedData';
import { WelcomeGuide } from './WelcomeGuide';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface AdminDashboardProps {
  user: User;
  accessToken: string;
  onNavigate: (page: string, params?: { email?: string }) => void;
}

export function AdminDashboard({ user, accessToken, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'volunteers' | 'instructions'>('events');
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [selectedEventForInsights, setSelectedEventForInsights] = useState<Event | null>(null);
  const [selectedInstructionForInsights, setSelectedInstructionForInsights] = useState<Instruction | null>(null);
  const [insightsUsers, setInsightsUsers] = useState<User[]>([]);
  
  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [showInstructionForm, setShowInstructionForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingInstruction, setEditingInstruction] = useState<Instruction | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'workshop',
    speakers: '',
    agenda: '',
    image: ''
  });

  const [instructionForm, setInstructionForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assigned_to: '',
    assigned_teams: [] as string[],
    assigned_volunteers: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    // Show welcome guide for first-time admins
    const hasSeenGuide = localStorage.getItem('rupantor_admin_guide_seen');
    if (!hasSeenGuide) {
      setShowWelcomeGuide(true);
    }
  }, []);

  const handleCloseGuide = () => {
    localStorage.setItem('rupantor_admin_guide_seen', 'true');
    setShowWelcomeGuide(false);
  };

  const handleShowInsights = async (event: Event) => {
    setSelectedEventForInsights(event);
    
    // Fetch all users to map IDs to names
    try {
      console.log('Fetching volunteers for insights...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/volunteers`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      console.log('Volunteers response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Volunteers fetch error:', errorText);
        return;
      }
      
      const data = await response.json();
      console.log('Volunteers data:', data);
      if (data.volunteers) {
        setInsightsUsers(data.volunteers);
      }
    } catch (error) {
      console.error('Failed to fetch users for insights:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Edge Function may not be deployed yet. Please wait and try again.');
      }
    }
  };

  const getUserNameById = (userId: string) => {
    const foundUser = insightsUsers.find(u => u.id === userId);
    return foundUser?.name || 'Unknown User';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'volunteers') {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/volunteers`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const data = await response.json();
        if (data.volunteers) {
          setVolunteers(data.volunteers);
        }
      } else if (activeTab === 'instructions') {
        // Fetch both instructions and volunteers for name display
        const [instructionsResponse, volunteersResponse] = await Promise.all([
          fetch(
            `https://${projectId}.supabase.co/functions/v1/server/instructions`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          ),
          fetch(
            `https://${projectId}.supabase.co/functions/v1/server/volunteers`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          )
        ]);
        
        const instructionsData = await instructionsResponse.json();
        const volunteersData = await volunteersResponse.json();
        
        if (instructionsData.instructions) {
          setInstructions(instructionsData.instructions);
        }
        if (volunteersData.volunteers) {
          setVolunteers(volunteersData.volunteers);
        }
      } else if (activeTab === 'events') {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/events`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const data = await response.json();
        if (data.events) {
          // Sort events by event date (nearest to farthest in time)
          const sortedEvents = [...data.events].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setEvents(sortedEvents);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEvent 
        ? `https://${projectId}.supabase.co/functions/v1/server/events/${editingEvent.id}`
        : `https://${projectId}.supabase.co/functions/v1/server/events`;
      
      const response = await fetch(url, {
        method: editingEvent ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...eventForm,
          speakers: eventForm.speakers.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        setShowEventForm(false);
        setEditingEvent(null);
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          category: 'workshop',
          speakers: '',
          agenda: '',
          image: ''
        });
        fetchData();
        alert(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      speakers: Array.isArray(event.speakers) ? event.speakers.join(', ') : '',
      agenda: event.agenda || '',
      image: event.image || ''
    });
    setShowEventForm(true);
  };

  const handleCreateInstruction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating/updating instruction with data:', instructionForm);
      
      const url = editingInstruction
        ? `https://${projectId}.supabase.co/functions/v1/server/instructions/${editingInstruction.id}`
        : `https://${projectId}.supabase.co/functions/v1/server/instructions`;
      
      const response = await fetch(url, {
        method: editingInstruction ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instructionForm)
      });

      const result = await response.json();
      console.log('Instruction save response:', result);

      if (response.ok) {
        setShowInstructionForm(false);
        setEditingInstruction(null);
        setInstructionForm({
          title: '',
          description: '',
          priority: 'medium',
          assigned_to: '',
          assigned_teams: [],
          assigned_volunteers: []
        });
        fetchData();
        alert(editingInstruction ? 'Instruction updated successfully!' : 'Instruction created successfully!');
      } else {
        console.error('Failed to save instruction:', result);
        alert('Failed to save instruction: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to save instruction:', error);
      alert('Failed to save instruction. Check console for details.');
    }
  };

  const handleEditInstruction = (instruction: Instruction) => {
    setEditingInstruction(instruction);
    setInstructionForm({
      title: instruction.title,
      description: instruction.description,
      priority: instruction.priority,
      assigned_to: instruction.assigned_to,
      assigned_teams: instruction.assigned_teams || [],
      assigned_volunteers: instruction.assigned_volunteers || []
    });
    setShowInstructionForm(true);
  };

  const toggleInstructionLock = async (instructionId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/instructions/${instructionId}/toggle-lock`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      if (response.ok) {
        const { instruction } = await response.json();
        // Update the selected instruction for insights
        setSelectedInstructionForInsights(instruction);
        // Refresh the data
        fetchData();
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {showWelcomeGuide && <WelcomeGuide onClose={handleCloseGuide} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl mb-2">Admin Dashboard</h1>
            <p className="text-xl text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWelcomeGuide(true)}
            className="text-gray-600"
          >
            Show Guide
          </Button>
        </div>

        {/* Sample Data Generator */}
        {events.length === 0 && volunteers.length <= 1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200 mb-8">
            <h3 className="mb-2">🚀 Get Started</h3>
            <p className="text-gray-600 mb-4">
              Generate sample data to explore all features of রুপান্তর. This will create volunteer accounts, events, and instructions.
            </p>
            <CompleteSeedData accessToken={accessToken} onComplete={fetchData} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Events</p>
                <p className="text-3xl">{events.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Volunteers</p>
                <p className="text-3xl">{volunteers.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Instructions</p>
                <p className="text-3xl">{instructions.length}</p>
              </div>
              <ClipboardList className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-sm text-white">
            <Button
              onClick={() => onNavigate('chat')}
              variant="secondary"
              className="w-full"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Open Chat
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-4 border-b-2 transition-colors text-center ${
                  activeTab === 'events'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Events
              </button>
              <button
                onClick={() => setActiveTab('volunteers')}
                className={`px-6 py-4 border-b-2 transition-colors text-center ${
                  activeTab === 'volunteers'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Volunteers
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-6 py-4 border-b-2 transition-colors text-center ${
                  activeTab === 'instructions'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <ClipboardList className="w-5 h-5 inline mr-2" />
                Instructions
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : (
              <>
                {/* Events Tab */}
                {activeTab === 'events' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl">Event Management</h2>
                      <Button onClick={() => setShowEventForm(!showEventForm)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Event
                      </Button>
                    </div>

                    {showEventForm && (
                      <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
                        <h3 className="mb-4">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Event Title</Label>
                              <Input
                                value={eventForm.title}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label>Category</Label>
                              <select
                                value={eventForm.category}
                                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="workshop">Workshop</option>
                                <option value="campaign">Campaign</option>
                                <option value="awareness">Awareness Drive</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={eventForm.description}
                              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                              rows={3}
                              required
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={eventForm.date}
                                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label>Time</Label>
                              <Input
                                type="time"
                                value={eventForm.time}
                                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label>Location</Label>
                              <Input
                                value={eventForm.location}
                                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                placeholder="e.g., Dhaka University Campus"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Speakers (comma-separated)</Label>
                            <Input
                              value={eventForm.speakers}
                              onChange={(e) => setEventForm({ ...eventForm, speakers: e.target.value })}
                              placeholder="John Doe, Jane Smith"
                            />
                          </div>

                          <div>
                            <Label>Event Image</Label>
                            <div className="space-y-2">
                              <Input
                                value={eventForm.image}
                                onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                                placeholder="Enter image URL (https://...)"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">or</span>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setEventForm({ ...eventForm, image: reader.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="cursor-pointer"
                                />
                              </div>
                              {eventForm.image && (
                                <div className="mt-2">
                                  <img src={eventForm.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button type="submit">{editingEvent ? 'Update Event' : 'Create Event'}</Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setShowEventForm(false);
                              setEditingEvent(null);
                              setEventForm({
                                title: '',
                                description: '',
                                date: '',
                                time: '',
                                location: '',
                                category: 'workshop',
                                speakers: '',
                                agenda: '',
                                image: ''
                              });
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                          {event.image && (
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={event.image} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <span className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs backdrop-blur-md bg-white/90 shadow-lg">
                                {event.category}
                              </span>
                            </div>
                          )}
                          
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="mb-2">{event.title}</h3>
                                <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                  <span>📅 {formatDate(event.date)}</span>
                                  <span>🕐 {event.time}</span>
                                  <span>📍 {event.location}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <span className="flex items-center gap-1 text-red-500">
                                    <Heart className="w-4 h-4" />
                                    {event.likes?.length || 0}
                                  </span>
                                  <span className="flex items-center gap-1 text-blue-500">
                                    <MessageCircle className="w-4 h-4" />
                                    {event.comments?.length || 0}
                                  </span>
                                  <span className="flex items-center gap-1 text-green-500">
                                    <UserCheck className="w-4 h-4" />
                                    {event.registrations?.length || 0}
                                  </span>
                                </div>
                              </div>
                              {!event.image && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs ml-2">
                                  {event.category}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => handleEditEvent(event)}
                                variant="outline"
                                size="sm"
                                className="text-center"
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleShowInsights(event)}
                                variant="outline"
                                size="sm"
                                className="text-center"
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Insights
                              </Button>
                              <Button
                                onClick={() => {
                                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
                                  window.open(mapsUrl, '_blank');
                                }}
                                variant="outline"
                                size="sm"
                                className="col-span-2 text-center"
                              >
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                View on Map
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Volunteers Tab */}
                {activeTab === 'volunteers' && (
                  <div>
                    <h2 className="text-2xl mb-6">Volunteer Management</h2>
                    <div className="space-y-4">
                      {volunteers.map((volunteer) => (
                        <div
                          key={volunteer.id}
                          className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <h3>{volunteer.name}</h3>
                            <p className="text-gray-600 text-sm">{volunteer.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {volunteer.role}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined: {formatDate(volunteer.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions Tab */}
                {activeTab === 'instructions' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl">Instruction Management</h2>
                      <Button onClick={() => setShowInstructionForm(!showInstructionForm)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Instruction
                      </Button>
                    </div>

                    {showInstructionForm && (
                      <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
                        <h3 className="mb-4">{editingInstruction ? 'Edit Instruction' : 'Create New Instruction'}</h3>
                        <form onSubmit={handleCreateInstruction} className="space-y-4">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={instructionForm.title}
                              onChange={(e) => setInstructionForm({ ...instructionForm, title: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={instructionForm.description}
                              onChange={(e) => setInstructionForm({ ...instructionForm, description: e.target.value })}
                              rows={3}
                              required
                            />
                          </div>

                          <div>
                            <Label>Priority</Label>
                            <select
                              value={instructionForm.priority}
                              onChange={(e) => setInstructionForm({ ...instructionForm, priority: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="high">High Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="low">Low Priority</option>
                            </select>
                          </div>

                          <div className="border border-green-300 rounded-lg p-4 bg-white">
                            <Label className="mb-3 block">Assign to Teams</Label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded border-b border-green-100">
                                <input
                                  type="checkbox"
                                  checked={instructionForm.assigned_teams.includes('All teams')}
                                  onChange={(e) => {
                                    const newTeams = e.target.checked
                                      ? [...instructionForm.assigned_teams, 'All teams']
                                      : instructionForm.assigned_teams.filter(t => t !== 'All teams');
                                    setInstructionForm({ ...instructionForm, assigned_teams: newTeams });
                                  }}
                                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <span className="text-sm">All teams</span>
                              </label>
                              {['Communication team', 'Treasurer team', 'Event management team', 'Branding team'].map((team) => (
                                <label key={team} className="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={instructionForm.assigned_teams.includes(team)}
                                    onChange={(e) => {
                                      const newTeams = e.target.checked
                                        ? [...instructionForm.assigned_teams, team]
                                        : instructionForm.assigned_teams.filter(t => t !== team);
                                      setInstructionForm({ ...instructionForm, assigned_teams: newTeams });
                                    }}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                  />
                                  <span className="text-sm">{team}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="border border-green-300 rounded-lg p-4 bg-white">
                            <Label className="mb-3 block">Assign to Individual Volunteers</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {volunteers.filter(v => v.role === 'volunteer').map((volunteer) => (
                                <label key={volunteer.id} className="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={instructionForm.assigned_volunteers.includes(volunteer.id)}
                                    onChange={(e) => {
                                      const newVolunteers = e.target.checked
                                        ? [...instructionForm.assigned_volunteers, volunteer.id]
                                        : instructionForm.assigned_volunteers.filter(v => v !== volunteer.id);
                                      setInstructionForm({ ...instructionForm, assigned_volunteers: newVolunteers });
                                    }}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                  />
                                  <span className="text-sm">{volunteer.name} {volunteer.team ? `(${volunteer.team})` : ''}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                            <p><strong>Note:</strong> You can assign to teams, individual volunteers, both, or leave unassigned. Instructions will be visible to all selected teams and volunteers.</p>
                          </div>

                          <div className="flex gap-2">
                            <Button type="submit">{editingInstruction ? 'Update Instruction' : 'Create Instruction'}</Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setShowInstructionForm(false);
                              setEditingInstruction(null);
                              setInstructionForm({
                                title: '',
                                description: '',
                                priority: 'medium',
                                assigned_to: '',
                                assigned_teams: [],
                                assigned_volunteers: []
                              });
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="space-y-4">
                      {instructions.map((instruction) => (
                        <div key={instruction.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3>{instruction.title}</h3>
                            <div className="flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs ${
                                instruction.priority === 'high' ? 'bg-red-100 text-red-700' :
                                instruction.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {instruction.priority ? instruction.priority.toUpperCase() : 'MEDIUM'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs ${
                                instruction.status === 'completed' ? 'bg-green-100 text-green-700' :
                                instruction.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {instruction.status ? instruction.status.replace('_', ' ').toUpperCase() : 'TODO'}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{instruction.description}</p>
                          <div className="flex justify-between items-center gap-4">
                            <div className="text-sm text-gray-500 flex-1">
                              {instruction.assigned_teams && instruction.assigned_teams.length > 0 && (
                                <div className="mb-1">
                                  <strong>Teams:</strong> {instruction.assigned_teams.join(', ')}
                                </div>
                              )}
                              {instruction.assigned_volunteers && instruction.assigned_volunteers.length > 0 && (
                                <div>
                                  <strong>Volunteers:</strong> {instruction.assigned_volunteers.map(id => 
                                    volunteers.find(v => v.id === id)?.name || 'Unknown'
                                  ).join(', ')}
                                </div>
                              )}
                              {(!instruction.assigned_teams || instruction.assigned_teams.length === 0) && 
                               (!instruction.assigned_volunteers || instruction.assigned_volunteers.length === 0) && (
                                <div className="text-gray-400 italic">Not assigned</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setSelectedInstructionForInsights(instruction)}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Insights
                              </Button>
                              <Button
                                onClick={() => handleEditInstruction(instruction)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Insights Dialog */}
        <Dialog open={!!selectedEventForInsights} onOpenChange={() => setSelectedEventForInsights(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Event Insights: {selectedEventForInsights?.title}</DialogTitle>
              <DialogDescription>
                View detailed engagement metrics for this event including registrations, likes, and comments.
              </DialogDescription>
            </DialogHeader>
            
            {selectedEventForInsights && (
              <div className="space-y-6">
                {/* Event Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-600">Likes</span>
                    </div>
                    <p className="text-2xl text-red-700">{selectedEventForInsights.likes?.length || 0}</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Comments</span>
                    </div>
                    <p className="text-2xl text-blue-700">{selectedEventForInsights.comments?.length || 0}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Registered</span>
                    </div>
                    <p className="text-2xl text-green-700">{selectedEventForInsights.registrations?.length || 0}</p>
                  </div>
                </div>

                {/* Registrations */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Registered Users
                  </h3>
                  {selectedEventForInsights.registrations && selectedEventForInsights.registrations.length > 0 ? (
                    <div className="space-y-4">
                      {/* Authenticated Users */}
                      {selectedEventForInsights.registrations.filter(r => !r.is_guest).length > 0 && (
                        <div>
                          <h4 className="text-sm mb-2 px-2 py-1 bg-blue-100 text-blue-800 rounded inline-block">
                            Registered Members ({selectedEventForInsights.registrations.filter(r => !r.is_guest).length})
                          </h4>
                          <div className="space-y-2 mt-2">
                            {selectedEventForInsights.registrations.filter(r => !r.is_guest).map((reg, idx) => (
                              <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex justify-between items-center">
                                <button
                                  onClick={() => reg.email && onNavigate('profile', { email: reg.email })}
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                                >
                                  {reg.user_name}
                                </button>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(reg.registered_at)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Guest Users */}
                      {selectedEventForInsights.registrations.filter(r => r.is_guest).length > 0 && (
                        <div>
                          <h4 className="text-sm mb-2 px-2 py-1 bg-green-100 text-green-800 rounded inline-block">
                            Guest Registrations ({selectedEventForInsights.registrations.filter(r => r.is_guest).length})
                          </h4>
                          <div className="space-y-2 mt-2">
                            {selectedEventForInsights.registrations.filter(r => r.is_guest).map((reg, idx) => (
                              <div key={idx} className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-medium">{reg.user_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {formatDateTime(reg.registered_at)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                  <div>
                                    <span className="text-gray-500">Email:</span> {reg.email}
                                  </div>
                                  <div>
                                    <span className="text-gray-500">WhatsApp:</span> {reg.whatsapp}
                                  </div>
                                  {reg.class && (
                                    <div>
                                      <span className="text-gray-500">Class:</span> {reg.class}
                                    </div>
                                  )}
                                  {reg.school && (
                                    <div>
                                      <span className="text-gray-500">School:</span> {reg.school}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No registrations yet</p>
                  )}
                </div>

                {/* Likes */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Users Who Liked
                  </h3>
                  {selectedEventForInsights.likes && selectedEventForInsights.likes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedEventForInsights.likes.map((userId, idx) => (
                        <div key={idx} className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <span className="text-sm">{getUserNameById(userId)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No likes yet</p>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Comments
                  </h3>
                  {selectedEventForInsights.comments && selectedEventForInsights.comments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEventForInsights.comments.map((comment) => (
                        <div key={comment.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm">{comment.user_name}</span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No comments yet</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Instruction Insights Dialog */}
        <Dialog open={!!selectedInstructionForInsights} onOpenChange={() => setSelectedInstructionForInsights(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Instruction Insights: {selectedInstructionForInsights?.title}</DialogTitle>
              <DialogDescription>
                View progress updates from assigned volunteers and track instruction completion.
              </DialogDescription>
            </DialogHeader>
            
            {selectedInstructionForInsights && (
              <div className="space-y-6">
                {/* Instruction Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className={`rounded-lg p-4 border ${
                    selectedInstructionForInsights.priority === 'high' ? 'bg-red-50 border-red-200' :
                    selectedInstructionForInsights.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm text-gray-600">Priority</span>
                    </div>
                    <p className="text-2xl">{selectedInstructionForInsights.priority?.toUpperCase()}</p>
                  </div>
                  
                  <div className={`rounded-lg p-4 border ${
                    selectedInstructionForInsights.status === 'completed' ? 'bg-green-50 border-green-200' :
                    selectedInstructionForInsights.status === 'in_progress' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="w-5 h-5" />
                      <span className="text-sm text-gray-600">Status</span>
                    </div>
                    <p className="text-2xl">{selectedInstructionForInsights.status?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Updates</span>
                    </div>
                    <p className="text-2xl text-purple-700">{selectedInstructionForInsights.updates?.length || 0}</p>
                  </div>
                </div>

                {/* Assignment Details */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Assigned To
                  </h3>
                  <div className="space-y-2">
                    {selectedInstructionForInsights.assigned_teams && selectedInstructionForInsights.assigned_teams.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-sm mb-1"><strong>Teams:</strong></p>
                        <p className="text-sm">{selectedInstructionForInsights.assigned_teams.join(', ')}</p>
                      </div>
                    )}
                    {selectedInstructionForInsights.assigned_volunteers && selectedInstructionForInsights.assigned_volunteers.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm mb-1"><strong>Individual Volunteers:</strong></p>
                        <p className="text-sm">
                          {selectedInstructionForInsights.assigned_volunteers.map(id => 
                            volunteers.find(v => v.id === id)?.name || 'Unknown'
                          ).join(', ')}
                        </p>
                      </div>
                    )}
                    {(!selectedInstructionForInsights.assigned_teams || selectedInstructionForInsights.assigned_teams.length === 0) && 
                     (!selectedInstructionForInsights.assigned_volunteers || selectedInstructionForInsights.assigned_volunteers.length === 0) && (
                      <p className="text-sm text-gray-500 italic">Not assigned to anyone</p>
                    )}
                  </div>
                </div>

                {/* Individual Status Tracking */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Individual Progress Status
                  </h3>
                  <div className="space-y-4">
                    {/* Team Members Status */}
                    {selectedInstructionForInsights.assigned_teams && 
                     selectedInstructionForInsights.assigned_teams.map(team => {
                      // Get volunteers from this team
                      const teamMembers = volunteers.filter(v => 
                        v.team === team || (team === 'All teams' && v.role === 'volunteer')
                      );
                      
                      if (teamMembers.length === 0 && team !== 'All teams') return null;
                      
                      return (
                        <div key={team} className="space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg border border-green-300">
                            <Users className="w-4 h-4 text-green-700" />
                            <h4 className="text-sm text-green-900">{team}</h4>
                          </div>
                          <div className="ml-4 grid gap-2">
                            {teamMembers.map(member => {
                              const memberStatus = selectedInstructionForInsights.individual_statuses?.find(
                                s => s.user_id === member.id
                              );
                              const status = memberStatus?.status || 'todo';
                              
                              return (
                                <div key={member.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                      status === 'completed' ? 'bg-green-500' :
                                      status === 'in_progress' ? 'bg-yellow-500' :
                                      'bg-gray-400'
                                    }`}></div>
                                    <span className="text-sm font-medium">{member.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      status === 'completed' ? 'bg-green-100 text-green-700' :
                                      status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                    {memberStatus && (
                                      <span className="text-xs text-gray-500">
                                        {formatDateTime(memberStatus.updated_at)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Individual Volunteer Status */}
                    {selectedInstructionForInsights.assigned_volunteers && 
                     selectedInstructionForInsights.assigned_volunteers.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg border border-blue-300">
                          <Users className="w-4 h-4 text-blue-700" />
                          <h4 className="text-sm text-blue-900">Individual Assignments</h4>
                        </div>
                        <div className="ml-4 grid gap-2">
                          {selectedInstructionForInsights.assigned_volunteers.map(volunteerId => {
                            const volunteer = volunteers.find(v => v.id === volunteerId);
                            const memberStatus = selectedInstructionForInsights.individual_statuses?.find(
                              s => s.user_id === volunteerId
                            );
                            const status = memberStatus?.status || 'todo';
                            
                            return (
                              <div key={volunteerId} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    status === 'completed' ? 'bg-green-500' :
                                    status === 'in_progress' ? 'bg-yellow-500' :
                                    'bg-gray-400'
                                  }`}></div>
                                  <span className="text-sm font-medium">{volunteer?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    status === 'completed' ? 'bg-green-100 text-green-700' :
                                    status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                  {memberStatus && (
                                    <span className="text-xs text-gray-500">
                                      {formatDateTime(memberStatus.updated_at)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {(!selectedInstructionForInsights.assigned_teams || selectedInstructionForInsights.assigned_teams.length === 0) && 
                     (!selectedInstructionForInsights.assigned_volunteers || selectedInstructionForInsights.assigned_volunteers.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No volunteers assigned to track</p>
                    )}
                  </div>
                </div>

                {/* Updates Lock Control */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2">
                    {selectedInstructionForInsights.updates_locked ? (
                      <Lock className="w-5 h-5 text-red-600" />
                    ) : (
                      <Unlock className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Updates are {selectedInstructionForInsights.updates_locked ? 'Locked' : 'Open'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedInstructionForInsights.updates_locked 
                          ? 'Volunteers cannot add updates' 
                          : 'Volunteers can add updates'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleInstructionLock(selectedInstructionForInsights.id)}
                    variant={selectedInstructionForInsights.updates_locked ? "default" : "outline"}
                    size="sm"
                  >
                    {selectedInstructionForInsights.updates_locked ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Updates
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Lock Updates
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress Updates Grouped by Teams */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    Progress Updates from Volunteers
                  </h3>
                  {selectedInstructionForInsights.updates && selectedInstructionForInsights.updates.length > 0 ? (
                    <div className="space-y-6">
                      {/* Team-based updates */}
                      {selectedInstructionForInsights.assigned_teams && 
                       selectedInstructionForInsights.assigned_teams.map(team => {
                        const teamUpdates = selectedInstructionForInsights.updates?.filter(
                          update => update.user_team === team
                        ) || [];
                        
                        if (teamUpdates.length === 0 && team !== 'All teams') return null;
                        
                        return (
                          <div key={team} className="space-y-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg border border-green-300">
                              <Users className="w-4 h-4 text-green-700" />
                              <h4 className="text-sm text-green-900">{team}</h4>
                              <span className="text-xs text-green-700 ml-auto">
                                {teamUpdates.length} update{teamUpdates.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {teamUpdates.length > 0 ? (
                              <div className="space-y-2 ml-4">
                                {teamUpdates.map((update) => (
                                  <div key={update.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-sm font-medium">{update.user_name}</span>
                                      <span className="text-xs text-gray-500">
                                        {formatDateTime(update.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{update.update}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic ml-4">No updates yet from this team</p>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Individual volunteer updates */}
                      {selectedInstructionForInsights.assigned_volunteers && 
                       selectedInstructionForInsights.assigned_volunteers.length > 0 && (() => {
                        const individualUpdates = selectedInstructionForInsights.updates?.filter(
                          update => selectedInstructionForInsights.assigned_volunteers?.includes(update.user_id)
                        ) || [];
                        
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg border border-blue-300">
                              <Users className="w-4 h-4 text-blue-700" />
                              <h4 className="text-sm text-blue-900">Individual Assignments</h4>
                              <span className="text-xs text-blue-700 ml-auto">
                                {individualUpdates.length} update{individualUpdates.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {individualUpdates.length > 0 ? (
                              <div className="space-y-2 ml-4">
                                {individualUpdates.map((update) => (
                                  <div key={update.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-sm font-medium">{update.user_name}</span>
                                      <span className="text-xs text-gray-500">
                                        {formatDateTime(update.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{update.update}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic ml-4">No updates yet from individual volunteers</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No updates yet from volunteers</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
