'use client';

interface ChatConfirmationProps {
  data: Record<string, unknown>;
  onEdit: () => void;
  onConfirm: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  subject: 'বিষয়',
  subjects: 'বিষয়',
  class: 'শ্রেণী',
  studentClass: 'শ্রেণী',
  location: 'এলাকা',
  area: 'এলাকা',
  district: 'জেলা',
  salary: 'বেতন',
  expectedSalary: 'প্রত্যাশিত বেতন',
  tutorGender: 'গৃহশিক্ষকের লিঙ্গ',
  gender: 'লিঙ্গ',
  daysPerWeek: 'সপ্তাহে দিন',
  medium: 'মাধ্যম',
  startTime: 'শুরুর সময়',
  guardianName: 'অভিভাবকের নাম',
  guardianPhone: 'অভিভাবকের ফোন',
  studentName: 'শিক্ষার্থীর নাম',
  specialRequirements: 'বিশেষ প্রয়োজনীয়তা',
  notes: 'মন্তব্য',
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export default function ChatConfirmation({ data, onEdit, onConfirm }: ChatConfirmationProps) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '');

  return (
    <div
      className="mx-3 my-2 rounded-xl border p-4 text-sm"
      style={{ backgroundColor: '#FFFDF7', borderColor: '#E8DDD0' }}
    >
      <p className="font-semibold mb-3" style={{ color: '#1C1917' }}>
        আপনার তথ্য নিশ্চিত করুন
      </p>

      <div className="space-y-1.5 mb-4">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-2">
            <span style={{ color: '#78716C' }} className="flex-shrink-0">
              {FIELD_LABELS[key] || key}:
            </span>
            <span className="font-medium text-right" style={{ color: '#1C1917' }}>
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
          style={{ borderColor: '#E8DDD0', color: '#78716C' }}
        >
          ✏️ পরিবর্তন
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
          style={{ backgroundColor: '#006A4E' }}
        >
          ✅ ঠিক আছে
        </button>
      </div>
    </div>
  );
}
