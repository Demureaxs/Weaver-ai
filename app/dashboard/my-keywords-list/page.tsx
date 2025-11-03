'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Button from '@/app/components/ui/Button';
import { Trash2, Edit, Save } from 'lucide-react';

interface Keyword {
  id: number;
  text: string;
  userId: number;
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
        .then((data) => setKeywords(data));
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
    <div className='space-y-4'>
      <div className='space-y-2'>
        <h1 className='text-4xl font-semibold'>My Keywords List</h1>
        <p>Manage your keyword lists ahead of article generation</p>
      </div>
      <div className='space-y-2'>
        {keywords.map((keyword) => (
          <div key={keyword.id} className='flex items-center justify-between p-4 border rounded-lg'>
            {editingKeywordId === keyword.id ? (
              <input
                type='text'
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className='border border-foreground/10 p-2 rounded w-full outline-primary'
              />
            ) : (
              <p>{keyword.text}</p>
            )}
            <div className='flex items-center gap-4'>
              {editingKeywordId === keyword.id ? (
                <Button onClick={() => handleUpdate(keyword.id)} icon={<Save size={16} />}>
                  Save
                </Button>
              ) : (
                <Button onClick={() => startEditing(keyword)} icon={<Edit size={16} />}>
                  Edit
                </Button>
              )}
              <Button onClick={() => handleDelete(keyword.id)} icon={<Trash2 size={16} />} variant='danger'>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
