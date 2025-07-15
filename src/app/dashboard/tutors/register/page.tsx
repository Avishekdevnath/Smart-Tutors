'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Upload, User, Phone, Mail, MapPin, GraduationCap, BookOpen, Target } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

interface TutorFormData {
  // Basic Information
  name: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  
  // Contact Information
  address: string;
  fatherName: string;
  fatherNumber: string;
  
  // Academic Information
  version: 'EM' | 'BM' | 'EV';
  group: 'Science' | 'Arts' | 'Commerce';
  sscResult: string;
  hscResult: string;
  oLevelResult: string;
  aLevelResult: string;
  
  // Educational Background
  schoolName: string;
  collegeName: string;
  university: string;
  universityShortForm: string;
  department: string;
  yearAndSemester: string;
  
  // Preferences
  preferredSubjects: string[];
  preferredLocation: string[];
  experience: string;
  
  // Location Details
  division: string;
  district: string;
  area: string;
  
  // Documents
  nidPhoto: File | null;
  studentIdPhoto: File | null;
}

export default function TutorRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TutorFormData>({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    address: '',
    fatherName: '',
    fatherNumber: '',
    version: 'EM',
    group: 'Science',
    sscResult: '',
    hscResult: '',
    oLevelResult: '',
    aLevelResult: '',
    schoolName: '',
    collegeName: '',
    university: '',
    universityShortForm: '',
    department: '',
    yearAndSemester: '',
    preferredSubjects: [],
    preferredLocation: [],
    experience: '',
    division: '',
    district: '',
    area: '',
    nidPhoto: null,
    studentIdPhoto: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Available subjects and locations
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Bangla', 'English', 'Math', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Civics', 'Economics', 'Accounting', 'Business Studies',
    'ICT', 'Computer Science', 'Religious Studies', 'Literature', 'All'
  ]);

  const [availableLocations, setAvailableLocations] = useState<string[]>([
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
    'Gazipur', 'Narayanganj', 'Tangail', 'Comilla', 'Noakhali', 'Feni', 'Cox\'s Bazar'
  ]);

  const handleInputChange = (field: keyof TutorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'nidPhoto' | 'studentIdPhoto', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Helper for react-select options
  const subjectOptions = availableSubjects.map((subject) => ({ value: subject, label: subject }));
  const locationOptions = availableLocations.map((location) => ({ value: location, label: location }));

  // Handler for react-select
  const handleSubjectSelect = (selected: any) => {
    if (!selected) {
      setFormData((prev) => ({ ...prev, preferredSubjects: [] }));
      return;
    }
    const values = selected.map((s: any) => s.value);
    if (values.includes('All')) {
      setFormData((prev) => ({ ...prev, preferredSubjects: ['All'] }));
    } else {
      setFormData((prev) => ({ ...prev, preferredSubjects: values.filter((v: string) => v !== 'All') }));
    }
  };

  const handleLocationSelect = (selected: any) => {
    if (!selected) {
      setFormData((prev) => ({ ...prev, preferredLocation: [] }));
      return;
    }
    const values = selected.map((s: any) => s.value);
    setFormData((prev) => ({ ...prev, preferredLocation: values }));
  };

  // Handler for creating new options
  const handleCreateSubject = async (inputValue: string) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setAvailableSubjects((prev) => [...prev, trimmed]);
    setFormData((prev) => ({ ...prev, preferredSubjects: [...prev.preferredSubjects, trimmed] }));
  };

  const handleCreateLocation = async (inputValue: string) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setAvailableLocations((prev) => [...prev, trimmed]);
    setFormData((prev) => ({ ...prev, preferredLocation: [...prev.preferredLocation, trimmed] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'nidPhoto' || key === 'studentIdPhoto') {
          if (value) {
            formDataToSend.append(key, value);
          }
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, value.join(','));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Add academic qualifications as JSON
      const academicQualifications = {
        sscResult: formData.sscResult,
        hscResult: formData.hscResult,
        oLevelResult: formData.oLevelResult,
        aLevelResult: formData.aLevelResult,
      };
      formDataToSend.append('academicQualifications', JSON.stringify(academicQualifications));

      // Add location as JSON
      const location = {
        division: formData.division,
        district: formData.district,
        area: formData.area,
      };
      formDataToSend.append('location', JSON.stringify(location));

      const response = await fetch('/api/tutors', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.message) {
        setSuccess('Tutor registered successfully!');
        setTimeout(() => {
          router.push('/dashboard/tutors');
        }, 2000);
      } else {
        setError(result.error || 'Failed to register tutor');
      }
    } catch (error) {
      console.error('Error registering tutor:', error);
      setError('Failed to register tutor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Register New Tutor" 
      description="Register a new tutor with complete information"
    >
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Tutors</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter tutor's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="tutor@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter detailed address"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-600" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father's Name
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter father's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father's Phone Number
              </label>
              <input
                type="tel"
                value={formData.fatherNumber}
                onChange={(e) => handleInputChange('fatherNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Academic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version *
              </label>
              <select
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="EM">English Medium</option>
                <option value="BM">Bangla Medium</option>
                <option value="EV">English Version</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group *
              </label>
              <select
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="Science">Science</option>
                <option value="Arts">Arts</option>
                <option value="Commerce">Commerce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SSC/O-Levels Result
              </label>
              <input
                type="text"
                value={formData.sscResult}
                onChange={(e) => handleInputChange('sscResult', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., GPA 5.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HSC/A-Levels Result
              </label>
              <input
                type="text"
                value={formData.hscResult}
                onChange={(e) => handleInputChange('hscResult', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., GPA 5.00"
              />
            </div>
          </div>
        </div>

        {/* Educational Background */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Educational Background
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter school name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Name
              </label>
              <input
                type="text"
                value={formData.collegeName}
                onChange={(e) => handleInputChange('collegeName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter college name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => handleInputChange('university', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter university name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Short Form
              </label>
              <input
                type="text"
                value={formData.universityShortForm}
                onChange={(e) => handleInputChange('universityShortForm', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., DU, BUET, CU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year & Semester
              </label>
              <input
                type="text"
                value={formData.yearAndSemester}
                onChange={(e) => handleInputChange('yearAndSemester', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 3rd Year, 2nd Semester"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Teaching Preferences
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Subjects
              </label>
              <CreatableSelect
                isMulti
                options={subjectOptions}
                value={subjectOptions.filter(opt => formData.preferredSubjects.includes(opt.value))}
                onChange={handleSubjectSelect}
                onCreateOption={handleCreateSubject}
                placeholder="Type or select subjects..."
                classNamePrefix="react-select"
                isClearable={false}
                closeMenuOnSelect={false}
                formatCreateLabel={inputValue => `Add "${inputValue}"`}
                styles={{
                  control: (base) => ({ ...base, minHeight: '44px', borderColor: '#a78bfa' }),
                  multiValue: (base) => ({ ...base, backgroundColor: '#ede9fe', color: '#6d28d9' }),
                  multiValueLabel: (base) => ({ ...base, color: '#6d28d9' }),
                  multiValueRemove: (base) => ({ ...base, color: '#a78bfa', ':hover': { backgroundColor: '#a78bfa', color: 'white' } }),
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Locations
              </label>
              <CreatableSelect
                isMulti
                options={locationOptions}
                value={locationOptions.filter(opt => formData.preferredLocation.includes(opt.value))}
                onChange={handleLocationSelect}
                onCreateOption={handleCreateLocation}
                placeholder="Type or select locations..."
                classNamePrefix="react-select"
                isClearable={false}
                closeMenuOnSelect={false}
                formatCreateLabel={inputValue => `Add "${inputValue}"`}
                styles={{
                  control: (base) => ({ ...base, minHeight: '44px', borderColor: '#a78bfa' }),
                  multiValue: (base) => ({ ...base, backgroundColor: '#ede9fe', color: '#6d28d9' }),
                  multiValueLabel: (base) => ({ ...base, color: '#6d28d9' }),
                  multiValueRemove: (base) => ({ ...base, color: '#a78bfa', ':hover': { backgroundColor: '#a78bfa', color: 'white' } }),
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teaching Experience
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your teaching experience (if any)"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Location Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Division
              </label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => handleInputChange('division', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Dhaka"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Dhaka"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Dhanmondi"
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Documents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NID Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('nidPhoto', e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your NID</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('studentIdPhoto', e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your Student ID</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Registering...</span>
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                <span>Register Tutor</span>
              </>
            )}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
} 