import { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, ChatGroup } from '../types';
import { Send, Users, ArrowLeft, Plus } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { formatTime } from '../utils/dateFormatter';

interface ChatSystemProps {
  user: User;
  accessToken: string;
  onNavigate: (page: string) => void;
}

export function ChatSystem({ user, accessToken, onNavigate }: ChatSystemProps) {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ type: 'user' | 'group'; id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', members: [] as string[] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVolunteers();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchVolunteers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/volunteers`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      const data = await response.json();
      if (data.volunteers) {
        setVolunteers(data.volunteers.filter((v: User) => v.id !== user.id));
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/chat/groups`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      const data = await response.json();
      if (data.groups) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      let url = `https://${projectId}.supabase.co/functions/v1/server/chat/messages?`;
      
      if (selectedChat.type === 'group') {
        url += `group_id=${selectedChat.id}`;
      } else {
        const ids = [user.id, selectedChat.id].sort();
        const conversationId = `${ids[0]}_${ids[1]}`;
        url += `conversation_id=${conversationId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages.sort((a: ChatMessage, b: ChatMessage) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const payload: any = {
        message: newMessage
      };

      if (selectedChat.type === 'group') {
        payload.group_id = selectedChat.id;
      } else {
        payload.to_user_id = selectedChat.id;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/chat/groups`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: groupForm.name,
            member_ids: [...groupForm.members, user.id]
          })
        }
      );

      if (response.ok) {
        setShowGroupForm(false);
        setGroupForm({ name: '', members: [] });
        fetchGroups();
        alert('Group created successfully!');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const toggleMember = (memberId: string) => {
    setGroupForm(prev => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter(id => id !== memberId)
        : [...prev.members, memberId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => onNavigate(user.role === 'admin' ? 'admin' : 'volunteer')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl">Chat System</h1>
              <p className="text-gray-600">Internal team communication</p>
            </div>
          </div>
          {user.role === 'admin' && (
            <Button onClick={() => setShowGroupForm(!showGroupForm)}>
              <Plus className="w-5 h-5 mr-2" />
              New Group
            </Button>
          )}
        </div>

        {showGroupForm && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
            <h3 className="mb-4">Create Group Chat</h3>
            <form onSubmit={createGroup} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Group Name</label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g., Climate Campaign Team"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Select Members</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {volunteers.map((volunteer) => (
                    <label key={volunteer.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={groupForm.members.includes(volunteer.id)}
                        onChange={() => toggleMember(volunteer.id)}
                        className="rounded"
                      />
                      <span>{volunteer.name}</span>
                      <span className="text-xs text-gray-500">({volunteer.role})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Group</Button>
                <Button type="button" variant="outline" onClick={() => setShowGroupForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 p-4">
              <h3>Conversations</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {/* Groups */}
              {groups.length > 0 && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-2">GROUPS</p>
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedChat({ type: 'group', id: group.id, name: group.name })}
                      className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                        selectedChat?.id === group.id
                          ? 'bg-green-100 text-green-900'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{group.name}</p>
                          <p className="text-xs text-gray-500">{group.member_ids.length} members</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Direct Messages */}
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-2">DIRECT MESSAGES</p>
                {volunteers.map((volunteer) => (
                  <button
                    key={volunteer.id}
                    onClick={() => setSelectedChat({ type: 'user', id: volunteer.id, name: volunteer.name })}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                      selectedChat?.id === volunteer.id
                        ? 'bg-green-100 text-green-900'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                        <span>{volunteer.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{volunteer.name}</p>
                        <p className="text-xs text-gray-500">{volunteer.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${selectedChat.type === 'group' ? 'bg-green-200' : 'bg-blue-200'} rounded-full flex items-center justify-center`}>
                      {selectedChat.type === 'group' ? (
                        <Users className="w-6 h-6 text-green-700" />
                      ) : (
                        <span className="text-xl">{selectedChat.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3>{selectedChat.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedChat.type === 'group' ? 'Group Chat' : 'Direct Message'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.from_user_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          {!isOwn && (
                            <p className="text-xs text-gray-500 mb-1 px-3">
                              {message.from_user_name}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.message}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-3">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
