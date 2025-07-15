'use client';

import { Search, SortAsc, SortDesc, X } from 'lucide-react';

interface GuardianSearchSortBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortField: string;
  setSortField: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  onSearch: () => void;
}

export default function GuardianSearchSortBar({
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onClearFilters,
  onSearch
}: GuardianSearchSortBarProps) {
  const sortOptions = [
    { value: 'createdAt', label: 'Latest Guardians' },
    { value: 'name', label: 'Guardian Name' },
    { value: 'number', label: 'Phone Number' },
    { value: 'address', label: 'Address' }
  ];

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <SortAsc className="w-4 h-4" />;
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const hasActiveFilters = searchTerm || sortField !== 'createdAt' || sortOrder !== 'desc';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search guardians by name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Sort Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sort Field */}
          <div>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              {getSortIcon(sortField)}
              <span className="text-sm font-medium">
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </span>
            </button>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Sort: {sortOptions.find(opt => opt.value === sortField)?.label} ({sortOrder})
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 