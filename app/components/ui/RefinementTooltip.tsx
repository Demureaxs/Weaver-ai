'use client';

import { useState, forwardRef } from 'react';
import Button from './Button';

interface RefinementTooltipProps {
  onRefine: (prompt: string) => void;
  isRefining: boolean;
  top: number;
  left: number;
}

const RefinementTooltip = forwardRef<HTMLDivElement, RefinementTooltipProps>(({ onRefine, isRefining, top, left }, ref) => {
  const [prompt, setPrompt] = useState('');

  const handleRefineClick = () => {
    if (prompt.trim()) {
      onRefine(prompt);
    }
  };

  return (
    <div
      ref={ref}
      className='fixed z-10 w-[1180px] rounded-md bg-background shadow-lg border border-primary/20 p-2'
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <div className='flex gap-2 items-center'>
        <input
          type='text'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g., "Make this more formal"'
          className='border border-foreground/10 p-2 rounded flex-1 outline-primary text-sm'
        />
        <Button onClick={handleRefineClick}>{isRefining ? 'Refining...' : 'Refine'}</Button>
      </div>
    </div>
  );
});

RefinementTooltip.displayName = 'RefinementTooltip';

export default RefinementTooltip;
