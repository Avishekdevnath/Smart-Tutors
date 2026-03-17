'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';
import { useSettings } from '@/hooks/useSettings';

interface Tuition {
  _id: string;
  code: string;
  class: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  dailyHours: string;
  salary: string;
  location: string;
  startMonth: string;
  tutorGender: string;
  specialRemarks: string;
  urgent: boolean;
  status: string;
  tutorRequirement: string;
  specificLocation: string;
  description: string;
  createdAt: string;
}

export default function TuitionDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { settings: siteSettings } = useSettings();
  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  useEffect(() => {
    const fetchTuition = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tuitions/public/${params.code}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tuition not found');
          } else {
            setError('Failed to load tuition details');
          }
          return;
        }

        const data = await response.json();
        setTuition(data);
      } catch (err) {
        setError('Failed to load tuition details');
        console.error('Error fetching tuition:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.code) {
      fetchTuition();
    }
  }, [params.code]);

  useEffect(() => {
    if (session && tuition) {
      checkApplicationStatus();
    }
  }, [session, tuition]);

  const checkApplicationStatus = async () => {
    if (!session || !tuition) return;
    
    try {
      setApplicationsLoading(true);
      const response = await fetch(`/api/applications?tuitionCode=${tuition.code}`);
      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.applications && data.applications.length > 0);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleApply = () => {
    if (!session) {
      // Redirect to registration with tuition code
      window.location.href = `/tutors/register?tuition=${tuition?.code}`;
      return;
    }
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuition || !session) return;

    // Check if user agreed to terms
    if (confirmationText.toLowerCase().trim() !== (siteSettings.mediaFeeConfirmText || 'Agree').toLowerCase()) {
      showToast('Please type "Agree" to confirm you accept the terms and conditions', 'error');
      return;
    }

    try {
      setApplicationLoading(true);
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tuitionId: tuition._id,
          agreedToTerms: true,
          confirmationText: confirmationText
        })
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Application submitted successfully!', 'success');
        setShowApplicationModal(false);
        setConfirmationText('');
        setHasApplied(true);
      } else {
        showToast(result.error || 'Failed to submit application', 'error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showToast('Error submitting application', 'error');
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleAppliedClick = () => {
    showToast('You have already applied for this tuition. Check your applications page for status updates.', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006A4E] mx-auto"></div>
          <p className="mt-4 text-[#78716C]">টিউশন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !tuition) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="font-heading text-2xl font-bold text-[#1C1917] mb-2">টিউশন পাওয়া যায়নি</h1>
          <p className="text-[#78716C] mb-6">{error || 'আপনি যে টিউশনটি খুঁজছেন তা বিদ্যমান নেই।'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#006A4E] text-white rounded-lg hover:bg-[#005a40] transition-colors"
          >
            ← হোমে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'demo running':
        return 'bg-yellow-100 text-yellow-800';
      case 'booked':
        return 'bg-gray-100 text-gray-800';
      case 'booked by other':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Header */}
      <div className="bg-[#006A4E]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">
                টিউশনের বিবরণ
              </h1>
              <p className="text-green-100 mt-1 text-sm">
                Code: {tuition.code}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyLink}
                className="inline-flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                title="লিঙ্ক কপি করুন"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                লিঙ্ক কপি
              </button>
              <Link
                href="/"
                className="text-green-100 hover:text-white font-medium text-sm"
              >
                ← হোমে ফিরুন
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card border border-[#E8DDD0] p-6 mb-6">
              {/* Header with Status */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#1C1917] mb-1">
                    {tuition.class} - {tuition.version}
                  </h2>
                  <p className="text-[#78716C] text-sm">
                    পোস্ট করা হয়েছে {formatDate(tuition.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {tuition.urgent && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      ⚡ Urgent
                    </span>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tuition.status)}`}>
                    {tuition.status.charAt(0).toUpperCase() + tuition.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Subjects */}
              {tuition.subjects && tuition.subjects.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-[#1C1917] mb-3">বিষয়সমূহ</h3>
                  <div className="flex flex-wrap gap-2">
                    {tuition.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#006A4E]/10 text-[#006A4E]"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule & Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-[#1C1917] mb-3">সময়সূচি</h3>
                  <div className="space-y-2 text-sm">
                    {tuition.weeklyDays && (
                      <div className="flex justify-between">
                        <span className="text-[#78716C]">Days:</span>
                        <span className="font-medium text-[#1C1917]">{tuition.weeklyDays}</span>
                      </div>
                    )}
                    {tuition.dailyHours && (
                      <div className="flex justify-between">
                        <span className="text-[#78716C]">Hours:</span>
                        <span className="font-medium text-[#1C1917]">{tuition.dailyHours}</span>
                      </div>
                    )}
                    {tuition.startMonth && (
                      <div className="flex justify-between">
                        <span className="text-[#78716C]">Start Month:</span>
                        <span className="font-medium text-[#1C1917]">{tuition.startMonth}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-semibold text-[#1C1917] mb-3">প্রয়োজনীয়তা</h3>
                  <div className="space-y-2 text-sm">
                    {tuition.salary && (
                      <div className="flex justify-between">
                        <span className="text-[#78716C]">Salary:</span>
                        <span className="font-medium text-[#E07B2A]">{tuition.salary}</span>
                      </div>
                    )}
                    {tuition.tutorGender && tuition.tutorGender !== "Not specified" && (
                      <div className="flex justify-between">
                        <span className="text-[#78716C]">Tutor Gender:</span>
                        <span className="font-medium text-[#1C1917]">{tuition.tutorGender}</span>
                      </div>
                    )}
                    {tuition.location && (
                      <div className="flex justify-between">
                        <span className="text-[#78716C]">Location:</span>
                        <span className="font-medium text-[#1C1917]">{tuition.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(tuition.specificLocation || tuition.description || tuition.tutorRequirement || tuition.specialRemarks) && (
                <div className="space-y-4 text-sm">
                  {tuition.specificLocation && (
                    <div>
                      <h3 className="font-heading font-semibold text-[#1C1917] mb-1">নির্দিষ্ট এলাকা</h3>
                      <p className="text-[#78716C]">{tuition.specificLocation}</p>
                    </div>
                  )}
                  {tuition.description && (
                    <div>
                      <h3 className="font-heading font-semibold text-[#1C1917] mb-1">বিবরণ</h3>
                      <p className="text-[#78716C]">{tuition.description}</p>
                    </div>
                  )}
                  {tuition.tutorRequirement && (
                    <div>
                      <h3 className="font-heading font-semibold text-[#1C1917] mb-1">টিউটর প্রয়োজনীয়তা</h3>
                      <p className="text-[#78716C]">{tuition.tutorRequirement}</p>
                    </div>
                  )}
                  {tuition.specialRemarks && (
                    <div>
                      <h3 className="font-heading font-semibold text-[#1C1917] mb-1">বিশেষ মন্তব্য</h3>
                      <p className="text-[#78716C]">{tuition.specialRemarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply Button */}
            <div className="bg-white rounded-xl shadow-card border border-[#E8DDD0] p-6 mb-6">
              <h3 className="font-heading font-semibold text-[#1C1917] mb-3">এই টিউশনে আবেদন করুন</h3>
              <p className="text-[#78716C] text-sm mb-4">
                এই টিউশনে আগ্রহী? আবেদন করুন এবং অভিভাবকের সাথে যোগাযোগ করুন।
              </p>
              {session ? (
                applicationsLoading ? (
                  <button
                    className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold cursor-default flex items-center justify-center"
                    disabled
                  >
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </button>
                ) : hasApplied ? (
                  <button
                    onClick={handleAppliedClick}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                    title="Click to view application status"
                    disabled
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Applied
                  </button>
                ) : (
                  <button
                    onClick={handleApply}
                    className="w-full bg-[#E07B2A] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#c96d22] transition-colors"
                  >
                    আবেদন করুন →
                  </button>
                )
              ) : (
                <Link
                  href={`/tutors/register?tuition=${tuition.code}`}
                  className="w-full inline-flex justify-center items-center px-4 py-3 bg-[#E07B2A] text-white font-semibold rounded-lg hover:bg-[#c96d22] transition-colors"
                >
                  রেজিস্ট্রেশন করে আবেদন করুন →
                </Link>
              )}
            </div>
            {/* Guardian Information section removed */}
          </div>
        </div>
      </div>
      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title="Apply for Tuition - Terms & Conditions"
        size="md"
        actions={
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowApplicationModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="application-form"
              disabled={applicationLoading || confirmationText.toLowerCase().trim() !== (siteSettings.mediaFeeConfirmText || 'Agree').toLowerCase()}
              className="px-4 py-2 bg-[#006A4E] text-white rounded-lg hover:bg-[#005a40] disabled:opacity-50"
            >
              {applicationLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        }
      >
        {tuition && (
          <form id="application-form" onSubmit={handleApplicationSubmit} className="space-y-4">
            <div className="bg-[#006A4E]/5 border border-[#006A4E]/20 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-[#006A4E] mb-2">টিউশনের তথ্য</h4>
              <p className="text-[#1C1917] text-sm">
                <strong>Code:</strong> {tuition.code} | <strong>Class:</strong> {tuition.class} | <strong>Location:</strong> {tuition.location}
              </p>
            </div>
            {/* Terms and Conditions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-3">আমাদের মিডিয়া ফি এর নিয়ম:</h4>
              <ul className="list-disc pl-5 text-yellow-800 text-sm space-y-1">
                {(siteSettings.mediaFeeRules || []).map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
              {siteSettings.mediaFeeNote && (
                <p className="mt-2 text-xs text-yellow-700 font-medium">{siteSettings.mediaFeeNote}</p>
              )}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">{siteSettings.mediaFeeConfirmText || 'Agree'}</span> to confirm you accept the terms
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={e => setConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DDD0] rounded-lg focus:ring-2 focus:ring-[#006A4E]"
                  placeholder={`Type ${siteSettings.mediaFeeConfirmText || 'Agree'} to confirm`}
                  required
                />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
} 