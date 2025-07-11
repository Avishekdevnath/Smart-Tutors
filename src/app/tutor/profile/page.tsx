'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TutorDashboardLayout from '@/components/TutorDashboardLayout';

export default function TutorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tutorData, setTutorData] = useState<any>(null);

  const user = session?.user as any;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || user?.userType !== 'tutor') {
      router.push('/tutors/login');
      return;
    }
    loadTutorProfile();
  }, [session, status]);

  const loadTutorProfile = async () => {
    try {
      setIsLoading(true);
      if (user?.tutorId) {
        console.log('Loading tutor profile for ID:', user.tutorId);
        const response = await fetch(`/api/tutors/${user.tutorId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Raw API response:', data);
          
          // The API returns { success: true, tutor: {...} }
          // So we need to extract the tutor data
          if (data.success && data.tutor) {
            console.log('Setting tutor data:', data.tutor);
            setTutorData(data.tutor);
          } else {
            console.log('Setting data directly:', data);
            setTutorData(data);
          }
        } else {
          console.error('Failed to fetch tutor profile:', response.status, response.statusText);
        }
      } else {
        console.error('No tutorId found in user session');
      }
    } catch (error) {
      console.error('Error loading tutor profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <TutorDashboardLayout title="Profile" description="Manage your tutor profile">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </TutorDashboardLayout>
    );
  }

  return (
    <TutorDashboardLayout title="Profile" description="Manage your tutor profile and settings">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {(tutorData?.name || user?.name || 'T').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tutorData?.name || user?.name || 'Tutor'}
                </h1>
                <p className="text-gray-600">Tutor Profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{tutorData?.name || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900">{tutorData?.email || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900">{tutorData?.phone || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-gray-900">{tutorData?.address || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <p className="text-gray-900">
                  {tutorData?.location?.formatted || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <p className="text-gray-900">{tutorData?.gender || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Family Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name
                </label>
                <p className="text-gray-900">{tutorData?.fatherName || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Phone Number
                </label>
                <p className="text-gray-900">{tutorData?.fatherNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Academic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University
                </label>
                <p className="text-gray-900">{tutorData?.university || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <p className="text-gray-900">{tutorData?.department || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University Short Form
                </label>
                <p className="text-gray-900">{tutorData?.universityShortForm || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year & Semester
                </label>
                <p className="text-gray-900">{tutorData?.yearAndSemester || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <p className="text-gray-900">{tutorData?.group || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <p className="text-gray-900">{tutorData?.version || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <p className="text-gray-900">{tutorData?.experience || 'Not provided'}</p>
            </div>

            {/* Academic Results */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Results
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">SSC Result:</span>
                  <p className="text-gray-900">{tutorData?.academicQualifications?.sscResult || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">HSC Result:</span>
                  <p className="text-gray-900">{tutorData?.academicQualifications?.hscResult || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">O-Level Result:</span>
                  <p className="text-gray-900">{tutorData?.academicQualifications?.oLevelResult || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">A-Level Result:</span>
                  <p className="text-gray-900">{tutorData?.academicQualifications?.aLevelResult || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Educational Institutions */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Educational Institutions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">School:</span>
                  <p className="text-gray-900">{tutorData?.schoolName || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">College:</span>
                  <p className="text-gray-900">{tutorData?.collegeName || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects and Preferences */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Teaching Preferences</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Subjects
              </label>
              <div className="flex flex-wrap gap-2">
                {tutorData?.preferredSubjects && tutorData.preferredSubjects.length > 0 ? (
                  tutorData.preferredSubjects.map((subject: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {subject}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No subjects specified</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Locations
              </label>
              <div className="flex flex-wrap gap-2">
                {tutorData?.preferredLocation && tutorData.preferredLocation.length > 0 ? (
                  tutorData.preferredLocation.map((location: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {location}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No preferred locations specified</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Change Password
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Public Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TutorDashboardLayout>
  );
} 