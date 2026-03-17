'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, MapPin, Clock, BookOpen, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';
import { useSettings } from '@/hooks/useSettings';

interface Tuition {
  _id: string;
  code: string;
  guardianName: string;
  guardianNumber: string;
  guardianAddress?: string;
  class: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  dailyHours: string;
  salary: string;
  location: string;
  startMonth: string;
  tutorGender: string;
  specialRemarks?: string;
  urgent: boolean;
  status: string;
  createdAt: string;
}

export default function TuitionsPage() {
  const { data: session } = useSession();
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [filteredTuitions, setFilteredTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [userApplications, setUserApplications] = useState<string[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [registrationForm, setRegistrationForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: ''
  });

  const { showToast } = useToast();
  const { settings: siteSettings } = useSettings();

  useEffect(() => {
    loadTuitions();
    if (session) loadUserApplications();
    else setUserApplications([]);
  }, [session]);

  useEffect(() => { filterTuitions(); }, [tuitions, searchTerm, selectedClass, selectedVersion, selectedLocation]);

  const loadTuitions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tuitions');
      if (res.ok) {
        const data = await res.json();
        const available = data.filter((t: Tuition) => ['open', 'available'].includes(t.status));
        setTuitions(available);
        setFilteredTuitions(available);
      }
    } catch { showToast('Error loading tuitions', 'error'); }
    finally { setLoading(false); }
  };

  const loadUserApplications = async () => {
    try {
      setApplicationsLoading(true);
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setUserApplications(data.applications.map((app: any) => app.tuition._id));
      }
    } catch {}
    finally { setApplicationsLoading(false); }
  };

  const filterTuitions = () => {
    let f = tuitions;
    if (searchTerm) f = f.filter(t =>
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedClass) f = f.filter(t => t.class === selectedClass);
    if (selectedVersion) f = f.filter(t => t.version === selectedVersion);
    if (selectedLocation) f = f.filter(t => t.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    setFilteredTuitions(f);
  };

  const handleApply = (tuition: Tuition) => {
    if (!session) { setSelectedTuition(tuition); setShowRegistrationModal(true); return; }
    setSelectedTuition(tuition);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTuition || !session) return;
    if (confirmationText.toLowerCase().trim() !== (siteSettings.mediaFeeConfirmText || 'Agree').toLowerCase()) {
      showToast('Please type "Agree" to confirm', 'error'); return;
    }
    try {
      setApplicationLoading(true);
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tuitionId: selectedTuition._id, agreedToTerms: true, confirmationText })
      });
      const result = await res.json();
      if (res.ok) {
        showToast('আবেদন সফলভাবে জমা হয়েছে!', 'success');
        setShowApplicationModal(false);
        setConfirmationText('');
        loadUserApplications();
      } else showToast(result.error || 'Failed to submit application', 'error');
    } catch { showToast('Error submitting application', 'error'); }
    finally { setApplicationLoading(false); }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registrationForm.password !== registrationForm.confirmPassword) {
      showToast('Passwords do not match', 'error'); return;
    }
    try {
      setRegistrationLoading(true);
      const res = await fetch('/api/tutors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registrationForm.name, phone: registrationForm.phone, email: registrationForm.email, password: registrationForm.password })
      });
      const result = await res.json();
      if (res.ok) {
        showToast('Registration successful!', 'success');
        setShowRegistrationModal(false);
        window.location.href = '/tutors/login';
      } else showToast(result.error || 'Registration failed', 'error');
    } catch { showToast('Error during registration', 'error'); }
    finally { setRegistrationLoading(false); }
  };

  const clearFilters = () => { setSearchTerm(''); setSelectedClass(''); setSelectedVersion(''); setSelectedLocation(''); };
  const hasApplied = (id: string) => userApplications.includes(id);

  const selectClass = 'w-full px-3 py-2.5 border border-[#E8DDD0] rounded-lg text-sm text-[#1C1917] bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:border-[#006A4E]';

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <Toast />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="bg-[#006A4E] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E07B2A]/10 rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
                সকল টিউশন
              </h1>
              <p className="text-green-200 text-sm font-medium uppercase tracking-widest mb-1">Available Tuitions</p>
              <p className="text-green-100 text-base">
                আপনার দক্ষতা ও সময়সূচি অনুযায়ী সেরা টিউশন খুঁজে নিন।
              </p>
            </div>
            {!session && (
              <div className="flex gap-3 shrink-0">
                <Link href="/tutors/register">
                  <button className="bg-[#E07B2A] hover:bg-[#C96A1A] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 cursor-pointer">
                    টিউটর হিসেবে যোগ দিন
                  </button>
                </Link>
                <Link href="/tutors/login">
                  <button className="border border-white/30 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 cursor-pointer">
                    Login
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8">
            <path d="M0 30 C360 0 1080 0 1440 30 L1440 30 L0 30 Z" fill="#FFFDF7"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Filter Bar ────────────────────────────────────────── */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 mb-8 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] w-4 h-4" />
              <input
                type="text"
                placeholder="Code, location, subject দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#E8DDD0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:border-[#006A4E]"
              />
            </div>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={selectClass}>
              <option value="">সব Class</option>
              {['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','O Level','A Level','University'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)} className={selectClass}>
              <option value="">সব Version</option>
              <option value="English Medium">English Medium</option>
              <option value="Bangla Medium">Bangla Medium</option>
              <option value="English Version">English Version</option>
              <option value="Others">Others</option>
            </select>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className={selectClass}>
              <option value="">সব Location</option>
              {['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Rangpur','Mymensingh'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedClass || selectedVersion || selectedLocation) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-[#78716C]">
                <span className="font-semibold text-[#006A4E]">{filteredTuitions.length}</span> টি টিউশন পাওয়া গেছে
              </span>
              <button onClick={clearFilters} className="text-sm text-[#E07B2A] hover:text-[#C96A1A] font-semibold cursor-pointer">
                সব ফিল্টার মুছুন
              </button>
            </div>
          )}
        </div>

        {/* ── Tuitions Grid ─────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8DDD0] p-5 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-5 bg-[#F5F0E8] rounded w-20" />
                  <div className="h-5 bg-[#F5F0E8] rounded w-16" />
                </div>
                <div className="space-y-3">
                  <div className="h-3.5 bg-[#F5F0E8] rounded w-full" />
                  <div className="h-3.5 bg-[#F5F0E8] rounded w-2/3" />
                  <div className="h-3.5 bg-[#F5F0E8] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTuitions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#78716C]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#1C1917] mb-2">কোনো টিউশন পাওয়া যায়নি</h3>
            <p className="text-[#78716C] text-sm">অনুসন্ধানের মানদণ্ড পরিবর্তন করুন বা পরে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTuitions.map((tuition) => (
              <div key={tuition._id} className="group bg-white rounded-2xl border border-[#E8DDD0] hover:border-[#006A4E]/30 hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col">

                {/* Code + badges */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <span className="font-heading font-bold text-[#1C1917] text-lg">{tuition.code}</span>
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

                <p className="px-5 pb-3 text-sm text-[#78716C]">{tuition.class} · {tuition.version}</p>

                <div className="px-5 pb-5 flex flex-col gap-3 flex-1">
                  {/* Subjects */}
                  <div className="flex flex-wrap gap-1.5">
                    {tuition.subjects.slice(0, 4).map((s, i) => (
                      <span key={i} className="bg-green-50 text-[#006A4E] border border-green-200 px-2.5 py-0.5 rounded-md text-xs font-semibold">{s}</span>
                    ))}
                    {tuition.subjects.length > 4 && (
                      <span className="bg-[#F5F0E8] text-[#78716C] px-2.5 py-0.5 rounded-md text-xs font-medium">+{tuition.subjects.length - 4}</span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 text-sm text-[#78716C]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0 text-[#E07B2A]" />
                      <span className="truncate">{tuition.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 text-[#006A4E]" />
                      <span>{tuition.weeklyDays} · {tuition.dailyHours}</span>
                    </div>
                    {tuition.startMonth && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 shrink-0 text-[#78716C]" />
                        <span>Start: {tuition.startMonth}</span>
                      </div>
                    )}
                  </div>

                  {/* Salary */}
                  <p className="text-[#006A4E] font-heading font-bold text-xl">৳ {tuition.salary}</p>

                  {/* Preference */}
                  {tuition.tutorGender && tuition.tutorGender !== 'Not specified' && (
                    <p className="text-xs text-[#78716C] bg-[#FFFDF7] border border-[#E8DDD0] rounded-lg px-3 py-2">
                      <span className="font-semibold text-[#1C1917]">Preferred:</span> {tuition.tutorGender} tutor
                    </p>
                  )}

                  {tuition.specialRemarks && (
                    <p className="text-xs text-[#78716C] line-clamp-2">
                      <span className="font-semibold text-[#1C1917]">Remarks:</span> {tuition.specialRemarks}
                    </p>
                  )}

                  <div className="flex-1" />

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-[#F5F0E8]">
                    <Link href={`/tuition/${tuition.code}`} className="flex-1">
                      <button className="w-full border border-[#E8DDD0] text-[#1C1917] hover:border-[#006A4E] hover:text-[#006A4E] py-2 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer">
                        বিস্তারিত
                      </button>
                    </Link>

                    {session ? (
                      applicationsLoading ? (
                        <button disabled className="flex-1 bg-[#F5F0E8] text-[#78716C] py-2 rounded-lg text-sm font-semibold cursor-default flex items-center justify-center gap-1.5">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Loading...
                        </button>
                      ) : hasApplied(tuition._id) ? (
                        <button
                          onClick={() => showToast('আপনি ইতোমধ্যে আবেদন করেছেন।', 'info')}
                          className="flex-1 bg-green-50 text-[#006A4E] border border-green-200 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(tuition)}
                          className="flex-1 bg-[#E07B2A] hover:bg-[#C96A1A] text-white py-2 rounded-lg text-sm font-bold transition-colors duration-200 cursor-pointer"
                        >
                          আবেদন করুন →
                        </button>
                      )
                    ) : (
                      <Link href={`/tutors/register?tuition=${tuition.code}`} className="flex-1">
                        <button className="w-full bg-[#E07B2A] hover:bg-[#C96A1A] text-white py-2 rounded-lg text-sm font-bold transition-colors duration-200 cursor-pointer">
                          Register & Apply
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Application Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title="টিউশনে আবেদন করুন"
        size="md"
        actions={
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowApplicationModal(false)}
              className="px-4 py-2 border border-[#E8DDD0] text-[#78716C] rounded-lg hover:bg-[#F5F0E8] text-sm font-medium cursor-pointer">
              বাতিল
            </button>
            <button type="submit" form="application-form"
              disabled={applicationLoading || confirmationText.toLowerCase().trim() !== (siteSettings.mediaFeeConfirmText || 'Agree').toLowerCase()}
              className="px-4 py-2 bg-[#006A4E] hover:bg-[#005540] text-white rounded-lg disabled:opacity-50 text-sm font-semibold cursor-pointer">
              {applicationLoading ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
            </button>
          </div>
        }
      >
        {selectedTuition && (
          <form id="application-form" onSubmit={handleApplicationSubmit} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-heading font-semibold text-[#006A4E] mb-1">Tuition Details</h4>
              <p className="text-sm text-[#1C1917]">
                <span className="font-semibold">Code:</span> {selectedTuition.code} &nbsp;·&nbsp;
                <span className="font-semibold">Class:</span> {selectedTuition.class} &nbsp;·&nbsp;
                <span className="font-semibold">Location:</span> {selectedTuition.location}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <h4 className="font-heading font-semibold mb-2">আমাদের মিডিয়া ফি এর নিয়ম:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {(siteSettings.mediaFeeRules || []).map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
              {siteSettings.mediaFeeNote && (
                <div className="mt-3 p-2 bg-amber-100 rounded text-xs font-medium">
                  {siteSettings.mediaFeeNote}
                </div>
              )}
              <p className="font-medium pt-3">
                একমত হলে নিচে <strong>"{siteSettings.mediaFeeConfirmText || 'Agree'}"</strong> লিখুন।
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C1917] mb-1.5">Confirmation *</label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Type '${siteSettings.mediaFeeConfirmText || 'Agree'}' to confirm`}
                className="w-full px-3 py-2.5 border border-[#E8DDD0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                required
              />
              {confirmationText.toLowerCase().trim() === (siteSettings.mediaFeeConfirmText || 'Agree').toLowerCase() && (
                <p className="mt-1 text-xs text-[#006A4E] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> শর্ত গ্রহণ করা হয়েছে
                </p>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* ── Registration Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        title="আবেদন করতে নিবন্ধন করুন"
        size="md"
        actions={
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowRegistrationModal(false)}
              className="px-4 py-2 border border-[#E8DDD0] text-[#78716C] rounded-lg hover:bg-[#F5F0E8] text-sm font-medium cursor-pointer">
              বাতিল
            </button>
            <button type="submit" form="registration-form" disabled={registrationLoading}
              className="px-4 py-2 bg-[#006A4E] hover:bg-[#005540] text-white rounded-lg disabled:opacity-50 text-sm font-semibold cursor-pointer">
              {registrationLoading ? 'নিবন্ধন হচ্ছে...' : 'Register & Apply'}
            </button>
          </div>
        }
      >
        {selectedTuition && (
          <form id="registration-form" onSubmit={handleRegistrationSubmit} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-[#006A4E] mb-1">Tuition: {selectedTuition.code}</p>
              <p className="text-[#1C1917]">{selectedTuition.class} · {selectedTuition.location}</p>
            </div>
            <p className="text-sm text-[#78716C] bg-amber-50 border border-amber-200 rounded-lg p-3">
              আবেদন করতে প্রথমে Tutor হিসেবে নিবন্ধন করুন। নিবন্ধনের পর Login পেজে নিয়ে যাওয়া হবে।
            </p>

            {[
              { label: 'পুরো নাম', key: 'name', type: 'text' },
              { label: 'Phone Number', key: 'phone', type: 'tel' },
              { label: 'Email Address', key: 'email', type: 'email' },
              { label: 'Password', key: 'password', type: 'password', hint: 'কমপক্ষে ৬ অক্ষর' },
              { label: 'Confirm Password', key: 'confirmPassword', type: 'password' },
            ].map(({ label, key, type, hint }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-[#1C1917] mb-1.5">{label} *</label>
                <input
                  type={type}
                  value={registrationForm[key as keyof typeof registrationForm]}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8DDD0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
                  minLength={key === 'password' ? 6 : undefined}
                  required
                />
                {hint && <p className="mt-1 text-xs text-[#78716C]">{hint}</p>}
              </div>
            ))}
          </form>
        )}
      </Modal>
    </div>
  );
}
