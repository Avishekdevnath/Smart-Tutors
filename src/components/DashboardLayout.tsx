'use client';

import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import ProtectedRoute from './ProtectedRoute';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Optional right-side header actions (buttons, etc.) */
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
  description,
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as any;
  const initials = (user?.name?.charAt(0) || user?.username?.charAt(0) || 'A').toUpperCase();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F7F3EE]">
        <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">

          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-[#E8DDD0] bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F0E8] transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Divider — mobile only */}
            <div className="h-6 w-px bg-[#E8DDD0] lg:hidden" />

            {/* Breadcrumb / Page title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-[#1C1917] sm:text-lg leading-tight truncate">
                {title}
              </h1>
              {description && (
                <p className="text-xs text-[#78716C] truncate hidden sm:block mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Page actions */}
              {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

              {/* Bell */}
              <button className="p-2 rounded-lg text-[#78716C] hover:text-[#006A4E] hover:bg-[#006A4E]/8 transition-colors relative">
                <BellIcon className="w-5 h-5" />
              </button>

              {/* Avatar + name */}
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[#F5F0E8] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#006A4E] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-[11px] font-bold text-white">{initials}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-[#1C1917] leading-none">
                    {user?.name || user?.username || 'Admin'}
                  </p>
                  <p className="text-[10px] text-[#78716C] mt-0.5 leading-none">Administrator</p>
                </div>
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 py-5 sm:py-7 lg:py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-[#E8DDD0] bg-white px-6 py-3">
            <p className="text-[11px] text-[#A8A29E] text-center">
              Smart Tutors Admin Panel · {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
