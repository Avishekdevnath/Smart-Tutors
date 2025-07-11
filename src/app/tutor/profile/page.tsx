'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TutorDashboardLayout from '@/components/TutorDashboardLayout';
import Modal from '@/components/Modal';
import TutorEditForm from '@/components/TutorEditForm';
import Toast, { useToast } from '@/components/Toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function TutorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tutorData, setTutorData] = useState<any>(null);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Loading states
  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Password form state
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { showToast } = useToast();
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

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (data: any) => {
    try {
      setEditLoading(true);
      const response = await fetch(`/api/tutors/${user.tutorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        showToast('Profile updated successfully', 'success');
        loadTutorProfile(); // Reload profile data
        setShowEditModal(false);
      } else {
        showToast(result.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = () => {
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordLoading(true);
      const response = await fetch('/api/tutors/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordFormData)
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Password changed successfully', 'success');
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordModal(false);
      } else {
        showToast(result.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Error changing password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleViewPublicProfile = () => {
    if (tutorData?.name) {
      const slug = tutorData.name.toLowerCase().replace(/\s+/g, '-');
      router.push(`/tutor/${slug}`);
    }
  };



  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
      <Toast />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
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
                  Phone Number
                </label>
                <p className="text-gray-900">{tutorData?.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900">{tutorData?.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <p className="text-gray-900">{tutorData?.gender || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-gray-900">{tutorData?.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Academic Information</h2>
            </div>
            <div className="p-6 space-y-4">
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
                  Year & Semester
                </label>
                <p className="text-gray-900">{tutorData?.yearAndSemester || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <p className="text-gray-900">{tutorData?.version || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <p className="text-gray-900">{tutorData?.group || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Teaching Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Teaching Preferences</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Subjects
                </label>
                <div className="flex flex-wrap gap-2">
                  {tutorData?.preferredSubjects?.map((subject: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {subject}
                    </span>
                  )) || <p className="text-gray-500">No subjects specified</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Locations
                </label>
                <div className="flex flex-wrap gap-2">
                  {tutorData?.preferredLocation?.map((location: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {location}
                    </span>
                  )) || <p className="text-gray-500">No locations specified</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <p className="text-gray-900">{tutorData?.experience || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Profile Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Profile Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tutorData?.profileStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {tutorData?.profileStatus || 'Unknown'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tutor ID
                </label>
                <p className="text-gray-900 font-mono">{tutorData?.tutorId || 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Applications
                </label>
                <p className="text-gray-900">{tutorData?.totalApplications || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Successful Tuitions
                </label>
                <p className="text-gray-900">{tutorData?.successfulTuitions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Change Password
                </button>
                <button 
                  onClick={handleViewPublicProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Public Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="xl"
      >
        {tutorData && (
          <TutorEditForm
            tutor={tutorData}
            onSave={handleSaveProfile}
            onCancel={() => setShowEditModal(false)}
            loading={editLoading}
          />
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
        actions={
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="password-form"
              disabled={passwordLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        }
      >
        <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordFormData.currentPassword}
                onChange={(e) => setPasswordFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordFormData.newPassword}
                onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                minLength={6}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordFormData.confirmPassword}
                onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>


    </TutorDashboardLayout>
  );
} 