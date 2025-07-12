"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TutorDashboardLayout from "@/components/TutorDashboardLayout";
import { Clock, CheckCircle, AlertCircle, TrendingUp, Eye, Calendar, MapPin, BookOpen } from "lucide-react";

interface TutorStats {
  totalApplications: number;
  pendingApplications: number;
  confirmedApplications: number;
  completedApplications: number;
  activeTuitions: number;
  profileCompletion: number;
  rejectedApplications?: number;
}

interface RecentActivity {
  id: string;
  type: string;
  status: string;
  tuitionCode: string;
  tuitionClass: string;
  tuitionSubjects: string[];
  tuitionLocation: string;
  appliedAt: string;
  message: string;
}

interface ActiveTuition {
  id: string;
  tuitionCode: string;
  guardianName: string;
  class: string;
  subjects: string[];
  location: string;
  salary: string;
  confirmedAt: string;
}

interface DashboardData {
  stats: TutorStats;
  recentActivities: RecentActivity[];
  activeTuitions: ActiveTuition[];
  profileCompletion: {
    basicInfo: boolean;
    academicInfo: boolean;
    documents: boolean;
    preferences: boolean;
  };
  tutor: {
    name: string;
    tutorId: string;
    totalApplications: number;
    successfulTuitions: number;
  };
}

export default function TutorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user as any;

  useEffect(() => {
    if (status === "loading") return;
    if (!session || user?.userType !== "tutor") {
      router.push("/tutors/login");
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line
  }, [session, status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/tutors/dashboard-stats?tutorId=${user.tutorId}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data);
      } else {
        setError(data.error || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-green-500";
      case "completed": return "bg-blue-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return { color: "bg-yellow-100 text-yellow-800", text: "Pending" };
      case "confirmed": return { color: "bg-green-100 text-green-800", text: "Confirmed" };
      case "completed": return { color: "bg-blue-100 text-blue-800", text: "Completed" };
      case "rejected": return { color: "bg-red-100 text-red-800", text: "Rejected" };
      default: return { color: "bg-gray-100 text-gray-800", text: "Unknown" };
    }
  };

  if (loading) {
    return (
      <TutorDashboardLayout title="Dashboard" description="Welcome to your tutor dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </TutorDashboardLayout>
    );
  }

  if (error) {
    return (
      <TutorDashboardLayout title="Dashboard" description="Welcome to your tutor dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </TutorDashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <TutorDashboardLayout title="Dashboard" description="Welcome to your tutor dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-gray-600">No dashboard data available</p>
          </div>
        </div>
      </TutorDashboardLayout>
    );
  }

  return (
    <TutorDashboardLayout title="Dashboard" description={`Welcome back, ${dashboardData.tutor.name || "Tutor"}!`}>
      {/* 1. Application Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Application Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalApplications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingApplications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.confirmedApplications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.completedApplications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.rejectedApplications || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. My Applications - Track Status */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📋 My Applications</h2>
          <p className="text-sm text-gray-600">Track status of your applications</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dashboardData.stats.totalApplications}</div>
                <div className="text-sm text-gray-600">Total Applied</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{dashboardData.stats.pendingApplications}</div>
                <div className="text-sm text-gray-600">Under Review</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dashboardData.stats.confirmedApplications}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{dashboardData.stats.completedApplications}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Application Progress</span>
                  <span>{Math.round((dashboardData.stats.confirmedApplications / Math.max(dashboardData.stats.totalApplications, 1)) * 100)}% Success Rate</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(dashboardData.stats.confirmedApplications / Math.max(dashboardData.stats.totalApplications, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Application List with Details */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📝 Application List</h2>
          <a href="/tutor/applications" className="text-green-600 hover:text-green-700 text-sm font-medium">
            View All Applications →
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {dashboardData.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivities.slice(0, 5).map((activity) => {
                  const statusBadge = getStatusBadge(activity.status);
                  return (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 ${getStatusColor(activity.status)} rounded-full`}></div>
                          <span className="text-sm font-semibold text-gray-900">{activity.tuitionCode}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{formatTimeAgo(activity.appliedAt)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{activity.tuitionClass} • {activity.tuitionSubjects?.join(", ")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{activity.tuitionLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Applied {formatTimeAgo(activity.appliedAt)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{activity.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600 mb-4">Start applying for tuitions to see your application history here</p>
                <a
                  href="/tuitions"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Browse Tuitions
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Welcome back, {dashboardData.tutor.name}!</h2>
        <p className="text-green-100 mb-4">
          You have {dashboardData.stats.totalApplications} total applications and {dashboardData.stats.activeTuitions} active tuitions.
        </p>
        <div className="flex items-center space-x-6 text-sm">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {dashboardData.stats.completedApplications} Completed
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {dashboardData.stats.pendingApplications} Pending
          </span>
          <span className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {dashboardData.tutor.successfulTuitions} Successful Tuitions
          </span>
        </div>
      </div>
    </TutorDashboardLayout>
  );
} 