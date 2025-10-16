import { useState } from 'react';
import { Button } from './ui/button';
import { Database } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface SeedDataButtonProps {
  accessToken: string;
  onComplete: () => void;
}

export function SeedDataButton({ accessToken, onComplete }: SeedDataButtonProps) {
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    try {
      const sampleEvents = [
        {
          title: 'Climate Action Workshop 2025',
          description: 'Join us for an interactive workshop on climate change mitigation strategies and sustainable living practices. Learn from experts and connect with fellow climate warriors.',
          date: '2025-11-15',
          time: '10:00 AM',
          location: 'Dhaka University Auditorium',
          category: 'workshop',
          speakers: ['Dr. Fatima Rahman', 'Prof. Ahmed Khan'],
          agenda: 'Climate science basics, mitigation strategies, Q&A session',
          image: 'https://images.unsplash.com/photo-1555069855-e580a9adbf43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBtZWV0aW5nJTIwd29ya3Nob3B8ZW58MXx8fHwxNzYwMzkwMTgwfDA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          title: 'Tree Plantation Drive',
          description: 'Be part of our mission to plant 10,000 trees across Dhaka. Every tree counts in our fight against climate change. Bring your enthusiasm and we will provide everything else!',
          date: '2025-11-20',
          time: '07:00 AM',
          location: 'Ramna Park, Dhaka',
          category: 'campaign',
          speakers: ['Community Leader Nasrin'],
          agenda: 'Morning assembly, tree planting session, group photo',
          image: 'https://images.unsplash.com/photo-1633975531445-94aa5f8d5a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjB2b2x1bnRlZXJzfGVufDF8fHx8MTc2MDM1MTYzMXww&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          title: 'Beach Cleanup Campaign',
          description: 'Help us clean Cox\'s Bazar beach and raise awareness about plastic pollution. Together we can make our beaches cleaner and safer for marine life.',
          date: '2025-11-25',
          time: '06:00 AM',
          location: 'Cox\'s Bazar Beach',
          category: 'campaign',
          speakers: ['Marine Biologist Dr. Karim'],
          agenda: 'Beach cleanup, waste segregation, awareness session',
          image: 'https://images.unsplash.com/photo-1582108909833-7b908eb5fb29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNsZWFudXAlMjBlbnZpcm9ubWVudHxlbnwxfHx8fDE3NjAzMDEwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          title: 'Youth Climate Conference',
          description: 'Annual gathering of young climate activists from across Bangladesh. Share ideas, learn from each other, and plan collective action for climate justice.',
          date: '2025-12-05',
          time: '09:00 AM',
          location: 'BRAC Centre Inn, Dhaka',
          category: 'awareness',
          speakers: ['Youth Leaders Panel', 'International Climate Expert'],
          agenda: 'Keynote speeches, breakout sessions, networking',
          image: 'https://images.unsplash.com/photo-1570210661710-e5549821e248?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwYWN0aW9uJTIweW91dGh8ZW58MXx8fHwxNzYwMzkwMTgwfDA&ixlib=rb-4.1.0&q=80&w=1080'
        }
      ];

      for (const event of sampleEvents) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/events`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          }
        );
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      alert('Sample events created successfully!');
      onComplete();
    } catch (error) {
      console.error('Failed to seed data:', error);
      alert('Failed to create sample events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={seedData}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      <Database className="w-4 h-4 mr-2" />
      {loading ? 'Creating...' : 'Add Sample Events'}
    </Button>
  );
}
