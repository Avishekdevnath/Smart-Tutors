'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSuperAdmin = false 
}) => {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
      
      if (!admin) {
        router.push('/admin/login');
        return;
      }
      
      if (requireSuperAdmin && admin.role !== 'super_admin') {
        router.push('/admin/unauthorized');
        return;
      }
    }
  }, [admin, loading, router, requireSuperAdmin]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  if (requireSuperAdmin && admin.role !== 'super_admin') {
    return null;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedRoute; 