'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Toast, { useToast } from '@/components/Toast';
import LocationSelector from '@/components/LocationSelector';

interface GuardianFormData {
  name: string;
  number: string;
  email: string;
  address: string;
  whatsappNumber: string;
  optionalNumber: string;
  socialMediaLink: string;
  location: {
    division: string;
    district: string;
    area: string;
    subarea?: string;
  };
}

export default function AddGuardianPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<GuardianFormData>({
    name: '',
    number: '',
    email: '',
    address: '',
    whatsappNumber: '',
    optionalNumber: '',
    socialMediaLink: '',
    location: {
      division: '',
      district: '',
      area: '',
      subarea: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleInputChange = (field: keyof GuardianFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location: GuardianFormData['location']) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number) {
      showToast('Phone number is required', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/guardians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Guardian added successfully!', 'success');
        setTimeout(() => {
          router.push('/dashboard/guardians');
        }, 2000);
      } else {
        showToast(result.error || 'Failed to add guardian', 'error');
      }
    } catch (error) {
      console.error('Error adding guardian:', error);
      showToast('Failed to add guardian', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Add New Guardian" 
      description="Add a new guardian to the system"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Guardian</h1>
          <p className="text-gray-600">Fill in the guardian's information below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter guardian name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="guardian@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="WhatsApp number (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Number
                </label>
                <input
                  type="tel"
                  value={formData.optionalNumber}
                  onChange={(e) => handleInputChange('optionalNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Alternative contact number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Media Link
                </label>
                <input
                  type="url"
                  value={formData.socialMediaLink}
                  onChange={(e) => handleInputChange('socialMediaLink', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Facebook, LinkedIn, or other social media profile"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Location Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Division/District/Area)
              </label>
              <LocationSelector
                value={formData.location}
                onChange={handleLocationChange}
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Address Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter complete address including house number, road, area, etc."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/guardians')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding Guardian...' : 'Add Guardian'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
} 