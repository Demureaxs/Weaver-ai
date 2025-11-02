import { BanknoteArrowUp, Clipboard, Download, Podcast, Trash2, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import fs from 'fs/promises';
import path from 'path';

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

export default async function DashboardPage() {
  const articlesDir = path.join(process.cwd(), 'public', 'articles');
  const articleFiles = await fs.readdir(articlesDir);

  const previousPosts = articleFiles
    .map((file) => {
      if (!file.endsWith('.md')) return null;

      const name = file.slice(0, -3); // Remove .md
      const parts = name.split('-');
      const timestamp = parts.pop();

      if (!timestamp || isNaN(Number(timestamp))) return null;

      const title = parts.join(' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const date = new Date(Number(timestamp)).toISOString().split('T')[0];

      return {
        id: timestamp,
        title,
        date,
        status: 'Published',
        filename: file,
      };
    })
    .filter((post) => post !== null)
    .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());

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
        <div className='bg-background flex text-sm flex-col border border-primary/20 p-4 space-y-4 rounded-lg shadow-lg'>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-semibold'>Previous Posts</h1>
            <Button href='/dashboard/ai-article-creation'>Create Post</Button>
          </div>
          <div className='space-y-2 overflow-scroll max-h-128 scrollbar-hide'>
            {previousPosts.map((post, index) => {
              if (!post) return null;
              return (
                <div key={index} className='group cursor-pointer'>
                  <div className='grid grid-cols-5 items-center gap-4 p-4 hover:border-primary transition-all duration-300 ease-in-out rounded-lg border border-primary/20 shadow-md'>
                    <h1>{post.title}</h1>
                    <p>{post.date}</p>
                    <p className='bg-primary w-fit px-2 rounded-full text-background text-xs flex items-center border border-foreground/5'>
                      {post.status}
                    </p>
                    <Button
                      href={`/articles/${post.filename}`}
                      download
                      className='justify-self-end'
                      icon={
                        <Download
                          size={16}
                          className='bg-primary rounded-full h-8 w-8 p-2 hover:bg-foreground transition-all duration-300 ease-in-out -ml-3'
                        />
                      }
                    />
                    <Trash2 size={16} className='cursor-pointer justify-self-end' />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
