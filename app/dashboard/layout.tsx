'use client';

import '../globals.css';
import { Figtree } from 'next/font/google';
import Header from '../components/ui/Header';
import SideNav from '../components/ui/SideNav';
import { UserProvider } from '../contexts/UserContext';
import { users } from '@/data/users';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = users[0];

  return (
    <UserProvider user={currentUser}>
      <div className={`${figtree.className} antialiased `}>
        <div className='h-screen max-h-screen overflow-clip flex flex-col'>
          <main className='flex flex-col flex-1'>
            <Header />
            <div className='flex flex-1 max-w-screen-2xl mx-auto w-full'>
              <SideNav />
              <div className='flex-1 h-[calc(100vh - 54px)] border-r shadow-lg border-foreground/8 p-6'>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
