'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Filter, MapPin, Clock, BookOpen, Users, Calendar, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import Toast, { useToast } from '@/components/Toast';

interface Tuition {
  _id: string;
  code: string;
  guardianName: string;
  guardianNumber: string;
  guardianAddress?: string;
  class: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  dailyHours: string;
  salary: string;
  location: string;
  startMonth: string;
  tutorGender: string;
  specialRemarks?: string;
  urgent: boolean;
  status: string;
  createdAt: string;
}

export default function TuitionsPage() {
  const { data: session } = useSession();
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [filteredTuitions, setFilteredTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [userApplications, setUserApplications] = useState<string[]>([]); // Track applied tuition IDs
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    phone: '',
    email: '',
    experience: '',
    message: ''
  });
  const [confirmationText, setConfirmationText] = useState('');
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadTuitions();
    if (session) {
      loadUserApplications();
    } else {
      // Clear applications when user logs out
      setUserApplications([]);
    }
  }, [session]);

  useEffect(() => {
    filterTuitions();
  }, [tuitions, searchTerm, selectedClass, selectedVersion, selectedLocation]);

  const loadTuitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tuitions');
      if (response.ok) {
        const data = await response.json();
        // Filter only available tuitions
        const availableTuitions = data.filter((tuition: Tuition) => 
          ['open', 'available'].includes(tuition.status)
        );
        setTuitions(availableTuitions);
        setFilteredTuitions(availableTuitions);
      }
    } catch (error) {
      console.error('Error loading tuitions:', error);
      showToast('Error loading tuitions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserApplications = async () => {
    try {
      setApplicationsLoading(true);
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        // Extract tuition IDs from user's applications
        const appliedTuitionIds = data.applications.map((app: any) => app.tuition._id);
        setUserApplications(appliedTuitionIds);
      }
    } catch (error) {
      console.error('Error loading user applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const filterTuitions = () => {
    let filtered = tuitions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tuition =>
        tuition.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tuition.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tuition.subjects.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        tuition.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (selectedClass) {
      filtered = filtered.filter(tuition => tuition.class === selectedClass);
    }

    // Version filter
    if (selectedVersion) {
      filtered = filtered.filter(tuition => tuition.version === selectedVersion);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(tuition => 
        tuition.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredTuitions(filtered);
  };

  const handleApply = (tuition: Tuition) => {
    if (!session) {
      setSelectedTuition(tuition);
      setShowRegistrationModal(true);
      return;
    }
    setSelectedTuition(tuition);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTuition || !session) return;

    // Check if user agreed to terms
    if (confirmationText.toLowerCase().trim() !== 'agree') {
      showToast('Please type "Agree" to confirm you accept the terms and conditions', 'error');
      return;
    }

    try {
      setApplicationLoading(true);
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tuitionId: selectedTuition._id,
          agreedToTerms: true,
          confirmationText: confirmationText
        })
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Application submitted successfully!', 'success');
        setShowApplicationModal(false);
        setConfirmationText('');
        loadUserApplications(); // Reload user applications to update status
      } else {
        showToast(result.error || 'Failed to submit application', 'error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showToast('Error submitting application', 'error');
    } finally {
      setApplicationLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedVersion('');
    setSelectedLocation('');
  };

  const hasApplied = (tuitionId: string) => {
    return userApplications.includes(tuitionId);
  };

  const handleAppliedClick = (tuition: Tuition) => {
    showToast('You have already applied for this tuition. Check your applications page for status updates.', 'info');
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registrationForm.password !== registrationForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setRegistrationLoading(true);
      const response = await fetch('/api/tutors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registrationForm.name,
          phone: registrationForm.phone,
          email: registrationForm.email,
          password: registrationForm.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Registration successful! You can now apply for tuitions.', 'success');
        setShowRegistrationModal(false);
        setRegistrationForm({
          name: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // Redirect to login
        window.location.href = '/tutors/login';
      } else {
        showToast(result.error || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showToast('Error during registration', 'error');
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Available Tuitions
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find the perfect tuition opportunity that matches your expertise and schedule.
            </p>
            {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/tutors/register">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                    Register as Tutor
                </button>
              </Link>
                <Link href="/tutors/login">
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200">
                    Login
                </button>
              </Link>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by code, location, subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Class Filter */}
            <div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="O Level">O Level</option>
                <option value="A Level">A Level</option>
                <option value="University">University</option>
              </select>
            </div>

            {/* Version Filter */}
            <div>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Versions</option>
                <option value="English Medium">English Medium</option>
                <option value="Bangla Medium">Bangla Medium</option>
                <option value="English Version">English Version</option>
                <option value="Others">Others</option>
              </select>
        </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barisal">Barisal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedClass || selectedVersion || selectedLocation) && (
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {filteredTuitions.length} of {tuitions.length} tuitions found
              </span>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Tuitions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTuitions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tuitions found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTuitions.map((tuition) => (
              <div key={tuition._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{tuition.code}</h3>
                    {tuition.urgent && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-blue-100">{tuition.class} • {tuition.version}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{tuition.location}</span>
                  </div>

                  {/* Subjects */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Subjects
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {tuition.subjects.map((subject, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {subject}
                        </span>
                      ))}
        </div>
      </div>

                  {/* Schedule */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {tuition.weeklyDays} • {tuition.dailyHours}
                    </p>
                  </div>

                  {/* Salary */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                              <span className="w-4 h-4 mr-2 text-yellow-500 font-semibold text-sm flex items-center justify-center">৳</span>
                      Salary
                    </h4>
                    <p className="text-gray-600 text-sm">{tuition.salary}</p>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {tuition.tutorGender !== "Not specified" && (
                      <p><span className="font-medium">Tutor Gender:</span> {tuition.tutorGender}</p>
                    )}
                    {tuition.startMonth && (
                      <p><span className="font-medium">Start:</span> {tuition.startMonth}</p>
                    )}
                    {tuition.specialRemarks && (
                      <p><span className="font-medium">Remarks:</span> {tuition.specialRemarks}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    {/* View Details Button */}
                    <Link href={`/tuition/${tuition.code}`}>
                      <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-300">
                        View Details
                      </button>
                    </Link>
                    
                    {/* Apply Button */}
                    {session ? (
                      applicationsLoading ? (
                        <button
                          className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold cursor-default flex items-center justify-center"
                          disabled
                        >
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking...
                        </button>
                      ) : hasApplied(tuition._id) ? (
                        <button
                          onClick={() => handleAppliedClick(tuition)}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                          title="Click to view application status"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(tuition)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                        >
                          Apply Now
                        </button>
                      )
                    ) : (
                      <Link href={`/tutors/register?tuition=${tuition.code}`}>
                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                          Register & Apply
                        </button>
                      </Link>
                    )}
                  </div>
          </div>
        </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
             <Modal
         isOpen={showApplicationModal}
         onClose={() => setShowApplicationModal(false)}
         title="Apply for Tuition - Terms & Conditions"
         size="md"
         actions={
           <div className="flex space-x-3">
             <button
               type="button"
               onClick={() => setShowApplicationModal(false)}
               className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
             >
               Cancel
             </button>
             <button
               type="submit"
               form="application-form"
               disabled={applicationLoading || confirmationText.toLowerCase().trim() !== 'agree'}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
             >
               {applicationLoading ? 'Submitting...' : 'Submit Application'}
             </button>
           </div>
         }
       >
         {selectedTuition && (
           <form id="application-form" onSubmit={handleApplicationSubmit} className="space-y-4">
             <div className="bg-blue-50 p-4 rounded-lg mb-4">
               <h4 className="font-semibold text-blue-900 mb-2">Tuition Details</h4>
               <p className="text-blue-800 text-sm">
                 <strong>Code:</strong> {selectedTuition.code} | <strong>Class:</strong> {selectedTuition.class} | <strong>Location:</strong> {selectedTuition.location}
               </p>
             </div>

             {/* Terms and Conditions */}
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
               <h4 className="font-semibold text-yellow-900 mb-3">আমাদের মিডিয়া ফি এর নিয়ম:</h4>
               <div className="text-yellow-800 text-sm space-y-2">
                 <p>
                   <strong>১.☞</strong> টিউশন কনফার্ম হওয়ার ৫-৭ দিনের মধ্যে স্যালারির ৬০% মিডিয়া ফি দিতে হবে (শুধুমাত্র প্রথম মাসের ক্ষেত্রে প্রযোজ্য)।
                 </p>
                 
                 <div className="mt-4 pt-3 border-t border-yellow-300">
                   <p className="font-medium mb-2">
                     আপনি কি আমাদের কন্ডিশনের সাথে একমত? একমত হলে অবশ্যই <strong>"Agree"</strong> Type করবেন।
                   </p>
                 </div>

                 <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                   <p className="text-red-800 text-xs">
                     <strong>বি:দ্র:</strong> টিউশন কনফার্ম করার পর নির্দিষ্ট সময়ের মধ্যে টিউশন ফি না দিলে, কোনো প্রকার প্রতারণা করলে বা করার চেষ্টা করলে আপনার বিরুদ্ধে যথাযথ আইনি ব্যবস্থা নেয়া হবে।
                   </p>
                 </div>
               </div>
             </div>

             {/* Confirmation Input */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Confirmation *
               </label>
               <input
                 type="text"
                 value={confirmationText}
                 onChange={(e) => setConfirmationText(e.target.value)}
                 placeholder="Type 'Agree' to confirm"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 required
               />
               <p className="mt-1 text-xs text-gray-500">
                 Type exactly "Agree" (case insensitive) to proceed
               </p>
               {confirmationText && confirmationText.toLowerCase().trim() === 'agree' && (
                 <p className="mt-1 text-xs text-green-600 flex items-center">
                   <CheckCircle className="w-3 h-3 mr-1" />
                   Terms accepted
                 </p>
               )}
             </div>
           </form>
         )}
       </Modal>

       {/* Registration Modal */}
       <Modal
         isOpen={showRegistrationModal}
         onClose={() => setShowRegistrationModal(false)}
         title="Register to Apply"
         size="md"
         actions={
           <div className="flex space-x-3">
             <button
               type="button"
               onClick={() => setShowRegistrationModal(false)}
               className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
             >
               Cancel
             </button>
             <button
               type="submit"
               form="registration-form"
               disabled={registrationLoading}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
             >
               {registrationLoading ? 'Registering...' : 'Register & Apply'}
             </button>
           </div>
         }
       >
         {selectedTuition && (
           <form id="registration-form" onSubmit={handleRegistrationSubmit} className="space-y-4">
             <div className="bg-blue-50 p-4 rounded-lg mb-4">
               <h4 className="font-semibold text-blue-900 mb-2">Tuition Details</h4>
               <p className="text-blue-800 text-sm">
                 <strong>Code:</strong> {selectedTuition.code} | <strong>Class:</strong> {selectedTuition.class} | <strong>Location:</strong> {selectedTuition.location}
               </p>
             </div>

             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
               <p className="text-yellow-800 text-sm">
                 <strong>Note:</strong> You need to register as a tutor to apply for this tuition. After registration, you'll be redirected to login.
               </p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Full Name *
               </label>
               <input
                 type="text"
                 value={registrationForm.name}
                 onChange={(e) => setRegistrationForm(prev => ({ ...prev, name: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Phone Number *
               </label>
               <input
                 type="tel"
                 value={registrationForm.phone}
                 onChange={(e) => setRegistrationForm(prev => ({ ...prev, phone: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Email Address *
               </label>
               <input
                 type="email"
                 value={registrationForm.email}
                 onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Password *
               </label>
               <input
                 type="password"
                 value={registrationForm.password}
                 onChange={(e) => setRegistrationForm(prev => ({ ...prev, password: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 minLength={6}
                 required
               />
               <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Confirm Password *
               </label>
               <input
                 type="password"
                 value={registrationForm.confirmPassword}
                 onChange={(e) => setRegistrationForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>
           </form>
         )}
       </Modal>
    </div>
  );
} 