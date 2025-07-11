"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const steps = [
  "Personal Information",
  "Academic Background",
  "Preferences & Experience",
  "Location Details",
  "Documents",
  "Review & Submit"
];

export default function TutorRegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
    fatherName: string;
    fatherNumber: string;
    background: string;
    version: string;
    group: string;
    sscResult: string;
    hscResult: string;
    oLevelResult: string;
    aLevelResult: string;
    schoolName: string;
    collegeName: string;
    university: string;
    universityShortForm: string;
    department: string;
    yearAndSemester: string;
    preferredSubjects: string;
    preferredLocation: string;
    experience: string;
    gender: string;
    division: string;
    district: string;
    area: string;
    password: string;
    nidPhoto: File | string | null;
    studentIdPhoto: File | string | null;
  }>({
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
    division: "",
    district: "",
    area: "",
    password: "",
    nidPhoto: null,
    studentIdPhoto: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const nidInputRef = useRef<HTMLInputElement>(null);
  const studentIdInputRef = useRef<HTMLInputElement>(null);

  // Add preview URLs for images
  const [nidPreview, setNidPreview] = useState<string | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'nidPhoto' | 'studentIdPhoto') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setForm(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (type === 'nidPhoto') setNidPreview(ev.target?.result as string);
        else setStudentIdPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (name === 'nidPhoto') setNidPreview(ev.target?.result as string);
        else setStudentIdPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
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
      formData.set("location", JSON.stringify({
        division: form.division,
        district: form.district,
        area: form.area,
      }));
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
      formData.delete("division");
      formData.delete("district");
      formData.delete("area");
      const res = await fetch("/api/tutors", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Registration successful! You can now log in.");
        setTimeout(() => router.push("/tutors"), 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Tutor Registration</h1>
      {/* Stepper */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((label, idx) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx === step ? 'bg-blue-600' : 'bg-gray-300'}`}>{idx + 1}</div>
            <span className={`text-xs mt-2 text-center ${idx === step ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{label}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-lg" encType="multipart/form-data">
        {/* Step 1: Personal Information */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. 017XXXXXXXX" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Current address" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Father's Name</label>
                <input name="fatherName" value={form.fatherName} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Father's full name" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Father's Number</label>
                <input name="fatherNumber" value={form.fatherNumber} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Father's phone number" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Password</label>
                <input name="password" value={form.password} onChange={handleChange} type="password" className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Enter a password" />
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Academic Background */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Academic Background</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Background</label>
                <select name="background" value={form.background} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200">
                  <option value="Bangla Medium">Bangla Medium</option>
                  <option value="English Version">English Version</option>
                  <option value="English Medium">English Medium</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Group</label>
                <select name="group" value={form.group} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200">
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                </select>
              </div>
              {(form.background === "Bangla Medium" || form.background === "English Version") && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">SSC Result</label>
                    <input name="sscResult" value={form.sscResult} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. GPA 5.00" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">HSC Result</label>
                    <input name="hscResult" value={form.hscResult} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. GPA 5.00" />
                  </div>
                </>
              )}
              {form.background === "English Medium" && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">O-levels Result</label>
                    <input name="oLevelResult" value={form.oLevelResult} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. 5A*, 2A" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">A-levels Result</label>
                    <input name="aLevelResult" value={form.aLevelResult} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. 2A, 1B" />
                  </div>
                </>
              )}
              <div>
                <label className="block font-semibold mb-1">School Name</label>
                <input name="schoolName" value={form.schoolName} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="School name" />
              </div>
              <div>
                <label className="block font-semibold mb-1">College Name</label>
                <input name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="College name" />
              </div>
              <div>
                <label className="block font-semibold mb-1">University</label>
                <input name="university" value={form.university} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="University name" />
              </div>
              <div>
                <label className="block font-semibold mb-1">University Short Form</label>
                <input name="universityShortForm" value={form.universityShortForm} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. DU, BUET" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Department</label>
                <input name="department" value={form.department} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Department name" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Year & Semester</label>
                <input name="yearAndSemester" value={form.yearAndSemester} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. 2nd Year, 1st Semester" />
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Preferences & Experience */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Preferences & Experience</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Preferred Subjects (comma separated)</label>
                <input name="preferredSubjects" value={form.preferredSubjects} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Math, Physics, Chemistry" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Preferred Location (comma separated)</label>
                <input name="preferredLocation" value={form.preferredLocation} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Dhanmondi, Uttara" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Experience</label>
                <input name="experience" value={form.experience} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. 2 years coaching" />
              </div>
            </div>
          </div>
        )}
        {/* Step 4: Location Details */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Location Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Division</label>
                <input name="division" value={form.division} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. Dhaka" />
              </div>
              <div>
                <label className="block font-semibold mb-1">District</label>
                <input name="district" value={form.district} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. Dhaka" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Area</label>
                <input name="area" value={form.area} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="e.g. Dhanmondi" />
              </div>
            </div>
          </div>
        )}
        {/* Step 5: Documents */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Documents</h2>
            <div className="space-y-8">
              {/* NID Photo Upload */}
              <div>
                <label className="block font-semibold mb-2">NID Photo</label>
                <div
                  className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:border-blue-400 bg-gray-50 relative"
                  onClick={() => nidInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, 'nidPhoto')}
                >
                  {nidPreview ? (
                    <img src={nidPreview} alt="NID Preview" className="h-32 object-contain mb-2 rounded shadow" />
                  ) : (
                    <span className="text-gray-400 text-sm mb-2">Drag & drop or click to upload NID photo</span>
                  )}
                  <input
                    ref={nidInputRef}
                    name="nidPhoto"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {form.nidPhoto && typeof form.nidPhoto !== 'string' && (
                  <div className="text-xs text-gray-500 mt-1">{form.nidPhoto.name}</div>
                )}
              </div>
              {/* Student ID Photo Upload */}
              <div>
                <label className="block font-semibold mb-2">Student ID Photo</label>
                <div
                  className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:border-blue-400 bg-gray-50 relative"
                  onClick={() => studentIdInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, 'studentIdPhoto')}
                >
                  {studentIdPreview ? (
                    <img src={studentIdPreview} alt="Student ID Preview" className="h-32 object-contain mb-2 rounded shadow" />
                  ) : (
                    <span className="text-gray-400 text-sm mb-2">Drag & drop or click to upload Student ID photo</span>
                  )}
                  <input
                    ref={studentIdInputRef}
                    name="studentIdPhoto"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {form.studentIdPhoto && typeof form.studentIdPhoto !== 'string' && (
                  <div className="text-xs text-gray-500 mt-1">{form.studentIdPhoto.name}</div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Step 6: Review & Submit */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Review & Submit</h2>
            <div className="bg-gray-50 p-4 rounded mb-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div><b>Full Name:</b> {form.name}</div>
                <div><b>Phone:</b> {form.phone}</div>
                <div><b>Email:</b> {form.email}</div>
                <div><b>Address:</b> {form.address}</div>
                <div><b>Father's Name:</b> {form.fatherName}</div>
                <div><b>Father's Number:</b> {form.fatherNumber}</div>
                <div><b>Gender:</b> {form.gender}</div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Academic Background</h3>
                <div><b>Background:</b> {form.background}</div>
                <div><b>Group:</b> {form.group}</div>
                {(form.background === "Bangla Medium" || form.background === "English Version") && (
                  <>
                    <div><b>SSC Result:</b> {form.sscResult}</div>
                    <div><b>HSC Result:</b> {form.hscResult}</div>
                  </>
                )}
                {form.background === "English Medium" && (
                  <>
                    <div><b>O-levels Result:</b> {form.oLevelResult}</div>
                    <div><b>A-levels Result:</b> {form.aLevelResult}</div>
                  </>
                )}
                <div><b>School Name:</b> {form.schoolName}</div>
                <div><b>College Name:</b> {form.collegeName}</div>
                <div><b>University:</b> {form.university}</div>
                <div><b>University Short Form:</b> {form.universityShortForm}</div>
                <div><b>Department:</b> {form.department}</div>
                <div><b>Year & Semester:</b> {form.yearAndSemester}</div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Preferences & Experience</h3>
                <div><b>Preferred Subjects:</b> {form.preferredSubjects}</div>
                <div><b>Preferred Location:</b> {form.preferredLocation}</div>
                <div><b>Experience:</b> {form.experience}</div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Location Details</h3>
                <div><b>Division:</b> {form.division}</div>
                <div><b>District:</b> {form.district}</div>
                <div><b>Area:</b> {form.area}</div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Documents</h3>
                <div><b>NID Photo:</b> {form.nidPhoto ? (form.nidPhoto instanceof File ? form.nidPhoto.name : form.nidPhoto) : 'Not uploaded'}</div>
                <div><b>Student ID Photo:</b> {form.studentIdPhoto ? (form.studentIdPhoto instanceof File ? form.studentIdPhoto.name : form.studentIdPhoto) : 'Not uploaded'}</div>
              </div>
            </div>
            <div className="text-gray-600 text-sm mb-2">Please review your information before submitting. You can go back to edit any section.</div>
          </div>
        )}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        <div className="flex justify-between mt-8">
          <button type="button" onClick={handleBack} disabled={step === 0} className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50">Back</button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={handleNext} className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Next</button>
          ) : (
            <button type="submit" disabled={loading} className="px-8 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
              {loading ? "Registering..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 