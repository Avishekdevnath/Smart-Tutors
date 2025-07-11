'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Clock, CheckCircle, XCircle, AlertCircle, User, MapPin, Eye } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';

interface Application {
  _id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'withdrawn';
  appliedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
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
  };
}

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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
      case 'confirmed':
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
      case 'confirmed':
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
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
                          onClick={() => updateApplicationStatus(application._id, 'confirmed')}
                          disabled={updatingStatus === application._id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {updatingStatus === application._id ? 'Updating...' : 'Confirm'}
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

                    {application.status === 'confirmed' && (
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
      </div>
    </DashboardLayout>
  );
} 