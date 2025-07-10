'use client';

import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import ProtectedRoute from './ProtectedRoute';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title = 'Dashboard',
  description 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
        {/* Main content */}
        <div className="lg:pl-64">
          {/* Mobile-responsive top bar - simplified for mobile */}
          <div className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-x-2 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-3 shadow-sm sm:gap-x-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden -m-2 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>

            {/* Title section - responsive */}
            <div className="flex flex-1 gap-x-2 self-stretch sm:gap-x-4">
              <div className="flex flex-1 flex-col justify-center min-w-0">
                <h1 className="text-sm font-semibold text-gray-900 sm:text-base lg:text-lg truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-xs text-gray-500 hidden sm:block lg:text-sm truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile: Show minimal info, Desktop: Show more details */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-gray-500">Admin Panel</p>
                <p className="text-xs font-medium text-gray-700">Smart Tutors</p>
              </div>
            </div>
          </div>

          {/* Page content with responsive spacing */}
          <main className="py-3 sm:py-4 lg:py-6">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout; 