'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  gender?: string;
  address?: string;
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
  successfulTuitions?: number;
  totalApplications?: number;
  academicQualifications?: {
    sscResult?: string;
    hscResult?: string;
  };
}

const versionLabel: Record<string, string> = {
  BM: 'Bangla Medium',
  EM: 'English Medium',
  EV: 'English Version',
};

const groupOptions = [
  { value: '', label: 'সব গ্রুপ' },
  { value: 'Science', label: 'Science' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Commerce', label: 'Commerce' },
];

const versionOptions = [
  { value: '', label: 'সব মাধ্যম' },
  { value: 'BM', label: 'Bangla Medium' },
  { value: 'EM', label: 'English Medium' },
  { value: 'EV', label: 'English Version' },
];

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#E8DDD0]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#E8DDD0] rounded w-32" />
          <div className="h-3 bg-[#E8DDD0] rounded w-24" />
        </div>
      </div>
      <div className="h-3 bg-[#E8DDD0] rounded w-full" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-[#E8DDD0] rounded-full" />
        <div className="h-6 w-20 bg-[#E8DDD0] rounded-full" />
      </div>
    </div>
  );
}

function TutorCard({ tutor }: { tutor: Tutor }) {
  const initials = tutor.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
  const isActive = tutor.profileStatus === 'active';

  return (
    <Link href={`/tutors/${tutor._id}`} className="block group">
      <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 hover:border-[#006A4E]/40 hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#005a40] flex items-center justify-center text-white text-base font-bold">
              {initials}
            </div>
            {isActive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1C1917] truncate group-hover:text-[#006A4E] transition-colors">
              {tutor.name}
            </p>
            <p className="text-xs text-[#006A4E] font-medium">{tutor.tutorId}</p>
            {(tutor.universityShortForm || tutor.university) && (
              <p className="text-xs text-[#78716C] truncate mt-0.5">
                {tutor.universityShortForm || tutor.university}
                {tutor.department ? ` · ${tutor.department}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        {tutor.address && (
          <p className="text-xs text-[#78716C] flex items-center gap-1 mb-3 truncate">
            <svg className="w-3.5 h-3.5 shrink-0 text-[#E07B2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {tutor.address}
          </p>
        )}

        {/* Subjects */}
        {tutor.preferredSubjects && tutor.preferredSubjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tutor.preferredSubjects.slice(0, 4).map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-[#006A4E]/8 text-[#006A4E] border border-[#006A4E]/15 rounded-lg text-xs font-medium">
                {s}
              </span>
            ))}
            {tutor.preferredSubjects.length > 4 && (
              <span className="px-2 py-0.5 bg-[#E8DDD0] text-[#78716C] rounded-lg text-xs">
                +{tutor.preferredSubjects.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#F5F0EB]">
          <div className="flex gap-1.5 flex-wrap">
            {tutor.version && (
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                {versionLabel[tutor.version] || tutor.version}
              </span>
            )}
            {tutor.group && (
              <span className="text-xs px-2 py-0.5 bg-[#E07B2A]/10 text-[#E07B2A] border border-[#E07B2A]/20 rounded-full">
                {tutor.group}
              </span>
            )}
            {tutor.experience && (
              <span className="text-xs px-2 py-0.5 bg-[#E8DDD0] text-[#78716C] rounded-full">
                {tutor.experience}
              </span>
            )}
          </div>
          {(tutor.successfulTuitions ?? 0) > 0 && (
            <span className="text-xs text-[#006A4E] font-semibold shrink-0">
              {tutor.successfulTuitions} ✓
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function TutorsPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [version, setVersion] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTutors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('searchTerm', debouncedSearch);
    if (group) params.set('group', group);
    if (version) params.set('version', version);

    try {
      const res = await fetch(`/api/tutors?${params}`);
      const data = await res.json();
      setTutors(Array.isArray(data) ? data : []);
    } catch {
      setTutors([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, group, version]);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  const activeCount = tutors.filter(t => t.profileStatus === 'active').length;

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E8DDD0]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0EB] transition-colors text-[#78716C] shrink-0"
            aria-label="হোম"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-[#006A4E] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-semibold text-[#1C1917] text-sm">টিউটর তালিকা</span>
          </div>
          {!loading && (
            <span className="text-xs text-[#78716C] bg-[#F5F0EB] px-2 py-1 rounded-full">
              {activeCount} active / {tutors.length} জন
            </span>
          )}
          <Link
            href="/tutors/register"
            className="ml-auto px-3 py-1.5 bg-[#006A4E] text-white rounded-lg text-xs font-medium hover:bg-[#005a40] transition-colors shrink-0"
          >
            + রেজিস্ট্রেশন
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm p-4 mb-6 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="নাম, বিশ্ববিদ্যালয়, এলাকা দিয়ে খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E8DDD0] rounded-xl text-sm text-[#1C1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
                aria-label="Clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {groupOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGroup(g => g === opt.value ? '' : opt.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  group === opt.value
                    ? 'bg-[#E07B2A] text-white border-[#E07B2A]'
                    : 'bg-white text-[#78716C] border-[#E8DDD0] hover:border-[#E07B2A]/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="w-px h-6 bg-[#E8DDD0] mx-1 self-center" />
            {versionOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setVersion(v => v === opt.value ? '' : opt.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  version === opt.value
                    ? 'bg-[#006A4E] text-white border-[#006A4E]'
                    : 'bg-white text-[#78716C] border-[#E8DDD0] hover:border-[#006A4E]/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : tutors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-[#E8DDD0] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-semibold text-[#1C1917] mb-1">কোনো টিউটর পাওয়া যায়নি</p>
            <p className="text-sm text-[#78716C] mb-4">অনুসন্ধানের শর্ত পরিবর্তন করে আবার চেষ্টা করুন।</p>
            <button
              onClick={() => { setSearch(''); setGroup(''); setVersion(''); }}
              className="px-4 py-2 bg-[#006A4E] text-white rounded-xl text-sm font-medium hover:bg-[#005a40] transition-colors"
            >
              ফিল্টার মুছুন
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#78716C] mb-3">{tutors.length} জন টিউটর পাওয়া গেছে</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutors.map(tutor => (
                <TutorCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
