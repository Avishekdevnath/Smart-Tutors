'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';

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
    if (confirmationText.toLowerCase().trim() !== 'agree') {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tuition details...</p>
        </div>
      </div>
    );
  }

  if (error || !tuition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tuition Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The tuition you are looking for does not exist.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tuition Details
              </h1>
              <p className="text-gray-600 mt-1">
                Code: {tuition.code}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyLink}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Copy link to clipboard"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              {/* Header with Status */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {tuition.class} - {tuition.version}
                  </h2>
                  <p className="text-gray-600">
                    Posted on {formatDate(tuition.createdAt)}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {tuition.subjects.map((subject, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule</h3>
                  <div className="space-y-2">
                    {tuition.weeklyDays && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days:</span>
                        <span className="font-medium">{tuition.weeklyDays}</span>
                      </div>
                    )}
                    {tuition.dailyHours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hours:</span>
                        <span className="font-medium">{tuition.dailyHours}</span>
                      </div>
                    )}
                    {tuition.startMonth && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Month:</span>
                        <span className="font-medium">{tuition.startMonth}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <div className="space-y-2">
                    {tuition.salary && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Salary:</span>
                        <span className="font-medium text-green-600">{tuition.salary}</span>
                      </div>
                    )}
                    {tuition.tutorGender && tuition.tutorGender !== "Not specified" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tutor Gender:</span>
                        <span className="font-medium">{tuition.tutorGender}</span>
                      </div>
                    )}
                    {tuition.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{tuition.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(tuition.specificLocation || tuition.description || tuition.tutorRequirement || tuition.specialRemarks) && (
                <div className="space-y-4">
                  {tuition.specificLocation && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Specific Location</h3>
                      <p className="text-gray-700">{tuition.specificLocation}</p>
                    </div>
                  )}
                  
                  {tuition.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700">{tuition.description}</p>
                    </div>
                  )}
                  
                  {tuition.tutorRequirement && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutor Requirements</h3>
                      <p className="text-gray-700">{tuition.tutorRequirement}</p>
                    </div>
                  )}
                  
                  {tuition.specialRemarks && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Remarks</h3>
                      <p className="text-gray-700">{tuition.specialRemarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply Button */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this Tuition</h3>
              <p className="text-gray-600 mb-4">
                Interested in this tuition? Click below to apply and connect with the guardian.
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
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </button>
                )
              ) : (
                <Link
                  href={`/tutors/register?tuition=${tuition.code}`}
                  className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register & Apply
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
              disabled={applicationLoading || confirmationText.toLowerCase().trim() !== 'agree'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {applicationLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        }
      >
        {tuition && (
          <form id="application-form" onSubmit={handleApplicationSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Tuition Details</h4>
              <p className="text-blue-800 text-sm">
                <strong>Code:</strong> {tuition.code} | <strong>Class:</strong> {tuition.class} | <strong>Location:</strong> {tuition.location}
              </p>
            </div>
            {/* Terms and Conditions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-3">আমাদের মিডিয়া ফি এর নিয়ম:</h4>
              <ul className="list-disc pl-5 text-yellow-800 text-sm space-y-1">
                <li>গার্ডিয়ান কনফার্ম হলে মিডিয়া ফি (১ দিনের বেতন) অফিসে/বিকাশে প্রদান করতে হবে।</li>
                <li>গার্ডিয়ান কনফার্ম হওয়ার পর গার্ডিয়ানের নাম্বার দেয়া হবে।</li>
                <li>মিডিয়া ফি না দিলে পরবর্তী টিউশন/গার্ডিয়ান কনফার্মেশন বন্ধ থাকবে।</li>
                <li>মিডিয়া ফি অফিসে/বিকাশে প্রদান করতে হবে: 017XXXXXXXX (Smart Tutors)</li>
              </ul>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">Agree</span> to confirm you accept the terms and conditions
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={e => setConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type Agree to confirm"
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