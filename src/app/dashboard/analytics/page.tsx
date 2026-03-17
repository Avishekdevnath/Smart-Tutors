'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UsersIcon, 
  AcademicCapIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  return (
    <DashboardLayout 
      title="Analytics & Reports" 
      description="View detailed analytics and generate reports"
    >
      {/* Coming Soon Banner */}
      <div className="mb-8 bg-[#006A4E]/8 border border-[#006A4E]/20 rounded-xl p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ClockIcon className="h-8 w-8 text-[#006A4E]" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-blue-900">Analytics Coming Soon</h3>
            <p className="text-blue-700">
              We're working hard to bring you comprehensive analytics and reporting features. 
              This will include detailed insights about tutors, guardians, tuitions, and performance metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ChartBarIcon className="h-6 w-6 text-[#006A4E]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance Metrics</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Trends</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#006A4E]/10">
              <UsersIcon className="h-6 w-6 text-[#006A4E]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">User Insights</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <AcademicCapIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Academic Reports</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Issue Tracking</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Custom Reports</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Real-time dashboard with live metrics</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Tutor performance analytics</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Guardian satisfaction tracking</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Tuition success rate analysis</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Financial reporting and insights</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Geographic distribution maps</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Export capabilities (PDF, Excel)</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Custom report builder</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 