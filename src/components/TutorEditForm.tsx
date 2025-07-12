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
  documents?: {
    nidPhoto?: string;
    studentIdPhoto?: string;
  };
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

  const [documentFiles, setDocumentFiles] = useState<{
    nidPhoto: File | null;
    studentIdPhoto: File | null;
  }>({
    nidPhoto: null,
    studentIdPhoto: null
  });

  const [documentPreviews, setDocumentPreviews] = useState<{
    nidPhoto: string | null;
    studentIdPhoto: string | null;
  }>({
    nidPhoto: tutor.documents?.nidPhoto || null,
    studentIdPhoto: tutor.documents?.studentIdPhoto || null
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'nidPhoto' | 'studentIdPhoto', file: File | null) => {
    setDocumentFiles(prev => ({ ...prev, [field]: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews(prev => ({ ...prev, [field]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreviews(prev => ({ ...prev, [field]: tutor.documents?.[field] || null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData for file uploads
    const formDataToSend = new FormData();
    
    // Add all text fields
    formDataToSend.append('name', formData.name);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('fatherName', formData.fatherName);
    formDataToSend.append('fatherNumber', formData.fatherNumber);
    formDataToSend.append('version', formData.version);
    formDataToSend.append('group', formData.group);
    formDataToSend.append('sscResult', formData.sscResult);
    formDataToSend.append('hscResult', formData.hscResult);
    formDataToSend.append('oLevelResult', formData.oLevelResult);
    formDataToSend.append('aLevelResult', formData.aLevelResult);
    formDataToSend.append('schoolName', formData.schoolName);
    formDataToSend.append('collegeName', formData.collegeName);
    formDataToSend.append('university', formData.university);
    formDataToSend.append('universityShortForm', formData.universityShortForm);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('yearAndSemester', formData.yearAndSemester);
    formDataToSend.append('preferredSubjects', formData.preferredSubjects.join(','));
    formDataToSend.append('preferredLocation', formData.preferredLocation.join(','));
    formDataToSend.append('experience', formData.experience);
    formDataToSend.append('division', formData.division);
    formDataToSend.append('district', formData.district);
    formDataToSend.append('area', formData.area);
    
    // Add files if they exist
    if (documentFiles.nidPhoto) {
      formDataToSend.append('nidPhoto', documentFiles.nidPhoto);
    }
    if (documentFiles.studentIdPhoto) {
      formDataToSend.append('studentIdPhoto', documentFiles.studentIdPhoto);
    }

    onSave(formDataToSend);
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

        {/* Documents */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Documents
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NID Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NID Photo
              </label>
              <div className="space-y-3">
                {documentPreviews.nidPhoto ? (
                  <div className="relative">
                    <img 
                      src={documentPreviews.nidPhoto} 
                      alt="NID Photo" 
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange('nidPhoto', null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-xs">No NID photo</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('nidPhoto', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Student ID Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID Photo
              </label>
              <div className="space-y-3">
                {documentPreviews.studentIdPhoto ? (
                  <div className="relative">
                    <img 
                      src={documentPreviews.studentIdPhoto} 
                      alt="Student ID Photo" 
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange('studentIdPhoto', null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-xs">No Student ID photo</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('studentIdPhoto', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
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