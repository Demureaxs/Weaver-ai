import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Figtree } from 'next/font/google';

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
    <html lang='en'>
      <body className={`${figtree.className} antialiased `}>{children}</body>
    </html>
  );
}
