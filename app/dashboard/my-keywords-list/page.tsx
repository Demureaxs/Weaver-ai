'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Button from '@/app/components/ui/Button';
import { Trash2, Edit, Save } from 'lucide-react';

interface Keyword {
  id: number;
  text: string;
  userId: number;
  createdAt: string; // Added createdAt field
}

export default function KeywordListPage() {
  const { user } = useUser();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [editingKeywordId, setEditingKeywordId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/v1/keywords?userId=${user.id}`)
        .then((res) => res.json())
        .then((data: Keyword[]) => {
          // Sort keywords by createdAt in descending order (most recent first)
          const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setKeywords(sortedData);
        });
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    await fetch('/api/v1/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setKeywords(keywords.filter((kw) => kw.id !== id));
  };

  const handleUpdate = async (id: number) => {
    await fetch('/api/v1/keywords', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text: editingText }),
    });
    setKeywords(keywords.map((kw) => (kw.id === id ? { ...kw, text: editingText } : kw)));
    setEditingKeywordId(null);
    setEditingText('');
  };

  const startEditing = (keyword: Keyword) => {
    setEditingKeywordId(keyword.id);
    setEditingText(keyword.text);
  };

  return (
    <div className='space-y-4 h-full  overflow-y-auto'>
      <div className='space-y-2'>
        <h1 className='text-4xl font-semibold'>My Keywords List</h1>
        <p>Manage your keyword lists ahead of article generation</p>
      </div>
      <div className='space-y-2 bg-background flex-1 max-h-[68vh] overflow-y-scroll scrollbar-hide'>
        {keywords.length > 0 ? (
          keywords.map((keyword) => (
            <div key={keyword.id} className='group bg-white cursor-pointer'>
              <div className='grid grid-cols-4 items-center gap-4 p-4 hover:border-primary transition-all duration-300 ease-in-out rounded-lg border border-primary/20 shadow-md text-sm'>
                {editingKeywordId === keyword.id ? (
                  <input
                    type='text'
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className='border border-foreground/10 p-2 rounded w-full outline-primary col-span-2'
                  />
                ) : (
                  <h1 className='col-span-2 font-semibold'>{keyword.text}</h1>
                )}
                <p suppressHydrationWarning>{new Date(keyword.createdAt).toLocaleDateString()}</p>
                <div className='flex items-center gap-4 justify-self-end'>
                  {editingKeywordId === keyword.id ? (
                    <Button
                      onClick={() => handleUpdate(keyword.id)}
                      icon={
                        <Save
                          size={16}
                          className='bg-primary rounded-full h-8 w-8 p-2 hover:bg-foreground transition-all duration-300 ease-in-out -ml-3'
                        />
                      }
                    />
                  ) : (
                    <Button
                      onClick={() => startEditing(keyword)}
                      icon={
                        <Edit
                          size={16}
                          className='bg-primary rounded-full h-8 w-8 p-2 hover:bg-foreground transition-all duration-300 ease-in-out -ml-3'
                        />
                      }
                    />
                  )}
                  <Button
                    onClick={() => handleDelete(keyword.id)}
                    icon={
                      <Trash2
                        size={16}
                        className='bg-primary rounded-full h-8 w-8 p-2 hover:bg-foreground transition-all duration-300 ease-in-out -ml-3'
                      />
                    }
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex items-center justify-center h-full text-foreground/50'>
            <p>No keywords found. Add some from the Keyword Ideas Tool!</p>
          </div>
        )}
      </div>
    </div>
  );
}
