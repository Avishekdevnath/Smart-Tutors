'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import TutorEditForm from '@/components/TutorEditForm';
import Toast, { useToast } from '@/components/Toast';
import { Search, Filter, SortAsc, SortDesc, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, GraduationCap, MessageSquare } from 'lucide-react';

interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  fatherName?: string;
  fatherNumber?: string;
  version?: string;
  group?: string;
  academicQualifications?: {
    sscResult?: string;
    hscResult?: string;
    oLevelResult?: string;
    aLevelResult?: string;
  };
  schoolName?: string;
  collegeName?: string;
  university?: string;
  universityShortForm?: string;
  department?: string;
  yearAndSemester?: string;
  preferredSubjects?: string[];
  preferredLocation?: string[];
  experience?: string;
  documents?: {
    nidPhoto?: string;
    studentIdPhoto?: string;
  };
  profileStatus: string; // Changed from status to profileStatus
  mediaFeeHistory?: {
    date?: string;
    amount?: number;
    description?: string;
    dueDate?: string;
    status?: string;
  }[];
  gender?: string;
  location?: {
    division?: string;
    district?: string;
    area?: string;
  };
  totalApplications?: number;
  successfulTuitions?: number;
  createdAt: string;
}

export default function TutorsDashboardPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [versionFilter, setVersionFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewModal, setViewModal] = useState<Tutor | null>(null);
  const [editModal, setEditModal] = useState<Tutor | null>(null);
  const [deleteModal, setDeleteModal] = useState<Tutor | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [smsModal, setSmsModal] = useState(false);
  const [selectedTutors, setSelectedTutors] = useState<Tutor[]>([]);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tutors');
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      showToast('Failed to fetch tutors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tutor: Tutor) => {
    setEditModal(tutor);
  };

  const handleSaveEdit = async (data: any) => {
    if (!editModal) return;
    
    try {
      setEditLoading(true);
      const response = await fetch(`/api/tutors/${editModal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        showToast('Tutor updated successfully', 'success');
        fetchTutors();
        setEditModal(null);
      } else {
        showToast(result.error || 'Failed to update tutor', 'error');
      }
    } catch (error) {
      console.error('Error updating tutor:', error);
      showToast('Error updating tutor', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.tutorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.phone.includes(searchTerm) ||
                         (tutor.email && tutor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tutor.address && tutor.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tutor.universityShortForm && tutor.universityShortForm.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || tutor.profileStatus === statusFilter;
    const matchesVersion = versionFilter === 'all' || tutor.version === versionFilter;
    const matchesGroup = groupFilter === 'all' || tutor.group === groupFilter;

    return matchesSearch && matchesStatus && matchesVersion && matchesGroup;
  });

  const sortedTutors = [...filteredTutors].sort((a, b) => {
    let aValue: any = a[sortField as keyof Tutor];
    let bValue: any = b[sortField as keyof Tutor];
    
    if (sortField === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }
    
    if (aValue === undefined) aValue = '';
    if (bValue === undefined) bValue = '';
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVersionColor = (version: string) => {
    switch (version) {
      case 'EM': return 'bg-blue-100 text-blue-800';
      case 'BM': return 'bg-green-100 text-green-800';
      case 'EV': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'Science': return 'bg-cyan-100 text-cyan-800';
      case 'Arts': return 'bg-pink-100 text-pink-800';
      case 'Commerce': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVersionFilter('all');
    setGroupFilter('all');
    setSortField('createdAt');
    setSortOrder('desc');
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    
    try {
      const response = await fetch(`/api/tutors/${deleteModal._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showToast('Tutor deleted successfully', 'success');
        fetchTutors();
        setDeleteModal(null);
      } else {
        showToast('Failed to delete tutor', 'error');
      }
    } catch (error) {
      showToast('Error deleting tutor', 'error');
    }
  };

  // SMS Functions
  const handleSendSMS = () => {
    if (selectedTutors.length === 0) {
      showToast('Please select at least one tutor to send SMS', 'error');
      return;
    }
    setSmsModal(true);
  };

  const handleSMSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!smsMessage.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    if (selectedTutors.length === 0) {
      showToast('No tutors selected', 'error');
      return;
    }

    try {
      setSmsLoading(true);
      
      const phoneNumbers = selectedTutors.map(tutor => tutor.phone);
      
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-bulk-same',
          numbers: phoneNumbers,
          message: smsMessage
        })
      });

      const result = await response.json();

      if (result.success) {
        showToast(`SMS sent successfully to ${selectedTutors.length} tutors!`, 'success');
        setSmsModal(false);
        setSmsMessage('');
        setSelectedTutors([]);
      } else {
        showToast(result.error || 'Failed to send SMS', 'error');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      showToast('Failed to send SMS', 'error');
    } finally {
      setSmsLoading(false);
    }
  };

  const toggleTutorSelection = (tutor: Tutor) => {
    setSelectedTutors(prev => {
      const isSelected = prev.some(t => t._id === tutor._id);
      if (isSelected) {
        return prev.filter(t => t._id !== tutor._id);
      } else {
        return [...prev, tutor];
      }
    });
  };

  const selectAllTutors = () => {
    setSelectedTutors(sortedTutors);
  };

  const clearSelection = () => {
    setSelectedTutors([]);
  };

  return (
    <DashboardLayout 
      title="Tutor Management" 
      description="Manage and monitor all registered tutors in the system"
    >
      {/* Header Section - Desktop Horizontal, Mobile Vertical */}
      <div className="mb-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tutor Management</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSortField('createdAt'); setSortOrder('desc'); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  sortField === 'createdAt' && sortOrder === 'desc'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Latest Tutors
              </button>
              <button
                onClick={() => { setSortField('name'); setSortOrder('asc'); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  sortField === 'name' && sortOrder === 'asc'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Name A-Z
              </button>
            </div>
          </div>
          <Link href="/dashboard/tutors/register">
            <button className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add New Tutor</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Desktop 4 columns, Mobile 2 columns */}
      <div className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-purple-100">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Tutors</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{tutors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-green-100">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Active</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {tutors.filter(t => t.profileStatus === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-yellow-100">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Inactive</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {tutors.filter(t => t.profileStatus === 'inactive').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-red-100">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Suspended</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {tutors.filter(t => t.profileStatus === 'suspended').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tutors by name, ID, phone, email, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Versions</option>
              <option value="EM">English Medium</option>
              <option value="BM">Bangla Medium</option>
              <option value="EV">English Version</option>
            </select>

            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Groups</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
              <option value="Commerce">Commerce</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* SMS Selection Controls */}
      {sortedTutors.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllTutors}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Select All ({sortedTutors.length})
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
              {selectedTutors.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedTutors.length} tutor(s) selected
                </span>
              )}
            </div>
            {selectedTutors.length > 0 && (
              <button
                onClick={handleSendSMS}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send SMS ({selectedTutors.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tutors Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedTutors.length === sortedTutors.length && sortedTutors.length > 0}
                  onChange={() => selectedTutors.length === sortedTutors.length ? clearSelection() : selectAllTutors()}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tutor ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Version</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">University</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <span className="text-gray-600">Loading tutors...</span>
                </td>
              </tr>
            ) : (
              sortedTutors.map((tutor) => (
                <tr key={tutor._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTutors.some(t => t._id === tutor._id)}
                      onChange={() => toggleTutorSelection(tutor)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{tutor.tutorId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tutor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tutor.version ? (
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getVersionColor(tutor.version)}`}>{tutor.version}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tutor.universityShortForm || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tutor.profileStatus)}`}>{tutor.profileStatus}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setViewModal(tutor)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(tutor)}
                        className="text-green-600 hover:text-green-900 text-sm font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                        title="Edit Tutor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal(tutor)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Tutor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {/* Empty State */}
            {!loading && sortedTutors.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' || versionFilter !== 'all' || groupFilter !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'Get started by adding your first tutor.'}
                  </p>
                  {!searchTerm && statusFilter === 'all' && versionFilter === 'all' && groupFilter === 'all' && (
                    <div className="mt-6">
                      <Link href="/dashboard/tutors/register">
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          Add First Tutor
                        </button>
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tutors Card List (Mobile) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <span className="text-gray-600">Loading tutors...</span>
          </div>
        ) : (
          sortedTutors.map((tutor) => (
            <div key={tutor._id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={selectedTutors.some(t => t._id === tutor._id)}
                  onChange={() => toggleTutorSelection(tutor)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-mono text-sm text-gray-500">{tutor.tutorId}</span>
                <span className="font-semibold text-gray-900 text-base flex-1 truncate">{tutor.name}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                <span className={`inline-flex px-2 py-1 rounded-full font-medium ${getVersionColor(tutor.version || '')}`}>{tutor.version || '-'}</span>
                <span className="inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tutor.universityShortForm || '-'}</span>
                <span className={`inline-flex px-2 py-1 rounded-full font-medium ${getStatusColor(tutor.profileStatus)}`}>{tutor.profileStatus}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setViewModal(tutor)}
                  className="flex-1 text-blue-600 hover:text-blue-900 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 inline" /> View
                </button>
                <button
                  onClick={() => handleEdit(tutor)}
                  className="flex-1 text-green-600 hover:text-green-900 text-xs font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                  title="Edit Tutor"
                >
                  <Edit className="w-4 h-4 inline" /> Edit
                </button>
                <button
                  onClick={() => setDeleteModal(tutor)}
                  className="flex-1 text-red-600 hover:text-red-900 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete Tutor"
                >
                  <Trash2 className="w-4 h-4 inline" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
        {/* Empty State */}
        {!loading && sortedTutors.length === 0 && (
          <div className="bg-white rounded-lg shadow text-center py-12 px-4">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || versionFilter !== 'all' || groupFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first tutor.'}
            </p>
            {!searchTerm && statusFilter === 'all' && versionFilter === 'all' && groupFilter === 'all' && (
              <div className="mt-6">
                <Link href="/dashboard/tutors/register">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Add First Tutor
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModal && (
        <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)}>
          <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto p-8">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-2">
                <span className="text-white text-4xl font-bold">{viewModal.name.charAt(0)}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{viewModal.name}</h2>
              <span className="text-base text-gray-500">{viewModal.tutorId}</span>
            </div>
            {/* Contact Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Contact</h3>
              <div className="space-y-3 text-base">
                <p><span className="font-medium">Phone:</span> {viewModal.phone || '—'}</p>
                <p><span className="font-medium">Email:</span> {viewModal.email || '—'}</p>
                <p><span className="font-medium">Address:</span> {viewModal.address || '—'}</p>
                <p><span className="font-medium">Father's Name:</span> {viewModal.fatherName || '—'}</p>
                <p><span className="font-medium">Father's Number:</span> {viewModal.fatherNumber || '—'}</p>
                <p><span className="font-medium">Gender:</span> {viewModal.gender || '—'}</p>
              </div>
            </div>
            {/* Academic Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Academic</h3>
              <div className="space-y-3 text-base">
                <p><span className="font-medium">Version:</span> {viewModal.version || '—'}</p>
                <p><span className="font-medium">Group:</span> {viewModal.group || '—'}</p>
                <p><span className="font-medium">SSC Result:</span> {viewModal.academicQualifications?.sscResult || '—'}</p>
                <p><span className="font-medium">HSC Result:</span> {viewModal.academicQualifications?.hscResult || '—'}</p>
                <p><span className="font-medium">O-Level Result:</span> {viewModal.academicQualifications?.oLevelResult || '—'}</p>
                <p><span className="font-medium">A-Level Result:</span> {viewModal.academicQualifications?.aLevelResult || '—'}</p>
                <p><span className="font-medium">School Name:</span> {viewModal.schoolName || '—'}</p>
                <p><span className="font-medium">College Name:</span> {viewModal.collegeName || '—'}</p>
                <p><span className="font-medium">University:</span> {viewModal.university || '—'}</p>
                <p><span className="font-medium">University Short Form:</span> {viewModal.universityShortForm || '—'}</p>
                <p><span className="font-medium">Department:</span> {viewModal.department || '—'}</p>
                <p><span className="font-medium">Year & Semester:</span> {viewModal.yearAndSemester || '—'}</p>
                <p><span className="font-medium">Preferred Subjects:</span> {viewModal.preferredSubjects && viewModal.preferredSubjects.length > 0 ? viewModal.preferredSubjects.join(', ') : '—'}</p>
                <p><span className="font-medium">Experience:</span> {viewModal.experience || '—'}</p>
              </div>
            </div>
            {/* Location Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Location</h3>
              <div className="space-y-3 text-base">
                <p><span className="font-medium">Division:</span> {viewModal.location?.division || '—'}</p>
                <p><span className="font-medium">District:</span> {viewModal.location?.district || '—'}</p>
                <p><span className="font-medium">Area:</span> {viewModal.location?.area || '—'}</p>
                <p><span className="font-medium">Preferred Locations:</span> {viewModal.preferredLocation && viewModal.preferredLocation.length > 0 ? viewModal.preferredLocation.join(', ') : '—'}</p>
              </div>
            </div>
            {/* Documents Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Documents</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-medium">NID Photo:</span>
                  {viewModal.documents?.nidPhoto ? (
                    <div className="mt-2">
                      <img 
                        src={viewModal.documents.nidPhoto} 
                        alt="NID Photo" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                      />
                      <a 
                        href={viewModal.documents.nidPhoto} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 inline-block"
                      >
                        View Full Size
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-500 ml-2">Not uploaded</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">Student ID Photo:</span>
                  {viewModal.documents?.studentIdPhoto ? (
                    <div className="mt-2">
                      <img 
                        src={viewModal.documents.studentIdPhoto} 
                        alt="Student ID Photo" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                      />
                      <a 
                        href={viewModal.documents.studentIdPhoto} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 inline-block"
                      >
                        View Full Size
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-500 ml-2">Not uploaded</span>
                  )}
                </div>
              </div>
            </div>
            {/* Status & History */}
            <div className="border-t pt-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Status & History</h3>
              <div className="space-y-3 text-base">
                <p><span className="font-medium">Profile Status:</span> <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(viewModal.profileStatus)}`}>{viewModal.profileStatus}</span></p>
                <p><span className="font-medium">Joined:</span> {viewModal.createdAt ? new Date(viewModal.createdAt).toLocaleDateString() : '—'}</p>
                <div>
                  <span className="font-medium">Media Fee History:</span>
                  {viewModal.mediaFeeHistory && viewModal.mediaFeeHistory.length > 0 ? (
                    <ul className="list-disc ml-6 mt-1 space-y-1">
                      {viewModal.mediaFeeHistory.map((fee, idx) => (
                        <li key={idx} className="text-sm">
                          <span>Date:</span> {fee.date ? new Date(fee.date).toLocaleDateString() : '—'} | <span>Amount:</span> {fee.amount || '—'} | <span>Description:</span> {fee.description || '—'} | <span>Due:</span> {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '—'} | <span>Status:</span> {fee.status || '—'}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span> —</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editModal && (
        <Modal isOpen={!!editModal} onClose={() => setEditModal(null)}>
          <div className="bg-white rounded-lg shadow-lg max-w-lg mx-auto p-6">
            <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><Edit className="w-6 h-6" /> Edit Tutor</h2>
            <TutorEditForm
              tutor={editModal}
              onSave={handleSaveEdit}
              onCancel={() => setEditModal(null)}
              loading={editLoading}
            />
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
            <div className="flex items-center mb-4">
              <Trash2 className="w-8 h-8 text-red-500 mr-3" />
              <h2 className="text-xl font-bold text-red-600">Delete Tutor</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete tutor <strong>{deleteModal.name}</strong> ({deleteModal.tutorId})? This action cannot be undone.
            </p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Tutor
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SMS Modal */}
      {smsModal && (
        <Modal isOpen={smsModal} onClose={() => setSmsModal(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-8 h-8 text-purple-500 mr-3" />
              <h2 className="text-xl font-bold text-purple-600">Send SMS to Selected Tutors</h2>
            </div>
            <form onSubmit={handleSMSSubmit} className="space-y-4">
              <div>
                <label htmlFor="smsMessage" className="block text-sm font-medium text-gray-700">Message:</label>
                <textarea
                  id="smsMessage"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your SMS message here..."
                  required
                ></textarea>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setSmsModal(false)}
                  className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={smsLoading}
                >
                  {smsLoading ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
} 