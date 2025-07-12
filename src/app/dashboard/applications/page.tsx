'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Clock, CheckCircle, XCircle, AlertCircle, User, MapPin, Eye, FileText, GraduationCap, Phone, Mail } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';

interface Application {
  _id: string;
  status: 'pending' | 'selected-for-demo' | 'confirmed-fee-pending' | 'completed' | 'rejected' | 'withdrawn';
  appliedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  demoDate?: string;
  demoInstructions?: string;
  guardianContactSent?: boolean;
  guardianContactSentAt?: string;
  notes?: string;
  tutor?: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  tuition: {
    _id: string;
    code: string;
    class: string;
    version: string;
    location: string;
    salary: string;
    status: string;
    guardianName?: string;
    guardianPhone?: string;
  };
}

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [demoInstructions, setDemoInstructions] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/admin/login');
      return;
    }
    loadApplications();
  }, [session, status]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        showToast('Error loading applications', 'error');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      showToast('Error loading applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      setUpdatingStatus(applicationId);
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showToast(`Application ${newStatus} successfully`, 'success');
        loadApplications(); // Reload applications
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update application', 'error');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      showToast('Error updating application', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'selected-for-demo':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'confirmed-fee-pending':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'withdrawn':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'selected-for-demo':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed-fee-pending':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'selected-for-demo':
        return 'Selected for Demo';
      case 'confirmed-fee-pending':
        return 'Confirmed - Fee Pending';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewTutorProfile = async (tutorId: string) => {
    try {
      const response = await fetch(`/api/tutors/${tutorId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTutor(data.tutor || data);
        setShowTutorModal(true);
      } else {
        showToast('Failed to load tutor profile', 'error');
      }
    } catch (error) {
      console.error('Error loading tutor profile:', error);
      showToast('Error loading tutor profile', 'error');
    }
  };

  const handleSelectForDemo = (application: Application) => {
    setSelectedApplication(application);
    setDemoInstructions('');
    setShowDemoModal(true);
  };

  const handleSendDemoSelection = async () => {
    if (!selectedApplication || !demoInstructions.trim()) {
      showToast('Please enter demo instructions', 'error');
      return;
    }
    
    try {
      setUpdatingStatus(selectedApplication._id);
      const response = await fetch(`/api/applications/${selectedApplication._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'selected-for-demo',
          demoInstructions: demoInstructions,
          guardianContactSent: true,
          guardianContactSentAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        showToast('Tutor selected for demo and guardian contact sent', 'success');
        setDemoInstructions('');
        setShowDemoModal(false);
        setSelectedApplication(null);
        loadApplications();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to select for demo', 'error');
      }
    } catch (error) {
      console.error('Error selecting for demo:', error);
      showToast('Error selecting for demo', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSendConfirmation = async (applicationId: string) => {
    if (!confirmationText.trim()) {
      showToast('Please enter confirmation text', 'error');
      return;
    }
    
    try {
      setUpdatingStatus(applicationId);
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'confirmed-fee-pending',
          confirmationText: confirmationText 
        })
      });

      if (response.ok) {
        showToast('Confirmation sent successfully', 'success');
        setConfirmationText('');
        setShowConfirmationModal(false);
        loadApplications();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to send confirmation', 'error');
      }
    } catch (error) {
      console.error('Error sending confirmation:', error);
      showToast('Error sending confirmation', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredApplications = selectedStatus 
    ? applications.filter(app => app.status === selectedStatus)
    : applications;

  if (loading) {
    return (
      <DashboardLayout title="Applications" description="Manage tuition applications">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Applications" description="Manage tuition applications">
      <Toast />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tuition Applications</h1>
              <p className="text-gray-600 mt-1">
                Review and manage tuition applications from tutors
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(app => app.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(app => app.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <User className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedStatus ? `No ${selectedStatus} applications` : 'No applications yet'}
            </h3>
            <p className="text-gray-600">
              {selectedStatus 
                ? `There are no ${selectedStatus} applications at the moment.`
                : 'Applications from tutors will appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {application.tuition.code}
                          <span className="text-sm font-normal text-gray-500">
                            (App ID: {application._id.slice(-6).toUpperCase()})
                          </span>
                        </h3>
                        <p className="text-gray-600">
                          {application.tuition.class} • {application.tuition.version}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                    </div>

                    {/* Tutor & Tuition Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* Tutor Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Tutor Information
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Name:</span> {application.tutor?.name || 'Guest Applicant'}</p>
                          <p><span className="font-medium">Phone:</span> {application.tutor?.phone || 'N/A'}</p>
                          {application.tutor?.email && (
                            <p><span className="font-medium">Email:</span> {application.tutor.email}</p>
                          )}
                        </div>
                        {application.tutor?._id && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleViewTutorProfile(application.tutor._id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Profile
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Tuition Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Tuition Information
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Location:</span> {application.tuition.location}</p>
                          <p><span className="font-medium">Salary:</span> {application.tuition.salary}</p>
                          <p><span className="font-medium">Applied:</span> {formatDate(application.appliedAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {application.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={() => handleSelectForDemo(application)}
                          disabled={updatingStatus === application._id}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {updatingStatus === application._id ? 'Updating...' : 'Select for Demo'}
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          disabled={updatingStatus === application._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                        >
                          {updatingStatus === application._id ? 'Updating...' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {application.status === 'selected-for-demo' && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={() => {
                            setShowConfirmationModal(true);
                            setConfirmationText('');
                          }}
                          disabled={updatingStatus === application._id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          {updatingStatus === application._id ? 'Updating...' : 'Confirm & Send Fee Info'}
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          disabled={updatingStatus === application._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                        >
                          {updatingStatus === application._id ? 'Updating...' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {application.status === 'confirmed-fee-pending' && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'completed')}
                          disabled={updatingStatus === application._id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          {updatingStatus === application._id ? 'Updating...' : 'Mark Completed'}
                        </button>
                      </div>
                    )}

                    {/* Demo Instructions Display */}
                    {application.demoInstructions && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <p className="text-orange-800 text-sm">
                          <strong>Demo Instructions:</strong> {application.demoInstructions}
                        </p>
                        {application.guardianContactSent && (
                          <p className="text-orange-600 text-xs mt-1">
                            ✓ Guardian contact sent on {formatDate(application.guardianContactSentAt || '')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {application.notes && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-700 text-sm">
                          <strong>Notes:</strong> {application.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tutor Profile Modal */}
        {showTutorModal && selectedTutor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Tutor Profile</h2>
                  <button
                    onClick={() => setShowTutorModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Name:</span>
                        <span className="text-gray-900">{selectedTutor.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-medium text-gray-700 w-24">Phone:</span>
                        <span className="text-gray-900">{selectedTutor.phone}</span>
                      </div>
                      {selectedTutor.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium text-gray-700 w-24">Email:</span>
                          <span className="text-gray-900">{selectedTutor.email}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Gender:</span>
                        <span className="text-gray-900">{selectedTutor.gender || 'Not specified'}</span>
                      </div>
                      {selectedTutor.fatherName && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-24">Father:</span>
                          <span className="text-gray-900">{selectedTutor.fatherName}</span>
                        </div>
                      )}
                      {selectedTutor.fatherNumber && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium text-gray-700 w-24">Father's Phone:</span>
                          <span className="text-gray-900">{selectedTutor.fatherNumber}</span>
                        </div>
                      )}
                      {selectedTutor.address && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-green-600 mt-1" />
                          <span className="font-medium text-gray-700 w-24">Address:</span>
                          <span className="text-gray-900">{selectedTutor.address}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Profile Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTutor.profileStatus === 'active' ? 'bg-green-100 text-green-800' :
                          selectedTutor.profileStatus === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedTutor.profileStatus || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Academic Information
                    </h3>
                    <div className="space-y-3">
                      {selectedTutor.schoolName && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-24">School:</span>
                          <span className="text-gray-900">{selectedTutor.schoolName}</span>
                        </div>
                      )}
                      {selectedTutor.collegeName && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-24">College:</span>
                          <span className="text-gray-900">{selectedTutor.collegeName}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">University:</span>
                        <span className="text-gray-900">{selectedTutor.university || 'Not specified'}</span>
                      </div>
                      {selectedTutor.universityShortForm && (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-24">University Short:</span>
                          <span className="text-gray-900">{selectedTutor.universityShortForm}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Department:</span>
                        <span className="text-gray-900">{selectedTutor.department || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Year & Semester:</span>
                        <span className="text-gray-900">{selectedTutor.yearAndSemester || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Version:</span>
                        <span className="text-gray-900">{selectedTutor.version || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Group:</span>
                        <span className="text-gray-900">{selectedTutor.group || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Results */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Results</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">SSC Result:</span>
                        <span className="text-gray-900">{selectedTutor.academicQualifications?.sscResult || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">HSC Result:</span>
                        <span className="text-gray-900">{selectedTutor.academicQualifications?.hscResult || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">O-Level Result:</span>
                        <span className="text-gray-900">{selectedTutor.academicQualifications?.oLevelResult || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">A-Level Result:</span>
                        <span className="text-gray-900">{selectedTutor.academicQualifications?.aLevelResult || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teaching Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Preferences</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Preferred Subjects:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTutor.preferredSubjects?.map((subject: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {subject}
                            </span>
                          )) || <span className="text-gray-500">No subjects specified</span>}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Preferred Locations:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTutor.preferredLocation?.map((location: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {location}
                            </span>
                          )) || <span className="text-gray-500">No locations specified</span>}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-24">Experience:</span>
                        <span className="text-gray-900">{selectedTutor.experience || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  {(selectedTutor.documents?.nidPhoto || selectedTutor.documents?.studentIdPhoto || selectedTutor.documents?.additionalDocuments?.length > 0) && (
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedTutor.documents?.nidPhoto && (
                          <div className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">NID Photo</h4>
                            <a 
                              href={selectedTutor.documents.nidPhoto} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View NID Document
                            </a>
                          </div>
                        )}
                        {selectedTutor.documents?.studentIdPhoto && (
                          <div className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Student ID Photo</h4>
                            <a 
                              href={selectedTutor.documents.studentIdPhoto} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Student ID
                            </a>
                          </div>
                        )}
                        {selectedTutor.documents?.additionalDocuments?.map((doc: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-2">{doc.label}</h4>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Document
                            </a>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{selectedTutor.totalApplications || 0}</div>
                        <div className="text-sm text-blue-800">Total Applications</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{selectedTutor.successfulTuitions || 0}</div>
                        <div className="text-sm text-green-800">Successful Tuitions</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedTutor.isProfileComplete ? 'Complete' : 'Incomplete'}
                        </div>
                        <div className="text-sm text-purple-800">Profile Status</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Selection Modal */}
        {showDemoModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Select Tutor for Demo</h2>
                <p className="text-gray-600 mt-1">
                  {selectedApplication.tutor?.name} - {selectedApplication.tuition.code}
                </p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Guardian Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Guardian Name:</strong> {selectedApplication.tuition.guardianName || 'Not provided'}</p>
                    <p><strong>Guardian Phone:</strong> {selectedApplication.tuition.guardianPhone || 'Not provided'}</p>
                    <p><strong>Location:</strong> {selectedApplication.tuition.location}</p>
                    <p><strong>Salary:</strong> {selectedApplication.tuition.salary}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demo Instructions for Tutor
                  </label>
                  <textarea
                    value={demoInstructions}
                    onChange={(e) => setDemoInstructions(e.target.value)}
                    placeholder="Enter demo instructions and guardian contact information for the tutor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be sent to the tutor along with guardian contact information.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-orange-800 mb-2">What happens next:</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Tutor will receive demo instructions and guardian contact</li>
                    <li>• Guardian contact will be sent to tutor's profile</li>
                    <li>• SMS notification will be sent (future feature)</li>
                    <li>• Application status will change to "Selected for Demo"</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDemoModal(false);
                      setSelectedApplication(null);
                      setDemoInstructions('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendDemoSelection}
                    disabled={!demoInstructions.trim() || updatingStatus}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    {updatingStatus ? 'Processing...' : 'Select for Demo & Send Contact'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Send Confirmation</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmation Message
                  </label>
                  <textarea
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Enter your confirmation message to the tutor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmationModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendConfirmation(updatingStatus || '')}
                    disabled={!confirmationText.trim() || updatingStatus}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingStatus ? 'Sending...' : 'Send Confirmation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 