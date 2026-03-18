'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Toast, { useToast } from '@/components/Toast';
import { formatSalary } from '@/utils/formatSalary';

interface Application {
  _id: string;
  status: 'pending' | 'selected-for-demo' | 'confirmed-fee-pending' | 'completed' | 'rejected' | 'withdrawn';
  appliedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  demoDate?: string;
  demoInstructions?: string;
  guardianContactSent?: boolean;
  guardianContactSentAt?: string;
  notes?: string;
  tutor?: { _id: string; name: string; phone: string; email?: string };
  tuition: {
    _id: string;
    code: string;
    class: string;
    version: string;
    location: string;
    salary: { min?: number; max?: number } | string;
    status: string;
    guardianName?: string;
    guardianPhone?: string;
  };
}

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; step: number }> = {
  'pending':             { label: 'Pending',            dot: 'bg-yellow-400',   badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',  step: 1 },
  'selected-for-demo':   { label: 'Demo Selected',      dot: 'bg-orange-400',   badge: 'bg-orange-50 text-orange-700 border-orange-200',   step: 2 },
  'confirmed-fee-pending':{ label: 'Fee Pending',       dot: 'bg-[#006A4E]',    badge: 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/20', step: 3 },
  'completed':           { label: 'Completed',          dot: 'bg-blue-500',     badge: 'bg-blue-50 text-blue-700 border-blue-200',         step: 4 },
  'rejected':            { label: 'Rejected',           dot: 'bg-red-400',      badge: 'bg-red-50 text-red-700 border-red-200',            step: 0 },
  'withdrawn':           { label: 'Withdrawn',          dot: 'bg-gray-400',     badge: 'bg-gray-50 text-gray-600 border-gray-200',         step: 0 },
};

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'selected-for-demo', label: 'Demo' },
  { value: 'confirmed-fee-pending', label: 'Fee Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Tutor Profile Slide-over ───────────────────────────────────────────────────
function TutorProfilePanel({ tutor, onClose }: { tutor: any; onClose: () => void }) {
  const initials = tutor.name?.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join('') || '?';
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="h-1.5 bg-gradient-to-r from-[#006A4E] to-[#E07B2A] shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD0] bg-[#FFFDF7] shrink-0">
          <h2 className="font-bold text-[#1C1917]">Tutor Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0EB] text-[#78716C]" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#006A4E] to-[#005a40] flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-[#1C1917] text-lg">{tutor.name}</p>
              <p className="text-sm text-[#006A4E] font-medium">{tutor.tutorId}</p>
              {tutor.profileStatus && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${tutor.profileStatus === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tutor.profileStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {tutor.profileStatus}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#006A4E]">{tutor.totalApplications || 0}</p>
              <p className="text-xs text-[#78716C]">Applications</p>
            </div>
            <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#E07B2A]">{tutor.successfulTuitions || 0}</p>
              <p className="text-xs text-[#78716C]">Successful</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden">
            <p className="text-xs font-semibold text-[#78716C] px-4 py-3 border-b border-[#F5F0EB] bg-[#FFFDF7]">Contact</p>
            <div className="divide-y divide-[#F5F0EB]">
              {[
                { label: 'Phone', value: tutor.phone },
                { label: 'Email', value: tutor.email },
                { label: 'Gender', value: tutor.gender },
                { label: 'Address', value: tutor.address },
                { label: 'Father Name', value: tutor.fatherName },
                { label: 'Father Phone', value: tutor.fatherNumber },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-[#78716C] w-28 shrink-0">{r.label}</span>
                  <span className="text-sm text-[#1C1917] text-right">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden">
            <p className="text-xs font-semibold text-[#78716C] px-4 py-3 border-b border-[#F5F0EB] bg-[#FFFDF7]">Academic</p>
            <div className="divide-y divide-[#F5F0EB]">
              {[
                { label: 'University', value: tutor.university },
                { label: 'Short Form', value: tutor.universityShortForm },
                { label: 'Department', value: tutor.department },
                { label: 'Year / Sem', value: tutor.yearAndSemester },
                { label: 'College', value: tutor.collegeName },
                { label: 'School', value: tutor.schoolName },
                { label: 'Version', value: tutor.version },
                { label: 'Group', value: tutor.group },
                { label: 'SSC', value: tutor.academicQualifications?.sscResult },
                { label: 'HSC', value: tutor.academicQualifications?.hscResult },
                { label: 'O-Level', value: tutor.academicQualifications?.oLevelResult },
                { label: 'A-Level', value: tutor.academicQualifications?.aLevelResult },
                { label: 'Experience', value: tutor.experience },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-[#78716C] w-28 shrink-0">{r.label}</span>
                  <span className="text-sm text-[#1C1917] text-right">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects & Locations */}
          {(tutor.preferredSubjects?.length > 0 || tutor.preferredLocation?.length > 0) && (
            <div className="space-y-3">
              {tutor.preferredSubjects?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#78716C] mb-2">Preferred Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.preferredSubjects.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-[#006A4E]/8 text-[#006A4E] border border-[#006A4E]/20 rounded-lg text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {tutor.preferredLocation?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#78716C] mb-2">Preferred Locations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.preferredLocation.map((l: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-[#E07B2A]/8 text-[#E07B2A] border border-[#E07B2A]/20 rounded-lg text-xs font-medium">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {(tutor.documents?.nidPhoto || tutor.documents?.studentIdPhoto || tutor.documents?.additionalDocuments?.length > 0) && (
            <div>
              <p className="text-xs font-semibold text-[#78716C] mb-2">Documents</p>
              <div className="space-y-2">
                {tutor.documents?.nidPhoto && (
                  <a href={tutor.documents.nidPhoto} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl hover:border-[#006A4E]/30 transition-colors text-sm text-[#006A4E] font-medium">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    NID Photo
                    <svg className="w-3.5 h-3.5 ml-auto text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
                {tutor.documents?.studentIdPhoto && (
                  <a href={tutor.documents.studentIdPhoto} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl hover:border-[#006A4E]/30 transition-colors text-sm text-[#006A4E] font-medium">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>
                    Student ID
                    <svg className="w-3.5 h-3.5 ml-auto text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
                {tutor.documents?.additionalDocuments?.map((doc: any, i: number) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl hover:border-[#006A4E]/30 transition-colors text-sm text-[#006A4E] font-medium">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    {doc.label}
                    <svg className="w-3.5 h-3.5 ml-auto text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E8DDD0] bg-[#FFFDF7] shrink-0">
          <Link href={`/tutors/${tutor._id}`} target="_blank" className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#006A4E] text-white rounded-xl text-sm font-semibold hover:bg-[#005a40] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            View Public Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Demo Modal ─────────────────────────────────────────────────────────────────
function DemoModal({ application, onClose, onSubmit, loading }: {
  application: Application; onClose: () => void;
  onSubmit: (instructions: string) => void; loading: boolean;
}) {
  const [instructions, setInstructions] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#E07B2A] to-[#006A4E]" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD0] bg-[#FFFDF7]">
          <div>
            <h2 className="font-bold text-[#1C1917]">Select for Demo</h2>
            <p className="text-xs text-[#78716C] mt-0.5">{application.tutor?.name} · {application.tuition.code}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0EB] text-[#78716C]" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Guardian info */}
          <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[#78716C] mb-2">Guardian Information</p>
            {[
              { label: 'Name', value: application.tuition.guardianName },
              { label: 'Phone', value: application.tuition.guardianPhone },
              { label: 'Location', value: application.tuition.location },
              { label: 'Salary', value: formatSalary(application.tuition.salary) },
            ].filter(r => r.value).map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-[#78716C]">{r.label}</span>
                <span className="text-[#1C1917] font-medium">{r.value}</span>
              </div>
            ))}
          </div>
          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
              Demo Instructions for Tutor <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Enter demo instructions and any additional information for the tutor..."
              className="w-full px-4 py-3 border border-[#E8DDD0] rounded-xl text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#E07B2A]/20 focus:border-[#E07B2A] resize-none"
            />
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-orange-700 mb-1.5">What happens next</p>
            <ul className="text-xs text-orange-600 space-y-1">
              <li>· Tutor receives demo instructions and guardian contact</li>
              <li>· Application status changes to "Demo Selected"</li>
              <li>· Guardian contact flag is set</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#E8DDD0] text-[#78716C] rounded-xl text-sm font-medium hover:bg-[#F5F0EB] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(instructions)}
            disabled={!instructions.trim() || loading}
            className="flex-1 py-2.5 bg-[#E07B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#c96e22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
            {loading ? 'Processing...' : 'Select for Demo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirmation Modal ─────────────────────────────────────────────────────────
function ConfirmationModal({ applicationId, onClose, onSubmit, loading }: {
  applicationId: string; onClose: () => void;
  onSubmit: (id: string, text: string) => void; loading: boolean;
}) {
  const [text, setText] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#006A4E] to-[#E07B2A]" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD0] bg-[#FFFDF7]">
          <h2 className="font-bold text-[#1C1917]">Send Confirmation</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F0EB] text-[#78716C]" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">Confirmation Message <span className="text-red-500">*</span></label>
            <textarea
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter your confirmation message for the tutor..."
              className="w-full px-4 py-3 border border-[#E8DDD0] rounded-xl text-sm text-[#1C1917] placeholder-[#78716C]/60 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#E8DDD0] text-[#78716C] rounded-xl text-sm font-medium hover:bg-[#F5F0EB] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(applicationId, text)}
            disabled={!text.trim() || loading}
            className="flex-1 py-2.5 bg-[#006A4E] text-white rounded-xl text-sm font-semibold hover:bg-[#005a40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
            {loading ? 'Sending...' : 'Send Confirmation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Application Card ───────────────────────────────────────────────────────────
function AppCard({ application, onViewTutor, onSelectDemo, onConfirm, onComplete, onReject, updating }: {
  application: Application;
  onViewTutor: (id: string) => void;
  onSelectDemo: (app: Application) => void;
  onConfirm: (app: Application) => void;
  onComplete: (id: string) => void;
  onReject: (id: string) => void;
  updating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[application.status] || STATUS_CONFIG['pending'];

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${expanded ? 'border-[#006A4E]/30' : 'border-[#E8DDD0]'}`}>
      {/* Card Header — always visible */}
      <button
        className="w-full text-left p-4 sm:p-5"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start gap-3">
          {/* Status dot column */}
          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
            <span className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Top row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-[#1C1917]">{application.tuition.code}</span>
              <span className="text-xs text-[#78716C]">#{application._id.slice(-6).toUpperCase()}</span>
              <StatusBadge status={application.status} />
            </div>
            {/* Tutor + class */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#78716C]">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {application.tutor?.name || 'Guest Applicant'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {application.tuition.class} · {application.tuition.version}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {application.tuition.location}
              </span>
            </div>
            {/* Applied date */}
            <p className="text-xs text-[#78716C] mt-1">{formatDate(application.appliedAt)}</p>
          </div>

          {/* Chevron */}
          <svg className={`w-4 h-4 text-[#78716C] shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#F5F0EB] px-4 sm:px-5 pb-5 pt-4 space-y-4">
          {/* Two-col info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tutor */}
            <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3.5 space-y-2">
              <p className="text-xs font-semibold text-[#78716C]">Tutor</p>
              <p className="text-sm font-medium text-[#1C1917]">{application.tutor?.name || 'Guest'}</p>
              {application.tutor?.phone && <p className="text-xs text-[#78716C]">{application.tutor.phone}</p>}
              {application.tutor?.email && <p className="text-xs text-[#78716C]">{application.tutor.email}</p>}
              {application.tutor?._id && (
                <button
                  onClick={() => onViewTutor(application.tutor!._id)}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#006A4E] font-medium hover:underline"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  View Full Profile
                </button>
              )}
            </div>
            {/* Tuition */}
            <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3.5 space-y-1.5">
              <p className="text-xs font-semibold text-[#78716C]">Tuition</p>
              {[
                { label: 'Guardian', value: application.tuition.guardianName },
                { label: 'Phone', value: application.tuition.guardianPhone },
                { label: 'Salary', value: formatSalary(application.tuition.salary) },
                { label: 'Location', value: application.tuition.location },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span className="text-[#78716C]">{r.label}</span>
                  <span className="text-[#1C1917] font-medium">{r.value}</span>
                </div>
              ))}
              <Link href={`/dashboard/tuitions`} className="inline-flex items-center gap-1 text-xs text-[#006A4E] font-medium mt-1 hover:underline">
                View Tuition
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>

          {/* Demo instructions */}
          {application.demoInstructions && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-orange-700 mb-1">Demo Instructions</p>
              <p className="text-sm text-orange-800">{application.demoInstructions}</p>
              {application.guardianContactSent && (
                <p className="text-xs text-orange-500 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Guardian contact sent · {application.guardianContactSentAt ? formatDate(application.guardianContactSentAt) : ''}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-3.5">
              <p className="text-xs font-semibold text-[#78716C] mb-1">Notes</p>
              <p className="text-sm text-[#1C1917]">{application.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => onSelectDemo(application)}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E07B2A] text-white rounded-xl text-sm font-medium hover:bg-[#c96e22] disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Select for Demo
                </button>
                <button
                  onClick={() => onReject(application._id)}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Reject
                </button>
              </>
            )}

            {application.status === 'selected-for-demo' && (
              <>
                <button
                  onClick={() => onConfirm(application)}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#006A4E] text-white rounded-xl text-sm font-medium hover:bg-[#005a40] disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Confirm & Send Fee Info
                </button>
                <button
                  onClick={() => onReject(application._id)}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Reject
                </button>
              </>
            )}

            {application.status === 'confirmed-fee-pending' && (
              <button
                onClick={() => onComplete(application._id)}
                disabled={updating}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Mark Completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [tutorPanel, setTutorPanel] = useState<any | null>(null);
  const [demoApp, setDemoApp] = useState<Application | null>(null);
  const [confirmApp, setConfirmApp] = useState<Application | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/admin/login'); return; }
    loadApplications();
  }, [session, status]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      } else {
        showToast('Error loading applications', 'error');
      }
    } catch {
      showToast('Error loading applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, body: object) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast('Updated successfully', 'success');
        loadApplications();
      } else {
        const d = await res.json();
        showToast(d.error || 'Update failed', 'error');
      }
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewTutor = async (tutorId: string) => {
    try {
      const res = await fetch(`/api/tutors/${tutorId}`);
      if (res.ok) {
        const d = await res.json();
        setTutorPanel(d.tutor || d);
      } else {
        showToast('Failed to load tutor', 'error');
      }
    } catch {
      showToast('Error loading tutor', 'error');
    }
  };

  const handleDemoSubmit = async (instructions: string) => {
    if (!demoApp) return;
    await updateStatus(demoApp._id, {
      status: 'selected-for-demo',
      demoInstructions: instructions,
      guardianContactSent: true,
      guardianContactSentAt: new Date().toISOString(),
    });
    setDemoApp(null);
  };

  const handleConfirmSubmit = async (id: string, text: string) => {
    await updateStatus(id, { status: 'confirmed-fee-pending', confirmationText: text });
    setConfirmApp(null);
  };

  const filtered = filterStatus ? applications.filter(a => a.status === filterStatus) : applications;

  // Stats
  const stats = [
    { label: 'Total', value: applications.length, color: 'text-[#1C1917]', bg: 'bg-[#F5F0EB]' },
    { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Demo', value: applications.filter(a => a.status === 'selected-for-demo').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Fee Pending', value: applications.filter(a => a.status === 'confirmed-fee-pending').length, color: 'text-[#006A4E]', bg: 'bg-[#006A4E]/8' },
    { label: 'Completed', value: applications.filter(a => a.status === 'completed').length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <DashboardLayout title="Applications" description="Manage tuition applications">
      <Toast />

      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3.5 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#78716C] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-white border border-[#E8DDD0] rounded-2xl p-1.5">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === tab.value
                  ? 'bg-[#006A4E] text-white shadow-sm'
                  : 'text-[#78716C] hover:bg-[#F5F0EB]'
              }`}
            >
              {tab.label}
              {tab.value && (
                <span className={`ml-1.5 text-xs ${filterStatus === tab.value ? 'opacity-80' : 'text-[#a8a29e]'}`}>
                  {applications.filter(a => a.status === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8DDD0] p-5 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#E8DDD0] mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 w-24 bg-[#E8DDD0] rounded" />
                      <div className="h-5 w-16 bg-[#E8DDD0] rounded-full" />
                    </div>
                    <div className="h-3 w-48 bg-[#E8DDD0] rounded" />
                    <div className="h-3 w-32 bg-[#E8DDD0] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DDD0] p-16 text-center">
            <div className="w-14 h-14 bg-[#E8DDD0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-semibold text-[#1C1917] mb-1">{filterStatus ? `No ${STATUS_CONFIG[filterStatus]?.label} applications` : 'No applications yet'}</p>
            <p className="text-sm text-[#78716C]">Applications from tutors will appear here.</p>
            {filterStatus && (
              <button onClick={() => setFilterStatus('')} className="mt-4 px-4 py-2 bg-[#006A4E] text-white rounded-xl text-sm font-medium hover:bg-[#005a40] transition-colors">
                Show All
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#78716C] px-1">{filtered.length} application{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map(app => (
              <AppCard
                key={app._id}
                application={app}
                onViewTutor={handleViewTutor}
                onSelectDemo={setDemoApp}
                onConfirm={setConfirmApp}
                onComplete={id => updateStatus(id, { status: 'completed' })}
                onReject={id => updateStatus(id, { status: 'rejected' })}
                updating={updatingId === app._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Panels & Modals */}
      {tutorPanel && <TutorProfilePanel tutor={tutorPanel} onClose={() => setTutorPanel(null)} />}
      {demoApp && (
        <DemoModal
          application={demoApp}
          onClose={() => setDemoApp(null)}
          onSubmit={handleDemoSubmit}
          loading={updatingId === demoApp._id}
        />
      )}
      {confirmApp && (
        <ConfirmationModal
          applicationId={confirmApp._id}
          onClose={() => setConfirmApp(null)}
          onSubmit={handleConfirmSubmit}
          loading={updatingId === confirmApp._id}
        />
      )}
    </DashboardLayout>
  );
}
