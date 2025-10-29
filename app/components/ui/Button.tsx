import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export default function Button({ children, className, href, ...props }: ButtonProps) {
  if (!href) {
    return (
      <button
        className={`group bg-background hover:bg-primary border border-primary group-hover:border-foreground hover:text-background transition-all duration-300 ease-in-out rounded-full pl-4 p-1 w-fit text-sm font-semibold flex items-center gap-2 ${className} cursor-pointer`}
        {...props}
      >
        {children}{' '}
        <ArrowRight className='bg-primary rounded-full h-8 w-8 p-1 -rotate-45 group-hover:rotate-0 group-hover:bg-foreground group-hover:text-white transition-all duration-300 ease-in-out' />
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`group bg-background hover:bg-primary border border-primary group-hover:border-foreground hover:text-background transition-all duration-300 ease-in-out rounded-full pl-4 p-1 w-fit text-sm font-semibold flex items-center gap-2 ${className} cursor-pointer`}
      {...props}
    >
      {children}{' '}
      <ArrowRight className='bg-primary rounded-full h-8 w-8 p-1 -rotate-45 group-hover:rotate-0 group-hover:bg-foreground group-hover:text-white transition-all duration-300 ease-in-out' />
    </Link>
  );
}
