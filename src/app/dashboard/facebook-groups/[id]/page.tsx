'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';

interface FacebookGroup {
  _id: string;
  name: string;
  link: string;
  memberCount: number;
  locations: string[];
}

interface FacebookGroupCollection {
  _id: string;
  collectionName: string;
  slug: string;
  groups: FacebookGroup[];
  createdAt: string;
  updatedAt: string;
}

interface GroupFormData {
  name: string;
  link: string;
  memberCount: number;
  locations: string;
}

export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<FacebookGroupCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [showDeleteCollectionModal, setShowDeleteCollectionModal] = useState(false);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FacebookGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<FacebookGroup | null>(null);
  const [collectionName, setCollectionName] = useState('');

  const [groupFormData, setGroupFormData] = useState<GroupFormData>({
    name: '',
    link: '',
    memberCount: 0,
    locations: ''
  });

  // Fetch collection details
  const fetchCollection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/facebook-groups/${collectionId}`);
      const data = await response.json();

      if (response.ok) {
        setCollection(data.data);
        setCollectionName(data.data.collectionName);
      } else {
        setError(data.error || 'Failed to fetch collection');
      }
    } catch (error) {
      setError('An error occurred while fetching collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
    }
  }, [collectionId]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Reset form
  const resetGroupForm = () => {
    setGroupFormData({
      name: '',
      link: '',
      memberCount: 0,
      locations: ''
    });
    setEditingGroup(null);
  };

  // Handle add group
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name.trim() || !groupFormData.link.trim()) {
      setError('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/facebook-groups/${collectionId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupFormData.name.trim(),
          link: groupFormData.link.trim(),
          memberCount: groupFormData.memberCount,
          locations: groupFormData.locations
            .split(',')
            .map(loc => loc.trim())
            .filter(loc => loc.length > 0)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCollection(data.data);
        setShowAddGroupModal(false);
        resetGroupForm();
        setSuccess('Group added successfully!');
      } else {
        setError(data.error || 'Failed to add group');
      }
    } catch (error) {
      setError('An error occurred while adding group');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit group
  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !groupFormData.name.trim() || !groupFormData.link.trim()) {
      setError('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/facebook-groups/${collectionId}/groups/${editingGroup._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupFormData.name.trim(),
          link: groupFormData.link.trim(),
          memberCount: groupFormData.memberCount,
          locations: groupFormData.locations
            .split(',')
            .map(loc => loc.trim())
            .filter(loc => loc.length > 0)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCollection(data.data);
        setShowEditGroupModal(false);
        resetGroupForm();
        setSuccess('Group updated successfully!');
      } else {
        setError(data.error || 'Failed to update group');
      }
    } catch (error) {
      setError('An error occurred while updating group');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/facebook-groups/${collectionId}/groups/${deletingGroup._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setCollection(data.data);
        setShowDeleteGroupModal(false);
        setDeletingGroup(null);
        setSuccess('Group deleted successfully!');
      } else {
        setError(data.error || 'Failed to delete group');
      }
    } catch (error) {
      setError('An error occurred while deleting group');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit collection
  const handleEditCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      setError('Please enter collection name');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/facebook-groups/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName: collectionName.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCollection(data.data);
        setShowEditCollectionModal(false);
        setSuccess('Collection updated successfully!');
      } else {
        setError(data.error || 'Failed to update collection');
      }
    } catch (error) {
      setError('An error occurred while updating collection');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete collection
  const handleDeleteCollection = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/facebook-groups/${collectionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/dashboard/facebook-groups');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete collection');
      }
    } catch (error) {
      setError('An error occurred while deleting collection');
    } finally {
      setSubmitting(false);
    }
  };

  // Open modals
  const openAddGroupModal = () => {
    resetGroupForm();
    setShowAddGroupModal(true);
  };

  const openEditGroupModal = (group: FacebookGroup) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      link: group.link,
      memberCount: group.memberCount,
      locations: group.locations.join(', ')
    });
    setShowEditGroupModal(true);
  };

  const openDeleteGroupModal = (group: FacebookGroup) => {
    setDeletingGroup(group);
    setShowDeleteGroupModal(true);
  };

  const openEditCollectionModal = () => {
    setShowEditCollectionModal(true);
  };

  const openDeleteCollectionModal = () => {
    setShowDeleteCollectionModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." description="Loading collection details...">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !collection) {
    return (
      <DashboardLayout title="Error" description="Failed to load collection">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-3">Error Loading Collection</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/facebook-groups')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Collections
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!collection) {
    return (
      <DashboardLayout title="Not Found" description="Collection not found">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Collection Not Found</h3>
          <p className="text-gray-600 mb-6">The collection you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/dashboard/facebook-groups')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Collections
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={collection.collectionName} 
      description="Collection details and groups"
    >
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => router.push('/dashboard/facebook-groups')}
          className="flex items-center gap-3 text-blue-600 hover:text-blue-800 mb-4 group"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Back to Collections</span>
        </button>
      </div>

      {/* Collection header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{collection.collectionName}</h1>
            <p className="text-gray-600 mb-3">/{collection.slug}</p>
            <p className="text-sm text-gray-500 mb-4">
              Created {new Date(collection.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-4">
              <div className="bg-white rounded-lg px-4 py-2 border border-blue-200">
                <div className="text-lg font-bold text-blue-700">{collection.groups.length}</div>
                <div className="text-sm text-blue-600">Groups</div>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 border border-green-200">
                <div className="text-lg font-bold text-green-700">
                  {(collection.groups.reduce((sum, group) => sum + group.memberCount, 0) / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-green-600">Total Members</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={openAddGroupModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              title="Add Group"
            >
              + Add Group
            </button>
            <button 
              onClick={openEditCollectionModal}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              title="Edit Collection"
            >
              Edit Collection
            </button>
            <button 
              onClick={openDeleteCollectionModal}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              title="Delete Collection"
            >
              Delete Collection
            </button>
          </div>
        </div>
      </div>

      {/* Groups list */}
      <div className="grid gap-6">
        {collection.groups.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No groups found</h3>
            <p className="text-gray-600 mb-6">This collection doesn't have any groups yet.</p>
            <button 
              onClick={openAddGroupModal}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Add First Group
            </button>
          </div>
        ) : (
          collection.groups.map((group) => (
            <div key={group._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {group.memberCount.toLocaleString()} members
                    </span>
                    {group.locations.length > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {group.locations.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={group.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Visit Group
                  </a>
                  <button
                    onClick={() => openEditGroupModal(group)}
                    className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteGroupModal(group)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Group Modal */}
      <Modal 
        isOpen={showAddGroupModal} 
        onClose={() => { setShowAddGroupModal(false); resetGroupForm(); }} 
        title="Add New Group"
        size="md"
        actions={
          <>
            <button
              type="button"
              onClick={() => { setShowAddGroupModal(false); resetGroupForm(); }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              onClick={handleAddGroup}
            >
              {submitting ? 'Adding...' : 'Add Group'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddGroup}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupFormData.name}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Mirpur Tuition Groups"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Link *
            </label>
            <input
              type="url"
              value={groupFormData.link}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, link: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://facebook.com/groups/..."
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Count *
            </label>
            <input
              type="number"
              value={groupFormData.memberCount}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, memberCount: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1000"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locations
            </label>
            <input
              type="text"
              value={groupFormData.locations}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, locations: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mirpur, Dhaka, Bangladesh (comma-separated)"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Group Modal */}
      <Modal 
        isOpen={showEditGroupModal} 
        onClose={() => { setShowEditGroupModal(false); resetGroupForm(); }} 
        title="Edit Group"
        size="md"
        actions={
          <>
            <button
              type="button"
              onClick={() => { setShowEditGroupModal(false); resetGroupForm(); }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleEditGroup}
            >
              {submitting ? 'Updating...' : 'Update Group'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditGroup}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupFormData.name}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Link *
            </label>
            <input
              type="url"
              value={groupFormData.link}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, link: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Count *
            </label>
            <input
              type="number"
              value={groupFormData.memberCount}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, memberCount: parseInt(e.target.value) || 0 }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locations
            </label>
            <input
              type="text"
              value={groupFormData.locations}
              onChange={(e) => setGroupFormData(prev => ({ ...prev, locations: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mirpur, Dhaka, Bangladesh (comma-separated)"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Group Modal */}
      <Modal 
        isOpen={showDeleteGroupModal} 
        onClose={() => { setShowDeleteGroupModal(false); setDeletingGroup(null); }} 
        title="Delete Group"
        size="sm"
        actions={
          <>
            <button
              type="button"
              onClick={() => { setShowDeleteGroupModal(false); setDeletingGroup(null); }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              onClick={handleDeleteGroup}
            >
              {submitting ? 'Deleting...' : 'Delete Group'}
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete the group <strong>"{deletingGroup?.name}"</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Edit Collection Modal */}
      <Modal 
        isOpen={showEditCollectionModal} 
        onClose={() => setShowEditCollectionModal(false)} 
        title="Edit Collection"
        size="md"
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowEditCollectionModal(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleEditCollection}
            >
              {submitting ? 'Updating...' : 'Update Collection'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditCollection}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Collection Modal */}
      <Modal 
        isOpen={showDeleteCollectionModal} 
        onClose={() => setShowDeleteCollectionModal(false)} 
        title="Delete Collection"
        size="sm"
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowDeleteCollectionModal(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              onClick={handleDeleteCollection}
            >
              {submitting ? 'Deleting...' : 'Delete Collection'}
            </button>
          </>
        }
      >
        <div className="text-gray-600">
          <p className="mb-3">
            Are you sure you want to delete the collection <strong>"{collection.collectionName}"</strong>?
          </p>
          <p className="text-sm text-red-600">
            This will permanently delete the collection and all {collection.groups.length} groups in it. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
} 