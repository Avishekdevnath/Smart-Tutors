"use client";

import { useState, useEffect } from "react";
import CreatableSelect from 'react-select/creatable';
import LocationSearch from "@/components/LocationSearch";

const initialForm = {
  guardianName: "",
  guardianNumber: "",
  address: "",
  location: "",
  studentClass: "",
  version: "English Medium",
  subjects: [],
  weeklyDays: "",
  dailyHours: "",
  salary: "",
  startMonth: "",
  tutorGender: "",
  specialRemarks: "",
  urgent: false,
};

export default function HireATutorPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [trackingLink, setTrackingLink] = useState("");

  // Subject management
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Bangla', 'English', 'Math', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Civics', 'Economics', 'Accounting', 'Business Studies',
    'ICT', 'Computer Science', 'Religious Studies', 'Literature', 'All'
  ]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocationChange = (location) => {
    setForm((prev) => ({ ...prev, location }));
  };

  // Helper for react-select options
  const subjectOptions = availableSubjects.map((subject) => ({ value: subject, label: subject }));

  // Handler for react-select
  const handleSubjectSelect = (selected) => {
    if (!selected) {
      setForm((prev) => ({ ...prev, subjects: [] }));
      return;
    }
    const values = selected.map((s) => s.value);
    if (values.includes('All')) {
      setForm((prev) => ({ ...prev, subjects: ['All'] }));
    } else {
      setForm((prev) => ({ ...prev, subjects: values.filter((v) => v !== 'All') }));
    }
  };

  // Handler for creating a new subject
  const handleCreateSubject = async (inputValue) => {
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
        setForm((prev) => ({ ...prev, subjects: [...prev.subjects, trimmed] }));
      } else {
        setError('Failed to add new subject');
      }
    } catch (error) {
      setError('Failed to add new subject');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setTrackingLink("");
    
    try {
      // Prepare the data for the API
      const tuitionData = {
        guardianName: form.guardianName,
        guardianNumber: form.guardianNumber,
        guardianAddress: form.address,
        studentClass: form.studentClass,
        version: form.version,
        subjects: form.subjects,
        weeklyDays: form.weeklyDays,
        weeklyHours: form.dailyHours, // API expects weeklyHours
        salary: form.salary,
        location: form.location,
        startMonth: form.startMonth,
        tutorGender: form.tutorGender,
        specialRemarks: form.specialRemarks,
        urgent: form.urgent
      };

      // Call the API to create tuition
      const response = await fetch('/api/tuitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tuitionData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Your tuition post has been created successfully!");
        setTrackingLink(`/track-tuition/${data.tuition.code}`);
        
        // Reset form after successful submission
        setForm(initialForm);
      } else {
        setError(data.error || "Failed to create tuition post. Please try again.");
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hire a Tutor</h1>
        <p className="text-gray-600 mb-6">Fill out the form below to post your tuition requirement. You will get a link to track tutor applications.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Guardian Name *</label>
              <input name="guardianName" value={form.guardianName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Guardian Phone *</label>
              <input name="guardianNumber" value={form.guardianNumber} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 017XXXXXXXX" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <input name="address" value={form.address} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. House 12, Road 3, Dhanmondi" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Location *</label>
              <LocationSearch 
                value={form.location} 
                onChange={handleLocationChange} 
                placeholder="Search for your area (e.g., Dhanmondi, Gulshan, Mohammadpur)"
                required={true}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Class *</label>
              <input name="studentClass" value={form.studentClass} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Class 8" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Version *</label>
              <select name="version" value={form.version} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                <option>Bangla Medium</option>
                <option>English Medium</option>
                <option>English Version</option>
                <option>Others</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Subjects *</label>
              <CreatableSelect
                isMulti
                options={subjectOptions}
                value={subjectOptions.filter(opt => Array.isArray(form.subjects) && form.subjects.includes(opt.value))}
                onChange={handleSubjectSelect}
                onCreateOption={handleCreateSubject}
                placeholder="Type or select subjects..."
                classNamePrefix="react-select"
                isClearable={false}
                closeMenuOnSelect={false}
                formatCreateLabel={inputValue => `Add "${inputValue}"`}
                styles={{
                  control: (base) => ({ ...base, minHeight: '44px', borderColor: '#3b82f6' }),
                  multiValue: (base) => ({ ...base, backgroundColor: '#dbeafe', color: '#1d4ed8' }),
                  multiValueLabel: (base) => ({ ...base, color: '#1d4ed8' }),
                  multiValueRemove: (base) => ({ ...base, color: '#3b82f6', ':hover': { backgroundColor: '#3b82f6', color: 'white' } }),
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weekly Days *</label>
              <input name="weeklyDays" value={form.weeklyDays} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 3 days" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Hours *</label>
              <input name="dailyHours" value={form.dailyHours} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 2 hours" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary *</label>
              <input name="salary" value={form.salary} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 5000 BDT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Month *</label>
              <input name="startMonth" value={form.startMonth} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. June 2024" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tutor Gender</label>
              <select name="tutorGender" value={form.tutorGender} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Remarks</label>
              <input name="specialRemarks" value={form.specialRemarks} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Female tutor preferred, must have experience" />
            </div>
            <div className="flex items-center mt-2">
              <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} className="mr-2" />
              <span className="text-sm text-gray-700">Mark as urgent</span>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          {trackingLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <span className="text-blue-800 text-sm">Track your tuition: </span>
              <a href={trackingLink} className="text-blue-600 underline break-all">{trackingLink}</a>
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg mt-2 disabled:opacity-60">
            {submitting ? "Submitting..." : "Post Tuition"}
          </button>
        </form>
      </div>
    </div>
  );
} 