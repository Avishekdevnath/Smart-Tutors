'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Copy, Check, ArrowLeft, X } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import LocationSelector from '@/components/LocationSelector';

interface TuitionFormData {
  // Tuition Code (optional - manual entry)
  tuitionCode?: string;
  
  // Guardian Information
  guardianName: string;
  guardianNumber: string;
  address: string; // Single address field for both guardian and tuition
  location: {
    division: string;
    district: string;
    area: string;
    subarea?: string;
  };
  
  // Student Information
  studentClass: string;
  version: 'Bangla Medium' | 'English Medium' | 'English Version' | 'Others';
  subjects: string[];
  weeklyDays: string;
  dailyHours: string; // Changed from weeklyHours
  salary: string;
  startMonth: string;
  
  // Special Requirements
  tutorGender: string;
  specialRemarks: string;
  urgent: boolean;
}

export default function AddTuitionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TuitionFormData>({
    tuitionCode: '', // Optional manual tuition code
    guardianName: '',
    guardianNumber: '',
    address: '',
    location: {
      division: '',
      district: '',
      area: '',
      subarea: '',
    },
    studentClass: '',
    version: 'English Medium',
    subjects: [],
    weeklyDays: '',
    dailyHours: '',
    salary: '',
    startMonth: '',
    tutorGender: '',
    specialRemarks: '',
    urgent: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<{
    detailed: string;
    short: string;
  } | null>(null);

  // Subject management
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Bangla', 'English', 'Math', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Civics', 'Economics', 'Accounting', 'Business Studies',
    'ICT', 'Computer Science', 'Religious Studies', 'Literature', 'All'
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [showSubjectInput, setShowSubjectInput] = useState(false);

  // Load subjects from database on component mount
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        if (data.subjects) {
          setAvailableSubjects(prev => [...new Set([...prev, ...data.subjects])]);
        }
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const handleInputChange = (field: keyof TuitionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper for react-select options
  const subjectOptions = availableSubjects.map((subject) => ({ value: subject, label: subject }));

  // Handler for react-select
  const handleSubjectSelect = (selected: any) => {
    if (!selected) {
      setFormData((prev) => ({ ...prev, subjects: [] }));
      return;
    }
    const values = selected.map((s: any) => s.value);
    if (values.includes('All')) {
      setFormData((prev) => ({ ...prev, subjects: ['All'] }));
    } else {
      setFormData((prev) => ({ ...prev, subjects: values.filter((v: string) => v !== 'All') }));
    }
  };

  // Handler for creating a new subject
  const handleCreateSubject = async (inputValue: string) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    // Add to backend
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed })
      });
      if (response.ok) {
        setAvailableSubjects((prev) => [...prev, trimmed]);
        setFormData((prev) => ({ ...prev, subjects: [...prev.subjects, trimmed] }));
      } else {
        setError('Failed to add new subject');
      }
    } catch (error) {
      setError('Failed to add new subject');
    }
  };

  const generatePosts = () => {
    const { guardianName, studentClass, version, subjects, weeklyDays, dailyHours, salary, address, startMonth, tutorGender, specialRemarks, urgent } = formData;

    // Detailed Post (Bangla)
    const detailedPost = `📚 **Smart Tutors - ${urgent ? '🚨 URGENT ' : ''}Tutor Requirement** 📚

🎓 **Student Details:**
• Class: ${studentClass}
• Version: ${version}
        • Subjects: ${Array.isArray(subjects) ? subjects.join(', ') : subjects || 'Not specified'}
• Days: ${weeklyDays} (${dailyHours} hours daily)
• Salary: ${salary}
• Location: ${address}
• Start: ${startMonth}

👨‍🏫 **Requirements:**
${tutorGender ? `• Gender: ${tutorGender}` : ''}
${specialRemarks ? `• Special Remarks: ${specialRemarks}` : ''}

📞 **Contact:**
Smart Tutors
Phone: [Your Platform Number]

#SmartTutors #TutorRequirement #${address.replace(/\s+/g, '')} #${studentClass.replace(/\s+/g, '')}`;

    // Short Post (Bangla)
    const shortPost = `📚 ${urgent ? '🚨 URGENT ' : ''}Tutor Required

${studentClass} (${version})
${Array.isArray(subjects) ? subjects.join(', ') : subjects || 'Not specified'}
${weeklyDays} (${dailyHours} hours daily)
Salary: ${salary}
Location: ${address}

📞 Smart Tutors
[Your Platform Number]

#SmartTutors #${address.replace(/\s+/g, '')}`;

    setGeneratedPosts({ detailed: detailedPost, short: shortPost });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guardianName || !formData.guardianNumber || !formData.studentClass) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const tuitionData = {
        code: formData.tuitionCode || undefined, // Include manual code if provided
        ...formData,
        guardianAddress: formData.address, // Map to guardianAddress for backend
        location: JSON.stringify(formData.location), // Map structured location for backend
        status: 'open',
        applications: [],
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/tuitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tuitionData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Tuition posted successfully!');
        generatePosts();
        setTimeout(() => {
          router.push('/dashboard/tuitions');
        }, 2000);
      } else {
        setError(result.error || 'Failed to post tuition');
      }
    } catch (error) {
      console.error('Error posting tuition:', error);
      setError('Failed to post tuition');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Add New Tuition" 
      description="Post a new tuition requirement with guardian information"
    >
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Tuitions</span>
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
        {/* Tuition Code (Optional) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tuition Code (Optional)</h2>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manual Tuition Code
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">ST</span>
              <input
                type="text"
                value={formData.tuitionCode}
                onChange={(e) => handleInputChange('tuitionCode', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 135 (just the number)"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Enter just the number (e.g., 135). The system will automatically add "ST" prefix. Leave empty to auto-generate the next sequential code.
            </p>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Guardian Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guardian Name *
              </label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => handleInputChange('guardianName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter guardian's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guardian Phone Number *
              </label>
              <input
                type="tel"
                value={formData.guardianNumber}
                onChange={(e) => handleInputChange('guardianNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="01XXXXXXXXX"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address (Guardian & Tuition Location) *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter detailed address where tuition will be held"
                rows={3}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Division/District/Area) *
              </label>
              <LocationSelector
                value={formData.location}
                onChange={(location) => handleInputChange('location', location)}
              />
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Student Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <input
                type="text"
                value={formData.studentClass}
                onChange={(e) => handleInputChange('studentClass', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Class 8, Standard 5, KG"
                required
              />
            </div>

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
                <option value="English Medium">English Medium</option>
                <option value="Bangla Medium">Bangla Medium</option>
                <option value="English Version">English Version</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects *
              </label>
              <CreatableSelect
                isMulti
                options={subjectOptions}
                value={subjectOptions.filter(opt => Array.isArray(formData.subjects) && formData.subjects.includes(opt.value))}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Days *
              </label>
              <input
                type="text"
                value={formData.weeklyDays}
                onChange={(e) => handleInputChange('weeklyDays', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 5 days, 6 days, Saturday-Tuesday"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Hours *
              </label>
              <input
                type="text"
                value={formData.dailyHours}
                onChange={(e) => handleInputChange('dailyHours', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 2 hours, 1.5 hours"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary *
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 5K, 8K, Negotiable"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Month
              </label>
              <input
                type="text"
                value={formData.startMonth}
                onChange={(e) => handleInputChange('startMonth', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., January, Next Month"
              />
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Special Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Tutor Gender
              </label>
              <select
                value={formData.tutorGender}
                onChange={(e) => handleInputChange('tutorGender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Not specified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.urgent}
                  onChange={(e) => handleInputChange('urgent', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Urgent</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Remarks
              </label>
              <textarea
                value={formData.specialRemarks}
                onChange={(e) => handleInputChange('specialRemarks', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Any special requirements, preferences, or additional information"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting Tuition...' : 'Post Tuition'}
          </button>
        </div>
      </form>

      {/* Generated Posts */}
      {generatedPosts && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Generated Social Media Posts</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detailed Post */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">Detailed Post</h4>
                <button
                  onClick={() => copyToClipboard(generatedPosts.detailed)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed">
                  {generatedPosts.detailed}
                </pre>
              </div>
            </div>

            {/* Short Post */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">Short Post</h4>
                <button
                  onClick={() => copyToClipboard(generatedPosts.short)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed">
                  {generatedPosts.short}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 