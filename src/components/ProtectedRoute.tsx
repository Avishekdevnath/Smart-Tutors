'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSuperAdmin = false 
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsChecking(false);
      
      if (!session) {
        // Redirect to appropriate login page
        router.push('/admin/login');
        return;
      }
      
      // Check if user is admin or tutor
      const user = session.user as any;
      if (!user.isAdmin && user.userType !== 'admin' && user.userType !== 'tutor') {
        router.push('/admin/login');
        return;
      }
      
      // For super admin requirement, check if user is super admin
      if (requireSuperAdmin && user.userType !== 'admin') {
        router.push('/admin/unauthorized');
        return;
      }
    }
  }, [session, status, router, requireSuperAdmin]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user as any;
  if (!user.isAdmin && user.userType !== 'admin' && user.userType !== 'tutor') {
    return null;
  }

  if (requireSuperAdmin && user.userType !== 'admin') {
    return null;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedRoute; 