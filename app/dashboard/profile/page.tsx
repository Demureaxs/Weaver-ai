'use client';

import { useEffect, useState } from 'react';
import Button from '@/app/components/ui/Button';
import { useUser } from '@/app/contexts/UserContext';

const ProfilePage = () => {
  const { user } = useUser(); // Assuming useUser provides a refreshUser function
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatarUrl, setUserAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
      setUserAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/v1/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: userName,
          email: userEmail,
          avatarUrl: userAvatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Assuming the API returns the updated user or a success message
      // If useUser has a refreshUser function, call it here.

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className=''>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h1 className='text-4xl font-semibold'>Profile</h1>
          <p>Edit your profile information here.</p>
        </div>
        <div className='bg-background p-4 space-y-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>User Information</h2>
          <div className='mb-4'>
            <label className='block text-gray-700 font-bold mb-2' htmlFor='username'>
              Username
            </label>
            <input
              className='bg-white border border-foreground/10 p-2 outline-primary shadow rounded w-full text-gray-700 focus:outline-primary focus:shadow-outline'
              id='username'
              type='text'
              placeholder={user?.name || 'Username'}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 font-bold mb-2' htmlFor='email'>
              Email
            </label>
            <input
              className='bg-white border border-foreground/10 p-2 outline-primary shadow rounded w-full text-gray-700 focus:outline-primary focus:shadow-outline'
              id='email'
              type='email'
              placeholder={user?.email || 'Email'}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 font-bold mb-2' htmlFor='avatarUrl'>
              Avatar URL
            </label>
            <input
              className='bg-white border border-foreground/10 p-2 outline-primary shadow rounded w-full text-gray-700 focus:outline-primary focus:shadow-outline'
              id='avatarUrl'
              type='text'
              placeholder={user?.avatarUrl || 'Avatar URL'}
              value={userAvatarUrl}
              onChange={(e) => setUserAvatarUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateProfile}>{isUpdating ? 'Updating...' : 'Update Profile'}</Button>
          <div className='border-t border-foreground/20 pt-4'>
            <h3 className='text-lg font-semibold mb-2'>Change Password</h3>
            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2' htmlFor='current-password'>
                Current Password
              </label>
              <input
                className='bg-white border border-foreground/10 p-2 outline-primary shadow rounded w-full text-gray-700 focus:outline-primary focus:shadow-outline'
                id='current-password'
                type='password'
                placeholder='******************'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2' htmlFor='new-password'>
                New Password
              </label>
              <input
                className='bg-white border border-foreground/10 p-2 outline-primary shadow rounded w-full text-gray-700 focus:outline-primary focus:shadow-outline'
                id='new-password'
                type='password'
                placeholder='******************'
              />
            </div>
            <Button className='bg-white'>Update Password</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
