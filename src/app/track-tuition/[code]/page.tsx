'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, AlertCircle, User, MapPin, Phone, Mail, Calendar, DollarSign, BookOpen } from 'lucide-react';

interface Tuition {
  _id: string;
  code: string;
  guardianName: string;
  guardianNumber: string;
  address: string;
  location: string;
  studentClass: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  dailyHours: string;
  salary: string;
  startMonth: string;
  tutorGender: string;
  specialRemarks: string;
  urgent: boolean;
  status: string;
  createdAt: string;
}

interface Application {
  _id: string;
  status: 'pending' | 'selected-for-demo' | 'confirmed-fee-pending' | 'completed' | 'rejected' | 'withdrawn';
  appliedAt: string;
  tutor: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    university?: string;
    department?: string;
    experience?: string;
  };
}

export default function TrackTuitionPage() {
  const params = useParams();
  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTuitionData = async () => {
      try {
        setLoading(true);
        
        // Fetch tuition details
        const tuitionResponse = await fetch(`/api/tuitions/public/${params.code}`);
        if (!tuitionResponse.ok) {
          if (tuitionResponse.status === 404) {
            setError('Tuition not found');
          } else {
            setError('Failed to load tuition details');
          }
          return;
        }
        const tuitionData = await tuitionResponse.json();
        setTuition(tuitionData);

        // Fetch applications for this tuition
        const applicationsResponse = await fetch(`/api/applications?tuitionCode=${params.code}`);
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData.applications || []);
        }
      } catch (err) {
        setError('Failed to load tuition data');
        console.error('Error fetching tuition data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.code) {
      fetchTuitionData();
    }
  }, [params.code]);

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
        return 'Pending Review';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tuition tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !tuition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tuition Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The tuition you are looking for does not exist.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tuition Tracking
              </h1>
              <p className="text-gray-600 mt-1">
                Code: {tuition.code}
              </p>
            </div>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tuition Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tuition Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tuition.studentClass} - {tuition.version}</h3>
                  <p className="text-sm text-gray-600">Posted on {formatDate(tuition.createdAt)}</p>
                </div>

                {tuition.urgent && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ⚡ Urgent Requirement
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Subjects:</span>
                    <span className="ml-2 text-gray-600">{tuition.subjects?.join(', ') || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Schedule:</span>
                    <span className="ml-2 text-gray-600">{tuition.weeklyDays} ({tuition.dailyHours} hours daily)</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Salary:</span>
                    <span className="ml-2 text-gray-600">{tuition.salary}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2 text-gray-600">{tuition.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Guardian:</span>
                    <span className="ml-2 text-gray-600">{tuition.guardianName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Contact:</span>
                    <span className="ml-2 text-gray-600">{tuition.guardianNumber}</span>
                  </div>
                </div>

                {tuition.specialRemarks && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Special Remarks:</span><br />
                      {tuition.specialRemarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Tutor Applications</h2>
                <div className="text-sm text-gray-600">
                  {applications.length} application{applications.length !== 1 ? 's' : ''}
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600">
                    No tutors have applied for this tuition yet. Check back later!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{application.tutor.name}</h3>
                            <p className="text-sm text-gray-600">{application.tutor.phone}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{getStatusText(application.status)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {application.tutor.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">{application.tutor.email}</span>
                          </div>
                        )}
                        {application.tutor.university && (
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">{application.tutor.university}</span>
                          </div>
                        )}
                        {application.tutor.department && (
                          <div className="flex items-center">
                            <span className="text-gray-600">{application.tutor.department}</span>
                          </div>
                        )}
                        {application.tutor.experience && (
                          <div className="flex items-center">
                            <span className="text-gray-600">{application.tutor.experience} experience</span>
                          </div>
                        )}
                      </div>

                      {/* View Tutor Details Button */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Link 
                          href={`/tutor/${application.tutor.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Tutor Details
                        </Link>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Applied on {formatDate(application.appliedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 