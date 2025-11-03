'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { Save } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
}

export default function ArticleEditorInstancePage() {
  const params = useParams();
  const { uuid } = params;

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (uuid) {
      setIsLoading(true);
      fetch(`/api/v1/articles?id=${uuid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
        .then((res) => res.json())
        .then((data) => {
          setArticle(data);
          setTitle(data.title);
          setContent(data.content);
          setIsLoading(false);
        });
    }
  }, [uuid]);

  const handleSave = async () => {
    if (!article) return;
    setIsSaving(true);
    await fetch('/api/v1/articles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.id, title, content }),
    });
    setIsSaving(false);
    // Optionally, show a success message or redirect
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-semibold'>Edit Article</h1>
        <Button onClick={handleSave} disabled={isSaving} icon={<Save size={16} />}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      <div className='space-y-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='border border-foreground/10 p-2 rounded w-full outline-primary text-2xl font-semibold'
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='border border-foreground/10 p-2 rounded w-full h-[70vh] outline-primary'
        />
      </div>
    </div>
  );
}
