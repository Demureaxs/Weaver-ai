import { BanknoteArrowUp, Clipboard, Podcast, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', tier: 'Premium' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', tier: 'Free' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', tier: 'Premium' },
  { id: 4, name: 'David Lee', email: 'david@example.com', tier: 'Free' },
  { id: 5, name: 'Emily Davis', email: 'emily@example.com', tier: 'Premium' },
];

const stats = [
  {
    label: 'Total Generations',
    value: 23,
    description: '+12% this month',
    icon: <Clipboard className='text-primary' size={18} />,
  },
  {
    label: 'Active Projects',
    value: 5,
    description: '3 completed this week',
    icon: <TrendingUp className='text-primary' size={18} />,
  },
  {
    label: 'Credits Remaining',
    value: 100,
    description: 'Per generation',
    icon: <BanknoteArrowUp className='text-primary' size={18} />,
  },
  {
    label: 'Plan',
    value: 'Premium',
    description: 'Unlimited generations',
    icon: <Podcast className='text-primary' size={18} />,
  },
];

const previousPosts = [
  {
    id: 1,
    title: 'How AI is Transforming Content Creation',
    date: '2024-06-10',
    status: 'Published',
  },
  {
    id: 2,
    title: 'Top 10 SEO Strategies for 2024',
    date: '2024-06-08',
    status: 'Draft',
  },
  {
    id: 3,
    title: 'The Future of Digital Marketing',
    date: '2024-06-05',
    status: 'Published',
  },
  {
    id: 4,
    title: 'Understanding User Intent in SEO',
    date: '2024-06-02',
    status: 'Review',
  },
];

export default async function DashboardPage() {
  return (
    <div className='flex flex-1 w-full flex-col overflow-scroll scrollbar-hide'>
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
        <div className='bg-background flex flex-col border border-primary/20 p-4 space-y-4 rounded-lg shadow-lg'>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-semibold'>Previous Posts</h1>
            <Button href='/dashboard/ai-article-creation'>Create Post</Button>
          </div>
          <div className='space-y-2'>
            {previousPosts.map((post, index) => {
              return (
                <div key={index} className='grid grid-cols-3 gap-4 p-4 rounded-lg border border-primary/20 shadow-md'>
                  <h1>{post.title}</h1>
                  <p>{post.date}</p>
                  <p className='bg-primary w-fit px-2 rounded-full text-background text-xs flex items-center border border-foreground/5'>
                    {post.status}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
