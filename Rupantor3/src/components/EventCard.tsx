import { useState } from 'react';
import { useState, useEffect } from 'react';
import { Event } from '../types';
import { Heart, MessageCircle, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { formatDate } from '../utils/dateFormatter';

interface EventCardProps {
  event: Event;
  user: any;
  accessToken: string | null;
  onUpdate: () => void;
}

export function EventCard({ event, user, accessToken, onUpdate }: EventCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showGuestRegistration, setShowGuestRegistration] = useState(false);
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    class: '',
    school: ''
  });
  
  // Track guest email in localStorage to check registration status
  const [guestEmail, setGuestEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get guest email from localStorage
    const storedEmail = localStorage.getItem('guest_email');
    
    // Verify that this email is actually registered for this event
    if (storedEmail && event.registrations) {
      const isActuallyRegistered = event.registrations.some(
        r => r.email === storedEmail && r.is_guest
      );
      
      if (isActuallyRegistered) {
        setGuestEmail(storedEmail);
      } else {
        // Email in localStorage but not registered for this event
        // Don't set it - this allows user to register
        setGuestEmail(null);
      }
    } else {
      setGuestEmail(storedEmail);
    }
  }, [event.registrations]);

  const isLiked = user && event.likes?.includes(user.id);
  const likesCount = event.likes?.length || 0;
  const commentsCount = event.comments?.length || 0;
  const registrationsCount = event.registrations?.length || 0;

  const handleLike = async () => {
    if (!user || !accessToken) {
      alert('Please login to like events');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events/${event.id}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to like event:', error);
    }
  };

  const handleComment = async () => {
    if (!user || !accessToken) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events/${event.id}/comment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ comment: newComment })
        }
      );

      if (response.ok) {
        setNewComment('');
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !accessToken) {
      // Show guest registration form for non-logged in users
      setShowGuestRegistration(true);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events/${event.id}/register`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        alert('Successfully registered for the event!');
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const handleUnregister = async () => {
    if (!user || !accessToken) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events/${event.id}/unregister`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        alert('Successfully unregistered from the event!');
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to unregister');
      }
    } catch (error) {
      console.error('Failed to unregister:', error);
      alert('Failed to unregister. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestRegister = async () => {
    if (!guestForm.name || !guestForm.email || !guestForm.whatsapp) {
      alert('Please fill in all required fields (Name, Email, WhatsApp)');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting guest registration:', {
        eventId: event.id,
        name: guestForm.name,
        email: guestForm.email,
        whatsapp: guestForm.whatsapp
      });

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events/${event.id}/register-guest`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          name: guestForm.name,
          email: guestForm.email,
          whatsapp: guestForm.whatsapp,
          class: guestForm.class,
          school: guestForm.school
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Store email in localStorage to track registration
        localStorage.setItem('guest_email', guestForm.email);
        setGuestEmail(guestForm.email);
        
        alert('Successfully registered for the event!');
        setShowGuestRegistration(false);
        setGuestForm({ name: '', email: '', whatsapp: '', class: '', school: '' });
        onUpdate();
      } else {
        console.error('Registration failed:', data);
        
        // Special handling for "already registered" error
        if (data.error && data.error.includes('already registered')) {
          // Store the email in localStorage so the UI updates
          localStorage.setItem('guest_email', guestForm.email);
          setGuestEmail(guestForm.email);
          setShowGuestRegistration(false);
          
          alert('This email is already registered for this event. You can now unregister if needed.');
          onUpdate();
        } else {
          alert(data.error || 'Failed to register');
        }
      }
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Failed to register. Please try again. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestUnregister = async () => {
    if (!guestEmail) {
      alert('No registration found');
      return;
    }

    setSubmitting(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events/${event.id}/unregister-guest`;
      
      console.log('Attempting guest unregister for:', guestEmail);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: guestEmail
        })
      });

      console.log('Unregister response status:', response.status);
      console.log('Unregister response ok:', response.ok);

      if (!response.ok) {
        // Try to get error message
        let errorMessage = `Failed to unregister (Status: ${response.status})`;
        try {
          const text = await response.text();
          console.error('Error response text:', text);
          console.error('Guest email being used:', guestEmail);
          console.error('Event ID:', event.id);
          console.error('Event registrations:', event.registrations);
          try {
            const data = JSON.parse(text);
            console.error('Parsed error data:', data);
            
            // Show debug info if available
            if (data.debug) {
              console.error('Debug info from server:', data.debug);
              if (data.debug.has_email_match && !data.debug.email_has_guest_flag) {
                errorMessage = 'Found a registration with this email, but it appears to be an authenticated user registration, not a guest registration. Please log in to unregister.';
              } else {
                errorMessage = data.error || errorMessage;
              }
            } else {
              errorMessage = data.error || errorMessage;
            }
          } catch {
            // Not JSON, use the text as is
            if (text && text.length < 200) {
              errorMessage = text;
            }
          }
        } catch (parseError) {
          console.error('Could not read error response:', parseError);
        }
        alert(errorMessage);
        return;
      }

      // Success - clear guest email from localStorage
      localStorage.removeItem('guest_email');
      setGuestEmail(null);
      
      alert('Successfully unregistered from the event!');
      onUpdate();
    } catch (error) {
      console.error('Failed to unregister:', error);
      alert('Failed to unregister. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user is registered (either authenticated user or guest)
  const isRegistered = user 
    ? event.registrations?.some(r => r.user_id === user.id)
    : guestEmail && event.registrations?.some(r => r.email === guestEmail && r.is_guest);

  const getPriorityColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'workshop': 'bg-blue-100 text-blue-700',
      'campaign': 'bg-green-100 text-green-700',
      'awareness': 'bg-purple-100 text-purple-700',
      'default': 'bg-gray-100 text-gray-700'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-500 hover:-translate-y-2">
      {event.image && (
        <div className="relative h-56 overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <span className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-xs backdrop-blur-md bg-white/90 shadow-lg ${getPriorityColor(event.category)}`}>
            {event.category}
          </span>
        </div>
      )}
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{event.title}</h3>
        </div>

        <p className="text-slate-600 mb-5 line-clamp-3 leading-relaxed">{event.description}</p>

        <div className="space-y-3 mb-5">
          <div className="flex items-center text-slate-600 text-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-slate-600 text-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-slate-600 text-sm">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <span>{event.location}</span>
          </div>
        </div>

        {event.speakers && event.speakers.length > 0 && (
          <div className="mb-5 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Speakers</p>
            <p className="text-sm text-slate-700">{event.speakers.join(', ')}</p>
          </div>
        )}

        <div className="space-y-3 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 text-sm font-medium ${isLiked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'} transition-colors text-center`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                {likesCount}
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors text-center"
              >
                <MessageCircle className="w-5 h-5" />
                {commentsCount}
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Users className="w-5 h-5" />
                {registrationsCount}
              </div>
            </div>

            {user ? (
              <Button
                onClick={isRegistered ? handleUnregister : handleRegister}
                disabled={submitting}
                variant={isRegistered ? "outline" : "default"}
                size="sm"
                className={isRegistered 
                  ? "border-red-300 text-red-600 hover:bg-red-50" 
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md"
                }
              >
                {submitting ? 'Processing...' : (isRegistered ? 'Unregister' : 'Register')}
              </Button>
            ) : (
              <Button
                onClick={isRegistered ? handleGuestUnregister : () => setShowGuestRegistration(true)}
                disabled={submitting}
                variant={isRegistered ? "outline" : "default"}
                size="sm"
                className={isRegistered 
                  ? "border-red-300 text-red-600 hover:bg-red-50" 
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md"
                }
              >
                {submitting ? 'Processing...' : (isRegistered ? 'Unregister' : 'Register')}
              </Button>
            )}
          </div>
          
          <Button
            onClick={() => {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
              window.open(mapsUrl, '_blank');
            }}
            variant="outline"
            size="sm"
            className="w-full text-center"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            View on Map
          </Button>
        </div>

        {showComments && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            {user && (
              <div className="mb-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="mb-3 border-slate-200 focus:border-emerald-300 rounded-xl"
                  rows={2}
                />
                <Button
                  onClick={handleComment}
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {event.comments && event.comments.length > 0 ? (
                event.comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-900">{comment.user_name}</span>
                      <span className="text-xs text-slate-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-3">No comments yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Guest Registration Dialog */}
      <Dialog open={showGuestRegistration} onOpenChange={setShowGuestRegistration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Please fill in your details to register for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={guestForm.name}
                onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                value={guestForm.whatsapp}
                onChange={(e) => setGuestForm({ ...guestForm, whatsapp: e.target.value })}
                placeholder="+880 1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                value={guestForm.class}
                onChange={(e) => setGuestForm({ ...guestForm, class: e.target.value })}
                placeholder="e.g., Class 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                value={guestForm.school}
                onChange={(e) => setGuestForm({ ...guestForm, school: e.target.value })}
                placeholder="Enter your school name"
              />
            </div>
          </div>
          <div className="space-y-2">
            {/* Show validation message */}
            {(!guestForm.name || !guestForm.email || !guestForm.whatsapp) && (
              <p className="text-xs text-red-600">
                * Please fill in all required fields (Name, Email, WhatsApp)
              </p>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowGuestRegistration(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log('Submit button clicked');
                  console.log('Form state:', guestForm);
                  handleGuestRegister();
                }}
                disabled={submitting || !guestForm.name || !guestForm.email || !guestForm.whatsapp}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {submitting ? 'Registering...' : 'Submit Registration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
