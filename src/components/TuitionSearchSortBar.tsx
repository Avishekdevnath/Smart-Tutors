import { Search, SortAsc, SortDesc, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

interface TuitionSearchSortBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  versionFilter: string;
  onVersionFilterChange: (value: string) => void;
  classFilter: string;
  onClassFilterChange: (value: string) => void;
  classOptions: string[];
  sortField: string;
  onSortFieldChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'available', label: 'Available' },
  { value: 'demo running', label: 'Demo Running' },
  { value: 'booked', label: 'Booked' },
  { value: 'booked by other', label: 'Booked by Other' },
];

const versionOptions = [
  { value: 'all', label: 'All Versions' },
  { value: 'English Medium', label: 'English Medium' },
  { value: 'Bangla Medium', label: 'Bangla Medium' },
  { value: 'English Version', label: 'English Version' },
  { value: 'Others', label: 'Others' },
];

const sortFieldOptions = [
  { value: 'createdAt', label: 'Latest Tuitions' },
  { value: 'code', label: 'Code (A-Z)' },
  { value: 'guardianName', label: 'Guardian Name (A-Z)' },
  { value: 'guardianNumber', label: 'Guardian Number' },
  { value: 'class', label: 'Class (A-Z)' },
  { value: 'version', label: 'Version (A-Z)' },
  { value: 'salary', label: 'Salary' },
  { value: 'urgent', label: 'Urgent Status' },
];

export default function TuitionSearchSortBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  versionFilter,
  onVersionFilterChange,
  classFilter,
  onClassFilterChange,
  classOptions,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  hasActiveFilters,
}: TuitionSearchSortBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 shadow-sm mb-4 sm:mb-6 lg:mb-8">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by code, class, subjects, guardian, location..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Sort Controls */}
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900 bg-white"
            >
              {sortFieldOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2.5 border rounded-lg transition-all duration-200 ${
                sortField 
                  ? 'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100' 
                  : 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
              }`}
              disabled={!sortField}
              title={sortField ? `Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}` : 'Select sort field first'}
            >
              {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>

          {/* Filter and Clear Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 flex-1 sm:flex-initial justify-center ${
                showFilters 
                  ? 'bg-purple-50 border-purple-300 text-purple-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              <span className="font-medium text-sm">Filters</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {hasActiveFilters && (
                <span className="bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1rem] h-4 flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <X size={16} />
                <span className="font-medium text-sm hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Options - Mobile responsive */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900 bg-white"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Version Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <select
                value={versionFilter}
                onChange={(e) => onVersionFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900 bg-white"
              >
                {versionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select
                value={classFilter}
                onChange={(e) => onClassFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900 bg-white"
              >
                <option value="all">All Classes</option>
                {classOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 