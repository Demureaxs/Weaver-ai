'use client';

import Link from 'next/link';
import { useUser } from '@/app/contexts/UserContext';
import Button from '@/app/components/ui/Button';
import PreviousPosts from '@/app/components/ui/PreviousPosts'; // Import PreviousPosts

export default function AiArticleEditorPage() {
  const { user } = useUser();

  return (
    <div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
      <div className='space-y-2 shrink-0'>
        <h1 className='text-4xl font-semibold'>Ai Article Editor</h1>
        <p>Refine and perfect your articles</p>
      </div>

      <PreviousPosts />
    </div>
  );
}
