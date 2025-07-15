'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import LocationSelector from '@/components/LocationSelector';

interface TuitionEditFormProps {
  tuition: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface Subject {
  _id: string;
  name: string;
}

export default function TuitionEditForm({ tuition, onSubmit, onCancel, loading = false }: TuitionEditFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(Array.isArray(tuition.subjects) ? tuition.subjects : []);
  const [customSubject, setCustomSubject] = useState('');
  const [location, setLocation] = useState({
    division: tuition.location?.division || '',
    district: tuition.location?.district || '',
    area: tuition.location?.area || '',
    subarea: tuition.location?.subarea || '',
  });
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      guardianName: tuition.guardianName || '',
      guardianNumber: tuition.guardianNumber || '',
      guardianAddress: tuition.guardianAddress || '',
      class: tuition.class || '',
      version: tuition.version || 'English Medium',
      weeklyDays: tuition.weeklyDays || '',
      dailyHours: tuition.dailyHours || '',
      weeklyHours: tuition.weeklyHours || '',
      salary: tuition.salary || '',
      location: tuition.location || '',
      startMonth: tuition.startMonth || '',
      tutorGender: tuition.tutorGender || 'Not specified',
      specialRemarks: tuition.specialRemarks || '',
      urgent: tuition.urgent || false,
      status: tuition.status || 'open',
      tutorRequirement: tuition.tutorRequirement || '',
      specificLocation: tuition.specificLocation || '',
      description: tuition.description || ''
    }
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const addCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects([...selectedSubjects, customSubject.trim()]);
      setCustomSubject('');
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setSelectedSubjects(selectedSubjects.filter(subject => subject !== subjectToRemove));
  };

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      subjects: selectedSubjects,
      location: location
    };
    onSubmit(formData);
  };

  const statusOptions = [
    { value: 'open', label: 'Open', color: 'text-green-600' },
    { value: 'available', label: 'Available', color: 'text-blue-600' },
    { value: 'demo running', label: 'Demo Running', color: 'text-yellow-600' },
    { value: 'booked', label: 'Booked', color: 'text-purple-600' },
    { value: 'booked by other', label: 'Booked by Other', color: 'text-red-600' }
  ];

  const versionOptions = [
    'English Medium',
    'Bangla Medium', 
    'English Version',
    'Others'
  ];

  const genderOptions = [
    'Not specified',
    'Male',
    'Female',
    'Any'
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Guardian Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Name *
            </label>
            <input
              {...register('guardianName', { required: 'Guardian name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter guardian name"
            />
            {errors.guardianName && (
              <p className="text-red-500 text-sm mt-1">{errors.guardianName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Number *
            </label>
            <input
              {...register('guardianNumber', { 
                required: 'Guardian number is required',
                pattern: {
                  value: /^(\+880|880|0)?1[3-9]\d{8}$/,
                  message: 'Please enter a valid Bangladeshi phone number'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="01XXXXXXXXX"
            />
            {errors.guardianNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.guardianNumber.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Address
            </label>
            <textarea
              {...register('guardianAddress')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter guardian address"
            />
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class *
            </label>
            <input
              {...register('class', { required: 'Class is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Class 8, HSC 1st Year"
            />
            {errors.class && (
              <p className="text-red-500 text-sm mt-1">{errors.class.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version *
            </label>
            <select
              {...register('version', { required: 'Version is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {versionOptions.map(version => (
                <option key={version} value={version}>{version}</option>
              ))}
            </select>
            {errors.version && (
              <p className="text-red-500 text-sm mt-1">{errors.version.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects *
            </label>
            <div className="space-y-3">
              {/* Selected Subjects */}
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map(subject => (
                    <span
                      key={subject}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Subject Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Array.isArray(subjects) && subjects.map(subject => (
                  <label key={subject._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubjects([...selectedSubjects, subject.name]);
                        } else {
                          setSelectedSubjects(selectedSubjects.filter(s => s !== subject.name));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{subject.name}</span>
                  </label>
                ))}
              </div>

              {/* Custom Subject */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Add custom subject"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                />
                <button
                  type="button"
                  onClick={addCustomSubject}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Days *
            </label>
            <input
              {...register('weeklyDays', { required: 'Weekly days is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 5 days, 6 days"
            />
            {errors.weeklyDays && (
              <p className="text-red-500 text-sm mt-1">{errors.weeklyDays.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Hours
            </label>
            <input
              {...register('dailyHours')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 2 hours"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary *
            </label>
            <input
              {...register('salary', { required: 'Salary is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 8000 BDT"
            />
            {errors.salary && (
              <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <LocationSelector
              value={location}
              onChange={setLocation}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Month
            </label>
            <input
              {...register('startMonth')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., January 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tutor Gender Preference
            </label>
            <select
              {...register('tutorGender')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {genderOptions.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status and Requirements */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className={option.color}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('urgent')}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Urgent Requirement</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Remarks
            </label>
            <textarea
              {...register('specialRemarks')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any special requirements or remarks..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || selectedSubjects.length === 0}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Status Change Warning */}
      {watchedStatus !== tuition.status && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Status Change Detected
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You are changing the status from <strong>{tuition.status}</strong> to <strong>{watchedStatus}</strong>. 
                  This will affect how the tuition appears in the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
} 