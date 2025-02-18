// utils/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, User } from './auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser && pathname !== '/signin') {
        router.push('/signin');
        return;
      }

      if (currentUser?.user_type !== 'doctor' && pathname !== '/unauthorized') {
        router.push('/unauthorized');
        return;
      }

      if (mounted) {
        setUser(currentUser);
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  return { user, isLoading };
};