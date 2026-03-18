'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TutorRequest {
  _id: string;
  tutorId: string;
  tutorName: string;
  guardianName: string;
  guardianPhone: string;
  guardianAddress?: string;
  studentClass: string;
  subjects?: string[];
  message?: string;
  status: 'pending' | 'processing' | 'converted' | 'rejected';
  adminNote?: string;
  tuitionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  processing: number;
  converted: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'converted', label: 'Converted' },
  { key: 'rejected', label: 'Rejected' },
] as const;

function statusBadge(status: TutorRequest['status']) {
  const map = {
    pending:    'bg-[#E07B2A]/10 text-[#E07B2A] border-[#E07B2A]/25',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    converted:  'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/25',
    rejected:   'bg-[#78716C]/10 text-[#78716C] border-[#78716C]/25',
  };
  const labels = { pending: 'Pending', processing: 'Processing', converted: 'Converted', rejected: 'Rejected' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Expanded Row Actions ───────────────────────────────────────────────────────

interface ExpandedRowProps {
  req: TutorRequest;
  onRefresh: () => void;
}

function ExpandedRow({ req, onRefresh }: ExpandedRowProps) {
  const [note, setNote] = useState(req.adminNote || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const act = async (action: string, extra: Record<string, any> = {}) => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/tutor-requests/${req._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote: note, ...extra }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Updated successfully');
        onRefresh();
      } else {
        setMsg(data.error || 'Failed to update');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setLoading(false);
    }
  };

  const tuitionParams = new URLSearchParams({
    guardianName: req.guardianName,
    guardianPhone: req.guardianPhone,
    ...(req.guardianAddress ? { guardianAddress: req.guardianAddress } : {}),
    class: req.studentClass,
    ...(req.subjects?.length ? { subjects: req.subjects.join(', ') } : {}),
  }).toString();

  return (
    <div className="bg-[#FFFDF7] border-t border-[#E8DDD0] px-5 py-4 space-y-4">
      {/* Full details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
        {req.guardianAddress && (
          <div>
            <span className="text-xs text-[#78716C] font-medium">Address: </span>
            <span className="text-[#1C1917]">{req.guardianAddress}</span>
          </div>
        )}
        {req.subjects && req.subjects.length > 0 && (
          <div>
            <span className="text-xs text-[#78716C] font-medium">Subjects: </span>
            <span className="text-[#1C1917]">{req.subjects.join(', ')}</span>
          </div>
        )}
        {req.message && (
          <div className="sm:col-span-2">
            <span className="text-xs text-[#78716C] font-medium">Message: </span>
            <span className="text-[#1C1917]">{req.message}</span>
          </div>
        )}
        {req.adminNote && (
          <div className="sm:col-span-2">
            <span className="text-xs text-[#78716C] font-medium">Previous Note: </span>
            <span className="text-[#1C1917]">{req.adminNote}</span>
          </div>
        )}
        <div>
          <span className="text-xs text-[#78716C] font-medium">Updated: </span>
          <span className="text-[#1C1917]">{formatDate(req.updatedAt)}</span>
        </div>
      </div>

      {/* Admin note field */}
      {(req.status === 'pending' || req.status === 'processing') && (
        <div>
          <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Admin Note</label>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Internal note (optional)..."
            className="w-full px-3 py-2 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] resize-none"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 items-center">
        {req.status === 'pending' && (
          <button
            onClick={() => act('processing')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-medium hover:bg-blue-100 disabled:opacity-60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mark Processing
          </button>
        )}

        {(req.status === 'pending' || req.status === 'processing') && (
          <>
            <Link
              href={`/dashboard/tuitions/add?${tuitionParams}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006A4E]/10 text-[#006A4E] border border-[#006A4E]/20 rounded-xl text-sm font-medium hover:bg-[#006A4E]/20 transition-colors"
              onClick={() => act('converted')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark Converted + Create Tuition
            </Link>

            <button
              onClick={() => act('rejected')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </>
        )}

        {(req.status === 'converted' || req.status === 'rejected') && (
          <span className="text-sm text-[#78716C] italic">
            This request is {req.status}. No further actions available.
          </span>
        )}

        {msg && (
          <span className={`text-xs font-medium ${msg.includes('success') ? 'text-[#006A4E]' : 'text-red-600'}`}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TutorRequestsDashboard() {
  const { admin, loading: authLoading } = useAdminAuth();

  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, processing: 0, converted: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/tutor-requests?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error('Failed to fetch tutor requests', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTabChange = (key: string) => {
    setStatusFilter(key);
    setPage(1);
    setExpandedId(null);
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Tutor Requests">
        <div className="flex items-center justify-center h-64">
          <svg className="w-6 h-6 animate-spin text-[#006A4E]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Tutor Requests"
      description="Manage guardian requests for specific tutors"
    >
      <div className="space-y-5">

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'bg-[#1C1917]/5 text-[#1C1917]', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )},
            { label: 'Pending', value: stats.pending, color: 'bg-[#E07B2A]/10 text-[#E07B2A]', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
            { label: 'Processing', value: stats.processing, color: 'bg-blue-50 text-blue-700', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )},
            { label: 'Converted', value: stats.converted, color: 'bg-[#006A4E]/10 text-[#006A4E]', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E8DDD0] p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1C1917] leading-none">{s.value}</p>
                <p className="text-xs text-[#78716C] mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[#E8DDD0]">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  statusFilter === tab.key
                    ? 'border-[#006A4E] text-[#006A4E] bg-[#006A4E]/5'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#FFFDF7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <svg className="w-6 h-6 animate-spin text-[#006A4E]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-14 h-14 bg-[#E8DDD0] rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="font-semibold text-[#1C1917]">No requests found</p>
              <p className="text-sm text-[#78716C] mt-1">
                {statusFilter ? `No ${statusFilter} requests yet.` : 'No tutor requests have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F0EB]">
              {requests.map(req => {
                const isExpanded = expandedId === req._id;
                return (
                  <div key={req._id}>
                    {/* Row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : req._id)}
                      className="w-full text-left px-5 py-4 hover:bg-[#FFFDF7] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#005a40] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {req.guardianName.charAt(0).toUpperCase()}
                        </div>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="font-semibold text-[#1C1917] text-sm truncate">{req.guardianName}</span>
                            {statusBadge(req.status)}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#78716C]">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {req.guardianPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Tutor: {req.tutorName || req.tutorId}
                            </span>
                            <span>Class: {req.studentClass}</span>
                            {req.subjects && req.subjects.length > 0 && (
                              <span>{req.subjects.slice(0, 3).join(', ')}{req.subjects.length > 3 ? ` +${req.subjects.length - 3}` : ''}</span>
                            )}
                            <span>{formatDate(req.createdAt)}</span>
                          </div>
                        </div>

                        {/* Expand icon */}
                        <svg
                          className={`w-4 h-4 text-[#78716C] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded */}
                    {isExpanded && <ExpandedRow req={req} onRefresh={fetchData} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E8DDD0] bg-[#FFFDF7]">
              <p className="text-xs text-[#78716C]">
                Page {pagination.page} of {pagination.totalPages} — {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium border border-[#E8DDD0] rounded-lg text-[#78716C] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-medium border border-[#E8DDD0] rounded-lg text-[#78716C] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
