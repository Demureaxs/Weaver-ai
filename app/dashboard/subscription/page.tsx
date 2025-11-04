'use client';
import Button from '@/app/components/ui/Button';
import { useUser } from '@/app/contexts/UserContext';

const SubscriptionPage = () => {
  const { user } = useUser();
  return (
    <div className='flex h-full w-full flex-col overflow-scroll scrollbar-hide '>
      <div className=' space-y-4 '>
        <div className='space-y-2'>
          <h1 className='text-4xl font-semibold'>Subscription</h1>
          <p>Manage and edit your subscription settings.</p>
        </div>
        <div className='bg-background p-4 rounded-lg border border-primary/20 shadow-lg'>
          <h2 className='text-xl font-semibold mb-4'>Current Plan</h2>
          <p className='text-gray-600 mb-4'>
            You are currently on the <span className='font-bold text-primary'>{user?.tier || 'Free'}</span> plan.
          </p>
          <div className='border-t pt-4'>
            <h3 className='text-lg font-semibold mb-2'>Upgrade to Premium</h3>
            <p className='text-gray-600 mb-4'>Unlock more features and enjoy unlimited access to our services.</p>
            <Button>Upgrade Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
