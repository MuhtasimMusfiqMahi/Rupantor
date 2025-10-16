import { useState, useEffect } from 'react';
import { Instruction, User } from '../types';
import { CheckCircle, Clock, AlertCircle, MessageSquare, Send, Lock } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface VolunteerDashboardProps {
  user: User;
  accessToken: string;
  onNavigate: (page: string) => void;
}

export function VolunteerDashboard({ user, accessToken, onNavigate }: VolunteerDashboardProps) {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/instructions`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      const data = await response.json();
      console.log('Volunteer dashboard - Fetched instructions:', data);
      if (data.instructions) {
        // Sort by creation date (newest first), already sorted by backend but ensuring consistency
        const sortedInstructions = data.instructions.sort((a: Instruction, b: Instruction) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        setInstructions(sortedInstructions);
        console.log(`Instructions set: ${sortedInstructions.length} total`);
      } else {
        console.log('No instructions in response');
      }
    } catch (error) {
      console.error('Failed to fetch instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (instructionId: string, status: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/instructions/${instructionId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      );

      if (response.ok) {
        fetchInstructions();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const addUpdate = async (instructionId: string) => {
    if (!updateText.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/instructions/${instructionId}/update`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ update: updateText })
        }
      );

      if (response.ok) {
        setUpdateText('');
        setShowUpdateForm(null);
        fetchInstructions();
        alert('Update added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add update');
      }
    } catch (error) {
      console.error('Failed to add update:', error);
      alert('Failed to add update. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  // Helper to get individual status for current user
  const getMyStatus = (instruction: Instruction) => {
    const myStatus = instruction.individual_statuses?.find(s => s.user_id === user.id);
    return myStatus?.status || 'todo'; // Default to todo if not set
  };

  const todoInstructions = instructions.filter(i => getMyStatus(i) === 'todo');
  const inProgressInstructions = instructions.filter(i => getMyStatus(i) === 'in_progress');
  const completedInstructions = instructions.filter(i => getMyStatus(i) === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Volunteer Dashboard</h1>
          <p className="text-xl text-gray-600">Welcome back, {user.name}!</p>
          {user.team && (
            <p className="text-sm text-green-600 mt-1">Team: {user.team}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">To Do</p>
                <p className="text-3xl">{todoInstructions.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl">{inProgressInstructions.length}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl">{completedInstructions.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
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

        {/* Instructions */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading instructions...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* To Do */}
            {todoInstructions.length > 0 && (
              <div>
                <h2 className="text-2xl mb-4">To Do</h2>
                <div className="grid gap-4">
                  {todoInstructions.map((instruction) => (
                    <div
                      key={instruction.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(getMyStatus(instruction))}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3>{instruction.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(instruction.priority)}`}>
                                {instruction.priority ? instruction.priority.toUpperCase() : 'MEDIUM'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{instruction.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                              <span>Assigned by: {instruction.created_by_name}</span>
                              {instruction.assigned_teams && (instruction.assigned_teams.includes(user.team || '') || instruction.assigned_teams.includes('All teams')) && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Team Assignment</span>
                              )}
                              {instruction.assigned_volunteers && instruction.assigned_volunteers.includes(user.id) && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Individual Assignment</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => updateStatus(instruction.id, 'in_progress')}
                            size="sm"
                          >
                            Start Working
                          </Button>
                          <Button
                            onClick={() => updateStatus(instruction.id, 'completed')}
                            variant="outline"
                            size="sm"
                          >
                            Mark Complete
                          </Button>
                          {!instruction.updates_locked && (
                            <Button
                              onClick={() => setShowUpdateForm(showUpdateForm === instruction.id ? null : instruction.id)}
                              variant="outline"
                              size="sm"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Add Update
                            </Button>
                          )}
                        </div>
                        
                        {instruction.updates_locked && (
                          <div className="text-sm text-gray-500 italic flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Updates are locked by admin
                          </div>
                        )}
                        
                        {showUpdateForm === instruction.id && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <Textarea
                              value={updateText}
                              onChange={(e) => setUpdateText(e.target.value)}
                              placeholder="Share your progress on this task..."
                              className="mb-3"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => addUpdate(instruction.id)}
                                size="sm"
                                disabled={!updateText.trim()}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Update
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowUpdateForm(null);
                                  setUpdateText('');
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress */}
            {inProgressInstructions.length > 0 && (
              <div>
                <h2 className="text-2xl mb-4">In Progress</h2>
                <div className="grid gap-4">
                  {inProgressInstructions.map((instruction) => (
                    <div
                      key={instruction.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-yellow-500"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(getMyStatus(instruction))}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3>{instruction.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(instruction.priority)}`}>
                                {instruction.priority ? instruction.priority.toUpperCase() : 'MEDIUM'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{instruction.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                              <span>Assigned by: {instruction.created_by_name}</span>
                              {instruction.assigned_teams && (instruction.assigned_teams.includes(user.team || '') || instruction.assigned_teams.includes('All teams')) && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Team Assignment</span>
                              )}
                              {instruction.assigned_volunteers && instruction.assigned_volunteers.includes(user.id) && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Individual Assignment</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => updateStatus(instruction.id, 'completed')}
                            size="sm"
                          >
                            Mark Complete
                          </Button>
                          {!instruction.updates_locked && (
                            <Button
                              onClick={() => setShowUpdateForm(showUpdateForm === instruction.id ? null : instruction.id)}
                              variant="outline"
                              size="sm"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Add Update
                            </Button>
                          )}
                        </div>
                        
                        {instruction.updates_locked && (
                          <div className="text-sm text-gray-500 italic flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Updates are locked by admin
                          </div>
                        )}
                        
                        {showUpdateForm === instruction.id && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <Textarea
                              value={updateText}
                              onChange={(e) => setUpdateText(e.target.value)}
                              placeholder="Share your progress on this task..."
                              className="mb-3"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => addUpdate(instruction.id)}
                                size="sm"
                                disabled={!updateText.trim()}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Update
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowUpdateForm(null);
                                  setUpdateText('');
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedInstructions.length > 0 && (
              <div>
                <h2 className="text-2xl mb-4">Completed</h2>
                <div className="grid gap-4">
                  {completedInstructions.map((instruction) => (
                    <div
                      key={instruction.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-green-500"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(getMyStatus(instruction))}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3>{instruction.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(instruction.priority)}`}>
                                {instruction.priority ? instruction.priority.toUpperCase() : 'MEDIUM'}
                              </span>
                            </div>
                            <p className="text-gray-600">{instruction.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap mt-3">
                              <span>Assigned by: {instruction.created_by_name}</span>
                              {instruction.assigned_teams && (instruction.assigned_teams.includes(user.team || '') || instruction.assigned_teams.includes('All teams')) && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Team Assignment</span>
                              )}
                              {instruction.assigned_volunteers && instruction.assigned_volunteers.includes(user.id) && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Individual Assignment</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {!instruction.updates_locked && (
                          <Button
                            onClick={() => setShowUpdateForm(showUpdateForm === instruction.id ? null : instruction.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add Update
                          </Button>
                        )}
                        
                        {instruction.updates_locked && (
                          <div className="text-sm text-gray-500 italic flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Updates are locked by admin
                          </div>
                        )}
                        
                        {showUpdateForm === instruction.id && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <Textarea
                              value={updateText}
                              onChange={(e) => setUpdateText(e.target.value)}
                              placeholder="Share your progress or final notes on this task..."
                              className="mb-3"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => addUpdate(instruction.id)}
                                size="sm"
                                disabled={!updateText.trim()}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Update
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowUpdateForm(null);
                                  setUpdateText('');
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {instructions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-600 mb-2">No instructions yet</h3>
                <p className="text-gray-500 text-sm">Check back later for assigned tasks</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
