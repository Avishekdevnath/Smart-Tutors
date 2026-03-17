"use client";

import { useState, useEffect } from "react";
import CreatableSelect from 'react-select/creatable';
import LocationSearch from "@/components/LocationSearch";

const initialForm: {
  guardianName: string;
  guardianNumber: string;
  address: string;
  location: string;
  studentClass: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  dailyHours: string;
  salary: string;
  startMonth: string;
  tutorGender: string;
  specialRemarks: string;
  urgent: boolean;
} = {
  guardianName: "",
  guardianNumber: "",
  address: "",
  location: "",
  studentClass: "",
  version: "English Medium",
  subjects: [],
  weeklyDays: "",
  dailyHours: "",
  salary: "",
  startMonth: "",
  tutorGender: "",
  specialRemarks: "",
  urgent: false,
};

export default function HireATutorPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [trackingLink, setTrackingLink] = useState("");

  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Bangla', 'English', 'Math', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Civics', 'Economics', 'Accounting', 'Business Studies',
    'ICT', 'Computer Science', 'Religious Studies', 'Literature', 'All'
  ]);

  useEffect(() => { loadSubjects(); }, []);

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        if (data.subjects) setAvailableSubjects(prev => [...new Set([...prev, ...data.subjects])]);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLocationChange = (location: string) => setForm(prev => ({ ...prev, location }));

  const subjectOptions = availableSubjects.map(s => ({ value: s, label: s }));

  const handleSubjectSelect = (selected: { value: string; label: string }[] | null) => {
    if (!selected) { setForm(prev => ({ ...prev, subjects: [] })); return; }
    const values = selected.map(s => s.value);
    if (values.includes('All')) setForm(prev => ({ ...prev, subjects: ['All'] }));
    else setForm(prev => ({ ...prev, subjects: values.filter((v: string) => v !== 'All') }));
  };

  const handleCreateSubject = async (inputValue: string) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed })
      });
      if (response.ok) {
        setAvailableSubjects(prev => [...prev, trimmed]);
        setForm(prev => ({ ...prev, subjects: [...prev.subjects, trimmed] }));
      } else setError('নতুন বিষয় যোগ করতে সমস্যা হয়েছে');
    } catch {
      setError('নতুন বিষয় যোগ করতে সমস্যা হয়েছে');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(""); setSuccess(""); setTrackingLink("");
    try {
      const tuitionData = {
        guardianName: form.guardianName,
        guardianNumber: form.guardianNumber,
        guardianAddress: form.address,
        studentClass: form.studentClass,
        version: form.version,
        subjects: form.subjects,
        weeklyDays: form.weeklyDays,
        weeklyHours: form.dailyHours,
        salary: form.salary,
        location: form.location,
        startMonth: form.startMonth,
        tutorGender: form.tutorGender,
        specialRemarks: form.specialRemarks,
        urgent: form.urgent
      };
      const response = await fetch('/api/tuitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tuitionData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("আপনার টিউশন পোস্ট সফলভাবে তৈরি হয়েছে!");
        setTrackingLink(`/track-tuition/${data.tuition.code}`);
        setForm(initialForm);
      } else {
        setError(data.error || "টিউশন পোস্ট তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError("সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 border border-[#E8DDD0] rounded-lg focus:ring-2 focus:ring-[#006A4E] focus:border-transparent bg-white text-[#1C1917] text-sm";
  const labelCls = "block text-sm font-medium text-[#1C1917] mb-1.5";

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Hero */}
      <section className="bg-[#006A4E] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">টিউটর নিয়োগ করুন</h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto">
            নিচের ফর্মটি পূরণ করুন এবং আপনার টিউশন চাহিদা পোস্ট করুন। টিউটর আবেদনকারীদের ট্র্যাক করতে একটি লিঙ্ক পাবেন।
          </p>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#FFFDF7" />
        </svg>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-card border border-[#E8DDD0] p-8">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-[#1C1917]">টিউশন পোস্ট তৈরি করুন</h2>
            <p className="text-[#78716C] text-sm mt-1">সব তারকাচিহ্নিত (*) তথ্য পূরণ করা বাধ্যতামূলক</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>অভিভাবকের নাম *</label>
                <input name="guardianName" value={form.guardianName} onChange={handleChange} required className={inputCls} placeholder="যেমন: জন ডো" />
              </div>
              <div>
                <label className={labelCls}>অভিভাবকের ফোন *</label>
                <input name="guardianNumber" value={form.guardianNumber} onChange={handleChange} required className={inputCls} placeholder="017XXXXXXXX" />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>ঠিকানা *</label>
                <input name="address" value={form.address} onChange={handleChange} required className={inputCls} placeholder="যেমন: বাড়ি ১২, রোড ৩, ধানমন্ডি" />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>এলাকা *</label>
                <LocationSearch
                  value={form.location}
                  onChange={handleLocationChange}
                  placeholder="এলাকা খুঁজুন (যেমন: ধানমন্ডি, গুলশান, মোহাম্মদপুর)"
                  required={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>শ্রেণি *</label>
                <input name="studentClass" value={form.studentClass} onChange={handleChange} required className={inputCls} placeholder="যেমন: Class 8" />
              </div>
              <div>
                <label className={labelCls}>ভার্সন *</label>
                <select name="version" value={form.version} onChange={handleChange} required className={inputCls}>
                  <option>Bangla Medium</option>
                  <option>English Medium</option>
                  <option>English Version</option>
                  <option>Others</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>বিষয়সমূহ *</label>
                <CreatableSelect
                  isMulti
                  options={subjectOptions}
                  value={subjectOptions.filter(opt => Array.isArray(form.subjects) && form.subjects.includes(opt.value))}
                  onChange={handleSubjectSelect}
                  onCreateOption={handleCreateSubject}
                  placeholder="বিষয় টাইপ করুন বা নির্বাচন করুন..."
                  classNamePrefix="react-select"
                  isClearable={false}
                  closeMenuOnSelect={false}
                  formatCreateLabel={(v: string) => `"${v}" যোগ করুন`}
                  styles={{
                    control: (base) => ({ ...base, minHeight: '44px', borderColor: '#E8DDD0', borderRadius: '0.5rem', '&:hover': { borderColor: '#006A4E' } }),
                    multiValue: (base) => ({ ...base, backgroundColor: '#dcfce7', color: '#166534' }),
                    multiValueLabel: (base) => ({ ...base, color: '#166534' }),
                    multiValueRemove: (base) => ({ ...base, color: '#006A4E', ':hover': { backgroundColor: '#006A4E', color: 'white' } }),
                  }}
                />
              </div>
              <div>
                <label className={labelCls}>সাপ্তাহিক দিন *</label>
                <input name="weeklyDays" value={form.weeklyDays} onChange={handleChange} required className={inputCls} placeholder="যেমন: 3 days" />
              </div>
              <div>
                <label className={labelCls}>দৈনিক ঘণ্টা *</label>
                <input name="dailyHours" value={form.dailyHours} onChange={handleChange} required className={inputCls} placeholder="যেমন: 2 hours" />
              </div>
              <div>
                <label className={labelCls}>বেতন *</label>
                <input name="salary" value={form.salary} onChange={handleChange} required className={inputCls} placeholder="যেমন: 5000 BDT" />
              </div>
              <div>
                <label className={labelCls}>শুরুর মাস *</label>
                <input name="startMonth" value={form.startMonth} onChange={handleChange} required className={inputCls} placeholder="যেমন: June 2024" />
              </div>
              <div>
                <label className={labelCls}>টিউটরের লিঙ্গ</label>
                <select name="tutorGender" value={form.tutorGender} onChange={handleChange} className={inputCls}>
                  <option value="">যেকোনো</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>বিশেষ মন্তব্য</label>
                <input name="specialRemarks" value={form.specialRemarks} onChange={handleChange} className={inputCls} placeholder="যেমন: মহিলা টিউটর পছন্দ, অভিজ্ঞতা থাকতে হবে" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" name="urgent" id="urgent" checked={form.urgent} onChange={handleChange} className="w-4 h-4 accent-[#E07B2A]" />
                <label htmlFor="urgent" className="text-sm text-[#1C1917]">জরুরি হিসেবে চিহ্নিত করুন</label>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-700 text-sm font-medium">{success}</p>}
            {trackingLink && (
              <div className="bg-[#006A4E]/5 border border-[#006A4E]/20 rounded-lg p-4">
                <p className="text-[#006A4E] text-sm font-medium mb-1">আপনার টিউশন ট্র্যাক করুন:</p>
                <a href={trackingLink} className="text-[#E07B2A] underline break-all text-sm">{trackingLink}</a>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-[#E07B2A] hover:bg-[#c96d22] text-white font-semibold text-base transition-colors disabled:opacity-60"
            >
              {submitting ? "পোস্ট করা হচ্ছে..." : "টিউশন পোস্ট করুন →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
