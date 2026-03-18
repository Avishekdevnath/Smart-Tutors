'use client';

import { useState, useRef, KeyboardEvent } from 'react';

const CLASS_OPTIONS = [
  'ক্লাস ১', 'ক্লাস ২', 'ক্লাস ৩', 'ক্লাস ৪', 'ক্লাস ৫',
  'ক্লাস ৬', 'ক্লাস ৭', 'ক্লাস ৮', 'ক্লাস ৯', 'ক্লাস ১০',
  'ক্লাস ১১', 'ক্লাস ১২', 'HSC', 'Honours', 'Masters',
];

const DAYS_OPTIONS = ['১', '২', '৩', '৪', '৫', '৬', '৭'];

const PHONE_REGEX = /^01\d{9}$/;

interface FormState {
  studentClass: string;
  subjects: string[];
  location: string;
  medium: string;
  tutorGender: string;
  daysPerWeek: string;
  salaryMin: string;
  salaryMax: string;
  guardianName: string;
  phone: string;
  notes: string;
  _hp: string;
}

const initialForm: FormState = {
  studentClass: '',
  subjects: [],
  location: '',
  medium: 'Bangla Medium',
  tutorGender: 'যেকোনো',
  daysPerWeek: '',
  salaryMin: '',
  salaryMax: '',
  guardianName: '',
  phone: '',
  notes: '',
  _hp: '',
};

interface FieldErrors {
  studentClass?: string;
  subjects?: string;
  location?: string;
  guardianName?: string;
  phone?: string;
  daysPerWeek?: string;
}

export default function PostTuitionPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [subjectInput, setSubjectInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const subjectInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (!trimmed) return;
    if (!form.subjects.includes(trimmed)) {
      setForm(prev => ({ ...prev, subjects: [...prev.subjects, trimmed] }));
      if (fieldErrors.subjects) setFieldErrors(prev => ({ ...prev, subjects: undefined }));
    }
    setSubjectInput('');
  };

  const handleSubjectKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubject();
    }
  };

  const removeSubject = (subject: string) => {
    setForm(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }));
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!form.studentClass) errors.studentClass = 'শ্রেণি নির্বাচন করুন';
    if (form.subjects.length === 0) errors.subjects = 'অন্তত একটি বিষয় যোগ করুন';
    if (!form.location.trim()) errors.location = 'এলাকার নাম লিখুন';
    if (!form.guardianName.trim()) errors.guardianName = 'অভিভাবকের নাম লিখুন';
    if (!PHONE_REGEX.test(form.phone)) errors.phone = 'সঠিক বাংলাদেশী ফোন নম্বর দিন (01XXXXXXXXX)';
    if (!form.daysPerWeek) errors.daysPerWeek = 'সাপ্তাহিক দিন নির্বাচন করুন';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        studentClass: form.studentClass,
        subjects: form.subjects,
        location: form.location,
        medium: form.medium,
        tutorGender: form.tutorGender,
        daysPerWeek: form.daysPerWeek,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        guardianName: form.guardianName,
        phone: form.phone,
        notes: form.notes,
        _hp: form._hp,
      };
      const res = await fetch('/api/tuitions/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm(initialForm);
      } else {
        const data = await res.json().catch(() => ({}));
        setServerError(data?.error || 'সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch {
      setServerError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const openChatWidget = () => {
    window.dispatchEvent(new Event('open-chat-widget'));
  };

  const inputCls = (error?: string) =>
    `w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:border-transparent bg-white text-[#1C1917] text-sm transition-colors ${
      error ? 'border-red-400' : 'border-[#E8DDD0]'
    }`;

  const labelCls = 'block text-sm font-semibold text-[#1C1917] mb-1.5';
  const errorCls = 'mt-1 text-xs text-red-600';

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-5">
            <svg className="w-9 h-9 text-[#006A4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1C1917] mb-3">সফলভাবে জমা হয়েছে!</h2>
          <p className="text-[#78716C] text-sm leading-relaxed mb-6">
            আপনার টিউশনের তথ্য জমা হয়েছে! ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে SMS-এ জানাবো।
          </p>
          <button
            onClick={openChatWidget}
            className="w-full py-3 rounded-lg bg-[#006A4E] hover:bg-[#005a40] text-white font-semibold text-sm transition-colors mb-3"
          >
            কামরুলের সাথে কথা বলুন →
          </button>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full py-2.5 rounded-lg border border-[#E8DDD0] text-[#78716C] text-sm hover:bg-[#F5F0E8] transition-colors"
          >
            আরেকটি টিউশন পোস্ট করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Page header */}
      <div className="bg-[#006A4E] py-10 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">টিউশন পোস্ট করুন</h1>
        <p className="text-green-100 text-sm md:text-base max-w-xl mx-auto mb-4">
          আপনার সন্তানের জন্য সেরা টিউটর খুঁজে পেতে নিচের ফর্মটি পূরণ করুন।
        </p>
        <button
          type="button"
          onClick={openChatWidget}
          className="inline-flex items-center text-[#E07B2A] text-sm font-medium hover:underline"
        >
          অথবা কামরুলের সাথে কথা বলুন →
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E8DDD0] bg-[#F5F0E8]/50">
            <p className="text-xs text-[#78716C]">সব তারকাচিহ্নিত (*) তথ্য পূরণ করা বাধ্যতামূলক</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6" noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="_hp"
              value={form._hp}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {/* Student class */}
            <div>
              <label className={labelCls}>
                শিক্ষার্থীর শ্রেণি <span className="text-red-500">*</span>
              </label>
              <select
                name="studentClass"
                value={form.studentClass}
                onChange={handleChange}
                className={inputCls(fieldErrors.studentClass)}
              >
                <option value="">শ্রেণি নির্বাচন করুন</option>
                {CLASS_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {fieldErrors.studentClass && <p className={errorCls}>{fieldErrors.studentClass}</p>}
            </div>

            {/* Subjects */}
            <div>
              <label className={labelCls}>
                বিষয়সমূহ <span className="text-red-500">*</span>
              </label>
              <div className={`border rounded-lg bg-white p-2 transition-colors ${fieldErrors.subjects ? 'border-red-400' : 'border-[#E8DDD0]'}`}>
                {form.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.subjects.map(subject => (
                      <span
                        key={subject}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-[#006A4E] border border-green-200"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => removeSubject(subject)}
                          className="ml-0.5 hover:text-red-500 transition-colors leading-none"
                          aria-label={`${subject} সরান`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={subjectInputRef}
                    type="text"
                    value={subjectInput}
                    onChange={e => setSubjectInput(e.target.value)}
                    onKeyDown={handleSubjectKeyDown}
                    placeholder="বিষয়ের নাম লিখুন, Enter চাপুন"
                    className="flex-1 text-sm outline-none text-[#1C1917] placeholder:text-[#78716C] bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="text-xs text-[#006A4E] font-medium hover:underline shrink-0"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>
              {fieldErrors.subjects && <p className={errorCls}>{fieldErrors.subjects}</p>}
              <p className="mt-1 text-xs text-[#78716C]">Enter চেপে বা "যোগ করুন" বাটনে ক্লিক করে বিষয় যোগ করুন</p>
            </div>

            {/* Location */}
            <div>
              <label className={labelCls}>
                এলাকা <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="যেমন: ধানমন্ডি, গুলশান, মোহাম্মদপুর"
                className={inputCls(fieldErrors.location)}
              />
              {fieldErrors.location && <p className={errorCls}>{fieldErrors.location}</p>}
            </div>

            {/* Medium */}
            <div>
              <label className={labelCls}>মাধ্যম</label>
              <div className="flex flex-wrap gap-3">
                {['Bangla Medium', 'English Medium', 'English Version'].map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="medium"
                      value={option}
                      checked={form.medium === option}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#006A4E]"
                    />
                    <span className="text-sm text-[#1C1917]">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tutor gender preference */}
            <div>
              <label className={labelCls}>টিউটরের লিঙ্গ পছন্দ</label>
              <div className="flex flex-wrap gap-3">
                {['পুরুষ', 'মহিলা', 'যেকোনো'].map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tutorGender"
                      value={option}
                      checked={form.tutorGender === option}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#006A4E]"
                    />
                    <span className="text-sm text-[#1C1917]">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Days per week */}
            <div>
              <label className={labelCls}>
                সাপ্তাহিক দিন <span className="text-red-500">*</span>
              </label>
              <select
                name="daysPerWeek"
                value={form.daysPerWeek}
                onChange={handleChange}
                className={inputCls(fieldErrors.daysPerWeek)}
              >
                <option value="">দিন নির্বাচন করুন</option>
                {DAYS_OPTIONS.map(d => (
                  <option key={d} value={d}>{d} দিন</option>
                ))}
              </select>
              {fieldErrors.daysPerWeek && <p className={errorCls}>{fieldErrors.daysPerWeek}</p>}
            </div>

            {/* Salary range */}
            <div>
              <label className={labelCls}>বেতন পরিসীমা (৳)</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    name="salaryMin"
                    value={form.salaryMin}
                    onChange={handleChange}
                    placeholder="সর্বনিম্ন"
                    min={0}
                    className={inputCls()}
                  />
                </div>
                <span className="text-[#78716C] text-sm shrink-0">—</span>
                <div className="flex-1">
                  <input
                    type="number"
                    name="salaryMax"
                    value={form.salaryMax}
                    onChange={handleChange}
                    placeholder="সর্বোচ্চ"
                    min={0}
                    className={inputCls()}
                  />
                </div>
              </div>
            </div>

            {/* Guardian name */}
            <div>
              <label className={labelCls}>
                অভিভাবকের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="guardianName"
                value={form.guardianName}
                onChange={handleChange}
                placeholder="আপনার পুরো নাম"
                className={inputCls(fieldErrors.guardianName)}
              />
              {fieldErrors.guardianName && <p className={errorCls}>{fieldErrors.guardianName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelCls}>
                ফোন নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={inputCls(fieldErrors.phone)}
              />
              {fieldErrors.phone && <p className={errorCls}>{fieldErrors.phone}</p>}
              <p className="mt-1 text-xs text-[#78716C]">১১ সংখ্যার বাংলাদেশী নম্বর (01 দিয়ে শুরু)</p>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>অতিরিক্ত তথ্য / বিশেষ চাহিদা</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="যেমন: অভিজ্ঞ টিউটর চাই, বাড়িতে পড়াতে হবে, মহিলা টিউটর পছন্দ..."
                className={inputCls() + ' resize-none'}
              />
            </div>

            {/* Server error */}
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-[#006A4E] hover:bg-[#005a40] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors"
            >
              {submitting ? 'জমা হচ্ছে...' : 'টিউশন পোস্ট করুন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
