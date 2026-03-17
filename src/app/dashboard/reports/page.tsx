'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { 
  DocumentChartBarIcon, 
  ClockIcon,
  DocumentTextIcon,
  ChartPieIcon,
  TableCellsIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  return (
    <DashboardLayout 
      title="Reports" 
      description="Generate and view detailed reports"
    >
      {/* Coming Soon Banner */}
      <div className="mb-8 bg-[#006A4E]/8 border border-[#006A4E]/20 rounded-xl p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ClockIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-green-900">Reports Coming Soon</h3>
            <p className="text-green-700">
              We're developing comprehensive reporting tools to help you analyze performance, 
              track progress, and make data-driven decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <DocumentChartBarIcon className="h-6 w-6 text-[#006A4E]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance Reports</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ChartPieIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Analytics Reports</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#006A4E]/10">
              <TableCellsIcon className="h-6 w-6 text-[#006A4E]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Data Tables</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <DocumentTextIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Custom Reports</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <DocumentArrowDownIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Export Reports</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-dashed border-[#E8DDD0] p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <DocumentChartBarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled Reports</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Features */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Report Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Tutor performance reports</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Student progress tracking</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Financial summaries</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#006A4E] rounded-full mr-3"></div>
              <span className="text-gray-700">Attendance reports</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">PDF and Excel export</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Automated report scheduling</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Interactive charts and graphs</span>
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