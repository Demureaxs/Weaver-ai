'use client'; // Add 'use client' directive

import { useEffect, useState } from 'react';
import { BanknoteArrowUp, Clipboard, Podcast, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../contexts/UserContext'; // Import useUser hook
import PreviousPosts from '../components/ui/PreviousPosts';
import { useRouter } from 'next/router';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  status: string;
  filename: string;
}

export default function DashboardPage() {
  const { user } = useUser(); // Get the current user from context
  const [totalGenerations, setTotalGenerations] = useState(0);

  useEffect(() => {
    if (user) {
      fetch(`/api/v1/articles?userId=${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
        .then((res) => res.json())
        .then((data: Article[]) => {
          setTotalGenerations(data.length);
        })
        .catch((error) => {
          console.error('Error fetching articles:', error);
        });
    }
  }, [user]);

  // Define stats based on user data
  const stats = [
    {
      label: 'Total Generations',
      value: totalGenerations,
      description: '+12% this month',
      icon: <Clipboard className='text-primary' size={18} />,
    },
    {
      label: 'Active Projects',
      value: 5, // This would ideally come from user's active projects
      description: '3 completed this week',
      icon: <TrendingUp className='text-primary' size={18} />,
    },
    {
      label: 'Credits Remaining',
      value: user?.credits || 0, // Use user's credits
      description: 'Per generation',
      icon: <BanknoteArrowUp className='text-primary' size={18} />,
    },
    {
      label: 'Plan',
      value: user?.tier || 'Free', // Use user's tier
      description: 'Unlimited generations',
      icon: <Podcast className='text-primary' size={18} />,
    },
  ];

  return (
    <div className='flex h-full w-full flex-col overflow-scroll scrollbar-hide'>
      <main className='space-y-4'>
        <div className='space-y-2'>
          <h1 className='text-4xl font-semibold'>Content Dashboard</h1>
          <p>Generate and manage your AI-Powered content</p>
        </div>
        {/* Stats */}
        <div className='grid grid-cols-4 gap-4 space-y-4'>
          {stats.map((stat, index) => {
            return (
              <div key={index} className='bg-background p-4 rounded-lg space-y-2 h-fit border border-primary/20 shadow-lg'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-2xl font-medium text-primary'>{stat.value}</h2>
                  {stat.icon}
                </div>
                <p>{stat.label}</p>
                {stat.description && <p className='text-sm text-foreground/50'>{stat.description}</p>}
              </div>
            );
          })}
        </div>
        {/* Previous Creations */}
        <PreviousPosts />
      </main>
    </div>
  );
}
