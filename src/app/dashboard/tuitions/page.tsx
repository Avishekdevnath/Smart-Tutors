'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import TuitionPostGenerator from '@/components/TuitionPostGenerator';
import { formatLocation, formatAddress } from '@/utils/location';
import Modal from '@/components/Modal';
import TuitionEditForm from '@/components/TuitionEditForm';
import Toast, { useToast } from '@/components/Toast';
import { SortAsc, SortDesc } from 'lucide-react';
import TuitionSearchSortBar from '@/components/TuitionSearchSortBar';
import { CopyTuitionGuardianInfo } from '@/components/CopyButton';

interface Tuition {
  _id: string;
  code: string;
  // Guardian Information
  guardianName: string;
  guardianNumber: string;
  guardianAddress?: string;
  
  // Student Information
  class: string;
  version: 'Bangla Medium' | 'English Medium' | 'English Version' | 'Others';
  subjects: string[];
  weeklyDays: string;
  dailyHours?: string; // Changed from weeklyHours
  salary: string;
  location?: string;
  startMonth?: string;
  
  // Special Requirements
  tutorGender: string;
  specialRemarks?: string;
  urgent?: boolean;
  
  // Legacy fields
  weeklyHours?: string; // Keep for backward compatibility
  confirmedSalary: number;
  salaryConfirmed: boolean;
  tutorRequirement: string;
  specificLocation: string;
  description: string;
  guardian?: {
    _id: string;
    name: string;
    number: string;
  };
  applications: Array<{
    tutorId: string;
    appliedDate: string;
  }>;
  selectedTutor?: {
    tutorId: string;
    selectionDate: string;
  };
  status: 'open' | 'available' | 'demo running' | 'booked' | 'booked by other';
  createdAt: string;
}

export default function TuitionManagementDashboard() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [versionFilter, setVersionFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTuitionForPosts, setSelectedTuitionForPosts] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<Tuition | null>(null);
  const [editModal, setEditModal] = useState<Tuition | null>(null);
  const [deleteModal, setDeleteModal] = useState<Tuition | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchTuitions();
  }, [currentPage, statusFilter, versionFilter, classFilter, sortField, sortOrder]);

  const fetchTuitions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: sortField,
        order: sortOrder,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(versionFilter !== 'all' && { version: versionFilter }),
        ...(classFilter !== 'all' && { class: classFilter }),
      });
      
      const response = await fetch(`/api/tuitions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTuitions(data);
        setTotalPages(Math.ceil(data.length / 10));
      }
    } catch (error) {
      console.error('Error fetching tuitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTuitions = tuitions.filter(tuition => {
    const formattedLocation = formatLocation(tuition.location);
    const formattedAddress = formatAddress(tuition.guardianAddress);
    
    const matchesSearch = tuition.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tuition.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(tuition.subjects) && tuition.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                         tuition.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tuition.guardianNumber.includes(searchTerm) ||
                         formattedLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formattedAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tuition.specificLocation && tuition.specificLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || tuition.status === statusFilter;
    const matchesVersion = versionFilter === 'all' || tuition.version === versionFilter;
    const matchesClass = classFilter === 'all' || tuition.class === classFilter;

    return matchesSearch && matchesStatus && matchesVersion && matchesClass;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'demo running': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      case 'booked by other': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVersionColor = (version: string) => {
    switch (version) {
      case 'English Medium': return 'bg-blue-100 text-blue-800';
      case 'Bangla Medium': return 'bg-green-100 text-green-800';
      case 'English Version': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueClasses = () => {
    const classes = new Set<string>();
    tuitions.forEach(tuition => {
      if (tuition.class) {
        classes.add(tuition.class);
      }
    });
    return Array.from(classes).sort();
  };

  const getSortFieldLabel = (field: string) => {
    switch (field) {
      case 'createdAt': return 'Latest Tuitions';
      case 'code': return 'Code';
      case 'guardianName': return 'Guardian Name';
      case 'guardianNumber': return 'Guardian Number';
      case 'class': return 'Class';
      case 'version': return 'Version';
      case 'salary': return 'Salary';
      case 'urgent': return 'Urgent Status';
      default: return field;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVersionFilter('all');
    setClassFilter('all');
    setSortField('createdAt');
    setSortOrder('desc');
  };

  // Edit handler
  const onEdit = (tuition: Tuition) => {
    setEditModal(tuition);
  };

  // Save edit
  const onSaveEdit = async (data: any) => {
    if (!editModal) return;
    
    setEditLoading(true);
    try {
      const res = await fetch(`/api/tuitions/${editModal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setEditModal(null);
          fetchTuitions();
          showToast('Tuition updated successfully!', 'success');
        } else {
          showToast(result.error || 'Update failed', 'error');
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Error updating tuition:', error);
      showToast('An error occurred while updating', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete handler
  const onDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await fetch(`/api/tuitions/${deleteModal._id}`, { method: 'DELETE' });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setDeleteModal(null);
          fetchTuitions();
          showToast('Tuition deleted successfully!', 'success');
        } else {
          showToast(result.error || 'Delete failed', 'error');
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Delete failed', 'error');
      }
    } catch (error) {
      console.error('Error deleting tuition:', error);
      showToast('An error occurred while deleting', 'error');
    }
  };

  return (
    <DashboardLayout 
      title="Tuition Management" 
      description="Manage and monitor all tuition assignments in the system"
    >
      {/* Header Section - Desktop Horizontal, Mobile Vertical */}
      <div className="mb-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tuition Management</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSort('createdAt')}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  sortField === 'createdAt' && sortOrder === 'desc'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Latest Tuitions
              </button>
              <button
                onClick={() => handleSort('urgent')}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  sortField === 'urgent' && sortOrder === 'desc'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Urgent First
              </button>
              <button
                onClick={() => handleSort('salary')}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  sortField === 'salary' && sortOrder === 'desc'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                High Salary
              </button>
            </div>
          </div>
          <Link href="/dashboard/tuitions/add">
            <button className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New Tuition</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Unified Search, Filter, Sort Bar */}
      <TuitionSearchSortBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        versionFilter={versionFilter}
        onVersionFilterChange={setVersionFilter}
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        classOptions={getUniqueClasses()}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={clearFilters}
        hasActiveFilters={Boolean(
          searchTerm ||
          statusFilter !== 'all' ||
          versionFilter !== 'all' ||
          classFilter !== 'all' ||
          sortField !== 'createdAt' ||
          sortOrder !== 'desc'
        )}
      />

      {/* Stats Cards - Desktop 4 columns, Mobile 2 columns */}
      <div className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-purple-100">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Tuitions</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{tuitions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-green-100">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Open</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {tuitions.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-blue-100">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Demo Running</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {tuitions.filter(t => t.status === 'demo running').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-purple-100">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Booked</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {tuitions.filter(t => t.status === 'booked').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tuitions Grid */}
        <div className="space-y-4 lg:space-y-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tuitions...</p>
            </div>
          ) : (
            filteredTuitions.map((tuition) => (
              <div key={tuition._id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Tuition Header - Desktop Horizontal, Mobile Vertical */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 lg:px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center relative flex-shrink-0">
                        <span className="text-white font-bold text-sm lg:text-lg">
                          {tuition.code.slice(-2)}
                        </span>
                        {/* Sort indicator */}
                        {sortField === 'code' && (
                          <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-1">
                            {sortOrder === 'desc' ? (
                              <svg className="w-2 h-2 lg:w-3 lg:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            ) : (
                              <svg className="w-2 h-2 lg:w-3 lg:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4M7 20v-4m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex flex-wrap items-center gap-2">
                          <span>{tuition.code}</span>
                          {sortField === 'createdAt' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {sortOrder === 'desc' ? (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                  Latest
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4M7 20v-4m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                  Oldest
                                </>
                              )}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tuition.urgent && (
                            <span className="inline-flex items-center space-x-1 text-red-600 font-medium mr-2">
                              <span>🚨 URGENT</span>
                              {sortField === 'urgent' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                                  {sortOrder === 'desc' ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4M7 20v-4m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                  )}
                                </span>
                              )}
                            </span>
                          )}
                          {tuition.class} • {tuition.version}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action buttons - Desktop Horizontal, Mobile Vertical */}
                    <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
                      <div className="flex items-center space-x-2">
                        <select
                          value={tuition.status}
                          onChange={async (e) => {
                            try {
                              const res = await fetch(`/api/tuitions/${tuition._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: e.target.value }),
                              });
                              if (res.ok) {
                                const result = await res.json();
                                if (result.success) {
                                  fetchTuitions();
                                  showToast(`Status updated to ${e.target.value}`, 'success');
                                } else {
                                  showToast(result.error || 'Status update failed', 'error');
                                }
                              } else {
                                const errorData = await res.json();
                                showToast(errorData.error || 'Status update failed', 'error');
                              }
                            } catch (error) {
                              console.error('Error updating status:', error);
                              showToast('An error occurred while updating status', 'error');
                            }
                          }}
                          className={`px-3 py-2 text-sm font-semibold rounded-full border-0 focus:ring-2 focus:ring-purple-500 min-w-0 ${getStatusColor(tuition.status)}`}
                        >
                          <option value="open">Open</option>
                          <option value="available">Available</option>
                          <option value="demo running">Demo Running</option>
                          <option value="booked">Booked</option>
                          <option value="booked by other">Booked by Other</option>
                        </select>
                      </div>
                      <button
                        onClick={() => setSelectedTuitionForPosts(selectedTuitionForPosts === tuition._id ? null : tuition._id)}
                        className="w-full lg:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {selectedTuitionForPosts === tuition._id ? 'Hide Posts' : 'Generate Posts'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tuition Details - Desktop 3 columns, Mobile 1 column */}
                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Guardian Information */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Guardian Information</h4>
                        <CopyTuitionGuardianInfo
                          tuitionCode={tuition.code}
                          guardianName={tuition.guardianName}
                          guardianNumber={tuition.guardianNumber}
                          size="sm"
                          variant="primary"
                        />
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
                          <span className="font-medium">Name:</span>
                          <span className="flex items-center space-x-1">
                            <span className="break-words">{tuition.guardianName}</span>
                            {sortField === 'guardianName' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800 flex-shrink-0">
                                {sortOrder === 'desc' ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4M7 20v-4m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </span>
                        </p>
                        <p className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
                          <span className="font-medium">Number:</span>
                          <span className="flex items-center space-x-1">
                            <span className="break-all">{tuition.guardianNumber}</span>
                            {sortField === 'guardianNumber' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800 flex-shrink-0">
                                {sortOrder === 'desc' ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4M7 20v-4m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </span>
                        </p>
                        {tuition.guardianAddress && (
                          <p className="break-words"><span className="font-medium">Address:</span> {formatAddress(tuition.guardianAddress)}</p>
                        )}
                      </div>
                    </div>

                    {/* Academic Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Academic Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="break-words"><span className="font-medium">Subjects:</span> {Array.isArray(tuition.subjects) ? tuition.subjects.join(', ') : tuition.subjects || 'Not specified'}</p>
                        <p className="break-words"><span className="font-medium">Schedule:</span> {tuition.weeklyDays}{tuition.dailyHours ? ` (${tuition.dailyHours} hours daily)` : tuition.weeklyHours ? ` (${tuition.weeklyHours} hours)` : ''}</p>
                        {tuition.location && (
                          <p className="break-words"><span className="font-medium">Location:</span> {formatLocation(tuition.location)}</p>
                        )}
                        {tuition.startMonth && (
                          <p><span className="font-medium">Start:</span> {tuition.startMonth}</p>
                        )}
                      </div>
                    </div>

                    {/* Financial & Requirements */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial & Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
                          <span className="font-medium">Salary:</span>
                          <span className="flex items-center space-x-1">
                            <span className="break-words">{tuition.salary}</span>
                            {sortField === 'salary' && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 flex-shrink-0">
                                {sortOrder === 'desc' ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V4m0 0l-4 4m4-4l4 4M7 20v-4m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </span>
                        </p>
                        {tuition.tutorGender && tuition.tutorGender !== 'Not specified' && (
                          <p><span className="font-medium">Gender:</span> {tuition.tutorGender}</p>
                        )}
                        {tuition.specialRemarks && (
                          <p className="break-words"><span className="font-medium">Remarks:</span> {tuition.specialRemarks}</p>
                        )}
                        <p><span className="font-medium">Applications:</span> {Array.isArray(tuition.applications) ? tuition.applications.length : 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Desktop Horizontal, Mobile Vertical */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                      <div className="flex flex-col space-y-1 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 text-sm text-gray-600">
                        <span>Created: {new Date(tuition.createdAt).toLocaleDateString()}</span>
                        {tuition.selectedTutor && (
                          <span className="text-green-600 font-medium">✓ Tutor Selected</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 lg:space-x-2">
                        <Link
                          href={`/tuition/${tuition.code}`}
                          target="_blank"
                          className="text-purple-600 hover:text-purple-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          View Public Page
                        </Link>
                        <button 
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors" 
                          onClick={() => setViewModal(tuition)}
                        >
                          View Details
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-colors" 
                          onClick={() => onEdit(tuition)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors" 
                          onClick={() => setDeleteModal(tuition)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Posts */}
                {selectedTuitionForPosts === tuition._id && (
                  <div className="border-t border-gray-200 p-4 lg:p-6 bg-gray-50">
                    <TuitionPostGenerator tuition={tuition} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredTuitions.length === 0 && (
          <div className="bg-white rounded-lg shadow text-center py-12 px-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tuitions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || versionFilter !== 'all' || classFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding a new tuition.'}
            </p>
            <div className="mt-6">
              <Link href="/dashboard/tuitions/add">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 touch-target">
                  Add New Tuition
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Tuition Details">
        {viewModal && (
          <div className="space-y-3">
            <p><b>Code:</b> {viewModal.code}</p>
            <p><b>Guardian:</b> {viewModal.guardianName} ({viewModal.guardianNumber})</p>
            <p><b>Class:</b> {viewModal.class}</p>
            <p><b>Version:</b> {viewModal.version}</p>
            <p><b>Subjects:</b> {Array.isArray(viewModal.subjects) ? viewModal.subjects.join(', ') : viewModal.subjects || 'Not specified'}</p>
            <p><b>Schedule:</b> {viewModal.weeklyDays} {viewModal.dailyHours || viewModal.weeklyHours}</p>
            <p><b>Salary:</b> {viewModal.salary}</p>
            <p><b>Status:</b> {viewModal.status}</p>
            <p><b>Location:</b> {formatLocation(viewModal.location)}</p>
            <p><b>Remarks:</b> {viewModal.specialRemarks}</p>
            <p><b>Created:</b> {new Date(viewModal.createdAt).toLocaleString()}</p>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={!!editModal} 
        onClose={() => setEditModal(null)} 
        title="Edit Tuition" 
        size="large"
      >
        {editModal && (
          <TuitionEditForm
            tuition={editModal}
            onSubmit={onSaveEdit}
            onCancel={() => setEditModal(null)}
            loading={editLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" actions={
        <>
          <button className="bg-gray-200 px-4 py-2 rounded touch-target" onClick={() => setDeleteModal(null)}>No</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded touch-target" onClick={onDelete}>Yes, Delete</button>
        </>
      }>
        <p>Are you sure you want to delete this tuition?</p>
        {deleteModal && <p className="text-sm text-gray-500 mt-2">{deleteModal.code} - {deleteModal.class} ({deleteModal.guardianName})</p>}
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <style jsx>{`
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
      `}</style>
    </DashboardLayout>
  );
} 