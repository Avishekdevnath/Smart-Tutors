'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  address?: string;
  fatherName?: string;
  fatherNumber?: string;
  version?: string;
  group?: string;
  university?: string;
  universityShortForm?: string;
  department?: string;
  yearAndSemester?: string;
  preferredSubjects?: string[];
  preferredLocation?: string[];
  experience?: string;
  profileStatus?: string;
  totalApplications?: number;
  successfulTuitions?: number;
  academicQualifications?: {
    sscResult?: string;
    hscResult?: string;
    oLevelResult?: string;
    aLevelResult?: string;
  };
  schoolName?: string;
  collegeName?: string;
  isProfileComplete?: boolean;
  createdAt?: string;
  documents?: {
    nidPhoto?: string;
    studentIdPhoto?: string;
    additionalDocuments?: Array<{ label: string; url: string }>;
  };
}

interface TutorProfileVisibility {
  showPhone: boolean;
  showEmail: boolean;
  showFatherInfo: boolean;
  showDocuments: boolean;
  showAddress: boolean;
  showSubjects: boolean;
  showLocations: boolean;
  showAcademics: boolean;
  showResults: boolean;
  showExperience: boolean;
  showStats: boolean;
  enableTutorRequest: boolean;
}

const DEFAULT_VISIBILITY: TutorProfileVisibility = {
  showPhone: false,
  showEmail: false,
  showFatherInfo: false,
  showDocuments: false,
  showAddress: true,
  showSubjects: true,
  showLocations: true,
  showAcademics: true,
  showResults: true,
  showExperience: true,
  showStats: true,
  enableTutorRequest: true,
};

// ── UI Primitives ─────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#E8DDD0] rounded-lg ${className}`} />;
}

function Badge({ children, color = 'green' }: { children: React.ReactNode; color?: 'green' | 'orange' | 'gray' | 'blue' | 'red' }) {
  const colors = {
    green:  'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/20',
    orange: 'bg-[#E07B2A]/10 text-[#E07B2A] border-[#E07B2A]/20',
    gray:   'bg-[#78716C]/10 text-[#78716C] border-[#78716C]/20',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    red:    'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#E8DDD0] shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-[#006A4E]/10 flex items-center justify-center mb-2 text-[#006A4E]">
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#1C1917]">{value}</p>
      <p className="text-xs text-[#78716C] text-center mt-0.5">{label}</p>
    </div>
  );
}

function Section({ title, icon, children, accentColor = 'green' }: { title: string; icon: React.ReactNode; children: React.ReactNode; accentColor?: 'green' | 'orange' | 'red' }) {
  const accent = accentColor === 'red' ? 'bg-red-50/10 text-red-700' : accentColor === 'orange' ? 'bg-[#E07B2A]/10 text-[#E07B2A]' : 'bg-[#006A4E]/10 text-[#006A4E]';
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8DDD0] bg-[#FFFDF7]">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        <h2 className="font-semibold text-[#1C1917] text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[#F5F0EB] last:border-0">
      <span className="text-xs text-[#78716C] font-medium shrink-0 w-36">{label}</span>
      <span className="text-sm text-[#1C1917] text-right">{value}</span>
    </div>
  );
}

// ── Request Modal ──────────────────────────────────────────────────────────────

interface RequestModalProps {
  tutor: Tutor;
  onClose: () => void;
}

function RequestModal({ tutor, onClose }: RequestModalProps) {
  const [form, setForm] = useState({
    guardianName: '',
    guardianPhone: '',
    guardianAddress: '',
    studentClass: '',
    subjects: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const subjectsArr = form.subjects
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/tutor-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutor._id,
          tutorName: tutor.name,
          guardianName: form.guardianName,
          guardianPhone: form.guardianPhone,
          guardianAddress: form.guardianAddress,
          studentClass: form.studentClass,
          subjects: subjectsArr,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD0] bg-[#FFFDF7] shrink-0">
          <div>
            <h2 className="font-bold text-[#1C1917] text-base">Request This Tutor</h2>
            <p className="text-xs text-[#78716C] mt-0.5">{tutor.name} — ID: {tutor.tutorId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0EB] transition-colors text-[#78716C]"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center p-10 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#006A4E]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#1C1917] text-lg">Request Sent!</p>
              <p className="text-[#78716C] text-sm mt-1">We will contact you soon regarding this tutor request.</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-[#006A4E] text-white rounded-xl font-semibold text-sm hover:bg-[#005a40] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="p-5 space-y-4">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Guardian Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.guardianName}
                  onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))}
                  placeholder="আপনার নাম"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FFFDF7] text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Guardian Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  value={form.guardianPhone}
                  onChange={e => setForm(f => ({ ...f, guardianPhone: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FFFDF7] text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Address</label>
                <input
                  type="text"
                  value={form.guardianAddress}
                  onChange={e => setForm(f => ({ ...f, guardianAddress: e.target.value }))}
                  placeholder="আপনার ঠিকানা"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FFFDF7] text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Student Class <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.studentClass}
                  onChange={e => setForm(f => ({ ...f, studentClass: e.target.value }))}
                  placeholder="e.g. Class 8, HSC, Honours 1st Year"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FFFDF7] text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Subjects <span className="text-xs text-[#78716C] font-normal">(comma separated)</span></label>
                <input
                  type="text"
                  value={form.subjects}
                  onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
                  placeholder="Math, English, Physics"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FFFDF7] text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Message</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="কোনো বিশেষ তথ্য থাকলে জানান..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FFFDF7] text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] resize-none"
                />
              </div>
            </div>

            <div className="px-5 pb-5 shrink-0">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#006A4E] text-white rounded-xl font-semibold text-sm hover:bg-[#005a40] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </>
                ) : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Version label map ─────────────────────────────────────────────────────────
const versionLabel: Record<string, string> = {
  BM: 'Bangla Medium',
  EM: 'English Medium',
  EV: 'English Version',
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visibility, setVisibility] = useState<TutorProfileVisibility>(DEFAULT_VISIBILITY);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch tutor, settings, and admin check in parallel
    Promise.all([
      fetch(`/api/tutors/${id}`).then(r => r.json()).catch(() => null),
      fetch('/api/settings').then(r => r.json()).catch(() => null),
      fetch('/api/admin/auth/verify').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([tutorData, settingsData, authData]) => {
      if (tutorData?.success && tutorData?.tutor) {
        setTutor(tutorData.tutor);
      } else {
        setNotFound(true);
      }

      if (settingsData?.tutorProfileVisibility) {
        setVisibility({ ...DEFAULT_VISIBILITY, ...settingsData.tutorProfileVisibility });
      }

      if (authData?.admin) {
        setIsAdmin(true);
      }

      setLoading(false);
    });
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────────
  if (notFound || !tutor) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-[#E8DDD0] rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#1C1917] mb-2">টিউটর পাওয়া যায়নি</h1>
        <p className="text-[#78716C] text-sm mb-6">এই আইডিতে কোনো টিউটর নেই।</p>
        <Link href="/" className="px-6 py-2.5 bg-[#006A4E] text-white rounded-xl text-sm font-medium hover:bg-[#005a40] transition-colors">
          হোমে ফিরে যান
        </Link>
      </div>
    );
  }

  const initials = tutor.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  const isActive = tutor.profileStatus === 'active';
  const showRequest = visibility.enableTutorRequest && !isAdmin;

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E8DDD0] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0EB] transition-colors text-[#78716C]"
            aria-label="হোম"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="h-4 w-px bg-[#E8DDD0]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#006A4E] rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1C1917]">Smart Tutors</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <Link
                href={`/dashboard/tutors/${tutor._id}`}
                className="text-xs px-3 py-1.5 bg-[#E07B2A]/10 text-[#E07B2A] border border-[#E07B2A]/20 rounded-lg font-medium hover:bg-[#E07B2A]/20 transition-colors"
              >
                Admin View
              </Link>
            )}
            <Badge color={isActive ? 'green' : 'gray'}>
              {isActive ? 'Active' : tutor.profileStatus}
            </Badge>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-16">

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#006A4E] to-[#E07B2A]" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#006A4E] to-[#005a40] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {initials}
                </div>
                {isActive && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" aria-label="Active" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-[#1C1917] truncate">{tutor.name}</h1>
                  {tutor.gender && <Badge color="gray">{tutor.gender}</Badge>}
                </div>
                <p className="text-sm font-medium text-[#006A4E] mb-1">ID: {tutor.tutorId}</p>
                {(tutor.university || tutor.universityShortForm) && (
                  <p className="text-sm text-[#78716C] flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    <span className="truncate">
                      {tutor.university || tutor.universityShortForm}
                      {tutor.universityShortForm && tutor.university && ` (${tutor.universityShortForm})`}
                    </span>
                  </p>
                )}
                {(isAdmin || visibility.showAddress) && tutor.address && (
                  <p className="text-sm text-[#78716C] flex items-center gap-1.5 mt-0.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{tutor.address}</span>
                  </p>
                )}
                {/* Admin: phone / email inline */}
                {isAdmin && tutor.phone && (
                  <p className="text-sm text-[#78716C] flex items-center gap-1.5 mt-0.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {tutor.phone}
                  </p>
                )}
                {/* Public phone if visibility enabled */}
                {!isAdmin && visibility.showPhone && tutor.phone && (
                  <p className="text-sm text-[#78716C] flex items-center gap-1.5 mt-0.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {tutor.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Tags row */}
            {(tutor.version || tutor.group || tutor.department || ((isAdmin || visibility.showExperience) && tutor.experience)) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#F5F0EB]">
                {tutor.version && <Badge color="blue">{versionLabel[tutor.version] || tutor.version}</Badge>}
                {tutor.group && <Badge color="orange">{tutor.group}</Badge>}
                {tutor.department && <Badge color="gray">{tutor.department}</Badge>}
                {(isAdmin || visibility.showExperience) && tutor.experience && (
                  <Badge color="green">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tutor.experience} অভিজ্ঞতা
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {(isAdmin || visibility.showStats) && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              value={tutor.successfulTuitions ?? 0}
              label="সফল টিউশন"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
            />
            <StatCard
              value={tutor.totalApplications ?? 0}
              label="আবেদন"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              value={tutor.isProfileComplete ? '✓' : '—'}
              label="প্রোফাইল"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Preferred Subjects */}
        {(isAdmin || visibility.showSubjects) && tutor.preferredSubjects && tutor.preferredSubjects.length > 0 && (
          <Section
            title="পছন্দের বিষয়"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          >
            <div className="flex flex-wrap gap-2">
              {tutor.preferredSubjects.map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-[#006A4E]/8 text-[#006A4E] border border-[#006A4E]/20 rounded-xl text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Preferred Locations */}
        {(isAdmin || visibility.showLocations) && tutor.preferredLocation && tutor.preferredLocation.length > 0 && (
          <Section
            title="পছন্দের এলাকা"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            <div className="flex flex-wrap gap-2">
              {tutor.preferredLocation.map((loc, i) => (
                <span key={i} className="px-3 py-1.5 bg-[#E07B2A]/8 text-[#E07B2A] border border-[#E07B2A]/20 rounded-xl text-sm font-medium flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {loc}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Academic Info */}
        {(isAdmin || visibility.showAcademics) && (tutor.university || tutor.department || tutor.yearAndSemester || tutor.schoolName || tutor.collegeName) && (
          <Section
            title="শিক্ষাগত যোগ্যতা"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            }
          >
            <InfoRow label="বিশ্ববিদ্যালয়" value={tutor.university} />
            <InfoRow label="ডিপার্টমেন্ট" value={tutor.department} />
            <InfoRow label="বর্ষ / সেমিস্টার" value={tutor.yearAndSemester} />
            <InfoRow label="কলেজ" value={tutor.collegeName} />
            <InfoRow label="স্কুল" value={tutor.schoolName} />
            <InfoRow label="মাধ্যম" value={tutor.version ? versionLabel[tutor.version] || tutor.version : undefined} />
            <InfoRow label="গ্রুপ" value={tutor.group} />
          </Section>
        )}

        {/* Results */}
        {(isAdmin || visibility.showResults) && (tutor.academicQualifications?.sscResult || tutor.academicQualifications?.hscResult || tutor.academicQualifications?.oLevelResult || tutor.academicQualifications?.aLevelResult) && (
          <Section
            title="পরীক্ষার ফলাফল"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          >
            <div className="grid grid-cols-2 gap-3">
              {tutor.academicQualifications?.sscResult && (
                <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#78716C] mb-1">SSC GPA</p>
                  <p className="text-lg font-bold text-[#006A4E]">{tutor.academicQualifications.sscResult}</p>
                </div>
              )}
              {tutor.academicQualifications?.hscResult && (
                <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#78716C] mb-1">HSC GPA</p>
                  <p className="text-lg font-bold text-[#006A4E]">{tutor.academicQualifications.hscResult}</p>
                </div>
              )}
              {tutor.academicQualifications?.oLevelResult && (
                <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#78716C] mb-1">O-Level</p>
                  <p className="text-lg font-bold text-[#006A4E]">{tutor.academicQualifications.oLevelResult}</p>
                </div>
              )}
              {tutor.academicQualifications?.aLevelResult && (
                <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#78716C] mb-1">A-Level</p>
                  <p className="text-lg font-bold text-[#006A4E]">{tutor.academicQualifications.aLevelResult}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Father Info — public if visibility.showFatherInfo */}
        {(isAdmin || visibility.showFatherInfo) && (tutor.fatherName || tutor.fatherNumber) && (
          <Section
            title="পিতার তথ্য"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            <InfoRow label="পিতার নাম" value={tutor.fatherName} />
            <InfoRow label="পিতার ফোন" value={tutor.fatherNumber} />
          </Section>
        )}

        {/* Documents — public if visibility.showDocuments, always for admin */}
        {(isAdmin || visibility.showDocuments) && (tutor.documents?.nidPhoto || tutor.documents?.studentIdPhoto || (tutor.documents?.additionalDocuments?.length ?? 0) > 0) && (
          <Section
            title="ডকুমেন্টস"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          >
            <div className="space-y-3">
              {tutor.documents?.nidPhoto && (
                <a href={tutor.documents.nidPhoto} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl hover:border-[#006A4E]/30 transition-colors">
                  <div className="w-8 h-8 bg-[#006A4E]/10 rounded-lg flex items-center justify-center text-[#006A4E] shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#1C1917] font-medium">NID Photo</span>
                  <svg className="w-4 h-4 text-[#78716C] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {tutor.documents?.studentIdPhoto && (
                <a href={tutor.documents.studentIdPhoto} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl hover:border-[#006A4E]/30 transition-colors">
                  <div className="w-8 h-8 bg-[#006A4E]/10 rounded-lg flex items-center justify-center text-[#006A4E] shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#1C1917] font-medium">Student ID</span>
                  <svg className="w-4 h-4 text-[#78716C] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {tutor.documents?.additionalDocuments?.map((doc, i) => (
                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl hover:border-[#006A4E]/30 transition-colors">
                  <div className="w-8 h-8 bg-[#006A4E]/10 rounded-lg flex items-center justify-center text-[#006A4E] shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#1C1917] font-medium">{doc.label}</span>
                  <svg className="w-4 h-4 text-[#78716C] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Email — public if visibility.showEmail, always for admin */}
        {!isAdmin && visibility.showEmail && tutor.email && (
          <Section
            title="যোগাযোগ"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          >
            <InfoRow label="ইমেইল" value={tutor.email} />
          </Section>
        )}

        {/* CTA — for public users */}
        {!isAdmin && (
          <div className="bg-gradient-to-br from-[#006A4E] to-[#005a40] rounded-2xl p-6 text-center shadow-lg">
            <p className="text-white font-semibold text-base mb-1">{tutor.name}-এর সাথে পড়াশোনা শুরু করুন</p>
            <p className="text-[#a8f0d8] text-sm mb-4">
              {showRequest ? 'এই টিউটরকে রিকোয়েস্ট করুন বা নতুন টিউশন পোস্ট করুন।' : 'আজই টিউশন পোস্ট করুন — বিনামূল্যে!'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {showRequest && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E07B2A] text-white rounded-xl font-semibold text-sm hover:bg-[#c96e22] transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Request This Tutor
                </button>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#006A4E] rounded-xl font-semibold text-sm hover:bg-[#FFFDF7] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                টিউশন পোস্ট করুন
              </Link>
            </div>
          </div>
        )}

        {/* Admin: Internal Data Section */}
        {isAdmin && (
          <div className="bg-white rounded-2xl border-2 border-[#E07B2A]/30 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E07B2A]/20 bg-[#E07B2A]/5">
              <div className="w-8 h-8 rounded-lg bg-[#E07B2A]/15 flex items-center justify-center text-[#E07B2A]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-[#1C1917] text-sm">Admin — Internal Data</h2>
                <p className="text-xs text-[#78716C]">Visible to admins only</p>
              </div>
              <span className="ml-auto text-xs px-2 py-0.5 bg-[#E07B2A]/15 text-[#E07B2A] rounded-full font-medium">Admin Only</span>
            </div>
            <div className="p-5 space-y-1">
              <InfoRow label="Phone" value={tutor.phone} />
              <InfoRow label="Email" value={tutor.email} />
              <InfoRow label="Father Name" value={tutor.fatherName} />
              <InfoRow label="Father Number" value={tutor.fatherNumber} />
              <InfoRow label="Full Address" value={tutor.address} />
              <InfoRow label="Profile Status" value={tutor.profileStatus} />
              <InfoRow label="Member Since" value={tutor.createdAt ? new Date(tutor.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined} />
              <div className="flex justify-between items-start py-2.5 border-b border-[#F5F0EB] last:border-0">
                <span className="text-xs text-[#78716C] font-medium shrink-0 w-36">Password</span>
                <span className="text-sm text-[#78716C] text-right italic">stored encrypted</span>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Link
                href={`/dashboard/tutor-requests?tutorId=${tutor._id}&tutorName=${encodeURIComponent(tutor.name)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E]/10 text-[#006A4E] border border-[#006A4E]/20 rounded-xl text-sm font-medium hover:bg-[#006A4E]/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                View Tutor Requests
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestModal tutor={tutor} onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
}
