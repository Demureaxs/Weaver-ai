'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/app/contexts/UserContext';
import Button from '@/app/components/ui/Button';
import { Download, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  createdAt: string;
  status: string;
  filename: string;
}

export default function AiArticleEditorPage() {
  const { user } = useUser();
  const [articles, setArticles] = useState<Article[]>([]);
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
          // Sort articles by createdAt in descending order (newest first)
          const sortedData = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setArticles(sortedData);
        });
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    await fetch('/api/v1/articles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setArticles(articles.filter((article) => article.id !== id));
  };

  return (
    <div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
      <div className='space-y-2 shrink-0'>
        <h1 className='text-4xl font-semibold'>Ai Article Editor</h1>
        <p>Refine and perfect your articles</p>
      </div>

      <div className='bg-background flex flex-1 flex-col border border-primary/20 p-4 space-y-4 rounded-lg shadow-lg overflow-hidden'>
        <div className='flex justify-between items-center shrink-0'>
          <h1 className='text-3xl font-semibold'>Previous Posts</h1>
          <Button href='/dashboard/ai-article-creation'>Create Post</Button>
        </div>

        <div className='space-y-2 flex-1 max-h-[68vh] overflow-y-scroll scrollbar-hide'>
          {articles.length > 0 ? (
            articles.map((post) => (
              <div
                key={post.id}
                className='group block cursor-pointer'
                onClick={() => router.push(`/dashboard/ai-article-editor/${post.id}`)}
              >
                <div className='grid grid-cols-5 items-center gap-4 p-4 hover:border-primary transition-all duration-300 ease-in-out rounded-lg border border-primary/20 shadow-md text-sm'>
                  <h1>{post.title}</h1>
                  <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                  <p className='bg-primary w-fit px-2 rounded-full text-background text-xs flex items-center border border-foreground/5'>
                    {post.status}
                  </p>
                  <Button
                    href={`/articles/${post.filename}`}
                    download
                    className='justify-self-end'
                    onClick={(e) => e.stopPropagation()} // Prevent link navigation
                    icon={
                      <Download
                        size={16}
                        className='bg-primary rounded-full h-8 w-8 p-2 hover:bg-foreground transition-all duration-300 ease-in-out -ml-3'
                      />
                    }
                  />
                  <Trash2
                    size={16}
                    className='cursor-pointer justify-self-end text-foreground/50 group-hover:text-red-500 transition-colors'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className='flex items-center justify-center h-full text-foreground/50'>
              <p>No previous posts found. Create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
