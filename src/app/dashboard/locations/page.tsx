"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LocationSelector from '@/components/LocationSelector';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';

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
  const [bulkResult, setBulkResult] = useState<{added:number, skipped:number, errors?:string[], error?:string} | null>(null);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<{removed:number, remaining:number, error?:string} | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    divisions: 0,
    districts: 0,
    areas: 0
  });

  useEffect(() => {
    fetchLocations();
  }, [currentPage, itemsPerPage, searchTerm, selectedDivision, selectedDistrict]);

  useEffect(() => {
    calculateStats();
  }, [locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDivision) params.append('division', selectedDivision);
      if (selectedDistrict) params.append('district', selectedDistrict);
      
      const response = await fetch(`/api/locations?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLocations(data.locations);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } else {
        setError('Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const uniqueDivisions = new Set(locations.map(loc => loc.division));
    const uniqueDistricts = new Set(locations.map(loc => loc.district));
    const uniqueAreas = new Set(locations.map(loc => loc.area));
    
    setStats({
      total: locations.length,
      divisions: uniqueDivisions.size,
      districts: uniqueDistricts.size,
      areas: uniqueAreas.size
    });
  };

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
      console.error('Error saving location:', error);
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
      console.error('Error deleting location:', error);
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
    if (!bulkInput.trim()) {
      setError('Please enter location data');
      return;
    }

    setBulkResult(null);
    try {
      let locationsData;
      try {
        locationsData = JSON.parse(bulkInput);
      } catch (parseError) {
        setBulkResult({ added: 0, skipped: 0, error: 'Invalid JSON format' });
        return;
      }

      const res = await fetch('/api/locations/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationsData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setBulkResult({ 
          added: data.added, 
          skipped: data.skipped,
          errors: data.errors 
        });
        setBulkInput('');
        fetchLocations();
      } else {
        setBulkResult({ added: 0, skipped: 0, error: data.error || 'Bulk add failed' });
      }
    } catch (err) {
      console.error('Bulk add error:', err);
      setBulkResult({ added: 0, skipped: 0, error: 'Bulk add failed' });
    }
  };

  // Remove Duplicates Handler
  const handleRemoveDuplicates = async () => {
    if (!confirm('Are you sure you want to remove duplicate locations? This action cannot be undone.')) {
      return;
    }

    setRemovingDuplicates(true);
    setDuplicateResult(null);
    
    try {
      const response = await fetch('/api/locations/remove-duplicates', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDuplicateResult({ 
          removed: data.removed, 
          remaining: data.remaining 
        });
        fetchLocations();
      } else {
        setDuplicateResult({ 
          removed: 0, 
          remaining: 0, 
          error: data.error || 'Failed to remove duplicates' 
        });
      }
    } catch (error) {
      console.error('Remove duplicates error:', error);
      setDuplicateResult({ 
        removed: 0, 
        remaining: 0, 
        error: 'Failed to remove duplicates' 
      });
    } finally {
      setRemovingDuplicates(false);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = !searchTerm || 
      location.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.subarea && location.subarea.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDivision = !selectedDivision || location.division === selectedDivision;
    const matchesDistrict = !selectedDistrict || location.district === selectedDistrict;
    
    return matchesSearch && matchesDivision && matchesDistrict;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
            <p className="text-gray-600">Manage location data for tuitions and tutors</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.divisions}</div>
            <div className="text-sm text-gray-600">Divisions</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.districts}</div>
            <div className="text-sm text-gray-600">Districts</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{stats.areas}</div>
            <div className="text-sm text-gray-600">Areas</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
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
                <Trash2 className="w-4 h-4" />
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

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <LocationSelector
                value={formData}
                onChange={setFormData}
                required={true}
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
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bulk Add Results */}
        {bulkResult && (
          <div className={`p-4 rounded-lg ${
            bulkResult.error ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            {bulkResult.error ? (
              <p>Error: {bulkResult.error}</p>
            ) : (
              <div>
                <p>Added: {bulkResult.added}, Skipped (duplicates): {bulkResult.skipped}</p>
                {bulkResult.errors && bulkResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Errors:</p>
                    <ul className="list-disc list-inside text-sm">
                      {bulkResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Duplicate Removal Results */}
        {duplicateResult && (
          <div className={`p-4 rounded-lg ${
            duplicateResult.error ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            {duplicateResult.error ? (
              <p>Error: {duplicateResult.error}</p>
            ) : (
              <p>Removed: {duplicateResult.removed}, Remaining: {duplicateResult.remaining}</p>
            )}
          </div>
        )}

        {/* Locations Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Loading locations...
                    </td>
                  </tr>
                ) : filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No locations found
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((location) => (
                    <tr key={location._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {location.formatted || `${location.area}, ${location.district}, ${location.division}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white px-6 py-3 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
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
                <p className="text-sm text-gray-500 mt-1">
                  Format: Array of objects with division, district, area, and optional subarea fields
                </p>
              </div>
              
              {bulkResult && (
                <div className={`p-3 rounded-lg mb-4 ${
                  bulkResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {bulkResult.error ? (
                    <p>Error: {bulkResult.error}</p>
                  ) : (
                    <div>
                      <p>Added: {bulkResult.added}, Skipped (duplicates): {bulkResult.skipped}</p>
                      {bulkResult.errors && bulkResult.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Errors:</p>
                          <ul className="list-disc list-inside text-sm">
                            {bulkResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Locations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 