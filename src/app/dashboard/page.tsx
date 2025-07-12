'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface DashboardStats {
  tutors: number;
  guardians: number;
  tuitions: number;
  activeTuitions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    tutors: 0,
    guardians: 0,
    tuitions: 0,
    activeTuitions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch stats from all APIs
      const [tutorsRes, guardiansRes, tuitionsRes] = await Promise.all([
        fetch('/api/tutors'),
        fetch('/api/guardians'),
        fetch('/api/tuitions')
      ]);

      const tutors = await tutorsRes.json();
      const guardians = await guardiansRes.json();
      const tuitions = await tuitionsRes.json();

      // Ensure we have arrays, handle potential error responses
      const tutorsArray = Array.isArray(tutors) ? tutors : [];
      const guardiansArray = Array.isArray(guardians) ? guardians : [];
      const tuitionsArray = Array.isArray(tuitions) ? tuitions : [];

      setStats({
        tutors: tutorsArray.length || 0,
        guardians: guardiansArray.length || 0,
        tuitions: tuitionsArray.length || 0,
        activeTuitions: tuitionsArray.filter((t: any) => t.status === 'open' || t.status === 'demo running').length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values on error
      setStats({
        tutors: 0,
        guardians: 0,
        tuitions: 0,
        activeTuitions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Tutor Management',
      description: 'Manage tutors and profiles',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      href: '/dashboard/tutors',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700',
      stat: stats.tutors,
      statLabel: 'Total Tutors'
    },
    {
      title: 'Guardian Management',
      description: 'Manage guardian contacts',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/dashboard/guardians',
      color: 'from-green-500 to-green-600',
      hoverColor: 'from-green-600 to-green-700',
      stat: stats.guardians,
      statLabel: 'Total Guardians'
    },
    {
      title: 'Tuition Management',
      description: 'Manage tuition assignments',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: '/dashboard/tuitions',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700',
      stat: stats.tuitions,
      statLabel: 'Total Tuitions'
    },
    {
      title: 'Analytics & Reports',
      description: 'View analytics and reports',
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: '/dashboard/analytics',
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'from-orange-600 to-orange-700',
      stat: stats.activeTuitions,
      statLabel: 'Active Tuitions'
    }
  ];

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welcome to Smart Tutors Management System"
    >
      {/* Quick Stats */}
      <div className="mb-6 sm:mb-8">
        {/* Stats Grid - Mobile responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Tutors</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.tutors}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-green-100">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Guardians</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.guardians}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-purple-100">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Tuitions</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.tuitions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-orange-100">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.activeTuitions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards - Mobile responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {dashboardCards.map((card, index) => (
            <Link key={index} href={card.href}>
              <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] cursor-pointer">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${card.color} group-hover:${card.hoverColor} transition-all duration-200`}>
                      <div className="text-white">
                        {card.icon}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.stat}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{card.statLabel}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions - Mobile responsive */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link 
            href="/dashboard/tuitions/add" 
            className="flex items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div className="p-2 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm sm:text-base font-medium text-gray-900">Add New Tuition</p>
              <p className="text-xs sm:text-sm text-gray-500">Create tuition posting</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/guardians/add" 
            className="flex items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div className="p-2 rounded-md bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm sm:text-base font-medium text-gray-900">Add Guardian</p>
              <p className="text-xs sm:text-sm text-gray-500">Register new guardian</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/analytics" 
            className="flex items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div className="p-2 rounded-md bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm sm:text-base font-medium text-gray-900">View Reports</p>
              <p className="text-xs sm:text-sm text-gray-500">Analytics dashboard</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 