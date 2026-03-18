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

type TabId = 'business' | 'fees' | 'homepage' | 'sms' | 'announcement' | 'application' | 'chat' | 'search';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'business',     label: 'Business Info',    icon: BuildingOfficeIcon },
  { id: 'fees',         label: 'Media Fee Rules',  icon: CurrencyBangladeshiIcon },
  { id: 'homepage',     label: 'Homepage',         icon: HomeIcon },
  { id: 'sms',          label: 'SMS Templates',    icon: ChatBubbleLeftRightIcon },
  { id: 'announcement', label: 'Announcement',     icon: MegaphoneIcon },
  { id: 'application',  label: 'Application',      icon: Cog6ToothIcon },
  { id: 'chat',         label: 'AI Chat Settings', icon: ChatBubbleLeftRightIcon },
  { id: 'search',       label: 'Search Config',    icon: DocumentTextIcon },
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

  // ── chatConfig helpers ──
  type ChatConfig = NonNullable<SiteSettings['chatConfig']>;
  type TuitionQuestion = ChatConfig['tuitionQuestions'][number];
  type KnowledgeArticle = ChatConfig['knowledgeArticles'][number];

  const getChatConfig = (): ChatConfig => (settings as Partial<SiteSettings>).chatConfig ?? {
    persona: { name: '', greeting: '', personality: '' },
    tuitionQuestions: [],
    salaryGuidance: false,
    confirmationMessage: '',
    successMessage: '',
    resumeMessage: '',
    escalationMessage: '',
    errorMessage: '',
    whatsappNumber: '',
    knowledgeArticles: [],
    maxConversationsPerHour: 50,
  };

  const setChatConfig = (updater: (prev: ChatConfig) => ChatConfig) =>
    setSettings(prev => ({ ...prev, chatConfig: updater(getChatConfig()) }));

  const setPersona = (key: keyof ChatConfig['persona'], value: string) =>
    setChatConfig(c => ({ ...c, persona: { ...c.persona, [key]: value } }));

  const addQuestion = () =>
    setChatConfig(c => ({
      ...c,
      tuitionQuestions: [
        ...c.tuitionQuestions,
        { field: `q${Date.now()}`, question: '', required: false, order: c.tuitionQuestions.length + 1, validationHint: '' },
      ],
    }));
  const updateQuestion = (i: number, patch: Partial<TuitionQuestion>) =>
    setChatConfig(c => {
      const arr = [...c.tuitionQuestions];
      arr[i] = { ...arr[i], ...patch };
      return { ...c, tuitionQuestions: arr };
    });
  const removeQuestion = (i: number) =>
    setChatConfig(c => ({ ...c, tuitionQuestions: c.tuitionQuestions.filter((_, idx) => idx !== i) }));
  const moveQuestion = (i: number, dir: -1 | 1) =>
    setChatConfig(c => {
      const arr = [...c.tuitionQuestions];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return c;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...c, tuitionQuestions: arr };
    });

  const addArticle = () =>
    setChatConfig(c => ({ ...c, knowledgeArticles: [...c.knowledgeArticles, { topic: '', content: '' }] }));
  const updateArticle = (i: number, patch: Partial<KnowledgeArticle>) =>
    setChatConfig(c => {
      const arr = [...c.knowledgeArticles];
      arr[i] = { ...arr[i], ...patch };
      return { ...c, knowledgeArticles: arr };
    });
  const removeArticle = (i: number) =>
    setChatConfig(c => ({ ...c, knowledgeArticles: c.knowledgeArticles.filter((_, idx) => idx !== i) }));

  // ── searchConfig helpers ──
  type SearchWeights = SiteSettings['searchConfig']['weights'];
  const getWeights = (): SearchWeights =>
    (settings as Partial<SiteSettings>).searchConfig?.weights ??
    { location: 0.30, subject: 0.25, class: 0.20, salary: 0.15, medium: 0.05, gender: 0.05 };
  const setWeight = (key: keyof SearchWeights, value: number) =>
    setSettings(prev => ({
      ...prev,
      searchConfig: { ...((prev as Partial<SiteSettings>).searchConfig ?? {}), weights: { ...getWeights(), [key]: value } },
    }));
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

        {/* ── AI CHAT SETTINGS ── */}
        {activeTab === 'chat' && (() => {
          const chatConfig = getChatConfig();
          return (
            <div>
              {/* Persona */}
              <div className={sectionCls}>
                <SectionHeader title="AI পার্সোনা" desc="চ্যাটবটের নাম, স্বাগত বার্তা ও ব্যক্তিত্ব নির্ধারণ করুন" />
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Persona Name (পার্সোনার নাম)</label>
                    <input className={inputCls} value={chatConfig.persona.name} onChange={e => setPersona('name', e.target.value)} placeholder="কামরুল" />
                  </div>
                  <div>
                    <label className={labelCls}>Greeting Message (স্বাগত বার্তা)</label>
                    <textarea className={`${inputCls} resize-none`} rows={3} value={chatConfig.persona.greeting} onChange={e => setPersona('greeting', e.target.value)} placeholder="আসসালামু আলাইকুম! আমি কামরুল..." />
                  </div>
                  <div>
                    <label className={labelCls}>Personality / Tone (ব্যক্তিত্ব)</label>
                    <textarea className={`${inputCls} resize-none`} rows={4} value={chatConfig.persona.personality} onChange={e => setPersona('personality', e.target.value)} placeholder="তুমি কামরুল, একজন বড় ভাইয়ের মতো কথা বলো..." />
                    <p className="text-xs text-gray-400 mt-1">এটি AI-এর ব্যক্তিত্ব নির্ধারণ করে</p>
                  </div>
                </div>
              </div>

              {/* Tuition Questions */}
              <div className={sectionCls}>
                <SectionHeader title="টিউশন প্রশ্নাবলী" desc="চ্যাটে গার্ডিয়ানকে জিজ্ঞেস করা প্রশ্নগুলো নির্ধারণ করুন" />
                <div className="space-y-3">
                  {chatConfig.tuitionQuestions.map((q, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex gap-1 ml-auto">
                          <button onClick={() => moveQuestion(i, -1)} disabled={i === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                            <ArrowUpIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveQuestion(i, 1)} disabled={i === chatConfig.tuitionQuestions.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                            <ArrowDownIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeQuestion(i)} className="p-1 text-red-400 hover:text-red-600">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className={labelCls}>প্রশ্ন</label>
                          <input className={inputCls} value={q.question} onChange={e => updateQuestion(i, { question: e.target.value })} placeholder="প্রশ্নটি লিখুন..." />
                        </div>
                        <div>
                          <label className={labelCls}>Validation Hint</label>
                          <input className={inputCls} value={q.validationHint} onChange={e => updateQuestion(i, { validationHint: e.target.value })} placeholder="e.g., class 1-12, HSC" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuestion(i, { required: !q.required })}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${q.required ? 'bg-[#006A4E]' : 'bg-gray-300'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${q.required ? 'translate-x-4' : 'translate-x-1'}`} />
                          </button>
                          <span className="text-xs text-gray-600">{q.required ? 'Required (বাধ্যতামূলক)' : 'Optional (ঐচ্ছিক)'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addQuestion} className="flex items-center gap-1 text-sm text-[#006A4E] hover:underline mt-1">
                    <PlusIcon className="w-4 h-4" /> প্রশ্ন যোগ করুন
                  </button>
                </div>
              </div>

              {/* Knowledge Articles */}
              <div className={sectionCls}>
                <SectionHeader title="Knowledge Articles" desc="AI যে তথ্যগুলো জানবে — যেমন ফি, নিয়ম, অফার ইত্যাদি" />
                <div className="space-y-3">
                  {chatConfig.knowledgeArticles.map((art, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500">আর্টিকেল #{i + 1}</span>
                        <button onClick={() => removeArticle(i)} className="p-1 text-red-400 hover:text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className={labelCls}>Topic (বিষয়)</label>
                          <input className={inputCls} value={art.topic} onChange={e => updateArticle(i, { topic: e.target.value })} placeholder="যেমন: মিডিয়া ফি সম্পর্কে" />
                        </div>
                        <div>
                          <label className={labelCls}>Content (বিষয়বস্তু)</label>
                          <textarea className={`${inputCls} resize-none`} rows={3} value={art.content} onChange={e => updateArticle(i, { content: e.target.value })} placeholder="বিষয়বস্তু লিখুন..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addArticle} className="flex items-center gap-1 text-sm text-[#006A4E] hover:underline mt-1">
                    <PlusIcon className="w-4 h-4" /> আর্টিকেল যোগ করুন
                  </button>
                </div>
              </div>

              {/* Contact & Rate Limit */}
              <div className={sectionCls}>
                <SectionHeader title="যোগাযোগ ও সীমা" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>WhatsApp Number (Escalation)</label>
                    <input className={inputCls} value={chatConfig.whatsappNumber} onChange={e => setChatConfig(c => ({ ...c, whatsappNumber: e.target.value }))} placeholder="017XXXXXXXX" />
                  </div>
                  <div>
                    <label className={labelCls}>Rate Limit (conversations/hour)</label>
                    <input type="number" min={1} className={inputCls} value={chatConfig.maxConversationsPerHour} onChange={e => setChatConfig(c => ({ ...c, maxConversationsPerHour: parseInt(e.target.value) || 50 }))} />
                    <p className="text-xs text-gray-400 mt-1">প্রতি ঘণ্টায় সর্বোচ্চ কনভার্সেশন</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className={sectionCls}>
                <SectionHeader title="সিস্টেম বার্তা" desc="বিভিন্ন পরিস্থিতিতে AI যে বার্তা পাঠাবে" />
                <div className="space-y-4">
                  {(
                    [
                      { key: 'confirmationMessage', label: 'Confirmation Message (নিশ্চিতকরণ)' },
                      { key: 'successMessage',      label: 'Success Message (সফল)' },
                      { key: 'resumeMessage',       label: 'Resume Message (পুনরায় শুরু)' },
                      { key: 'escalationMessage',   label: 'Escalation Message (ট্রান্সফার)' },
                      { key: 'errorMessage',        label: 'Error Message (ত্রুটি)' },
                    ] as { key: keyof typeof chatConfig; label: string }[]
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={2}
                        value={(chatConfig[key] as string) ?? ''}
                        onChange={e => setChatConfig(c => ({ ...c, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Guidance Toggle */}
              <div className={sectionCls}>
                <SectionHeader title="বেতন গাইডেন্স" desc="AI কি গার্ডিয়ানকে প্রস্তাবিত বেতন রেঞ্জ জানাবে?" />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChatConfig(c => ({ ...c, salaryGuidance: !c.salaryGuidance }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${chatConfig.salaryGuidance ? 'bg-[#006A4E]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${chatConfig.salaryGuidance ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-700">
                    {chatConfig.salaryGuidance ? 'বেতন গাইডেন্স চালু আছে' : 'বেতন গাইডেন্স বন্ধ'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── SEARCH CONFIG ── */}
        {activeTab === 'search' && (() => {
          const weights = getWeights();
          const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
          const sumOk = Math.abs(weightSum - 1) < 0.01;
          const WEIGHT_FIELDS: { key: keyof typeof weights; label: string; desc: string }[] = [
            { key: 'location', label: 'লোকেশন (Location)',   desc: 'টিউটর ও গার্ডিয়ানের এলাকার মিল কতটা গুরুত্বপূর্ণ' },
            { key: 'subject',  label: 'সাবজেক্ট (Subject)',  desc: 'বিষয় মিলের গুরুত্ব' },
            { key: 'class',    label: 'ক্লাস (Class)',       desc: 'ক্লাস মিলের গুরুত্ব' },
            { key: 'salary',   label: 'বেতন (Salary)',       desc: 'বেতন রেঞ্জ মিলের গুরুত্ব' },
            { key: 'medium',   label: 'মাধ্যম (Medium)',     desc: 'শিক্ষার মাধ্যম মিলের গুরুত্ব' },
            { key: 'gender',   label: 'লিঙ্গ (Gender)',      desc: 'পছন্দের লিঙ্গ মিলের গুরুত্ব' },
          ];
          return (
            <div>
              <div className={sectionCls}>
                <SectionHeader
                  title="সার্চ ওয়েট কনফিগারেশন"
                  desc="AI টিউটর ম্যাচিং অ্যালগরিদমে প্রতিটি বৈশিষ্ট্যের ওজন নির্ধারণ করুন (মোট ≈ 1.0 হওয়া উচিত)"
                />

                <div className="mb-5 p-3 rounded-lg border text-sm font-medium flex items-center gap-2"
                  style={{ background: sumOk ? '#f0fdf4' : '#fffbeb', borderColor: sumOk ? '#bbf7d0' : '#fde68a', color: sumOk ? '#166534' : '#92400e' }}
                >
                  {sumOk
                    ? <><CheckCircleIcon className="w-4 h-4" /> মোট ওজন: {weightSum.toFixed(2)} — ঠিক আছে</>
                    : <><ExclamationTriangleIcon className="w-4 h-4" /> মোট ওজন: {weightSum.toFixed(2)} — ১.০ হওয়া উচিত (বর্তমান পার্থক্য: {(weightSum - 1).toFixed(2)})</>
                  }
                </div>

                <div className="space-y-5">
                  {WEIGHT_FIELDS.map(({ key, label, desc }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className={labelCls + ' mb-0'}>{label}</label>
                        <span className="text-sm font-bold text-[#006A4E]">{weights[key].toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={weights[key]}
                        onChange={e => setWeight(key, parseFloat(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-[#006A4E] cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                        <span>0.00</span>
                        <span className="text-gray-500">{desc}</span>
                        <span>1.00</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-[#F5F0E8] rounded-lg text-sm text-[#78716C]">
                  <strong className="text-[#1C1917]">কীভাবে কাজ করে?</strong>
                  <p className="mt-1">প্রতিটি ওজন AI সার্চে সেই বৈশিষ্ট্যের গুরুত্ব নির্ধারণ করে। উচ্চতর ওজন মানে সেই বৈশিষ্ট্য বেশি গুরুত্বপূর্ণ। সর্বোত্তম ফলাফলের জন্য সমস্ত ওজনের যোগফল ১.০ হওয়া উচিত।</p>
                </div>
              </div>
            </div>
          );
        })()}

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
