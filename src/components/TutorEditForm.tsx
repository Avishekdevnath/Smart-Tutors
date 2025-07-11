'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, GraduationCap, BookOpen, Target } from 'lucide-react';

interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  address?: string;
  fatherName?: string;
  fatherNumber?: string;
  version?: string;
  group?: string;
  academicQualifications?: {
    sscResult?: string;
    hscResult?: string;
    oLevelResult?: string;
    aLevelResult?: string;
  };
  schoolName?: string;
  collegeName?: string;
  university?: string;
  universityShortForm?: string;
  department?: string;
  yearAndSemester?: string;
  preferredSubjects?: string[];
  preferredLocation?: string[];
  experience?: string;
  location?: {
    division?: string;
    district?: string;
    area?: string;
  };
  status?: string;
}

interface TutorEditFormProps {
  tutor: Tutor;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function TutorEditForm({ tutor, onSave, onCancel, loading = false }: TutorEditFormProps) {
  const [formData, setFormData] = useState({
    name: tutor.name || '',
    phone: tutor.phone || '',
    email: tutor.email || '',
    gender: tutor.gender || 'Male',
    address: tutor.address || '',
    fatherName: tutor.fatherName || '',
    fatherNumber: tutor.fatherNumber || '',
    version: tutor.version || 'EM',
    group: tutor.group || 'Science',
    sscResult: tutor.academicQualifications?.sscResult || '',
    hscResult: tutor.academicQualifications?.hscResult || '',
    oLevelResult: tutor.academicQualifications?.oLevelResult || '',
    aLevelResult: tutor.academicQualifications?.aLevelResult || '',
    schoolName: tutor.schoolName || '',
    collegeName: tutor.collegeName || '',
    university: tutor.university || '',
    universityShortForm: tutor.universityShortForm || '',
    department: tutor.department || '',
    yearAndSemester: tutor.yearAndSemester || '',
    preferredSubjects: tutor.preferredSubjects || [],
    preferredLocation: tutor.preferredLocation || [],
    experience: tutor.experience || '',
    division: tutor.location?.division || '',
    district: tutor.location?.district || '',
    area: tutor.location?.area || ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      address: formData.address,
      fatherName: formData.fatherName,
      fatherNumber: formData.fatherNumber,
      version: formData.version,
      group: formData.group,
      academicQualifications: {
        sscResult: formData.sscResult,
        hscResult: formData.hscResult,
        oLevelResult: formData.oLevelResult,
        aLevelResult: formData.aLevelResult,
      },
      schoolName: formData.schoolName,
      collegeName: formData.collegeName,
      university: formData.university,
      universityShortForm: formData.universityShortForm,
      department: formData.department,
      yearAndSemester: formData.yearAndSemester,
      preferredSubjects: formData.preferredSubjects,
      preferredLocation: formData.preferredLocation,
      experience: formData.experience,
      location: {
        division: formData.division,
        district: formData.district,
        area: formData.area,
      }
    };

    onSave(updateData);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Tutor Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Academic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <select
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="EM">English Medium</option>
                <option value="BM">Bangla Medium</option>
                <option value="EV">English Version</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <select
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Family Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father's Name
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Educational Background */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Educational Background
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Teaching Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Teaching Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 2 years of teaching experience"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Subjects (comma-separated)
              </label>
              <input
                type="text"
                value={formData.preferredSubjects.join(', ')}
                onChange={(e) => handleInputChange('preferredSubjects', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="e.g., Physics, Math, Chemistry"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Locations (comma-separated)
              </label>
              <input
                type="text"
                value={formData.preferredLocation.join(', ')}
                onChange={(e) => handleInputChange('preferredLocation', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="e.g., Mohammadpur, Gulshan, Gulisthan"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Location Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Division
              </label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => handleInputChange('division', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 