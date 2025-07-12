'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UsersIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Overview and analytics'
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserIcon,
    description: 'Manage your profile'
  },
  {
    name: 'Tutors',
    href: '/dashboard/tutors',
    icon: AcademicCapIcon,
    description: 'Manage tutor profiles'
  },
  {
    name: 'Guardians',
    href: '/dashboard/guardians',
    icon: UserGroupIcon,
    description: 'Manage guardian accounts'
  },
  {
    name: 'Tuitions',
    href: '/dashboard/tuitions',
    icon: UsersIcon,
    description: 'Manage tuition classes'
  },
  {
    name: 'Applications',
    href: '/dashboard/applications',
    icon: DocumentTextIcon,
    description: 'Manage tuition applications'
  },
  {
    name: 'SMS',
    href: '/dashboard/sms',
    icon: DocumentTextIcon, // You can replace with a message/chat icon if available
    description: 'Send SMS to users'
  },
  {
    name: 'Facebook Groups',
    href: '/dashboard/facebook-groups',
    icon: GlobeAltIcon,
    description: 'Manage Facebook group collections'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    description: 'View reports and insights'
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: DocumentTextIcon,
    description: 'Generate and view reports'
  },
  {
    name: 'Locations',
    href: '/dashboard/locations',
    icon: MapPinIcon,
    description: 'Manage locations'
  },
  {
    name: 'Contact',
    href: '/dashboard/contact',
    icon: EnvelopeIcon,
    description: 'Contact us and inquiries'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: CogIcon,
    description: 'System configuration'
  }
];

interface DashboardSidebarProps {
  className?: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ 
  className = '', 
  sidebarOpen, 
  setSidebarOpen 
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const user = session?.user as any;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      console.log('Initiating logout from dashboard...');
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload if signOut fails
      window.location.href = '/';
    }
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600/75 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            {/* Mobile header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Smart Tutors</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 p-1 rounded-md"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Back to Home Button - Mobile Only */}
            <div className="px-3 pt-4 pb-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                <ArrowLeftIcon className="h-5 w-5 flex-shrink-0" />
                <span>Back to Home</span>
              </Link>
            </div>
            
            {/* Mobile navigation */}
            <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isItemActive = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isItemActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isItemActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile bottom section */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {user?.name || user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@smarttutors.com'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 ${className}`}>
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Smart Tutors</h1>
          </div>
        </div>

        {/* Back to Home Button - Desktop */}
        <div className="px-6 mt-6">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
          >
            <ArrowLeftIcon className="h-4 w-4 flex-shrink-0" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 space-y-1 px-3 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isItemActive = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isItemActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isItemActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Desktop bottom section */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.name || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@smarttutors.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 