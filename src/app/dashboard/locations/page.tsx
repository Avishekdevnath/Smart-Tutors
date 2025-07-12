"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import LocationSelector from '@/components/LocationSelector';

interface Location {
  _id: string;
  division: string;
  district: string;
  area: string;
  subarea?: string;
  formatted?: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationFormData {
  division: string;
  district: string;
  area: string;
  subarea?: string;
  formatted?: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    division: '',
    district: '',
    area: '',
    subarea: '',
    formatted: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkResult, setBulkResult] = useState<{added:number, skipped:number, error?:string} | null>(null);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<{removed:number, remaining:number, error?:string} | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    divisions: 0,
    districts: 0,
    areas: 0
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations?limit=1000');
      const data = await response.json();
      
      if (data.success) {
        setLocations(data.locations);
      } else {
        setError('Failed to fetch locations');
      }
    } catch (error) {
      setError('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const divisions = [...new Set(locations.map(loc => loc.division))];
    const districts = [...new Set(locations.map(loc => loc.district))];
    const areas = [...new Set(locations.map(loc => loc.area))];

    setStats({
      total: locations.length,
      divisions: divisions.length,
      districts: districts.length,
      areas: areas.length
    });
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = 
      location.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.subarea && location.subarea.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDivision = !selectedDivision || location.division === selectedDivision;
    const matchesDistrict = !selectedDistrict || location.district === selectedDistrict;
    
    return matchesSearch && matchesDivision && matchesDistrict;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDivision, selectedDistrict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.division || !formData.district || !formData.area) {
      setError('Division, district, and area are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const url = editingLocation 
        ? `/api/locations/${editingLocation._id}`
        : '/api/locations';
      
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(editingLocation ? 'Location updated successfully!' : 'Location added successfully!');
        setShowAddForm(false);
        setEditingLocation(null);
        resetForm();
      fetchLocations();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to save location');
      }
    } catch (error) {
      setError('Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      division: location.division,
      district: location.district,
      area: location.area,
      subarea: location.subarea || '',
      formatted: location.formatted || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Location deleted successfully!');
        fetchLocations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete location');
      }
    } catch (error) {
      setError('Failed to delete location');
    }
  };

  const resetForm = () => {
    setFormData({
      division: '',
      district: '',
      area: '',
      subarea: '',
      formatted: ''
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingLocation(null);
    resetForm();
  };

  const divisions = [...new Set(locations.map(loc => loc.division))].sort();
  const districts = [...new Set(locations.map(loc => loc.district))].sort();

  // Bulk Add Handler
  const handleBulkAdd = async () => {
    setBulkResult(null);
    try {
      const res = await fetch('/api/locations/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bulkInput
      });
      const data = await res.json();
      if (data.success) {
        setBulkResult({ added: data.added, skipped: data.skipped });
        setBulkInput('');
      fetchLocations();
      } else {
        setBulkResult({ added: 0, skipped: 0, error: data.error || 'Bulk add failed' });
      }
    } catch (err) {
      setBulkResult({ added: 0, skipped: 0, error: 'Bulk add failed' });
    }
  };

  // Remove Duplicates Handler
  const handleRemoveDuplicates = async () => {
    if (!confirm('This will remove all duplicate locations. Are you sure?')) return;
    
    setRemovingDuplicates(true);
    setDuplicateResult(null);
    
    try {
      const res = await fetch('/api/locations/remove-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      console.log('Remove duplicates response:', data); // Debug log
      
      if (data.success) {
        setDuplicateResult({ removed: data.removed, remaining: data.remaining });
        fetchLocations(); // Refresh the list
    } else {
        setDuplicateResult({ removed: 0, remaining: 0, error: data.error || 'Unknown error occurred' });
      }
    } catch (error) {
      console.error('Remove duplicates error:', error); // Debug log
      setDuplicateResult({ removed: 0, remaining: 0, error: `Failed to remove duplicates: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setRemovingDuplicates(false);
    }
  };

  return (
    <DashboardLayout 
      title="Location Management" 
      description="Manage divisions, districts, areas, and sub-areas"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Divisions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.divisions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Districts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.districts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Areas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.areas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Divisions</option>
              {divisions.map(division => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>

            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Bulk Add
            </button>
            <button
              onClick={handleRemoveDuplicates}
              disabled={removingDuplicates}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removingDuplicates ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {removingDuplicates ? 'Removing...' : 'Remove Duplicates'}
            </button>
          <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
              <Plus className="w-4 h-4" />
              Add Location
          </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <LocationSelector
              value={formData}
              onChange={setFormData}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formatted Address (Optional)
              </label>
          <input
            type="text"
                value={formData.formatted}
                onChange={(e) => setFormData({ ...formData, formatted: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Gulshan-1, Dhaka, Dhaka Division"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingLocation ? 'Update' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Locations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Locations ({filteredLocations.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading locations...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No locations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Division
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub-area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formatted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLocations.map((location) => (
                  <tr key={location._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.division}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.subarea || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {location.formatted || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                    <button
                          onClick={() => handleEdit(location)}
                          className="text-blue-600 hover:text-blue-900"
                    >
                          <Edit className="w-4 h-4" />
                    </button>
                    <button
                          onClick={() => handleDelete(location._id)}
                          className="text-red-600 hover:text-red-900"
                    >
                          <Trash2 className="w-4 h-4" />
                    </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLocations.length)} of {filteredLocations.length} locations
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bulk Add Locations</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste JSON Array of Locations
              </label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='[{"division":"Dhaka","district":"Dhaka","area":"Agargaon"},...]'
            />
          </div>
            
            {bulkResult && (
              <div className={`p-3 rounded-lg mb-4 ${
                bulkResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {bulkResult.error ? (
                  <p>Error: {bulkResult.error}</p>
                ) : (
                  <p>Added: {bulkResult.added}, Skipped (duplicates): {bulkResult.skipped}</p>
                )}
          </div>
            )}
            
            <div className="flex justify-end gap-3">
            <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
                onClick={handleBulkAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Submit
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Removal Result */}
      {duplicateResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                duplicateResult.error ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {duplicateResult.error ? (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-2">
                {duplicateResult.error ? 'Error' : 'Duplicates Removed'}
              </h3>
              
              {duplicateResult.error ? (
                <p className="text-red-600 mb-4">{duplicateResult.error}</p>
              ) : (
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">
                    Successfully removed <span className="font-semibold text-red-600">{duplicateResult.removed}</span> duplicate locations
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-green-600">{duplicateResult.remaining}</span> unique locations remain
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setDuplicateResult(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 