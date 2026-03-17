'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  AcademicCapIcon,
  UserGroupIcon,
  UsersIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  tutors: number;
  guardians: number;
  tuitions: number;
  activeTuitions: number;
  openTuitions: number;
  completedTuitions: number;
  totalApplications: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    tutors: 0,
    guardians: 0,
    tuitions: 0,
    activeTuitions: 0,
    openTuitions: 0,
    completedTuitions: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTuitions, setRecentTuitions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [tutorsRes, guardiansRes, tuitionsRes, appsRes] = await Promise.all([
          fetch('/api/tutors'),
          fetch('/api/guardians'),
          fetch('/api/tuitions'),
          fetch('/api/applications'),
        ]);
        const tutors = await tutorsRes.json();
        const guardians = await guardiansRes.json();
        const tuitions = await tuitionsRes.json();
        const apps = appsRes.ok ? await appsRes.json() : {};

        const ta = Array.isArray(tutors) ? tutors : [];
        const ga = Array.isArray(guardians) ? guardians : [];
        const tua = Array.isArray(tuitions) ? tuitions : [];
        const appsArr = Array.isArray(apps?.applications) ? apps.applications : [];

        setStats({
          tutors: ta.length,
          guardians: ga.length,
          tuitions: tua.length,
          activeTuitions: tua.filter((t: any) => t.status === 'open' || t.status === 'demo running').length,
          openTuitions: tua.filter((t: any) => t.status === 'open').length,
          completedTuitions: tua.filter((t: any) => t.status === 'completed' || t.status === 'booked').length,
          totalApplications: appsArr.length,
        });

        // last 5 tuitions
        setRecentTuitions(tua.slice(0, 5));
      } catch {
        // keep zeros
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusColor: Record<string, string> = {
    open:              'bg-emerald-50 text-emerald-700 border-emerald-200',
    available:         'bg-blue-50 text-blue-700 border-blue-200',
    'demo running':    'bg-amber-50 text-amber-700 border-amber-200',
    booked:            'bg-slate-50 text-slate-600 border-slate-200',
    'booked by other': 'bg-red-50 text-red-700 border-red-200',
    completed:         'bg-teal-50 text-teal-700 border-teal-200',
  };

  const Skeleton = () => (
    <div className="animate-pulse h-8 w-16 bg-[#E8DDD0] rounded-lg" />
  );

  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back — here's what's happening today"
      actions={
        <Link
          href="/dashboard/tuitions/add"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#006A4E] hover:bg-[#005a40] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          New Tuition
        </Link>
      }
    >
      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Tutors',
            value: stats.tutors,
            icon: AcademicCapIcon,
            href: '/dashboard/tutors',
            accent: '#006A4E',
            bg: '#006A4E10',
            delta: 'Registered tutors',
          },
          {
            label: 'Total Guardians',
            value: stats.guardians,
            icon: UserGroupIcon,
            href: '/dashboard/guardians',
            accent: '#0369a1',
            bg: '#0369a110',
            delta: 'Registered guardians',
          },
          {
            label: 'Total Tuitions',
            value: stats.tuitions,
            icon: UsersIcon,
            href: '/dashboard/tuitions',
            accent: '#7c3aed',
            bg: '#7c3aed10',
            delta: 'All time postings',
          },
          {
            label: 'Active Tuitions',
            value: stats.activeTuitions,
            icon: CheckCircleIcon,
            href: '/dashboard/tuitions',
            accent: '#E07B2A',
            bg: '#E07B2A10',
            delta: 'Open + demo running',
          },
        ].map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="group bg-white rounded-xl border border-[#E8DDD0] p-5 hover:shadow-md hover:border-[#006A4E]/30 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
              <ArrowRightIcon className="w-4 h-4 text-[#C4B8A8] group-hover:text-[#006A4E] transition-colors mt-1" />
            </div>
            <div>
              {loading ? <Skeleton /> : (
                <p className="text-2xl font-bold text-[#1C1917]">{card.value}</p>
              )}
              <p className="text-xs font-semibold text-[#1C1917] mt-1">{card.label}</p>
              <p className="text-[11px] text-[#A8A29E] mt-0.5">{card.delta}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Second row: breakdown + quick actions ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Tuition breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8DDD0] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-[#1C1917]">Tuition Overview</h2>
              <p className="text-xs text-[#78716C] mt-0.5">Status breakdown</p>
            </div>
            <Link
              href="/dashboard/tuitions"
              className="text-xs font-semibold text-[#006A4E] hover:underline flex items-center gap-1"
            >
              View all <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Open', value: stats.openTuitions, color: '#006A4E', bg: '#006A4E10' },
              { label: 'Active / Demo', value: stats.activeTuitions, color: '#E07B2A', bg: '#E07B2A10' },
              { label: 'Completed', value: stats.completedTuitions, color: '#0369a1', bg: '#0369a110' },
              { label: 'Applications', value: stats.totalApplications, color: '#7c3aed', bg: '#7c3aed10' },
              { label: 'Guardians', value: stats.guardians, color: '#be185d', bg: '#be185d10' },
              { label: 'Tutors', value: stats.tutors, color: '#0f766e', bg: '#0f766e10' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#F5F0E8]"
                style={{ backgroundColor: item.bg }}
              >
                <div
                  className="w-2 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  {loading ? <div className="h-5 w-10 bg-[#E8DDD0] rounded animate-pulse" /> : (
                    <p className="text-lg font-bold text-[#1C1917]">{item.value}</p>
                  )}
                  <p className="text-[11px] text-[#78716C] font-medium">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
          <h2 className="text-sm font-bold text-[#1C1917] mb-1">Quick Actions</h2>
          <p className="text-xs text-[#78716C] mb-5">Common tasks</p>

          <div className="space-y-2">
            {[
              { label: 'Add New Tuition', sub: 'Post a tuition requirement', href: '/dashboard/tuitions/add', color: 'bg-[#006A4E]' },
              { label: 'Add Guardian', sub: 'Register a new guardian', href: '/dashboard/guardians/add', color: 'bg-[#0369a1]' },
              { label: 'Send SMS', sub: 'Broadcast to tutors', href: '/dashboard/sms', color: 'bg-[#7c3aed]' },
              { label: 'View Analytics', sub: 'Insights & trends', href: '/dashboard/analytics', color: 'bg-[#E07B2A]' },
              { label: 'Business Settings', sub: 'Media fee & contacts', href: '/dashboard/business-settings', color: 'bg-[#0f766e]' },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#E8DDD0] hover:border-[#006A4E]/30 hover:bg-[#FFFDF7] transition-all group"
              >
                <div className={`w-2 h-2 rounded-full ${action.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1C1917] group-hover:text-[#006A4E] transition-colors truncate">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-[#A8A29E] truncate">{action.sub}</p>
                </div>
                <ArrowRightIcon className="w-3.5 h-3.5 text-[#C4B8A8] group-hover:text-[#006A4E] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent tuitions table ────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD0]">
          <div>
            <h2 className="text-sm font-bold text-[#1C1917]">Recent Tuitions</h2>
            <p className="text-xs text-[#78716C] mt-0.5">Latest 5 postings</p>
          </div>
          <Link
            href="/dashboard/tuitions"
            className="text-xs font-semibold text-[#006A4E] hover:underline flex items-center gap-1"
          >
            View all <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 bg-[#F5F0E8] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentTuitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-[#A8A29E]">
            <DocumentTextIcon className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No tuitions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FFFDF7] border-b border-[#E8DDD0]">
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wide">Code</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wide">Class</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wide hidden sm:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wide hidden md:table-cell">Salary</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold text-[#78716C] uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {recentTuitions.map((t: any) => (
                  <tr key={t._id} className="hover:bg-[#FFFDF7] transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs font-semibold text-[#006A4E] bg-[#006A4E]/8 px-2 py-1 rounded">
                        {t.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#1C1917] font-medium text-xs">
                      {t.class || t.studentClass || '—'} <span className="text-[#78716C] font-normal">{t.version}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[#78716C] text-xs hidden sm:table-cell max-w-[140px] truncate">
                      {t.location || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-[#E07B2A] hidden md:table-cell">
                      {t.salary || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor[t.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/dashboard/tuitions`}
                        className="text-xs font-semibold text-[#006A4E] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
