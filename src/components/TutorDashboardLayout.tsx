'use client';

import { useState } from 'react';
import TutorDashboardSidebar from './TutorDashboardSidebar';

interface TutorDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function TutorDashboardLayout({ 
  children, 
  title = "Tutor Dashboard",
  description = "Manage your tutoring activities"
}: TutorDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TutorDashboardSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="lg:px-8">
          {/* Mobile menu button */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:hidden">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          <main className="py-6 sm:py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 text-sm sm:text-base text-gray-600">
                    {description}
                  </p>
                )}
              </div>

              {/* Page content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 