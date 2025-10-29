import Image from 'next/image';
import Button from './Button';

export default async function Header() {
  return (
    <header className='py-3 border-b border-foreground/10 shadow-lg'>
      <div className='max-w-screen-2xl px-6 mx-auto flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>WEAVER.AI</h1>
        <nav className='flex items-center space-x-4'>
          <ul className='flex items-center space-x-4'>
            <li className='cursor-pointer'>Home</li>
            <li className='cursor-pointer'>About</li>
            <li className='cursor-pointer'>Contact</li>
            <li className='cursor-pointer'>Blog</li>
          </ul>
          <div className='flex items-center space-x-2'>
            <Button>Login</Button>
            <Button>Sign Up</Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
