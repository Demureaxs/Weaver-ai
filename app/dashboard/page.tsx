'use client'; // Add 'use client' directive

import { BanknoteArrowUp, Clipboard, Download, Podcast, Trash2, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../contexts/UserContext'; // Import useUser hook
import { useEffect, useState } from 'react'; // Import useEffect and useState
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useUser(); // Get the current user from context
  const [previousPosts, setPreviousPosts] = useState<any[]>([]); // State for previous posts
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  // Define stats based on user data
  const stats = [
    {
      label: 'Total Generations',
      value: previousPosts.length || 0, // Use the length of the fetched posts
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

  useEffect(() => {
    if (user) {
      fetch(`/api/v1/articles?userId=${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
        .then((res) => res.json())
        .then((data) => {
          // Sort articles by createdAt in descending order (newest first)
          const sortedData = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPreviousPosts(sortedData);
          setLoading(false); // Set loading to false after data is fetched
        })
        .catch((error) => {
          console.error('Error fetching articles:', error);
          setLoading(false); // Also set loading to false on error
        });
    } else {
      setLoading(false); // If no user, stop loading immediately
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    await fetch('/api/v1/articles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPreviousPosts(previousPosts.filter((post) => post.id !== id));
  };

  const handleDownload = async (articleId: string, filename: string) => {
    // 1. Prepare the download
    const prepareRes = await fetch('/api/v1/prepare-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    });

    if (!prepareRes.ok) {
      // Handle error
      console.error('Failed to prepare download');
      return;
    }

    const { url } = await prepareRes.json();

    // 2. Trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 3. Clean up the file
    // We can do this in a timeout to give the download time to start
    setTimeout(() => {
      fetch('/api/v1/cleanup-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
    }, 1000); // 1 second delay
  };

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
            {loading ? (
              <p>Loading articles...</p>
            ) : previousPosts && previousPosts.length > 0 ? (
              previousPosts.map((post, index) => {
                if (!post) return null;
                return (
                  <div key={index} className='group cursor-pointer' onClick={() => router.push(`/dashboard/ai-article-editor/${post.id}`)}>
                    <div className='grid grid-cols-5 items-center gap-4 p-4 hover:border-primary transition-all duration-300 ease-in-out rounded-lg border border-primary/20 shadow-md'>
                      <h1>{post.title}</h1>
                      <p suppressHydrationWarning>{new Date(post.createdAt).toLocaleDateString()}</p>
                      <p className='bg-primary w-fit px-2 rounded-full text-background text-xs flex items-center border border-foreground/5'>
                        {post.status}
                      </p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(post.id, post.filename);
                        }}
                        className='justify-self-end'
                        icon={
                          <Download
                            size={16}
                            className='bg-primary rounded-full h-8 w-8 p-2 hover:bg-foreground transition-all duration-300 ease-in-out -ml-3'
                          />
                        }
                      />
                      <Trash2
                        size={16}
                        className='cursor-pointer justify-self-end'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(post.id);
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No articles found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
