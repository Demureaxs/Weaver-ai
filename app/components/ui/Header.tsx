'use client';

import Image from 'next/image';
import Button from './Button';
import { Lock, LockKeyhole, LockOpen } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/app/contexts/UserContext';

export default function Header() {
  const { user } = useUser();

  return (
    <header className='py-3 border-b border-foreground/10 shadow-md'>
      <div className='max-w-screen-2xl px-6 mx-auto flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>WEAVER.AI</h1>
        <nav className='flex items-center space-x-4'>
          <ul className='flex items-center space-x-4'>
            <li className='cursor-pointer'>
              <Link href='/'>Home</Link>
            </li>
            <li className='cursor-pointer'>
              <Link href='/about'>About</Link>
            </li>
            <li className='cursor-pointer'>
              <Link href='/contact'>Contact</Link>
            </li>
            <li className='cursor-pointer'>
              <Link href='/blog'>Blog</Link>
            </li>
          </ul>
          <div className='flex items-center space-x-2'>
            {user ? (
              <>
                <span>Welcome, {user.name}!</span>
                <span>Credits: {user.credits}</span>
                <Button>Logout</Button>
              </>
            ) : (
              <>
                <Button
                  icon={
                    <LockKeyhole
                      size={18}
                      className='h-8 w-8 p-1 bg-primary rounded-full group-hover:bg-foreground group-hover:text-background transition-all duration-300 ease-in-out'
                    />
                  }
                >
                  <Link href='/login'>Login</Link>
                </Button>
                <Button href='/signup'>Sign Up</Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
