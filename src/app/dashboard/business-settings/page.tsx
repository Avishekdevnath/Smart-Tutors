'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { invalidateSettingsCache, SiteSettings } from '@/hooks/useSettings';
import {
  BuildingOfficeIcon,
  PhoneIcon,
  CurrencyBangladeshiIcon,
  ClockIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

type TabId = 'business' | 'fees' | 'homepage' | 'sms' | 'announcement' | 'application';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'business',     label: 'Business Info',    icon: BuildingOfficeIcon },
  { id: 'fees',         label: 'Media Fee Rules',  icon: CurrencyBangladeshiIcon },
  { id: 'homepage',     label: 'Homepage',         icon: HomeIcon },
  { id: 'sms',          label: 'SMS Templates',    icon: ChatBubbleLeftRightIcon },
  { id: 'announcement', label: 'Announcement',     icon: MegaphoneIcon },
  { id: 'application',  label: 'Application',      icon: Cog6ToothIcon },
];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006A4E] focus:border-transparent";
const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5";
const sectionCls = "bg-white rounded-xl border border-gray-200 p-6 mb-5";

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5 pb-4 border-b border-gray-100">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {desc && <p className="text-xs text-gray-500 mt-1">{desc}</p>}
    </div>
  );
}

export default function BusinessSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('business');
  const [settings, setSettings] = useState<Partial<SiteSettings> & { businessHours?: Record<string, string> }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedTab, setSavedTab] = useState<TabId | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = useCallback((key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const setNested = useCallback((parent: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...(prev as Record<string, Record<string,string>>)[parent], [key]: value }
    }));
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        invalidateSettingsCache();
        setSavedTab(activeTab);
        setTimeout(() => setSavedTab(null), 3000);
      } else {
        setError(data.error || 'সেভ করতে সমস্যা হয়েছে');
      }
    } catch {
      setError('সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // helpers for array fields
  const addRule = () => set('mediaFeeRules', [...(settings.mediaFeeRules || []), '']);
  const updateRule = (i: number, val: string) => {
    const arr = [...(settings.mediaFeeRules || [])];
    arr[i] = val;
    set('mediaFeeRules', arr);
  };
  const removeRule = (i: number) => set('mediaFeeRules', (settings.mediaFeeRules || []).filter((_, idx) => idx !== i));
  const moveRule = (i: number, dir: -1 | 1) => {
    const arr = [...(settings.mediaFeeRules || [])];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set('mediaFeeRules', arr);
  };

  const addPhone = () => set('phoneNumbers', [...(settings.phoneNumbers || []), '']);
  const updatePhone = (i: number, val: string) => {
    const arr = [...(settings.phoneNumbers || [])];
    arr[i] = val;
    set('phoneNumbers', arr);
  };
  const removePhone = (i: number) => set('phoneNumbers', (settings.phoneNumbers || []).filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <DashboardLayout title="Business Settings" description="Manage all site-wide configurations">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Business Settings" description="Manage all site-wide configurations">
      <div className="max-w-5xl">
        {/* Tab Bar */}
        <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1.5 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#006A4E] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Save bar */}
        <div className="flex items-center justify-between mb-5 bg-white border border-gray-200 rounded-xl px-5 py-3">
          <div className="text-sm text-gray-500">
            {savedTab === activeTab
              ? <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> সেভ হয়েছে</span>
              : error
              ? <span className="text-red-600 flex items-center gap-1"><ExclamationTriangleIcon className="w-4 h-4" /> {error}</span>
              : 'পরিবর্তন করুন এবং সেভ করুন'}
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 bg-[#006A4E] hover:bg-[#005a40] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </button>
        </div>

        {/* ── BUSINESS INFO ── */}
        {activeTab === 'business' && (
          <div>
            <div className={sectionCls}>
              <SectionHeader title="প্রতিষ্ঠানের পরিচিতি" desc="সাইটের নাম, স্লোগান এবং লোগো টেক্সট" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Business Name</label>
                  <input className={inputCls} value={settings.businessName || ''} onChange={e => set('businessName', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Logo Text</label>
                  <input className={inputCls} value={settings.logoText || ''} onChange={e => set('logoText', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Tagline (Bengali)</label>
                  <input className={inputCls} value={settings.tagline || ''} onChange={e => set('tagline', e.target.value)} />
                </div>
              </div>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="ফোন নম্বর" desc="প্রাথমিক ও ব্যাকআপ নম্বর — প্রথমটি প্রধান নম্বর হিসেবে ব্যবহৃত হবে" />
              <div className="space-y-2">
                {(settings.phoneNumbers || []).map((ph, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      value={ph}
                      onChange={e => updatePhone(i, e.target.value)}
                      placeholder="017XXXXXXXX"
                    />
                    <button onClick={() => removePhone(i)} className="p-2 text-red-400 hover:text-red-600">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addPhone} className="flex items-center gap-1 text-sm text-[#006A4E] hover:underline mt-1">
                  <PlusIcon className="w-4 h-4" /> নম্বর যোগ করুন
                </button>
              </div>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="পেমেন্ট নম্বর" desc="bKash ও Nagad নম্বর — মিডিয়া ফি পেমেন্টের জন্য" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>bKash Number</label>
                  <input className={inputCls} value={settings.bkashNumber || ''} onChange={e => set('bkashNumber', e.target.value)} placeholder="017XXXXXXXX" />
                </div>
                <div>
                  <label className={labelCls}>Nagad Number</label>
                  <input className={inputCls} value={settings.nagadNumber || ''} onChange={e => set('nagadNumber', e.target.value)} placeholder="017XXXXXXXX" />
                </div>
                <div>
                  <label className={labelCls}>WhatsApp Number</label>
                  <input className={inputCls} value={settings.whatsappNumber || ''} onChange={e => set('whatsappNumber', e.target.value)} placeholder="017XXXXXXXX" />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input className={inputCls} type="email" value={settings.emailAddress || ''} onChange={e => set('emailAddress', e.target.value)} />
                </div>
              </div>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="ঠিকানা ও সোশ্যাল" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Office Address (Bengali)</label>
                  <textarea className={inputCls} rows={2} value={settings.officeAddress || ''} onChange={e => set('officeAddress', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Google Maps Link</label>
                  <input className={inputCls} value={settings.googleMapsLink || ''} onChange={e => set('googleMapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
                </div>
                <div>
                  <label className={labelCls}>Facebook Page URL</label>
                  <input className={inputCls} value={settings.facebookPageUrl || ''} onChange={e => set('facebookPageUrl', e.target.value)} placeholder="https://facebook.com/..." />
                </div>
              </div>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="অফিস সময়" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>রবি – বৃহস্পতি</label>
                  <input className={inputCls} value={settings.businessHours?.sunThu || ''} onChange={e => setNested('businessHours', 'sunThu', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>শুক্রবার</label>
                  <input className={inputCls} value={settings.businessHours?.fri || ''} onChange={e => setNested('businessHours', 'fri', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>শনিবার</label>
                  <input className={inputCls} value={settings.businessHours?.sat || ''} onChange={e => setNested('businessHours', 'sat', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MEDIA FEE RULES ── */}
        {activeTab === 'fees' && (
          <div>
            <div className={sectionCls}>
              <SectionHeader
                title="মিডিয়া ফি এর নিয়মাবলী"
                desc="এই নিয়মগুলো টিউটর আবেদন মডালে প্রদর্শিত হয়। টেনে সাজাতে পারেন।"
              />
              <div className="space-y-2">
                {(settings.mediaFeeRules || []).map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex flex-col gap-0.5 mt-2">
                      <button onClick={() => moveRule(i, -1)} className="text-gray-300 hover:text-gray-600 disabled:opacity-20" disabled={i === 0}>
                        <ArrowUpIcon className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveRule(i, 1)} className="text-gray-300 hover:text-gray-600 disabled:opacity-20" disabled={i === (settings.mediaFeeRules?.length ?? 0) - 1}>
                        <ArrowDownIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold flex items-center justify-center mt-2">
                      {i + 1}
                    </div>
                    <textarea
                      className={`${inputCls} flex-1 resize-none`}
                      rows={2}
                      value={rule}
                      onChange={e => updateRule(i, e.target.value)}
                      placeholder="নিয়মটি লিখুন..."
                    />
                    <button onClick={() => removeRule(i)} className="mt-2 p-1.5 text-red-400 hover:text-red-600">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addRule} className="flex items-center gap-1 text-sm text-[#006A4E] hover:underline mt-2">
                  <PlusIcon className="w-4 h-4" /> নতুন নিয়ম যোগ করুন
                </button>
              </div>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="চুক্তি নিশ্চিতকরণ" desc="টিউটর আবেদন করতে এই শব্দটি টাইপ করতে হবে" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Confirm Word (e.g., "Agree" or "রাজি")</label>
                  <input
                    className={inputCls}
                    value={settings.mediaFeeConfirmText || ''}
                    onChange={e => set('mediaFeeConfirmText', e.target.value)}
                    placeholder="Agree"
                  />
                  <p className="text-xs text-gray-400 mt-1">টিউটর এই শব্দ টাইপ না করলে আবেদন সম্পন্ন হবে না</p>
                </div>
                <div>
                  <label className={labelCls}>Extra Note (optional)</label>
                  <input
                    className={inputCls}
                    value={settings.mediaFeeNote || ''}
                    onChange={e => set('mediaFeeNote', e.target.value)}
                    placeholder="যেমন: bKash: 01700000000 (Smart Tutors)"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HOMEPAGE ── */}
        {activeTab === 'homepage' && (
          <div>
            <div className={sectionCls}>
              <SectionHeader title="Hero Section" desc="হোমপেজের প্রধান ব্যানার টেক্সট" />
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Headline (Bengali)</label>
                  <input className={inputCls} value={settings.heroHeadline || ''} onChange={e => set('heroHeadline', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Sub-headline (Bengali)</label>
                  <input className={inputCls} value={settings.heroSubheadline || ''} onChange={e => set('heroSubheadline', e.target.value)} />
                </div>
              </div>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="Hero Statistics" desc="হিরো সেকশনে দেখানো সংখ্যা" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>মোট টিউশন</label>
                  <input className={inputCls} value={settings.heroStatTuitions || ''} onChange={e => set('heroStatTuitions', e.target.value)} placeholder="৫০০+" />
                </div>
                <div>
                  <label className={labelCls}>মোট টিউটর</label>
                  <input className={inputCls} value={settings.heroStatTutors || ''} onChange={e => set('heroStatTutors', e.target.value)} placeholder="১০০০+" />
                </div>
                <div>
                  <label className={labelCls}>সাফল্যের হার</label>
                  <input className={inputCls} value={settings.heroStatSuccess || ''} onChange={e => set('heroStatSuccess', e.target.value)} placeholder="৯৫%" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SMS TEMPLATES ── */}
        {activeTab === 'sms' && (
          <div>
            <div className="mb-4 p-4 bg-[#006A4E]/8 border border-[#006A4E]/20 rounded-xl text-sm text-[#006A4E]">
              <strong>Available placeholders:</strong>{' '}
              <code className="bg-blue-100 px-1 rounded">{'{{code}}'}</code>{' '}
              <code className="bg-blue-100 px-1 rounded">{'{{class}}'}</code>{' '}
              <code className="bg-blue-100 px-1 rounded">{'{{location}}'}</code>{' '}
              <code className="bg-blue-100 px-1 rounded">{'{{salary}}'}</code>{' '}
              <code className="bg-blue-100 px-1 rounded">{'{{bkash}}'}</code>{' '}
              <code className="bg-blue-100 px-1 rounded">{'{{tutorName}}'}</code>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="নতুন টিউশন পোস্ট হলে" desc="টিউটরদের কাছে নতুন টিউশন ব্রডকাস্ট করতে এই টেমপ্লেট ব্যবহৃত হয়" />
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={settings.smsOnTuitionCreated || ''}
                onChange={e => set('smsOnTuitionCreated', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">{(settings.smsOnTuitionCreated || '').length} characters</p>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="টিউটর কনফার্ম হলে" desc="নির্বাচিত টিউটরকে পাঠানো বার্তা" />
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={settings.smsOnTutorConfirmed || ''}
                onChange={e => set('smsOnTutorConfirmed', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">{(settings.smsOnTutorConfirmed || '').length} characters</p>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="নতুন আবেদন পেলে" desc="অ্যাডমিনের কাছে নতুন আবেদনের বিজ্ঞপ্তি" />
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={settings.smsOnApplicationReceived || ''}
                onChange={e => set('smsOnApplicationReceived', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENT ── */}
        {activeTab === 'announcement' && (
          <div className={sectionCls}>
            <SectionHeader title="সাইটওয়াইড নোটিশ ব্যানার" desc="সাইটের সব পাবলিক পেজের উপরে একটি নোটিশ দেখাতে পারবেন" />

            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => set('announcementEnabled', !settings.announcementEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.announcementEnabled ? 'bg-[#006A4E]' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.announcementEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {settings.announcementEnabled ? 'নোটিশ চালু আছে' : 'নোটিশ বন্ধ'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>নোটিশ টেক্সট</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={settings.announcementText || ''}
                  onChange={e => set('announcementText', e.target.value)}
                  placeholder="যেমন: ঈদুল ফিতর উপলক্ষে অফিস ৩ দিন বন্ধ থাকবে।"
                />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <div className="flex gap-3 mt-1">
                  {(['info', 'warning', 'success'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => set('announcementType', type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        settings.announcementType === type
                          ? type === 'info' ? 'border-[#006A4E] bg-[#006A4E]/8 text-[#006A4E]'
                          : type === 'warning' ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                          : 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {type === 'info' ? 'ℹ️ Info' : type === 'warning' ? '⚠️ Warning' : '✅ Success'}
                    </button>
                  ))}
                </div>
              </div>

              {settings.announcementEnabled && settings.announcementText && (
                <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${
                  settings.announcementType === 'info' ? 'bg-[#006A4E]/8 text-[#006A4E] border border-[#006A4E]/20'
                  : settings.announcementType === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                  <strong>Preview:</strong> {settings.announcementText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── APPLICATION SETTINGS ── */}
        {activeTab === 'application' && (
          <div>
            <div className={sectionCls}>
              <SectionHeader title="আবেদন নিয়ন্ত্রণ" desc="টিউটর আবেদন প্রক্রিয়ার সীমা ও নিয়ম" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>প্রতি টিউশনে সর্বোচ্চ আবেদন</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={settings.maxApplicationsPerTuition ?? 0}
                    onChange={e => set('maxApplicationsPerTuition', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = কোনো সীমা নেই</p>
                </div>
                <div>
                  <label className={labelCls}>স্বয়ংক্রিয় বন্ধ (দিন পরে)</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={settings.autoCloseAfterDays ?? 0}
                    onChange={e => set('autoCloseAfterDays', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = কখনো স্বয়ংক্রিয় বন্ধ হবে না</p>
                </div>
              </div>
            </div>

            <div className={sectionCls}>
              <SectionHeader title="চুক্তি বাধ্যতামূলক" desc="আবেদন করতে টিউটরকে মিডিয়া ফি নিয়মে সম্মত হতে হবে কিনা" />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => set('requireAgreement', !settings.requireAgreement)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.requireAgreement ? 'bg-[#006A4E]' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireAgreement ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-sm text-gray-700">
                  {settings.requireAgreement ? 'চুক্তি বাধ্যতামূলক — টিউটরকে সম্মত হতে হবে' : 'চুক্তি ঐচ্ছিক'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
