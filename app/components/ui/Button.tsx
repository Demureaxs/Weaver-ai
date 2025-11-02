import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  icon?: React.ReactNode;
  download?: boolean;
}

export default function Button({ children, className, href, icon, ...props }: ButtonProps) {
  const iconContent = icon ? (
    icon
  ) : (
    <ArrowRight className='bg-primary rounded-full h-8 w-8 p-1 -rotate-45 group-hover:rotate-0 group-hover:bg-foreground group-hover:text-white transition-all duration-300 ease-in-out' />
  );

  const componentClassName = `group bg-background hover:bg-primary border border-primary group-hover:border-foreground hover:text-background transition-all duration-300 ease-in-out rounded-full pl-4 p-1 w-fit text-sm font-semibold flex items-center gap-2 ${className} cursor-pointer`;

  if (!href) {
    return (
      <button className={componentClassName} {...props}>
        {children} {iconContent}
      </button>
    );
  }

  return (
    <Link href={href} className={componentClassName} {...props}>
      {children} {iconContent}
    </Link>
  );
}
