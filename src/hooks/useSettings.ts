'use client';

import { useState, useEffect } from 'react';

export interface SiteSettings {
  businessName: string;
  tagline: string;
  logoText: string;
  phoneNumbers: string[];
  bkashNumber: string;
  nagadNumber: string;
  officeAddress: string;
  googleMapsLink: string;
  emailAddress: string;
  facebookPageUrl: string;
  whatsappNumber: string;
  businessHours: { sunThu: string; fri: string; sat: string };
  mediaFeeRules: string[];
  mediaFeeConfirmText: string;
  mediaFeeNote: string;
  maxApplicationsPerTuition: number;
  autoCloseAfterDays: number;
  requireAgreement: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroStatTuitions: string;
  heroStatTutors: string;
  heroStatSuccess: string;
  smsOnTuitionCreated: string;
  smsOnTutorConfirmed: string;
  smsOnApplicationReceived: string;
  emailOnContactSubmit: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementType: 'info' | 'warning' | 'success';
}

const DEFAULT_SETTINGS: SiteSettings = {
  businessName: 'Smart Tutors',
  tagline: 'টিউশন পরিচালনার সম্পূর্ণ সমাধান',
  logoText: 'Smart Tutors',
  phoneNumbers: [],
  bkashNumber: '',
  nagadNumber: '',
  officeAddress: 'ঢাকা, বাংলাদেশ',
  googleMapsLink: '',
  emailAddress: 'smarttutorsmedia@gmail.com',
  facebookPageUrl: '',
  whatsappNumber: '',
  businessHours: { sunThu: 'সকাল ৯টা – সন্ধ্যা ৬টা', fri: 'সকাল ১০টা – বিকাল ২টা', sat: 'সকাল ১০টা – বিকাল ৪টা' },
  mediaFeeRules: [
    'গার্ডিয়ান কনফার্ম হলে মিডিয়া ফি (১ দিনের বেতন) অফিসে/বিকাশে প্রদান করতে হবে।',
    'গার্ডিয়ান কনফার্ম হওয়ার পর গার্ডিয়ানের নাম্বার দেয়া হবে।',
    'মিডিয়া ফি না দিলে পরবর্তী টিউশন/গার্ডিয়ান কনফার্মেশন বন্ধ থাকবে।',
  ],
  mediaFeeConfirmText: 'Agree',
  mediaFeeNote: '',
  maxApplicationsPerTuition: 0,
  autoCloseAfterDays: 0,
  requireAgreement: true,
  heroHeadline: 'বাংলাদেশের সেরা টিউশন মিডিয়া',
  heroSubheadline: 'সঠিক টিউটর খুঁজুন, দ্রুত কনফার্ম করুন',
  heroStatTuitions: '৫০০+',
  heroStatTutors: '১০০০+',
  heroStatSuccess: '৯৫%',
  smsOnTuitionCreated: '',
  smsOnTutorConfirmed: '',
  smsOnApplicationReceived: '',
  emailOnContactSubmit: '',
  announcementEnabled: false,
  announcementText: '',
  announcementType: 'info',
};

let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

async function fetchSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings;
  if (!fetchPromise) {
    fetchPromise = fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        cachedSettings = { ...DEFAULT_SETTINGS, ...data };
        fetchPromise = null;
        return cachedSettings as SiteSettings;
      })
      .catch(() => {
        fetchPromise = null;
        return DEFAULT_SETTINGS;
      });
  }
  return fetchPromise;
}

export function invalidateSettingsCache() {
  cachedSettings = null;
  fetchPromise = null;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
