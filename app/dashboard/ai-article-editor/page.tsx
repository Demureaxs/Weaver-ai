import Button from '@/app/components/ui/Button';
import path from 'path';
import fs from 'fs/promises';
import { Download, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

// Helper function to read articles, with error handling
async function getPreviousPosts() {
  const articlesDir = path.join(process.cwd(), 'public', 'articles');

  let articleFiles: string[] = [];
  try {
    articleFiles = await fs.readdir(articlesDir);
    // This will force a cache revalidation if the dir read is successful
    // revalidatePath('/dashboard/ai-article-remix');
  } catch (error) {
    console.warn('Warning: Could not read articles directory:', error);
    // If the directory doesn't exist or read fails, return an empty array
    return [];
  }

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
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return previousPosts;
}

export default async function AiArticleRemixPage() {
  const previousPosts = await getPreviousPosts();

  return (
    // --- FIX 1: Add 'overflow-hidden' to establish the main page boundary ---
    <div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
      {/* --- UPDATED: Title section does not shrink --- */}
      <div className='space-y-2 shrink-0'>
        <h1 className='text-4xl font-semibold'>Ai Article Editor</h1>
        <p>Refine and perfect your articles</p>
      </div>

      {/* --- FIX 2: Add 'overflow-hidden' to the main content box. This is the key. --- */}
      <div className='bg-background flex flex-1 flex-col border border-primary/20 p-4 space-y-4 rounded-lg shadow-lg overflow-hidden'>
        {/* --- UPDATED: Header inside the box does not shrink --- */}
        <div className='flex justify-between items-center shrink-0'>
          <h1 className='text-3xl font-semibold'>Previous Posts</h1>
          <Button href='/dashboard/ai-article-creation'>Create Post</Button>
        </div>

        {/* --- FIX 3: Add 'overflow-y-auto' to the list container --- */}
        <div className='space-y-2 flex-1 max-h-[68vh] overflow-y-scroll scrollbar-hide'>
          {previousPosts.length > 0 ? (
            previousPosts.map((post, index) => {
              if (!post) return null;
              return (
                <div key={index} className='group'>
                  <div
                    key={index}
                    className='grid grid-cols-5 items-center gap-4 p-4 hover:border-primary transition-all duration-300 ease-in-out rounded-lg border border-primary/20 shadow-md text-sm'
                  >
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
            })
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
