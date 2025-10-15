import { useState, useEffect } from 'react';
import { Event } from '../types';
import { EventCard } from './EventCard';
import { Calendar, Filter } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EventsPageProps {
  user: any;
  accessToken: string | null;
}

export function EventsPage({ user, accessToken }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

      if (response.ok) {
        const data = await response.json();
        // The response is { events: [...] }, so we need to access data.events
        // Sort by event date (nearest to farthest in time)
        const sortedEvents = (data.events || []).sort((a: Event, b: Event) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    // Category filter
    if (categoryFilter !== 'all' && event.category !== categoryFilter) {
      return false;
    }

    // Date filter
    if (filter === 'upcoming') {
      const eventDate = new Date(event.date);
      return eventDate >= new Date();
    } else if (filter === 'past') {
      const eventDate = new Date(event.date);
      return eventDate < new Date();
    }

    return true;
  });

  const categories = ['all', ...new Set(events.map(e => e.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-[40px]">
            All Events
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore all climate action events and join the movement for a sustainable future
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 bg-[rgba(0,0,0,0)]">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${
                filter === 'upcoming'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${
                filter === 'past'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              Past Events
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-300 transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-6"></div>
            <p className="text-slate-600 text-lg">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-3xl border border-slate-200/60">
            <Calendar className="w-20 h-20 text-slate-400 mx-auto mb-6" />
            <h3 className="text-slate-700 mb-3 text-xl">No events found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {filter === 'upcoming' 
                ? 'No upcoming events at the moment. Check back soon!' 
                : filter === 'past' 
                ? 'No past events to display.' 
                : 'No events available. Check back later for climate action events!'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-slate-600">
              Showing <span className="font-medium text-emerald-600">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  user={user}
                  accessToken={accessToken}
                  onUpdate={fetchEvents}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
