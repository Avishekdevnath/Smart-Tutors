'use client';

import { Search, Filter, X, SortAsc, SortDesc, Users, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchAndFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  memberCountFilter: string;
  onMemberCountFilterChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  // New sorting props
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  // New exclusion props
  excludeLocations: string;
  onExcludeLocationsChange: (value: string) => void;
  maxMemberCount: string;
  onMaxMemberCountChange: (value: string) => void;
  minMemberCount: string;
  onMinMemberCountChange: (value: string) => void;
}

export default function SearchAndFilterBar({
  searchTerm,
  onSearchChange,
  locationFilter,
  onLocationFilterChange,
  memberCountFilter,
  onMemberCountFilterChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  excludeLocations,
  onExcludeLocationsChange,
  maxMemberCount,
  onMaxMemberCountChange,
  minMemberCount,
  onMinMemberCountChange
}: SearchAndFilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 shadow-sm mb-4 sm:mb-6">
      {/* Main search and controls */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search collections or groups..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Sort Controls */}
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
            >
              <option value="">Sort by...</option>
              <option value="name">Name</option>
              <option value="memberCount">Member Count</option>
              <option value="createdAt">Created Date</option>
              <option value="groupsCount">Groups Count</option>
            </select>
            
            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2.5 border rounded-lg transition-all duration-200 ${
                sortBy 
                  ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' 
                  : 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
              }`}
              disabled={!sortBy}
              title={sortBy ? `Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}` : 'Select sort field first'}
            >
              {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>

          {/* Filter and Clear Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 flex-1 sm:flex-initial justify-center ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              <span className="font-medium text-sm">Filters</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1rem] h-4 flex items-center justify-center">
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
            {/* Include Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin size={14} className="inline mr-1" />
                Include Location
              </label>
              <input
                type="text"
                placeholder="e.g., Mirpur, Dhaka"
                value={locationFilter}
                onChange={(e) => onLocationFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500">
                Shows collections with groups in this location
              </p>
            </div>

            {/* Exclude Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin size={14} className="inline mr-1" />
                Exclude Location
              </label>
              <input
                type="text"
                placeholder="Exclude from location"
                value={excludeLocations}
                onChange={(e) => onExcludeLocationsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500">
                Hides collections with groups from this location
              </p>
            </div>

            {/* Min Member Count */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Users size={14} className="inline mr-1" />
                Min Members
              </label>
              <input
                type="number"
                placeholder="1000"
                value={minMemberCount}
                onChange={(e) => onMinMemberCountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500">
                Minimum member count per group
              </p>
            </div>

            {/* Max Member Count */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Users size={14} className="inline mr-1" />
                Max Members
              </label>
              <input
                type="number"
                placeholder="50000"
                value={maxMemberCount}
                onChange={(e) => onMaxMemberCountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500">
                Maximum member count per group
              </p>
            </div>

            {/* Legacy Member Count Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Users size={14} className="inline mr-1" />
                Legacy Filter
              </label>
              <input
                type="number"
                placeholder="Member count"
                value={memberCountFilter}
                onChange={(e) => onMemberCountFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500">
                Legacy member count filter
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 