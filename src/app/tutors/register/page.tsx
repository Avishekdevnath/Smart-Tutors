"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, User, GraduationCap, MapPin, FileText, Eye, Send } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import DocumentUpload from "@/components/DocumentUpload";

const steps = [
  { id: 0, title: "Personal Info", icon: User },
  { id: 1, title: "Academic Background", icon: GraduationCap },
  { id: 2, title: "Preferences", icon: Eye },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Documents", icon: FileText },
  { id: 5, title: "Review", icon: Send },
];

interface AdditionalDocument {
  id: string;
  label: string;
  file: File;
  preview: string;
}

export default function TutorRegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    fatherName: "",
    fatherNumber: "",
    background: "Bangla Medium",
    version: "EM",
    group: "Science",
    sscResult: "",
    hscResult: "",
    oLevelResult: "",
    aLevelResult: "",
    schoolName: "",
    collegeName: "",
    university: "",
    universityShortForm: "",
    department: "",
    yearAndSemester: "",
    preferredSubjects: "",
    preferredLocation: "",
    experience: "",
    gender: "Male",
    location: {
    division: "",
    district: "",
    area: "",
      subarea: "",
    },
    password: "",
    nidPhoto: null as File | string | null,
    studentIdPhoto: null as File | string | null,
  });

  const [additionalDocuments, setAdditionalDocuments] = useState<AdditionalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tuitionCode, setTuitionCode] = useState<string | null>(null);
  const [tuitionDetails, setTuitionDetails] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Add preview URLs for images
  const [nidPreview, setNidPreview] = useState<string | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);

  // Handle tuition parameter from URL
  useEffect(() => {
    const tuition = searchParams.get('tuition');
    if (tuition) {
      setTuitionCode(tuition);
      fetchTuitionDetails(tuition);
    }
  }, [searchParams]);

  const fetchTuitionDetails = async (code: string) => {
    try {
      const response = await fetch(`/api/tuitions/public/${code}`);
      if (response.ok) {
        const data = await response.json();
        setTuitionDetails(data);
        
        // Pre-fill form with tuition information
        setForm(prev => ({
          ...prev,
          preferredSubjects: data.subjects?.join(', ') || '',
          preferredLocation: data.location || '',
          version: data.version === 'English Medium' ? 'EM' : 
                  data.version === 'English Version' ? 'EV' : 
                  data.version === 'Bangla Medium' ? 'BM' : 'EM'
        }));
      }
    } catch (error) {
      console.error('Error fetching tuition details:', error);
    }
  };

  // Handle document changes
  const handleNidPhotoChange = (file: File | null) => {
    setForm(prev => ({ ...prev, nidPhoto: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNidPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setNidPreview(null);
    }
  };

  const handleStudentIdPhotoChange = (file: File | null) => {
    setForm(prev => ({ ...prev, studentIdPhoto: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setStudentIdPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setStudentIdPreview(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const files = (e.target as HTMLInputElement).files;
      setForm({ ...form, [name]: files ? files[0] : null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      formData.set("preferredSubjects", form.preferredSubjects.split(",").map(s => s.trim()).filter(Boolean).join(","));
      formData.set("preferredLocation", form.preferredLocation.split(",").map(s => s.trim()).filter(Boolean).join(","));
      formData.set("location", JSON.stringify(form.location));
      
      // Add tuition code if applying for a specific tuition
      if (tuitionCode) {
        formData.set("applyingForTuition", tuitionCode);
      }
      formData.set("academicQualifications", JSON.stringify({
        sscResult: form.sscResult,
        hscResult: form.hscResult,
        oLevelResult: form.oLevelResult,
        aLevelResult: form.aLevelResult,
      }));
      formData.delete("sscResult");
      formData.delete("hscResult");
      formData.delete("oLevelResult");
      formData.delete("aLevelResult");

      // Add additional documents
      additionalDocuments.forEach((doc, index) => {
        formData.append(`additionalDocument_${index}`, doc.file);
        formData.append(`additionalDocumentLabel_${index}`, doc.label);
      });
      formData.set("additionalDocumentsCount", additionalDocuments.length.toString());

      const res = await fetch("/api/tutors", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/tutors/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tutor Registration</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Join our platform and start your teaching journey</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                <span className="text-sm text-gray-500">Step {step + 1} of {steps.length}</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="sm:hidden flex items-center space-x-2">
                <span className="text-xs text-gray-500">Step {step + 1}/{steps.length}</span>
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Progress Steps */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Registration Progress</h3>
              <div className="space-y-4">
                {steps.map((stepItem, index) => {
                  const Icon = stepItem.icon;
                  const isCompleted = index < step;
                  const isCurrent = index === step;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : isCurrent 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isCompleted 
                            ? 'text-green-600' 
                            : isCurrent 
                              ? 'text-blue-600' 
                              : 'text-gray-500'
                        }`}>
                          {stepItem.title}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-gray-400">Current step</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Horizontal Stepper */}
          <div className="flex lg:hidden col-span-1 mb-6">
            <div className="flex w-full justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 px-2 py-3">
              {steps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isCompleted = index < step;
                const isCurrent = index === step;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isCurrent
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-[10px] font-medium text-center ${
                      isCompleted
                        ? 'text-green-600'
                        : isCurrent
                          ? 'text-blue-600'
                          : 'text-gray-400'
                    }`}>
                      {stepItem.title.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tuition Application Banner */}
              {tuitionCode && tuitionDetails && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Applying for Tuition: {tuitionDetails.code}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium text-gray-700">Class:</span> {tuitionDetails.class} - {tuitionDetails.version}</div>
                        <div><span className="font-medium text-gray-700">Subjects:</span> {tuitionDetails.subjects?.join(', ')}</div>
                        <div><span className="font-medium text-gray-700">Location:</span> {tuitionDetails.location}</div>
                        <div><span className="font-medium text-gray-700">Salary:</span> {tuitionDetails.salary}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Step 1: Personal Information */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          name="name" 
                          value={form.name} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="Enter your full name" 
                          required 
                        />
                        {!form.name && step > 0 && (
                          <p className="text-xs text-red-500">Full name is required</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                          name="phone" 
                          value={form.phone} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="01XXXXXXXXX" 
                          required 
                        />
                        {!form.phone && step > 0 && (
                          <p className="text-xs text-red-500">Phone number is required</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                          name="email" 
                          type="email" 
                          value={form.email} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="your.email@example.com" 
                        />
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select 
                          name="gender" 
                          value={form.gender} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea 
                          name="address" 
                          value={form.address} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          rows={3} 
                          placeholder="Enter your full address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                        <input 
                          name="fatherName" 
                          value={form.fatherName} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="Father's name" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Father's Phone Number</label>
                        <input 
                          name="fatherNumber" 
                          value={form.fatherNumber} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="Father's phone number" 
                        />
              </div>
            </div>
          </div>
        )}
                
        {/* Step 2: Academic Background */}
        {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Academic Background</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Educational Background</label>
                        <select 
                          name="background" 
                          value={form.background} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                  <option value="Bangla Medium">Bangla Medium</option>
                          <option value="English Medium">English Medium</option>
                  <option value="English Version">English Version</option>
                </select>
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Group</label>
                        <select 
                          name="group" 
                          value={form.group} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                </select>
              </div>
                      
              {(form.background === "Bangla Medium" || form.background === "English Version") && (
                <>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">SSC Result</label>
                            <input 
                              name="sscResult" 
                              value={form.sscResult} 
                              onChange={handleChange} 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                              placeholder="e.g. 5.00" 
                            />
                  </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">HSC Result</label>
                            <input 
                              name="hscResult" 
                              value={form.hscResult} 
                              onChange={handleChange} 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                              placeholder="e.g. 5.00" 
                            />
                  </div>
                </>
              )}
                      
              {form.background === "English Medium" && (
                <>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">O-levels Result</label>
                            <input 
                              name="oLevelResult" 
                              value={form.oLevelResult} 
                              onChange={handleChange} 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                              placeholder="e.g. 6A, 2B" 
                            />
                  </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">A-levels Result</label>
                            <input 
                              name="aLevelResult" 
                              value={form.aLevelResult} 
                              onChange={handleChange} 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                              placeholder="e.g. 2A, 1B" 
                            />
                  </div>
                </>
              )}
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">School Name</label>
                        <input 
                          name="schoolName" 
                          value={form.schoolName} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="School name" 
                        />
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">College Name</label>
                        <input 
                          name="collegeName" 
                          value={form.collegeName} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="College name" 
                        />
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">University</label>
                        <input 
                          name="university" 
                          value={form.university} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="University name" 
                        />
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">University Short Form</label>
                        <input 
                          name="universityShortForm" 
                          value={form.universityShortForm} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="e.g. DU, BUET" 
                        />
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input 
                          name="department" 
                          value={form.department} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="Department name" 
                        />
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Year & Semester</label>
                        <input 
                          name="yearAndSemester" 
                          value={form.yearAndSemester} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="e.g. 2nd Year, 1st Semester" 
                        />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences & Experience */}
        {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Preferences & Experience</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Preferred Subjects</label>
                        <input 
                          name="preferredSubjects" 
                          value={form.preferredSubjects} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="Math, Physics, Chemistry (comma separated)" 
                        />
                        <p className="text-xs text-gray-500">Enter subjects you can teach, separated by commas</p>
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Preferred Locations</label>
                        <input 
                          name="preferredLocation" 
                          value={form.preferredLocation} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          placeholder="Dhanmondi, Uttara (comma separated)" 
                        />
                        <p className="text-xs text-gray-500">Enter areas where you're willing to teach, separated by commas</p>
              </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Teaching Experience</label>
                        <textarea 
                          name="experience" 
                          value={form.experience} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                          rows={3}
                          placeholder="Describe your teaching experience, coaching background, or any relevant experience" 
                        />
                        <p className="text-xs text-gray-500">Share your teaching experience, coaching background, or any relevant experience</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Location Details */}
        {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-orange-600" />
              </div>
                      <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
              </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <LocationSelector
                        value={form.location}
                        onChange={(location) => setForm({ ...form, location })}
                      />
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {step === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                      <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
              </div>
                    
                    <DocumentUpload
                      nidPhoto={form.nidPhoto as File | null}
                      studentIdPhoto={form.studentIdPhoto as File | null}
                      additionalDocuments={additionalDocuments}
                      onNidPhotoChange={handleNidPhotoChange}
                      onStudentIdPhotoChange={handleStudentIdPhotoChange}
                      onAdditionalDocumentsChange={setAdditionalDocuments}
                      nidPreview={nidPreview}
                      studentIdPreview={studentIdPreview}
                      showRequired={true}
                  />
                </div>
                )}

                {/* Step 6: Review & Submit */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 text-red-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
              </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium text-gray-700">Full Name:</span> {form.name || 'Not provided'}</div>
                            <div><span className="font-medium text-gray-700">Phone:</span> {form.phone || 'Not provided'}</div>
                            <div><span className="font-medium text-gray-700">Email:</span> {form.email || 'Not provided'}</div>
                            <div><span className="font-medium text-gray-700">Gender:</span> {form.gender}</div>
                            <div><span className="font-medium text-gray-700">Address:</span> {form.address || 'Not provided'}</div>
                            <div><span className="font-medium text-gray-700">Father's Name:</span> {form.fatherName || 'Not provided'}</div>
                            <div><span className="font-medium text-gray-700">Father's Number:</span> {form.fatherNumber || 'Not provided'}</div>
            </div>
          </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Background</h3>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium text-gray-700">Background:</span> {form.background}</div>
                            <div><span className="font-medium text-gray-700">Group:</span> {form.group}</div>
                {(form.background === "Bangla Medium" || form.background === "English Version") && (
                  <>
                                <div><span className="font-medium text-gray-700">SSC Result:</span> {form.sscResult || 'Not provided'}</div>
                                <div><span className="font-medium text-gray-700">HSC Result:</span> {form.hscResult || 'Not provided'}</div>
                  </>
                )}
                {form.background === "English Medium" && (
                  <>
                                <div><span className="font-medium text-gray-700">O-levels Result:</span> {form.oLevelResult || 'Not provided'}</div>
                                <div><span className="font-medium text-gray-700">A-levels Result:</span> {form.aLevelResult || 'Not provided'}</div>
                  </>
                )}
                            <div><span className="font-medium text-gray-700">University:</span> {form.university || 'Not provided'}</div>
                            <div><span className="font-medium text-gray-700">Department:</span> {form.department || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Preferences & Experience</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div><span className="font-medium text-gray-700">Preferred Subjects:</span> {form.preferredSubjects || 'Not provided'}</div>
                          <div><span className="font-medium text-gray-700">Preferred Location:</span> {form.preferredLocation || 'Not provided'}</div>
                          <div><span className="font-medium text-gray-700">Experience:</span> {form.experience || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div><span className="font-medium text-gray-700">Division:</span> {form.location.division || 'Not provided'}</div>
                          <div><span className="font-medium text-gray-700">District:</span> {form.location.district || 'Not provided'}</div>
                          <div><span className="font-medium text-gray-700">Area:</span> {form.location.area || 'Not provided'}</div>
                          <div><span className="font-medium text-gray-700">Sub-area:</span> {form.location.subarea || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium text-gray-700">NID Photo:</span> {form.nidPhoto ? (form.nidPhoto instanceof File ? form.nidPhoto.name : 'Uploaded') : 'Not uploaded'}</div>
                          <div><span className="font-medium text-gray-700">Student ID Photo:</span> {form.studentIdPhoto ? (form.studentIdPhoto instanceof File ? form.studentIdPhoto.name : 'Uploaded') : 'Not uploaded'}</div>
              </div>
                        {additionalDocuments.length > 0 && (
              <div>
                            <span className="font-medium text-gray-700">Additional Documents:</span>
                            <ul className="ml-4 mt-2 space-y-1">
                              {additionalDocuments.map((doc) => (
                                <li key={doc.id} className="text-sm">• {doc.label}: {doc.file.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
              </div>
              </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Important:</strong> Please review all your information carefully before submitting. 
                        You can go back to edit any section if needed.
                      </p>
              </div>
            </div>
                )}

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">{success}</p>
          </div>
        )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={handleBack} 
                    disabled={step === 0} 
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                  
          {step < steps.length - 1 ? (
                    <button 
                      type="button" 
                      onClick={handleNext} 
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Registration
                        </>
                      )}
            </button>
          )}
        </div>
      </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 