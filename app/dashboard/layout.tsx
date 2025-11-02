import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { Figtree } from 'next/font/google';
import Header from '../components/ui/Header';
import SideNav from '../components/ui/SideNav';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Weaver AI',
  description: 'Your AI-powered SEO assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${figtree.className} antialiased `}>
      <div className='h-screen max-h-screen overflow-clip flex flex-col'>
        <main className='flex flex-col flex-1'>
          <Header />
          <div className='flex flex-1 max-w-screen-2xl mx-auto w-full'>
            {/* Left Pane */}
            <SideNav />

            {/* Main pane */}
            <div className='flex-1 border-r shadow-lg border-foreground/8 p-6'>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
