"use client";

import { useState, useEffect, Suspense } from "react";
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

function TutorRegisterContent() {
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
    const tuition = searchParams?.get('tuition');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Registration</h1>
          <p className="text-gray-600">Join our platform and start your tutoring journey</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepItem.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step > stepItem.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <stepItem.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step > stepItem.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm font-medium text-gray-900">
              Step {step + 1} of {steps.length}: {steps[step].title}
            </p>
          </div>
        </div>

        {/* Form Container */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Step Content */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Continue with other steps... */}
            {/* Step 1: Academic Background */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Background</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background *
                    </label>
                    <select
                      name="background"
                      value={form.background}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Bangla Medium">Bangla Medium</option>
                      <option value="English Medium">English Medium</option>
                      <option value="English Version">English Version</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version *
                    </label>
                    <select
                      name="version"
                      value={form.version}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="EM">English Medium</option>
                      <option value="EV">English Version</option>
                      <option value="BM">Bangla Medium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group *
                    </label>
                    <select
                      name="group"
                      value={form.group}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Humanities">Humanities</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SSC Result (GPA)
                    </label>
                    <input
                      type="text"
                      name="sscResult"
                      value={form.sscResult}
                      onChange={handleChange}
                      placeholder="e.g., 5.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSC Result (GPA)
                    </label>
                    <input
                      type="text"
                      name="hscResult"
                      value={form.hscResult}
                      onChange={handleChange}
                      placeholder="e.g., 5.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      O-Level Result
                    </label>
                    <input
                      type="text"
                      name="oLevelResult"
                      value={form.oLevelResult}
                      onChange={handleChange}
                      placeholder="e.g., A* in 6 subjects"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      A-Level Result
                    </label>
                    <input
                      type="text"
                      name="aLevelResult"
                      value={form.aLevelResult}
                      onChange={handleChange}
                      placeholder="e.g., A* in 3 subjects"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={form.schoolName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College Name
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={form.collegeName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Teaching Preferences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Subjects *
                    </label>
                    <input
                      type="text"
                      name="preferredSubjects"
                      value={form.preferredSubjects}
                      onChange={handleChange}
                      placeholder="e.g., Mathematics, Physics, Chemistry"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Locations *
                    </label>
                    <input
                      type="text"
                      name="preferredLocation"
                      value={form.preferredLocation}
                      onChange={handleChange}
                      placeholder="e.g., Dhanmondi, Gulshan, Banani"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teaching Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      placeholder="e.g., 2 years teaching experience"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={form.university}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University Short Form
                    </label>
                    <input
                      type="text"
                      name="universityShortForm"
                      value={form.universityShortForm}
                      onChange={handleChange}
                      placeholder="e.g., DU, BUET, NSU"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year & Semester
                    </label>
                    <input
                      type="text"
                      name="yearAndSemester"
                      value={form.yearAndSemester}
                      onChange={handleChange}
                      placeholder="e.g., 3rd Year, 2nd Semester"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Information</h2>
                
                <LocationSelector
                  location={form.location}
                  onLocationChange={(location) => setForm(prev => ({ ...prev, location }))}
                />
              </div>
            )}

            {/* Step 4: Documents */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Upload</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NID Photo
                    </label>
                    <DocumentUpload
                      onFileChange={handleNidPhotoChange}
                      preview={nidPreview}
                      accept="image/*"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID Photo
                    </label>
                    <DocumentUpload
                      onFileChange={handleStudentIdPhotoChange}
                      preview={studentIdPreview}
                      accept="image/*"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Documents
                  </label>
                  <DocumentUpload
                    onFileChange={(file) => {
                      if (file) {
                        const newDoc: AdditionalDocument = {
                          id: Date.now().toString(),
                          label: `Document ${additionalDocuments.length + 1}`,
                          file,
                          preview: URL.createObjectURL(file)
                        };
                        setAdditionalDocuments(prev => [...prev, newDoc]);
                      }
                    }}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  
                  {additionalDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {additionalDocuments.map((doc, index) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img src={doc.preview} alt={doc.label} className="w-10 h-10 object-cover rounded" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                              <p className="text-xs text-gray-500">{doc.file.name}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAdditionalDocuments(prev => prev.filter(d => d.id !== doc.id));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h2>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Name:</span> {form.name}</div>
                    <div><span className="font-medium">Phone:</span> {form.phone}</div>
                    <div><span className="font-medium">Email:</span> {form.email || 'Not provided'}</div>
                    <div><span className="font-medium">Gender:</span> {form.gender}</div>
                    <div className="md:col-span-2"><span className="font-medium">Address:</span> {form.address || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Background:</span> {form.background}</div>
                    <div><span className="font-medium">Version:</span> {form.version}</div>
                    <div><span className="font-medium">Group:</span> {form.group}</div>
                    <div><span className="font-medium">SSC Result:</span> {form.sscResult || 'Not provided'}</div>
                    <div><span className="font-medium">HSC Result:</span> {form.hscResult || 'Not provided'}</div>
                    <div><span className="font-medium">University:</span> {form.university || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Teaching Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Preferred Subjects:</span> {form.preferredSubjects}</div>
                    <div><span className="font-medium">Preferred Locations:</span> {form.preferredLocation}</div>
                    <div><span className="font-medium">Experience:</span> {form.experience || 'Not provided'}</div>
                    <div><span className="font-medium">Department:</span> {form.department || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                  <div className="text-sm">
                    <div><span className="font-medium">Division:</span> {form.location.division}</div>
                    <div><span className="font-medium">District:</span> {form.location.district}</div>
                    <div><span className="font-medium">Area:</span> {form.location.area}</div>
                    <div><span className="font-medium">Subarea:</span> {form.location.subarea}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                  <div className="text-sm">
                    <div><span className="font-medium">NID Photo:</span> {form.nidPhoto ? 'Uploaded' : 'Not uploaded'}</div>
                    <div><span className="font-medium">Student ID Photo:</span> {form.studentIdPhoto ? 'Uploaded' : 'Not uploaded'}</div>
                    <div><span className="font-medium">Additional Documents:</span> {additionalDocuments.length} uploaded</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button 
                  type="button" 
                  onClick={handleBack} 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}
              
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
  );
}

// Loading component for Suspense fallback
function TutorRegisterLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading registration form...</p>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function TutorRegisterPage() {
  return (
    <Suspense fallback={<TutorRegisterLoading />}>
      <TutorRegisterContent />
    </Suspense>
  );
} 