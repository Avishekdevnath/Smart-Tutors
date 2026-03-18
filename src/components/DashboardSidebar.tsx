'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftEllipsisIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const buildNavGroups = (pendingDrafts: number): NavGroup[] => [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Analytics', href: '/dashboard/analytics', icon: PresentationChartLineIcon },
      { name: 'Reports', href: '/dashboard/reports', icon: ClipboardDocumentListIcon },
    ],
  },
  {
    label: 'Core Management',
    items: [
      { name: 'Tutors', href: '/dashboard/tutors', icon: AcademicCapIcon },
      { name: 'Guardians', href: '/dashboard/guardians', icon: UserGroupIcon },
      { name: 'Tuitions', href: '/dashboard/tuitions', icon: UsersIcon },
      { name: 'Applications', href: '/dashboard/applications', icon: DocumentTextIcon },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'SMS', href: '/dashboard/sms', icon: ChatBubbleLeftEllipsisIcon },
      { name: 'Contact Inbox', href: '/dashboard/contact', icon: EnvelopeIcon },
      {
        name: 'Conversations',
        href: '/dashboard/conversations',
        icon: ChatBubbleLeftRightIcon,
        badge: pendingDrafts > 0 ? String(pendingDrafts) : undefined,
      },
      { name: 'Facebook Groups', href: '/dashboard/facebook-groups', icon: GlobeAltIcon },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { name: 'Locations', href: '/dashboard/locations', icon: MapPinIcon },
      { name: 'Business Settings', href: '/dashboard/business-settings', icon: BuildingOfficeIcon },
      { name: 'Account Settings', href: '/dashboard/settings', icon: CogIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'My Profile', href: '/dashboard/profile', icon: UserIcon },
    ],
  },
];

interface DashboardSidebarProps {
  className?: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [pendingDrafts, setPendingDrafts] = useState(0);

  useEffect(() => {
    fetch('/api/conversations?limit=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.stats?.pendingDrafts !== undefined) setPendingDrafts(d.stats.pendingDrafts);
      })
      .catch(() => {});
  }, []);

  const navGroups = buildNavGroups(pendingDrafts);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const toggleGroup = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/', redirect: true });
    } catch {
      window.location.href = '/';
    }
  };

  const initials = (user?.name?.charAt(0) || user?.username?.charAt(0) || 'A').toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] border-r border-[#E8DDD0]">

      {/* Logo bar */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-[#E8DDD0] flex-shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#006A4E] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-xs tracking-tight">ST</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1C1917] leading-none">Smart Tutors</p>
            <p className="text-[10px] text-[#78716C] mt-0.5">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#78716C] hover:text-[#1C1917] p-1 lg:hidden rounded-lg hover:bg-[#F5F0E8] transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Back to site */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#78716C] hover:text-[#006A4E] hover:bg-[#006A4E]/5 border border-[#E8DDD0] hover:border-[#006A4E]/20 transition-all"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to website
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navGroups.map(group => {
          const isGroupCollapsed = collapsed[group.label];
          return (
            <div key={group.label} className="mb-2">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 mb-0.5 rounded group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] group-hover:text-[#006A4E] transition-colors">
                  {group.label}
                </span>
                {isGroupCollapsed
                  ? <ChevronRightIcon className="w-3 h-3 text-[#A8A29E]" />
                  : <ChevronDownIcon className="w-3 h-3 text-[#A8A29E]" />}
              </button>

              {!isGroupCollapsed && group.items.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 group ${
                      active
                        ? 'bg-[#006A4E] text-white shadow-sm'
                        : 'text-[#44403C] hover:bg-[#006A4E]/8 hover:text-[#006A4E]'
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        active ? 'text-white' : 'text-[#A8A29E] group-hover:text-[#006A4E]'
                      }`}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-semibold bg-[#E07B2A] text-white px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 border-t border-[#E8DDD0] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#006A4E] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#1C1917] truncate">
              {user?.name || user?.username || 'Admin'}
            </p>
            <p className="text-[10px] text-[#78716C] truncate">
              {user?.email || 'admin@smarttutors.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSidebar({
  className = '',
  sidebarOpen,
  setSidebarOpen,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 ${className}`}>
        <SidebarContent />
      </div>
    </>
  );
}
