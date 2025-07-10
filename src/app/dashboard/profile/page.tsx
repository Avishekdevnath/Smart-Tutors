'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { 
  UserIcon, 
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  return (
    <DashboardLayout 
      title="Profile" 
      description="Manage your account settings and preferences"
    >
      {/* Coming Soon Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ClockIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-purple-900">Profile Management Coming Soon</h3>
            <p className="text-purple-700">
              We're working on comprehensive profile management features to help you 
              customize your account and manage your personal information.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Personal Info</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Security</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <EnvelopeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Email Settings</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <PhoneIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contact Info</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <MapPinIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Location</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <UserIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Preferences</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Profile Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Personal information management</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Password and security settings</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Email and notification preferences</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Profile picture and avatar</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Two-factor authentication</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Privacy and data settings</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Account activity history</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Theme and appearance options</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 