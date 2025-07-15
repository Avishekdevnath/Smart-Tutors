"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TutorDashboardLayout from "@/components/TutorDashboardLayout";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MapPin, 
  BookOpen, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Eye,
  TrendingUp,
  Award,
  Clock3,
  CheckSquare,
  XSquare,
  MinusCircle
} from "lucide-react";
import Toast, { useToast } from "@/components/Toast";

interface Application {
  _id: string;
  status: "pending" | "selected-for-demo" | "confirmed-fee-pending" | "completed" | "rejected" | "withdrawn";
  appliedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  demoInstructions?: string;
  guardianContactSent?: boolean;
  guardianContactSentAt?: string;
  notes?: string;
  tuition: {
    _id: string;
    code: string;
    class: string;
    version: string;
    location: string;
    salary: string;
    status: string;
    subjects?: string[];
    guardianName?: string;
    guardianPhone?: string;
  };
}

export default function TutorApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"date" | "status" | "salary">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { showToast } = useToast();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/tutors/login");
      return;
    }
    loadApplications();
  }, [session, status]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        showToast("Error loading applications", "error");
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      showToast("Error loading applications", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock3 className="w-5 h-5 text-yellow-500" />;
      case "selected-for-demo":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "confirmed-fee-pending":
        return <CheckSquare className="w-5 h-5 text-green-500" />;
      case "completed":
        return <Award className="w-5 h-5 text-blue-500" />;
      case "rejected":
        return <XSquare className="w-5 h-5 text-red-500" />;
      case "withdrawn":
        return <MinusCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock3 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "selected-for-demo":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "confirmed-fee-pending":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "withdrawn":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "selected-for-demo":
        return "Selected for Demo";
      case "confirmed-fee-pending":
        return "Confirmed - Fee Pending";
      case "completed":
        return "Completed";
      case "rejected":
        return "Rejected";
      case "withdrawn":
        return "Withdrawn";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  };

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter((app) => {
      const matchesStatus = !selectedStatus || app.status === selectedStatus;
      const matchesSearch = !searchTerm || 
        app.tuition.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tuition.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tuition.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.tuition.guardianName && app.tuition.guardianName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "salary":
          comparison = parseInt(a.tuition.salary) - parseInt(b.tuition.salary);
          break;
      }
      return sortOrder === "asc" ? -comparison : comparison;
    });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    selectedForDemo: applications.filter(app => app.status === "selected-for-demo").length,
    confirmed: applications.filter(app => app.status === "confirmed-fee-pending").length,
    completed: applications.filter(app => app.status === "completed").length,
    rejected: applications.filter(app => app.status === "rejected").length,
    withdrawn: applications.filter(app => app.status === "withdrawn").length,
  };

  if (loading) {
    return (
      <TutorDashboardLayout title="My Applications" description="View your tuition applications">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </TutorDashboardLayout>
    );
  }

  return (
    <TutorDashboardLayout title="My Applications" description="View your tuition applications">
      <Toast />
      
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 My Applications</h1>
              <p className="text-gray-600">
                Track and manage your tuition applications
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <a
                href="/tuitions"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Browse Tuitions
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600 font-medium">Total</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-sm text-gray-600 font-medium">Pending</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-orange-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.selectedForDemo}</div>
              <div className="text-sm text-gray-600 font-medium">Demo</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.confirmed}</div>
              <div className="text-sm text-gray-600 font-medium">Confirmed</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.completed}</div>
              <div className="text-sm text-gray-600 font-medium">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-red-200">
              <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
              <div className="text-sm text-gray-600 font-medium">Rejected</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-600 mb-1">{stats.withdrawn}</div>
              <div className="text-sm text-gray-600 font-medium">Withdrawn</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by code, class, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="selected-for-demo">Selected for Demo</option>
                <option value="confirmed-fee-pending">Confirmed - Fee Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "status" | "salary")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
                <option value="salary">Sort by Salary</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 ${viewMode === "list" ? "bg-green-600 text-white" : "bg-white text-gray-600"} transition-colors`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 ${viewMode === "grid" ? "bg-green-600 text-white" : "bg-white text-gray-600"} transition-colors`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List/Grid */}
        {filteredAndSortedApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedStatus || searchTerm ? "No matching applications" : "No applications yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus || searchTerm 
                ? "Try adjusting your filters or search terms."
                : "Start applying for tuitions to see your applications here."
              }
            </p>
            {!selectedStatus && !searchTerm && (
              <a
                href="/tuitions"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Browse Tuitions
              </a>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredAndSortedApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Application Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {application.tuition.code}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {application.tuition.class} • {application.tuition.version}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{application.tuition.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-4 h-4 mr-2 text-yellow-500 font-semibold text-sm flex items-center justify-center">৳</span>
                      <span>{application.tuition.salary}</span>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="p-6">
                  {/* Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Applied {formatTimeAgo(application.appliedAt)}</span>
                    </div>
                    {application.confirmedAt && (
                      <div className="flex items-center text-sm text-green-600 mb-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Confirmed {formatTimeAgo(application.confirmedAt)}</span>
                      </div>
                    )}
                    {application.completedAt && (
                      <div className="flex items-center text-sm text-blue-600 mb-2">
                        <Award className="w-4 h-4 mr-2" />
                        <span>Completed {formatTimeAgo(application.completedAt)}</span>
                      </div>
                    )}
                    {application.rejectedAt && (
                      <div className="flex items-center text-sm text-red-600 mb-2">
                        <XCircle className="w-4 h-4 mr-2" />
                        <span>Rejected {formatTimeAgo(application.rejectedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Guardian Info (if available) */}
                  {application.tuition.guardianName && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-700 mb-1">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-medium">{application.tuition.guardianName}</span>
                      </div>
                      {application.tuition.guardianPhone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{application.tuition.guardianPhone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subjects */}
                  {application.tuition.subjects && application.tuition.subjects.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {application.tuition.subjects.map((subject, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Demo Instructions */}
                  {application.demoInstructions && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 mb-2">
                        <strong>🎯 Demo Instructions:</strong>
                      </p>
                      <p className="text-sm text-orange-700 mb-2">
                        {application.demoInstructions}
                      </p>
                      {application.guardianContactSent && (
                        <div className="text-xs text-orange-600 mt-2 pt-2 border-t border-orange-200">
                          ✓ Guardian contact information has been sent to your profile
                        </div>
                      )}
                    </div>
                  )}

                  {/* Application Notes */}
                  {application.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> {application.notes}
                      </p>
                    </div>
                  )}

                  {/* Application ID */}
                  <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                    ID: {application._id.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredAndSortedApplications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedApplications.length} of {applications.length} applications
              </span>
              <span>
                {searchTerm && `Search: "${searchTerm}"`}
                {selectedStatus && ` • Status: ${getStatusText(selectedStatus)}`}
              </span>
          </div>
        </div>
        )}
      </div>
    </TutorDashboardLayout>
  );
} 