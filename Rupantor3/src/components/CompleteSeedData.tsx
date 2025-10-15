import { useState } from 'react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface CompleteSeedDataProps {
  accessToken: string;
  onComplete: () => void;
}

export function CompleteSeedData({ accessToken, onComplete }: CompleteSeedDataProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const seedData = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Sample volunteers data with team assignments
      const volunteers = [
        { name: 'আয়েশা খান', email: 'ayesha@example.com', password: 'password123', role: 'volunteer', team: 'Communication team' },
        { name: 'রহিম আলী', email: 'rahim@example.com', password: 'password123', role: 'volunteer', team: 'Communication team' },
        { name: 'সানিয়া রহমান', email: 'sania@example.com', password: 'password123', role: 'volunteer', team: 'Treasurer team' },
        { name: 'তানভীর হক', email: 'tanvir@example.com', password: 'password123', role: 'volunteer', team: 'Event management team' },
        { name: 'নাদিয়া ইসলাম', email: 'nadia@example.com', password: 'password123', role: 'volunteer', team: 'Event management team' },
        { name: 'ফারহান সিদ্দিকী', email: 'farhan@example.com', password: 'password123', role: 'volunteer', team: 'Branding team' },
        { name: 'তাসনিম আহমেদ', email: 'tasnim@example.com', password: 'password123', role: 'volunteer', team: 'Branding team' },
        { name: 'সাদিয়া খাতুন', email: 'sadia@example.com', password: 'password123', role: 'volunteer', team: 'Communication team' },
      ];

      // Sample admins data
      const admins = [
        { name: 'কবির হোসেন (Admin)', email: 'kabir@example.com', password: 'password123', role: 'admin' },
        { name: 'রিমা দাস (Admin)', email: 'rima@example.com', password: 'password123', role: 'admin' },
        { name: 'আরিফ মাহমুদ (Admin)', email: 'arif@example.com', password: 'password123', role: 'admin' },
      ];

      // Sample events data with Unsplash image URLs
      const events = [
        {
          title: 'Tree Plantation Drive 2025',
          description: 'Join us for a massive tree plantation campaign across Dhaka. We aim to plant 10,000 trees to combat air pollution and create green spaces in urban areas. Volunteers will receive training on proper planting techniques.',
          date: '2025-11-15',
          time: '08:00 AM',
          location: 'Ramna Park, Dhaka',
          category: 'campaign',
          speakers: ['Dr. পরিবেশ কুমার', 'Ms. সবুজ রহমান'],
          image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'
        },
        {
          title: 'Climate Action Workshop',
          description: 'An intensive workshop focused on understanding climate change impacts on Bangladesh and developing actionable solutions. Learn about renewable energy, sustainable practices, and how to become a climate advocate.',
          date: '2025-11-20',
          time: '10:00 AM',
          location: 'Bangladesh University of Engineering',
          category: 'workshop',
          speakers: ['Prof. জলবায়ু সেন', 'Dr. শক্তি ইসলাম'],
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
        },
        {
          title: 'Coastal Cleanup Campaign',
          description: 'Help protect our marine ecosystem by participating in our coastal cleanup drive. We will clean Cox\'s Bazar beach and raise awareness about plastic pollution affecting our oceans.',
          date: '2025-11-25',
          time: '06:00 AM',
          location: 'Cox\'s Bazar Beach',
          category: 'campaign',
          speakers: ['Ms. সমুদ্র বেগম'],
          image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80'
        },
        {
          title: 'Renewable Energy Awareness',
          description: 'Discover the potential of solar, wind, and biogas energy for Bangladesh. This awareness session will showcase successful renewable energy projects and discuss how communities can adopt green energy solutions.',
          date: '2025-12-01',
          time: '02:00 PM',
          location: 'Dhaka Science Museum',
          category: 'awareness',
          speakers: ['Eng. সৌর পাওয়ার', 'Dr. বায়ু শক্তি'],
          image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80'
        },
        {
          title: 'Sustainable Agriculture Training',
          description: 'Learn organic farming techniques and sustainable agriculture practices that reduce environmental impact while increasing crop yields. Perfect for farmers and agriculture enthusiasts.',
          date: '2025-12-05',
          time: '09:00 AM',
          location: 'Agricultural Research Center, Gazipur',
          category: 'workshop',
          speakers: ['Dr. কৃষি পণ্ডিত', 'Ms. জৈব চাষী'],
          image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
        },
        {
          title: 'Youth Climate Summit 2025',
          description: 'A major summit bringing together young climate activists from across Bangladesh. Participate in panel discussions, networking sessions, and collaborative workshops to shape our climate action strategy.',
          date: '2025-12-10',
          time: '09:00 AM',
          location: 'International Convention City Bashundhara',
          category: 'campaign',
          speakers: ['Hon. পরিবেশ মন্ত্রী', 'Ms. তরুণ নেতা', 'Dr. জলবায়ু বিশেষজ্ঞ'],
          image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80'
        },
        {
          title: 'Water Conservation Workshop',
          description: 'Learn practical techniques for water conservation in urban and rural settings. Topics include rainwater harvesting, greywater recycling, and efficient irrigation methods.',
          date: '2025-12-15',
          time: '11:00 AM',
          location: 'Chittagong University',
          category: 'workshop',
          speakers: ['Dr. জল সংরক্ষণ', 'Eng. বৃষ্টি ব্যবস্থাপনা'],
          image: 'https://images.unsplash.com/photo-1548263594-a71ea65a8c6e?w=800&q=80'
        },
        {
          title: 'School Climate Education Program',
          description: 'Interactive awareness program for school students about climate change, its impacts, and what young people can do. Includes fun activities, quizzes, and tree planting.',
          date: '2025-12-20',
          time: '10:00 AM',
          location: 'Various Schools in Dhaka',
          category: 'awareness',
          speakers: ['Ms. শিক্ষা বিদ', 'Mr. পরিবেশ শিক্ষক'],
          image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80'
        }
      ];

      // Sample task instructions with team and individual assignments
      const instructions = [
        {
          title: 'Prepare Workshop Materials',
          description: 'Create presentation slides and handouts for the upcoming climate action workshop. Include statistics on Bangladesh climate impact.',
          priority: 'high',
          assigned_teams: ['Event management team'],
          assigned_volunteers: []
        },
        {
          title: 'Social Media Campaign',
          description: 'Design and post daily climate tips on our social media channels. Focus on actionable tips for reducing carbon footprint.',
          priority: 'medium',
          assigned_teams: ['Communication team', 'Branding team'],
          assigned_volunteers: []
        },
        {
          title: 'Coordinate with Local Authorities',
          description: 'Reach out to city corporation for permissions and support for the tree plantation drive.',
          priority: 'high',
          assigned_teams: ['Event management team'],
          assigned_volunteers: []
        },
        {
          title: 'Volunteer Training Session',
          description: 'Organize a training session for new volunteers on event management and climate advocacy.',
          priority: 'medium',
          assigned_teams: [],
          assigned_volunteers: []
        },
        {
          title: 'Equipment Procurement',
          description: 'Purchase or arrange saplings, tools, gloves, and other materials needed for the plantation drive.',
          priority: 'high',
          assigned_teams: ['Treasurer team'],
          assigned_volunteers: []
        },
        {
          title: 'Create Event Feedback Form',
          description: 'Design a comprehensive feedback form to collect participant experiences and suggestions.',
          priority: 'low',
          assigned_teams: ['Event management team'],
          assigned_volunteers: []
        },
        {
          title: 'Partnership Outreach',
          description: 'Contact environmental NGOs and corporate sponsors for potential partnerships and funding.',
          priority: 'medium',
          assigned_teams: ['Communication team'],
          assigned_volunteers: []
        },
        {
          title: 'Website Content Update',
          description: 'Update website with latest events, success stories, and impact statistics.',
          priority: 'low',
          assigned_teams: ['Branding team'],
          assigned_volunteers: []
        },
        {
          title: 'Media Kit Preparation',
          description: 'Prepare press releases and media kits for upcoming Youth Climate Summit.',
          priority: 'high',
          assigned_teams: ['Communication team'],
          assigned_volunteers: []
        },
        {
          title: 'Volunteer Appreciation Event',
          description: 'Plan and organize a thank you event for our dedicated volunteers with certificates and refreshments.',
          priority: 'medium',
          assigned_teams: ['Event management team'],
          assigned_volunteers: []
        }
      ];

      // Create users
      const userPromises = [...volunteers, ...admins].map(async (userData) => {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/signup`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(userData)
            }
          );
          return response.ok;
        } catch (error) {
          console.error('Failed to create user:', error);
          return false;
        }
      });

      await Promise.all(userPromises);

      // Create events
      const eventPromises = events.map(async (eventData) => {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/events`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(eventData)
            }
          );
          return response.ok;
        } catch (error) {
          console.error('Failed to create event:', error);
          return false;
        }
      });

      await Promise.all(eventPromises);

      // Create instructions
      const instructionPromises = instructions.map(async (instructionData) => {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-98798d2b/instructions`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(instructionData)
            }
          );
          return response.ok;
        } catch (error) {
          console.error('Failed to create instruction:', error);
          return false;
        }
      });

      await Promise.all(instructionPromises);

      setStatus('success');
      setMessage(`Successfully created ${volunteers.length + admins.length} users, ${events.length} events, and ${instructions.length} task instructions!`);
      
      // Refresh data after a short delay
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('Seed data error:', error);
      setStatus('error');
      setMessage('Failed to seed data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={seedData}
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Sample Data...
          </>
        ) : (
          '🌱 Generate Complete Sample Data'
        )}
      </Button>

      {status === 'success' && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-800 font-medium">Success!</p>
            <p className="text-sm text-emerald-700 mt-1">{message}</p>
            <div className="mt-3 text-xs text-emerald-600 space-y-1">
              <p>✅ 11 Users Created (8 Volunteers + 3 Admins)</p>
              <p>✅ 8 Climate Events Created</p>
              <p>✅ 10 Task Instructions Created</p>
              <p className="mt-2 font-medium">📝 All users have password: <code className="bg-emerald-100 px-2 py-0.5 rounded">password123</code></p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">Error</p>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
