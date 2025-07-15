'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TutorDashboardLayout from '@/components/TutorDashboardLayout';

export default function TutorTuitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || user?.userType !== 'tutor') {
      router.push('/tutors/login');
      return;
    }
  }, [session, status]);

  return (
    <TutorDashboardLayout title="My Tuitions" description="View and manage your assigned tuitions">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Tuitions</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tuitions assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any active tuitions at the moment.
            </p>
          </div>
        </div>
      </div>
    </TutorDashboardLayout>
  );
} 