'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { User } from '@/data/users';

interface UserContextType {
  user: User | null;
  updateUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, user: initialUser }: { children: ReactNode; user: User | null }) {
  const [user, setUser] = useState(initialUser);

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
