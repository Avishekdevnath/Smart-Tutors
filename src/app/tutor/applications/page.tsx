'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TutorDashboardLayout from '@/components/TutorDashboardLayout';
import { Clock, CheckCircle, XCircle, AlertCircle, MapPin, BookOpen } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';

interface Application {
  _id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'withdrawn';
  appliedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  notes?: string;
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

export default function TutorApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/tutors/login');
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'confirmed':
        return 'Confirmed';
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

  const filteredApplications = selectedStatus 
    ? applications.filter(app => app.status === selectedStatus)
    : applications;

  if (loading) {
    return (
      <TutorDashboardLayout title="My Applications" description="View your tuition applications">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </TutorDashboardLayout>
    );
  }

  return (
    <TutorDashboardLayout title="My Applications" description="View your tuition applications">
      <Toast />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">
                Track the status of your tuition applications
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

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedStatus ? `No ${selectedStatus} applications` : 'No applications yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus 
                ? `You don't have any ${selectedStatus} applications.`
                : 'Start applying for tuitions to see your applications here.'
              }
            </p>
            {!selectedStatus && (
              <a
                href="/tuitions"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Tuitions
              </a>
            )}
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
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {application.tuition.code}
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

                    {/* Tuition Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{application.tuition.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="w-4 h-4 mr-2 text-yellow-500 font-bold text-lg">৳</span>
                        <span>{application.tuition.salary}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Applied {formatDate(application.appliedAt)}</span>
                      </div>
                    </div>

                    {/* Status-specific information */}
                    {application.status === 'confirmed' && application.confirmedAt && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-green-800 text-sm">
                          <strong>Confirmed on:</strong> {formatDate(application.confirmedAt)}
                        </p>
                      </div>
                    )}

                    {application.status === 'completed' && application.completedAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-blue-800 text-sm">
                          <strong>Completed on:</strong> {formatDate(application.completedAt)}
                        </p>
                      </div>
                    )}

                    {application.status === 'rejected' && application.rejectedAt && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-800 text-sm">
                          <strong>Rejected on:</strong> {formatDate(application.rejectedAt)}
                        </p>
                      </div>
                    )}

                    {/* Application Status Details */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Application ID:</span>
                          <span className="text-gray-600 ml-2">{application._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Terms Agreed:</span>
                          <span className="text-green-600 ml-2">✓ Yes</span>
                        </div>
                      </div>
                      {application.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-gray-700 text-sm">
                            <strong>Additional Info:</strong> {application.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {applications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {applications.filter(app => app.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {applications.filter(app => app.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
          </div>
        </div>
        )}
      </div>
    </TutorDashboardLayout>
  );
} 