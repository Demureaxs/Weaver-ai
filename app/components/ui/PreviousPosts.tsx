import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Button from './Button';
import { Download, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  status: string;
  filename: string;
}

export default function PreviousPosts() {
  const { user } = useUser();
  const [previousPosts, setPreviousPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetch(`/api/v1/articles?userId=${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
        .then((res) => res.json())
        .then((data) => {
          const sortedData = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPreviousPosts(sortedData);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching articles:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
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
    const prepareRes = await fetch('/api/v1/prepare-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    });

    if (!prepareRes.ok) {
      console.error('Failed to prepare download');
      return;
    }

    const { url } = await prepareRes.json();

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      fetch('/api/v1/cleanup-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
    }, 1000);
  };

  return (
    <div className='bg-background flex text-sm flex-col border border-primary/20 p-4 space-y-4 h-fit rounded-lg shadow-lg'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-semibold'>Previous Posts</h1>
        <Button href='/dashboard/ai-article-creation'>Create Post</Button>
      </div>
      <div className='space-y-2 overflow-scroll h-full scrollbar-hide'>
        {loading ? (
          <p>Loading articles...</p>
        ) : previousPosts && previousPosts.length > 0 ? (
          previousPosts.map((post, index) => {
            if (!post) return null;
            return (
              <div key={index} className='group cursor-pointer bg-white' onClick={() => router.push(`/dashboard/ai-article-editor/${post.id}`)}>
                <div className='grid grid-cols-5 items-center gap-4 p-4 hover:border-primary transition-all duration-300 ease-in-out rounded-lg border border-primary/20 shadow-md'>
                  <h1 className='font-semibold'>{post.title}</h1>
                  <p suppressHydrationWarning className='justify-self-end'>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p className='bg-primary justify-self-end w-fit px-2 rounded-full text-background text-xs flex items-center border border-foreground/5'>
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

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    className='justify-self-end'
                    icon={
                      <Trash2
                        size={16}
                        className='bg-primary rounded-full h-8 w-8 p-2 hover:bg-foreground transition-all cursor-pointer duration-300 ease-in-out -ml-3'
                      />
                    }
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
  );
}
