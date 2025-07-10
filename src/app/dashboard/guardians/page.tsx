'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import GuardianEditForm from '@/components/GuardianEditForm';
import GuardianSearchSortBar from '@/components/GuardianSearchSortBar';
import Toast, { useToast } from '@/components/Toast';
import { CopyGuardianInfo } from '@/components/CopyButton';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Guardian {
  _id: string;
  name: string;
  number: string;
  address: string;
  tuitionCount?: number;
  createdAt: string;
}

export default function GuardianManagementDashboard() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewModal, setViewModal] = useState<Guardian | null>(null);
  const [editModal, setEditModal] = useState<Guardian | null>(null);
  const [deleteModal, setDeleteModal] = useState<Guardian | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchGuardians();
  }, [sortField, sortOrder]);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: sortField,
        order: sortOrder,
        ...(searchTerm && { search: searchTerm }),
      });
      
      const response = await fetch(`/api/guardians?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGuardians(data);
      }
    } catch (error) {
      console.error('Error fetching guardians:', error);
      showToast('Failed to fetch guardians', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredGuardians = guardians.filter(guardian => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return guardian.name.toLowerCase().includes(searchLower) ||
           guardian.number.includes(searchTerm) ||
           guardian.address.toLowerCase().includes(searchLower);
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSortField('createdAt');
    setSortOrder('desc');
    fetchGuardians();
  };

  // Edit handler
  const onEdit = (guardian: Guardian) => {
    setEditModal(guardian);
  };

  // Save edit
  const onSaveEdit = async (data: any) => {
    if (!editModal) return;
    
    setEditLoading(true);
    try {
      const res = await fetch(`/api/guardians/${editModal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setEditModal(null);
          fetchGuardians();
          showToast('Guardian updated successfully!', 'success');
        } else {
          showToast(result.error || 'Update failed', 'error');
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Error updating guardian:', error);
      showToast('An error occurred while updating', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete handler
  const onDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await fetch(`/api/guardians/${deleteModal._id}`, { method: 'DELETE' });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setDeleteModal(null);
          fetchGuardians();
          showToast('Guardian deleted successfully!', 'success');
        } else {
          showToast(result.error || 'Delete failed', 'error');
        }
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Delete failed', 'error');
      }
    } catch (error) {
      console.error('Error deleting guardian:', error);
      showToast('An error occurred while deleting', 'error');
    }
  };

  return (
    <DashboardLayout 
      title="Guardian Management" 
      description="Manage and monitor all guardians in the system"
    >
      {/* Header with Add Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guardian Management</h1>
          <p className="text-gray-600 mt-1">Total: {guardians.length} guardians</p>
        </div>
        
        <Link
          href="/dashboard/guardians/add"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Guardian
        </Link>
      </div>

      {/* Search and Sort Bar */}
      <GuardianSearchSortBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onClearFilters={clearFilters}
        onSearch={fetchGuardians}
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {/* Guardian Cards */}
          {filteredGuardians.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No guardians found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new guardian.'}
              </p>
              {!searchTerm && (
                <Link
                  href="/dashboard/guardians/add"
                  className="inline-flex items-center px-4 py-2 mt-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add First Guardian
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuardians.map((guardian) => (
                <div key={guardian._id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header with Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900">{guardian.name}</h3>
                          <p className="text-sm text-gray-500">
                            {guardian.tuitionCount || 0} tuition{(guardian.tuitionCount || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      {/* Copy Button */}
                      <CopyGuardianInfo
                        guardianName={guardian.name}
                        guardianNumber={guardian.number}
                        size="sm"
                        variant="primary"
                      />
                    </div>

                    {/* Guardian Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {guardian.number}
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="line-clamp-2">{guardian.address}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Added {new Date(guardian.createdAt).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewModal(guardian)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(guardian)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(guardian)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Guardian Details"
        size="md"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{viewModal.name}</span>
                    <CopyGuardianInfo
                      guardianName={viewModal.name}
                      guardianNumber={viewModal.number}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium">{viewModal.number}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm font-medium text-right max-w-xs">{viewModal.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tuitions Posted:</span>
                  <span className="text-sm font-medium">{viewModal.tuitionCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Joined:</span>
                  <span className="text-sm font-medium">
                    {new Date(viewModal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Guardian"
        size="lg"
      >
        {editModal && (
          <GuardianEditForm
            guardian={editModal}
            onSubmit={onSaveEdit}
            onCancel={() => setEditModal(null)}
            loading={editLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Guardian"
        actions={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        }
      >
        {deleteModal && (
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Guardian
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{deleteModal.name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
} 