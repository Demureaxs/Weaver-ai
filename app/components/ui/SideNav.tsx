'use client';
import { BotMessageSquare, CalendarCheck, Gauge, icons, Keyboard, ListRestart, UserRound, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';

const applicationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Gauge size={16} />,
  },
  {
    label: 'AI Article Creation',
    href: '/dashboard/ai-article-creation',
    icon: <BotMessageSquare size={14} />,
  },
  {
    label: 'AI Article Editor',
    href: '/dashboard/ai-article-editor',
    icon: <ListRestart size={14} />,
  },
  {
    label: 'Keyword Ideas Tool',
    href: '/dashboard/keyword-ideas-tool',
    icon: <Keyboard size={14} />,
  },
  {
    label: 'My Keywords List',
    href: '/dashboard/my-keywords-list',
    icon: <icons.Tag size={14} />,
  },
];

const baseAccountItems = [
  {
    label: 'Subscription',
    href: '/dashboard/subscription',
    icon: <CalendarCheck size={14} />,
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: <UserRound size={14} />,
  },
  {
    label: 'Sitemap',
    href: '/dashboard/sitemap',
    icon: <Map size={14} />,
  },
];

export default function SideNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const accountItems = user ? [...baseAccountItems, { label: 'Sign Out', href: '/sign-out', icon: <icons.LogOut size={14} /> }] : baseAccountItems;

  // Combine all navigation items for a single best match calculation
  const allNavItems = [...applicationItems, ...accountItems];

  let bestMatchHref = '';
  let longestMatchLength = 0;

  // First pass: find exact match
  allNavItems.forEach((item) => {
    if (pathname === item.href) {
      bestMatchHref = item.href;
      longestMatchLength = item.href.length;
    }
  });

  // Second pass: if no exact match, find longest startsWith match
  if (!bestMatchHref) {
    allNavItems.forEach((item) => {
      if (pathname.startsWith(item.href) && item.href.length > longestMatchLength) {
        bestMatchHref = item.href;
        longestMatchLength = item.href.length;
      }
    });
  }

  return (
    <div className='w-[260px] space-y-4 p-6 border-r border-foreground/10 shadow-lg text-sm'>
      <h1 className='text-foreground/50'>Application</h1>
      <ul className='space-y-2 ml-2'>
        {applicationItems.map((item, index) => (
          <Link
            href={item.href}
            key={index}
            className={`flex items-center gap-2 ${item.href === bestMatchHref && 'bg-primary text-background rounded-lg -ml-2 px-2 py-1'}`}
          >
            {item.icon && <div>{item.icon}</div>}
            <div>{item.label}</div>
          </Link>
        ))}
      </ul>
      <h1 className='text-foreground/50'>My Account</h1>
      <ul className='space-y-2 ml-2'>
        {accountItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className={`flex items-center gap-2 ${item.href === bestMatchHref && 'bg-primary text-background rounded-lg -ml-2 px-2 py-1'}`}
          >
            {item.icon && <div>{item.icon}</div>}
            <div>{item.label}</div>
          </Link>
        ))}
      </ul>
    </div>
  );
}
