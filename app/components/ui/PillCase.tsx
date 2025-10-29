'use client';

import { ClipboardType, Settings, Users } from 'lucide-react';
import React from 'react';
import { useState } from 'react';

const pills = [
  {
    title: 'Users',
    logo: <Users className='size-4' />,
  },
  {
    title: 'Content',
    logo: <ClipboardType className='size-4' />,
  },
  {
    title: 'Settings',
    logo: <Settings className='size-4' />,
  },
];

interface PillCaseProps {
  children?: React.ReactNode;
  className?: string;
}

export default function PillCase({ children, className, ...props }: PillCaseProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className={`bg-gray-300 rounded p-1 w-fit flex items-center gap-1 group transition-all duration-300 ease-in-out ${className}`} {...props}>
      {pills.map((pill, i) => (
        <Pill key={pill.title} text={pill.title} logo={pill.logo} selected={selected === i} setSelected={() => setSelected(i)} />
      ))}
      {children}
    </div>
  );
}

function Pill({ text, logo, selected, setSelected }: { text: string; logo?: React.ReactNode; selected: boolean; setSelected: () => void }) {
  return (
    <div
      onClick={setSelected}
      className={`flex items-center gap-1 cursor-pointer ${
        selected ? 'bg-background text-foreground/80' : 'text-gray-500'
      } px-3 py-1 rounded-sm text-xs font-medium`}
    >
      {logo}
      <span>{text}</span>
    </div>
  );
}
