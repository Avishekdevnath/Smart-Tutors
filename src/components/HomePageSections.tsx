'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AcademicCapIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const formatLocation = (location: string | { division: string; district: string; area: string }): string => {
  if (typeof location === 'string') return location;
  if (location && typeof location === 'object') {
    const { division, district, area } = location;
    return [area, district, division].filter(Boolean).join(', ');
  }
  return 'Location not specified';
};

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: number;
  location: string | { division: string; district: string; area: string };
  status: string;
  rating?: number;
}

interface Tuition {
  _id: string;
  code: string;
  guardianName: string;
  guardianNumber: string;
  class: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  dailyHours?: string;
  salary: string;
  location: string | { division: string; district: string; area: string };
  tutorGender: string;
  specialRemarks?: string;
  urgent?: boolean;
  status: string;
  createdAt: string;
  applications?: Array<{ tutorId: string; appliedDate: string; _id?: string }>;
}

/* ─── Top Tutors ─────────────────────────────────────────────── */
export function TopTutorsSection() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tutors')
      .then(r => r.ok ? r.json() : [])
      .then(data => setTutors(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeleton = (
    <section className="py-20 bg-[#FFFDF7] border-y border-[#E8DDD0]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-[#1C1917] mb-2">সেরা টিউটরগণ</h2>
          <p className="text-[#006A4E] font-semibold text-sm uppercase tracking-wide">Top Tutors</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8DDD0] p-6 animate-pulse">
              <div className="flex items-center mb-4 gap-3">
                <div className="w-12 h-12 bg-[#F5F0E8] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#F5F0E8] rounded w-32" />
                  <div className="h-3 bg-[#F5F0E8] rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-[#F5F0E8] rounded w-full" />
                <div className="h-3 bg-[#F5F0E8] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (loading) return skeleton;

  return (
    <section className="py-20 bg-[#FFFDF7] border-y border-[#E8DDD0]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-[#006A4E] px-3 py-1 rounded-full text-sm font-semibold mb-4">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            যাচাইকৃত ও অভিজ্ঞ
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1917] mb-2">
            সেরা টিউটরগণ
          </h2>
          <p className="text-[#006A4E] font-semibold text-sm uppercase tracking-widest mb-3">Top Tutors</p>
          <p className="text-[#78716C] text-base max-w-xl mx-auto">
            আমাদের সবচেয়ে যোগ্য ও অভিজ্ঞ টিউটরদের সাথে পরিচিত হন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor._id} className="bg-white rounded-2xl border border-[#E8DDD0] hover:shadow-card-hover hover:border-[#006A4E]/30 transition-all duration-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#006A4E] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {tutor.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#1C1917]">{tutor.name || 'Tutor Name'}</h3>
                  {/* Subject names stay in English */}
                  <p className="text-sm text-[#78716C]">{tutor.subjects?.slice(0, 2).join(', ') || 'Subject'}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-[#78716C] gap-2">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-[#E07B2A]" />
                  <span>{formatLocation(tutor.location)}</span>
                </div>
                <div className="flex items-center text-sm text-[#78716C] gap-2">
                  <AcademicCapIcon className="h-4 w-4 shrink-0 text-[#006A4E]" />
                  {/* Numbers stay in English */}
                  <span>{tutor.experience || 0} yrs experience</span>
                </div>
                <div className="flex items-center text-sm text-[#78716C] gap-2">
                  <StarIcon className="h-4 w-4 shrink-0 text-[#E07B2A]" />
                  <span>Rating: {tutor.rating || 4.5}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F5F0E8]">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  tutor.status === 'active'
                    ? 'bg-green-50 text-[#006A4E] border border-green-200'
                    : 'bg-[#F5F0E8] text-[#78716C] border border-[#E8DDD0]'
                }`}>
                  {/* Status label English */}
                  {tutor.status === 'active' ? 'Available' : tutor.status || 'Available'}
                </span>
                <Link href={`/tutors/${tutor._id}`}>
                  <button className="text-[#006A4E] hover:text-[#005540] text-sm font-semibold cursor-pointer">
                    প্রোফাইল দেখুন →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/tutors">
            <button className="bg-[#006A4E] hover:bg-[#005540] text-white px-10 py-3.5 rounded-xl font-semibold text-base transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer">
              সব টিউটর দেখুন — View All Tutors
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Latest Tuitions ────────────────────────────────────────── */
export function LatestTuitionsSection() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tuitions')
      .then(r => r.ok ? r.json() : [])
      .then((data: Tuition[]) => {
        const available = data.filter(t => ['open', 'available'].includes(t.status));
        setTuitions(available.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getApplicationsCount = (apps?: Array<{ tutorId: string; appliedDate: string; _id?: string }>) =>
    Array.isArray(apps) ? apps.length : 0;

  const getDaysAgo = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const skeletonSection = (
    <section className="py-20 bg-[#FFFDF7]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-[#1C1917] mb-2">সর্বশেষ টিউশন</h2>
          <p className="text-[#006A4E] text-sm font-semibold uppercase tracking-wide">Latest Tuitions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8DDD0] p-5 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-5 bg-[#F5F0E8] rounded w-20" />
                <div className="h-5 bg-[#F5F0E8] rounded w-16" />
              </div>
              <div className="space-y-2.5">
                <div className="h-3.5 bg-[#F5F0E8] rounded w-full" />
                <div className="h-3.5 bg-[#F5F0E8] rounded w-2/3" />
                <div className="h-3.5 bg-[#F5F0E8] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (loading) return skeletonSection;

  return (
    <section className="py-20 bg-[#FFFDF7]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-[#E07B2A] px-3 py-1 rounded-full text-sm font-semibold mb-4">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            নতুন সুযোগ
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1917] mb-2">
            সর্বশেষ টিউশন
          </h2>
          <p className="text-[#006A4E] font-semibold text-sm uppercase tracking-widest mb-3">Latest Tuitions</p>
          <p className="text-[#78716C] text-base max-w-2xl mx-auto">
            ঢাকার পরিবারগুলোর পোস্ট করা নতুন শিক্ষাদানের সুযোগগুলো দেখুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tuitions.map((tuition) => (
            <div
              key={tuition._id}
              className="group bg-white rounded-2xl border border-[#E8DDD0] hover:border-[#006A4E]/30 hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Top — code (English) + badges (English) */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <span className="font-heading font-bold text-[#1C1917] text-lg tracking-tight">
                  {tuition.code}
                </span>
                <div className="flex items-center gap-2">
                  {tuition.urgent && (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      URGENT
                    </span>
                  )}
                  <span className="bg-green-50 text-[#006A4E] border border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">
                    {tuition.status}
                  </span>
                </div>
              </div>

              {/* Class + version — English attributes */}
              <p className="px-5 pb-4 text-sm text-[#78716C]">
                {tuition.class} · {tuition.version}
              </p>

              <div className="px-5 pb-5 flex flex-col gap-3 flex-1">
                {/* Subjects — English names */}
                <div className="flex flex-wrap gap-1.5">
                  {tuition.subjects?.slice(0, 4).map((subject, i) => (
                    <span key={i} className="bg-green-50 text-[#006A4E] border border-green-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                      {subject}
                    </span>
                  ))}
                  {tuition.subjects?.length > 4 && (
                    <span className="bg-[#F5F0E8] text-[#78716C] px-2.5 py-0.5 rounded-md text-xs font-medium">
                      +{tuition.subjects.length - 4}
                    </span>
                  )}
                </div>

                {/* Meta rows — Bengali labels, English values */}
                <div className="space-y-2 text-sm text-[#78716C]">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 shrink-0 text-[#E07B2A]" />
                    <span className="truncate">{formatLocation(tuition.location)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 shrink-0 text-[#006A4E]" />
                    <span>
                      {tuition.weeklyDays}
                      {tuition.dailyHours && ` · ${tuition.dailyHours}`}
                    </span>
                  </div>
                </div>

                {/* Salary */}
                <p className="text-[#006A4E] font-heading font-bold text-lg">৳ {tuition.salary}</p>

                {/* Tutor preference */}
                {tuition.tutorGender && tuition.tutorGender !== 'Not specified' && (
                  <div className="flex items-center gap-2 bg-[#FFFDF7] border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#78716C]">
                    <UserIcon className="w-4 h-4 shrink-0 text-[#E07B2A]" />
                    <span>
                      <span className="font-semibold text-[#1C1917]">Preferred:</span>{' '}
                      {tuition.tutorGender} tutor
                    </span>
                  </div>
                )}

                <div className="flex-1" />

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F5F0E8]">
                  <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                    <span className="font-semibold text-[#006A4E]">
                      {getApplicationsCount(tuition.applications)} applied
                    </span>
                    <span>·</span>
                    <span>{getDaysAgo(tuition.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/tuition/${tuition.code}`}>
                      <button className="border border-[#E8DDD0] text-[#1C1917] hover:border-[#006A4E] hover:text-[#006A4E] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer">
                        Details
                      </button>
                    </Link>
                    <Link href={`/tutors/register?tuition=${tuition.code}`}>
                      <button className="bg-[#E07B2A] hover:bg-[#C96A1A] text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer">
                        Apply →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/tuitions">
            <button className="bg-[#006A4E] hover:bg-[#005540] text-white px-10 py-3.5 rounded-xl font-semibold text-base transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer">
              সব টিউশন দেখুন — Explore All Tuitions
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
