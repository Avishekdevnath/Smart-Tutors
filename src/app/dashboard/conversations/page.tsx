'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ExtractedData {
  studentClass?: string;
  subjects?: string[];
  location?: {
    division?: string;
    district?: string;
    area?: string;
    subarea?: string;
  };
  medium?: string;
  tutorGender?: string;
  daysPerWeek?: number;
  salary?: { min?: number; max?: number };
  additionalNotes?: string;
  guardianName?: string;
  guardianPhone?: string;
}

interface Conversation {
  _id: string;
  userName?: string;
  userPhone?: string;
  userType: string;
  intent: string | null;
  status: 'active' | 'completed' | 'escalated' | 'abandoned';
  messages: Message[];
  completeness: number;
  confirmedByUser: boolean;
  extractedData: ExtractedData;
  tuitionId?: string;
  escalationReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalToday: number;
  pendingDrafts: number;
  escalated: number;
  successRate: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এইমাত্র';
  if (mins < 60) return `${mins}m আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h আগে`;
  const days = Math.floor(hrs / 24);
  return `${days}d আগে`;
}

function statusLabel(s: string) {
  switch (s) {
    case 'active': return 'সক্রিয়';
    case 'completed': return 'সম্পন্ন';
    case 'escalated': return 'এসকালেটেড';
    case 'abandoned': return 'বাতিল';
    default: return s;
  }
}

function statusClasses(s: string) {
  switch (s) {
    case 'active': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'completed': return 'bg-green-50 text-[#006A4E] border border-green-200';
    case 'escalated': return 'bg-orange-50 text-[#E07B2A] border border-orange-200';
    case 'abandoned': return 'bg-red-50 text-red-700 border border-red-200';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function intentLabel(i: string | null) {
  switch (i) {
    case 'post_tuition': return 'টিউশন পোস্ট';
    case 'track_status': return 'স্ট্যাটাস ট্র্যাক';
    case 'faq': return 'FAQ';
    case 'support': return 'সাপোর্ট';
    default: return 'অজানা';
  }
}

function intentClasses(i: string | null) {
  switch (i) {
    case 'post_tuition': return 'bg-[#006A4E]/10 text-[#006A4E]';
    case 'track_status': return 'bg-blue-100 text-blue-700';
    case 'faq': return 'bg-purple-100 text-purple-700';
    case 'support': return 'bg-[#E07B2A]/10 text-[#E07B2A]';
    default: return 'bg-gray-100 text-gray-600';
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E8DDD0] p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#78716C] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#1C1917] leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConvListItem({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const lastMsg = conv.messages[conv.messages.length - 1];
  const displayName = conv.userName || conv.userPhone || 'অজানা ব্যবহারকারী';
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-[#E8DDD0] transition-colors ${
        selected ? 'bg-[#006A4E]/5 border-l-2 border-l-[#006A4E]' : 'hover:bg-[#F5F0E8]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#E8DDD0] flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-4 h-4 text-[#78716C]" />
          </div>
          <span className="text-sm font-semibold text-[#1C1917] truncate">{displayName}</span>
        </div>
        <span className="text-[10px] text-[#78716C] flex-shrink-0 mt-0.5">{timeAgo(conv.updatedAt)}</span>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusClasses(conv.status)}`}>
          {statusLabel(conv.status)}
        </span>
        {conv.intent && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${intentClasses(conv.intent)}`}>
            {intentLabel(conv.intent)}
          </span>
        )}
      </div>

      {lastMsg && (
        <p className="text-xs text-[#78716C] line-clamp-1 mb-2">
          {lastMsg.role === 'user' ? '👤 ' : '🤖 '}
          {lastMsg.content}
        </p>
      )}

      {conv.intent === 'post_tuition' && (
        <div className="w-full bg-[#E8DDD0] rounded-full h-1">
          <div
            className="h-1 rounded-full bg-[#006A4E] transition-all"
            style={{ width: `${Math.min(conv.completeness, 100)}%` }}
          />
        </div>
      )}
    </button>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[#006A4E] text-white rounded-br-sm'
            : 'bg-[#F5F0E8] text-[#1C1917] border border-[#E8DDD0] rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isUser ? 'text-white/60 text-right' : 'text-[#78716C]'}`}>
          {new Date(msg.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ─── Editable Draft Form ───────────────────────────────────────────────────────

interface DraftEdits {
  guardianName: string;
  guardianNumber: string;
  studentClass: string;
  subjects: string;
  medium: string;
  tutorGender: string;
  daysPerWeek: string;
  salaryMin: string;
  salaryMax: string;
  area: string;
  notes: string;
}

function DraftForm({
  extractedData,
  edits,
  onChange,
}: {
  extractedData: ExtractedData;
  edits: DraftEdits;
  onChange: (field: keyof DraftEdits, val: string) => void;
}) {
  const inp =
    'w-full text-sm border border-[#E8DDD0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] text-[#1C1917]';
  const lbl = 'block text-xs font-semibold text-[#78716C] mb-1';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>অভিভাবকের নাম</label>
          <input className={inp} value={edits.guardianName} onChange={(e) => onChange('guardianName', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>ফোন নম্বর</label>
          <input className={inp} value={edits.guardianNumber} onChange={(e) => onChange('guardianNumber', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>শ্রেণি</label>
          <input className={inp} value={edits.studentClass} onChange={(e) => onChange('studentClass', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>মাধ্যম</label>
          <input className={inp} value={edits.medium} onChange={(e) => onChange('medium', e.target.value)} placeholder="English Medium" />
        </div>
      </div>
      <div>
        <label className={lbl}>বিষয়সমূহ (comma দিয়ে আলাদা করুন)</label>
        <input className={inp} value={edits.subjects} onChange={(e) => onChange('subjects', e.target.value)} placeholder="Math, English, Science" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>শিক্ষকের লিঙ্গ</label>
          <input className={inp} value={edits.tutorGender} onChange={(e) => onChange('tutorGender', e.target.value)} placeholder="যেকোনো" />
        </div>
        <div>
          <label className={lbl}>সাপ্তাহিক দিন</label>
          <input className={inp} type="number" value={edits.daysPerWeek} onChange={(e) => onChange('daysPerWeek', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>বেতন (সর্বনিম্ন)</label>
          <input className={inp} type="number" value={edits.salaryMin} onChange={(e) => onChange('salaryMin', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>বেতন (সর্বোচ্চ)</label>
          <input className={inp} type="number" value={edits.salaryMax} onChange={(e) => onChange('salaryMax', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={lbl}>এলাকা</label>
        <input className={inp} value={edits.area} onChange={(e) => onChange('area', e.target.value)} />
      </div>
      <div>
        <label className={lbl}>অতিরিক্ত নোট</label>
        <textarea
          className={`${inp} resize-none`}
          rows={2}
          value={edits.notes}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Conversation Detail Panel ────────────────────────────────────────────────

function ConvDetail({
  conv,
  onAction,
  onBack,
}: {
  conv: Conversation;
  onAction: (action: 'publish' | 'reject', edits?: any, rejectReason?: string) => Promise<void>;
  onBack?: () => void;
}) {
  const hasDraft = conv.intent === 'post_tuition' && !!conv.tuitionId;
  const [edits, setEdits] = useState<DraftEdits>({
    guardianName: conv.extractedData.guardianName || '',
    guardianNumber: conv.extractedData.guardianPhone || '',
    studentClass: conv.extractedData.studentClass || '',
    subjects: (conv.extractedData.subjects || []).join(', '),
    medium: conv.extractedData.medium || '',
    tutorGender: conv.extractedData.tutorGender || '',
    daysPerWeek: conv.extractedData.daysPerWeek?.toString() || '',
    salaryMin: conv.extractedData.salary?.min?.toString() || '',
    salaryMax: conv.extractedData.salary?.max?.toString() || '',
    area: [
      conv.extractedData.location?.area,
      conv.extractedData.location?.district,
    ]
      .filter(Boolean)
      .join(', '),
    notes: conv.extractedData.additionalNotes || '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishedCode, setPublishedCode] = useState<string | null>(null);

  const handleEdits = (field: keyof DraftEdits, val: string) =>
    setEdits((prev) => ({ ...prev, [field]: val }));

  const buildEditsPayload = () => {
    const subjects = edits.subjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      guardianName: edits.guardianName,
      guardianNumber: edits.guardianNumber,
      class: edits.studentClass,
      version: edits.medium,
      subjects,
      tutorGender: edits.tutorGender || 'Not specified',
      weeklyDays: edits.daysPerWeek,
      location: edits.area,
      salary: {
        min: edits.salaryMin ? Number(edits.salaryMin) : undefined,
        max: edits.salaryMax ? Number(edits.salaryMax) : undefined,
      },
      specialRemarks: edits.notes,
    };
  };

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const res = await onAction('publish', buildEditsPayload());
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await onAction('reject', undefined, rejectReason);
    } finally {
      setSubmitting(false);
    }
  };

  const canPublish =
    conv.status !== 'completed' && conv.status !== 'abandoned';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8DDD0] bg-white flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="p-1 rounded-lg hover:bg-[#F5F0E8] text-[#78716C]">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#1C1917] text-sm">
              {conv.userName || conv.userPhone || 'অজানা ব্যবহারকারী'}
            </span>
            {conv.userPhone && (
              <span className="flex items-center gap-1 text-xs text-[#78716C]">
                <PhoneIcon className="w-3 h-3" />
                {conv.userPhone}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusClasses(conv.status)}`}>
              {statusLabel(conv.status)}
            </span>
            {conv.intent && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${intentClasses(conv.intent)}`}>
                {intentLabel(conv.intent)}
              </span>
            )}
            <span className="text-[10px] text-[#78716C]">{timeAgo(conv.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Body: messages + optional draft panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Messages */}
        <div className={`flex flex-col flex-1 min-h-0 ${hasDraft ? 'md:w-1/2 lg:w-3/5' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {conv.messages.length === 0 ? (
              <p className="text-center text-sm text-[#78716C] mt-8">কোনো বার্তা নেই</p>
            ) : (
              conv.messages.map((m, i) => <ChatBubble key={i} msg={m} />)
            )}
          </div>
        </div>

        {/* Draft sidebar */}
        {hasDraft && (
          <div className="hidden md:flex flex-col w-1/2 lg:w-2/5 border-l border-[#E8DDD0] bg-[#FFFDF7] overflow-y-auto">
            <div className="px-4 py-3 border-b border-[#E8DDD0]">
              <h3 className="text-sm font-semibold text-[#1C1917]">টিউশন ড্রাফট</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-[#E8DDD0] rounded-full">
                  <div
                    className="h-1.5 rounded-full bg-[#006A4E]"
                    style={{ width: `${Math.min(conv.completeness, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#78716C]">{conv.completeness}%</span>
              </div>
            </div>
            <div className="p-4 flex-1">
              <DraftForm extractedData={conv.extractedData} edits={edits} onChange={handleEdits} />
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      {canPublish && (
        <div className="flex-shrink-0 border-t border-[#E8DDD0] bg-white px-4 py-3 space-y-3">
          {publishedCode && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              <CheckCircleIcon className="w-5 h-5 text-[#006A4E] flex-shrink-0" />
              <p className="text-sm font-semibold text-[#006A4E]">
                প্রকাশিত হয়েছে — কোড: <span className="font-bold">{publishedCode}</span>
              </p>
            </div>
          )}

          {showRejectInput && (
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border border-[#E8DDD0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                placeholder="প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <button
                onClick={handleReject}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 transition-colors"
              >
                নিশ্চিত করুন
              </button>
              <button
                onClick={() => setShowRejectInput(false)}
                className="px-3 py-2 text-sm text-[#78716C] hover:bg-[#F5F0E8] rounded-lg transition-colors"
              >
                বাতিল
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {hasDraft && (
              <button
                onClick={handlePublish}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006A4E] text-white text-sm font-semibold rounded-xl hover:bg-[#005a40] disabled:opacity-50 transition-colors shadow-sm"
              >
                <CheckCircleIcon className="w-4 h-4" />
                প্রকাশ করুন
              </button>
            )}
            {!showRejectInput && (
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-400 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                প্রত্যাখ্যান করুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed state */}
      {conv.status === 'completed' && (
        <div className="flex-shrink-0 border-t border-[#E8DDD0] bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-[#006A4E]" />
            <p className="text-sm font-medium text-[#006A4E]">এই কথোপকথন সম্পন্ন হয়েছে।</p>
          </div>
        </div>
      )}

      {/* Abandoned state */}
      {conv.status === 'abandoned' && (
        <div className="flex-shrink-0 border-t border-[#E8DDD0] bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium text-red-600">
              এই কথোপকথন বাতিল করা হয়েছে।
              {conv.escalationReason && (
                <span className="text-red-500"> কারণ: {conv.escalationReason}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Escalated: contact user via WhatsApp / Call */}
      {conv.status === 'escalated' && (
        <div className="flex-shrink-0 border-t border-[#E8DDD0] bg-orange-50 px-4 py-3">
          <p className="text-xs font-semibold text-[#E07B2A] mb-2">
            ব্যবহারকারী সরাসরি কথা বলতে চান — যোগাযোগ করুন:
          </p>
          {conv.userPhone ? (
            <div className="flex gap-2">
              <a
                href={`https://wa.me/88${conv.userPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম! Smart Tutors থেকে বলছি।')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp: {conv.userPhone}
              </a>
              <a
                href={`tel:${conv.userPhone}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#E07B2A] text-[#E07B2A] hover:bg-orange-100 transition-colors"
              >
                <PhoneIcon className="w-4 h-4" />
                কল
              </a>
            </div>
          ) : (
            <p className="text-xs text-[#78716C]">
              ব্যবহারকারীর ফোন নম্বর পাওয়া যায়নি। চ্যাট বার্তা দেখে যোগাযোগ করুন।
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all', label: 'সব' },
  { key: 'active', label: 'সক্রিয়' },
  { key: 'escalated', label: 'এসকালেটেড' },
  { key: 'completed', label: 'সম্পন্ন' },
  { key: 'abandoned', label: 'বাতিল' },
];

export default function ConversationsDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats>({ totalToday: 0, pendingDrafts: 0, escalated: 0, successRate: 0 });
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/dashboard/login');
    }
  }, [sessionStatus, router]);

  const fetchConversations = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        });
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (search.trim()) params.set('search', search.trim());

        const res = await fetch(`/api/conversations?${params}`);
        const data = await res.json();
        if (data.conversations) {
          setConversations(data.conversations);
          setStats(data.stats);
          setPagination(data.pagination);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  useEffect(() => {
    fetchConversations(1);
  }, [fetchConversations]);

  const handleSelect = (conv: Conversation) => {
    setSelectedConv(conv);
    setMobileView('detail');
    setActionMsg(null);
  };

  const handleAction = async (
    action: 'publish' | 'reject',
    edits?: any,
    rejectReason?: string
  ): Promise<void> => {
    if (!selectedConv) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv._id,
          action,
          edits,
          rejectReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'অনুরোধ ব্যর্থ হয়েছে');

      if (action === 'publish') {
        setActionMsg({ type: 'success', text: `প্রকাশিত হয়েছে! কোড: ${data.tuition?.code}` });
        // Update local list
        setConversations((prev) =>
          prev.map((c) => (c._id === selectedConv._id ? { ...c, status: 'completed' } : c))
        );
        setSelectedConv((prev) => (prev ? { ...prev, status: 'completed' } : prev));
      } else {
        setActionMsg({ type: 'success', text: 'কথোপকথন বাতিল করা হয়েছে।' });
        setConversations((prev) =>
          prev.map((c) => (c._id === selectedConv._id ? { ...c, status: 'abandoned' } : c))
        );
        setSelectedConv((prev) => (prev ? { ...prev, status: 'abandoned' } : prev));
      }

      // Refresh stats
      fetchConversations(pagination.page);
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e.message });
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <DashboardLayout title="কথোপকথন" description="AI চ্যাট কথোপকথন পর্যালোচনা ও পরিচালনা করুন">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#006A4E] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="কথোপকথন" description="AI চ্যাট কথোপকথন পর্যালোচনা ও পরিচালনা করুন">
      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="আজকের কথোপকথন"
          value={stats.totalToday}
          icon={<ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />}
          accent="bg-blue-50"
        />
        <StatCard
          label="পেন্ডিং ড্রাফট"
          value={stats.pendingDrafts}
          icon={<ClockIcon className="w-5 h-5 text-[#E07B2A]" />}
          accent="bg-[#E07B2A]/10"
        />
        <StatCard
          label="এসকালেটেড"
          value={stats.escalated}
          icon={<ExclamationTriangleIcon className="w-5 h-5 text-red-500" />}
          accent="bg-red-50"
        />
        <StatCard
          label="সাফল্যের হার"
          value={`${stats.successRate}%`}
          icon={<CheckCircleIcon className="w-5 h-5 text-[#006A4E]" />}
          accent="bg-green-50"
        />
      </div>

      {/* Action message */}
      {actionMsg && (
        <div
          className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
            actionMsg.type === 'success'
              ? 'bg-green-50 text-[#006A4E] border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
          ) : (
            <XCircleIcon className="w-4 h-4 flex-shrink-0" />
          )}
          {actionMsg.text}
          <button onClick={() => setActionMsg(null)} className="ml-auto text-inherit opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Main panel */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        <div className="flex h-full">

          {/* LEFT: Conversation list */}
          <div
            className={`flex flex-col border-r border-[#E8DDD0] ${
              selectedConv ? 'hidden md:flex md:w-1/3' : 'flex w-full md:w-1/3'
            } ${mobileView === 'detail' ? 'hidden' : 'flex'} md:flex`}
          >
            {/* Search + filters */}
            <div className="px-3 py-3 border-b border-[#E8DDD0] space-y-2 flex-shrink-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DDD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E]/30 focus:border-[#006A4E] bg-[#F5F0E8]"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === tab.key
                        ? 'bg-[#006A4E] text-white'
                        : 'text-[#78716C] hover:bg-[#F5F0E8] hover:text-[#1C1917]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-3 border-[#006A4E] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-[#78716C]">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 opacity-40" />
                  <p className="text-sm">কোনো কথোপকথন পাওয়া যায়নি</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConvListItem
                    key={conv._id}
                    conv={conv}
                    selected={selectedConv?._id === conv._id}
                    onClick={() => handleSelect(conv)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 border-t border-[#E8DDD0] flex-shrink-0">
                <button
                  onClick={() => fetchConversations(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-2 py-1 text-xs rounded border border-[#E8DDD0] disabled:opacity-40 hover:bg-[#F5F0E8]"
                >
                  আগে
                </button>
                <span className="text-xs text-[#78716C]">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchConversations(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-2 py-1 text-xs rounded border border-[#E8DDD0] disabled:opacity-40 hover:bg-[#F5F0E8]"
                >
                  পরে
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Detail panel */}
          <div
            className={`flex-1 flex flex-col ${
              !selectedConv ? 'hidden md:flex' : 'flex'
            } ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}
          >
            {selectedConv ? (
              <ConvDetail
                conv={selectedConv}
                onAction={handleAction}
                onBack={() => {
                  setMobileView('list');
                  setSelectedConv(null);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[#78716C]">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F0E8] flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-[#A8A29E]" />
                </div>
                <p className="text-sm font-medium">একটি কথোপকথন নির্বাচন করুন</p>
                <p className="text-xs text-center max-w-xs">
                  বাম দিক থেকে কোনো কথোপকথনে ক্লিক করুন বিস্তারিত দেখতে ও পর্যালোচনা করতে।
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
