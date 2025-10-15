import { useState, useEffect } from 'react';
import { Event } from '../types';
import { EventCard } from './EventCard';
import { Calendar, Users, Target, Leaf } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logoImage from 'figma:asset/30413506c2fe0151b8e7a901d4930f79e5e6f227.png';

interface PublicHomeProps {
  onNavigate: (page: string) => void;
  user: any;
  accessToken: string | null;
}

export function PublicHome({ onNavigate, user, accessToken }: PublicHomeProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      if (data.events) {
        // Sort by event date (nearest to farthest in time)
        setEvents(data.events.sort((a: Event, b: Event) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/20 to-emerald-900/40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <img 
              src={logoImage} 
              alt="রুপান্তর" 
              className="h-32 md:h-40 w-auto mx-auto mb-8 drop-shadow-2xl filter brightness-110 contrast-110 saturate-110 transform hover:scale-105 transition-all duration-700 ease-out rounded-3xl" 
            />
            <div className="space-y-6 mb-12">
              <p className="text-xl md:text-2xl text-emerald-50 font-light tracking-wide">Climate Action Youth Organization</p>
              <p className="text-xl md:text-3xl lg:text-4xl text-white font-light leading-tight max-w-4xl mx-auto">
                একসাথে আমরা জলবায়ু পরিবর্তনের বিরুদ্ধে লড়াই করছি এবং একটি টেকসই ভবিষ্যত তৈরি করছি
              </p>
              <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto font-light">
                Join thousands of young climate activists making a real difference
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {!user && (
                <>
                  <button
                    onClick={() => onNavigate('auth')}
                    className="group relative px-8 py-4 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 text-center"
                  >
                    <span className="relative z-10 font-medium">Join the Movement</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-8 py-4 border-2 border-white/80 text-white rounded-xl hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm font-medium text-center"
                  >
                    Get in Touch
                  </button>
                </>
              )}
              {user && (
                <button
                  onClick={() => onNavigate(user.role === 'admin' ? 'admin' : user.role === 'volunteer' ? 'volunteer' : 'home')}
                  className="px-8 py-4 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 font-medium text-center"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 40C840 50 960 70 1080 80C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          <div className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/60 transition-all duration-300 hover:-translate-y-1">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="mb-3 text-slate-900">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Fight climate change through youth-led action</p>
          </div>
          
          <div className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/60 transition-all duration-300 hover:-translate-y-1">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="mb-3 text-slate-900">Community</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Building a network of climate warriors</p>
          </div>
          
          <div className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/60 transition-all duration-300 hover:-translate-y-1">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="mb-3 text-slate-900">Events</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Regular workshops and awareness campaigns</p>
          </div>
          
          <div className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/60 transition-all duration-300 hover:-translate-y-1">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h3 className="mb-3 text-slate-900">Impact</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Creating real change for our planet</p>
          </div>
        </div>

        {/* Events Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Upcoming Events</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Join us in making a real difference for our planet</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
              <p className="mt-6 text-slate-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-3xl border border-slate-200/60">
              <Calendar className="w-20 h-20 text-slate-400 mx-auto mb-6" />
              <h3 className="text-slate-700 mb-3 text-xl">No events yet</h3>
              <p className="text-slate-500 mb-4 max-w-md mx-auto">Check back soon for upcoming climate action events!</p>
              {user && user.role === 'admin' && (
                <p className="text-sm text-emerald-600">
                  💡 Login to Admin Dashboard to add sample events
                </p>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  user={user}
                  accessToken={accessToken}
                  onUpdate={fetchEvents}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
