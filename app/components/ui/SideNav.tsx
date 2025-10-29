import Link from 'next/link';

const applicationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'AI Article Creation',
    href: '/dashboard/ai-article-creation',
  },
  {
    label: 'AI Article Remix',
    href: '/dashboard/ai-article-remix',
  },
  {
    label: 'Keyword Ideas Tool',
    href: '/dashboard/keyword-ideas-tool',
  },
];

const accountItems = [
  {
    label: 'Subscription',
    href: '/dashboard/subscription',
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
  },
  {
    label: 'Sitemap',
    href: '/dashboard/sitemap',
  },
  {
    label: 'Sign Out',
    href: '/sign-out',
  },
];

interface SideNavProps {
  children?: React.ReactNode;
  className?: string;
}

export default async function SideNav({ children, className }: SideNavProps) {
  return (
    <div className='w-[260px] space-y-4 p-6 border-r border-foreground/10 shadow-lg text-sm'>
      <h1 className='text-foreground/50'>Application</h1>
      <ul className='space-y-2 ml-2'>
        {applicationItems.map((item) => (
          <Link href={item.href} key={item.href} className='block'>
            {item.label}
          </Link>
        ))}
      </ul>
      <h1 className='text-foreground/50'>My Account</h1>
      <ul className='space-y-2 ml-2'>
        {accountItems.map((item) => (
          <Link href={item.href} key={item.href} className='block'>
            {item.label}
          </Link>
        ))}
      </ul>
    </div>
  );
}
