'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Edit, Trash2, ExternalLink, Users, X, Search, Filter, ArrowLeft } from 'lucide-react';
import FacebookGroupCard from '@/components/FacebookGroupCard';
import CollectionCard from '@/components/CollectionCard';
import SearchAndFilterBar from '@/components/SearchAndFilterBar';
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

interface FormData {
  collectionName: string;
  groups: Omit<FacebookGroup, '_id'>[];
}

interface GroupFormData {
  name: string;
  link: string;
  memberCount: number;
  locations: string;
}

export default function FacebookGroupsPage() {
  const [collections, setCollections] = useState<FacebookGroupCollection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<FacebookGroupCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<FacebookGroupCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<FacebookGroupCollection | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ group: FacebookGroup; index: number } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    collectionName: '',
    groups: []
  });
  const [groupFormData, setGroupFormData] = useState<GroupFormData>({
    name: '',
    link: '',
    memberCount: 0,
    locations: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [memberCountFilter, setMemberCountFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // New sorting and filtering states
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [excludeLocations, setExcludeLocations] = useState('');
  const [maxMemberCount, setMaxMemberCount] = useState('');
  const [minMemberCount, setMinMemberCount] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    filterCollections();
  }, [collections, searchTerm, locationFilter, memberCountFilter, sortBy, sortOrder, excludeLocations, maxMemberCount, minMemberCount]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook-groups');
      const result = await response.json();
      if (result.success) {
        setCollections(result.data);
      } else {
        setError(result.error || 'Failed to fetch collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  const filterCollections = () => {
    let filtered = [...collections];

    // Search by collection name or group names
    if (searchTerm) {
      filtered = filtered.filter(collection => 
        collection.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.groups.some(group => 
          group.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by include location
    if (locationFilter) {
      filtered = filtered.filter(collection =>
        collection.groups.some(group =>
          group.locations.some(location =>
            location.toLowerCase().includes(locationFilter.toLowerCase())
          )
        )
      );
    }

    // Filter by exclude location
    if (excludeLocations) {
      filtered = filtered.filter(collection =>
        !collection.groups.some(group =>
          group.locations.some(location =>
            location.toLowerCase().includes(excludeLocations.toLowerCase())
          )
        )
      );
    }

    // Filter by legacy member count (minimum)
    if (memberCountFilter) {
      const minMembers = parseInt(memberCountFilter);
      filtered = filtered.filter(collection =>
        collection.groups.some(group => group.memberCount >= minMembers)
      );
    }

    // Filter by min member count
    if (minMemberCount) {
      const minMembers = parseInt(minMemberCount);
      filtered = filtered.filter(collection =>
        collection.groups.some(group => group.memberCount >= minMembers)
      );
    }

    // Filter by max member count
    if (maxMemberCount) {
      const maxMembers = parseInt(maxMemberCount);
      filtered = filtered.filter(collection =>
        collection.groups.some(group => group.memberCount <= maxMembers)
      );
    }

    // Sort collections
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case 'name':
            aValue = a.collectionName.toLowerCase();
            bValue = b.collectionName.toLowerCase();
            break;
          case 'memberCount':
            aValue = a.groups.reduce((sum, group) => sum + group.memberCount, 0);
            bValue = b.groups.reduce((sum, group) => sum + group.memberCount, 0);
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'groupsCount':
            aValue = a.groups.length;
            bValue = b.groups.length;
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    setFilteredCollections(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collectionName.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch('/api/facebook-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setShowCreateModal(false);
        setFormData({ collectionName: '', groups: [] });
        setSuccess('Collection created successfully!');
        fetchCollections();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setError('Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !formData.collectionName.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/facebook-groups/${editingCollection._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setShowEditModal(false);
        setEditingCollection(null);
        setFormData({ collectionName: '', groups: [] });
        setSuccess('Collection updated successfully!');
        fetchCollections();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update collection');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      setError('Failed to update collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/facebook-groups/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Collection deleted successfully!');
        fetchCollections();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      setError('Failed to delete collection');
    }
  };

  const openEditModal = (collection: FacebookGroupCollection) => {
    setEditingCollection(collection);
    setFormData({
      collectionName: collection.collectionName,
      groups: collection.groups.map(group => ({
        name: group.name,
        link: group.link,
        memberCount: group.memberCount,
        locations: group.locations
      }))
    });
    setShowEditModal(true);
  };

  const addGroup = () => {
    setFormData(prev => ({
      ...prev,
      groups: [...prev.groups, {
        name: '',
        link: '',
        memberCount: 0,
        locations: []
      }]
    }));
  };

  const removeGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }));
  };

  const updateGroup = (index: number, field: keyof Omit<FacebookGroup, '_id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === index ? { ...group, [field]: value } : group
      )
    }));
  };

  const updateGroupLocations = (index: number, locations: string) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.map((group, i) => 
        i === index ? { ...group, locations: locations.split(',').map(l => l.trim()).filter(Boolean) } : group
      )
    }));
  };

  const resetForm = () => {
    setFormData({ collectionName: '', groups: [] });
    setError('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setMemberCountFilter('');
    setSortBy('');
    setSortOrder('desc');
    setExcludeLocations('');
    setMaxMemberCount('');
    setMinMemberCount('');
  };

  // Group management functions
  const openAddGroupModal = () => {
    setGroupFormData({
      name: '',
      link: '',
      memberCount: 0,
      locations: ''
    });
    setShowAddGroupModal(true);
    setError('');
  };

  const openEditGroupModal = (group: FacebookGroup, index: number) => {
    setEditingGroup({ group, index });
    setGroupFormData({
      name: group.name,
      link: group.link,
      memberCount: group.memberCount,
      locations: group.locations.join(', ')
    });
    setShowEditGroupModal(true);
    setError('');
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name.trim() || !groupFormData.link.trim()) {
      setError('Group name and link are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const newGroup = {
        name: groupFormData.name.trim(),
        link: groupFormData.link.trim(),
        memberCount: groupFormData.memberCount,
        locations: groupFormData.locations.split(',').map(l => l.trim()).filter(Boolean)
      };

      const response = await fetch(`/api/facebook-groups/${selectedCollection!._id}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Group added successfully');
        setShowAddGroupModal(false);
        fetchCollections();
        // Update selected collection with new data
        const updatedCollection = collections.find(c => c._id === selectedCollection!._id);
        if (updatedCollection) {
          setSelectedCollection(updatedCollection);
        }
      } else {
        setError(result.error || 'Failed to add group');
      }
    } catch (error) {
      console.error('Error adding group:', error);
      setError('Failed to add group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name.trim() || !groupFormData.link.trim()) {
      setError('Group name and link are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const updatedGroup = {
        name: groupFormData.name.trim(),
        link: groupFormData.link.trim(),
        memberCount: groupFormData.memberCount,
        locations: groupFormData.locations.split(',').map(l => l.trim()).filter(Boolean)
      };

      const response = await fetch(`/api/facebook-groups/${selectedCollection!._id}/groups/${editingGroup!.group._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGroup)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Group updated successfully');
        setShowEditGroupModal(false);
        setEditingGroup(null);
        fetchCollections();
        // Update selected collection with new data
        const updatedCollection = collections.find(c => c._id === selectedCollection!._id);
        if (updatedCollection) {
          setSelectedCollection(updatedCollection);
        }
      } else {
        setError(result.error || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/facebook-groups/${selectedCollection!._id}/groups/${groupId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Group deleted successfully');
        fetchCollections();
        // Update selected collection with new data
        const updatedCollection = collections.find(c => c._id === selectedCollection!._id);
        if (updatedCollection) {
          setSelectedCollection(updatedCollection);
        }
      } else {
        setError(result.error || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Failed to delete group');
    } finally {
      setSubmitting(false);
    }
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: '',
      link: '',
      memberCount: 0,
      locations: ''
    });
    setEditingGroup(null);
    setError('');
  };

  if (loading) {
    return (
      <DashboardLayout title="Facebook Groups" description="Manage Facebook group collections">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show collection detail view
  if (selectedCollection) {
    return (
      <DashboardLayout 
        title={selectedCollection.collectionName} 
        description="Collection details and groups"
      >
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Collections</span>
          </button>
        </div>

        {/* Collection header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCollection.collectionName}</h1>
              <p className="text-gray-600 mb-3">/{selectedCollection.slug}</p>
              <p className="text-sm text-gray-500 mb-4">
                Created {new Date(selectedCollection.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-4">
                <div className="bg-white rounded-lg px-4 py-2 border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{selectedCollection.groups.length}</div>
                  <div className="text-sm text-blue-600">Groups</div>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 border border-green-200">
                  <div className="text-lg font-bold text-green-700">
                    {(selectedCollection.groups.reduce((sum, group) => sum + group.memberCount, 0) / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-green-600">Total Members</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={openAddGroupModal}
                className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
                title="Add Group"
              >
                <Plus size={18} />
              </button>
              <button 
                onClick={() => openEditModal(selectedCollection)}
                className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition-colors"
                title="Edit Collection"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(selectedCollection._id)}
                className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
                title="Delete Collection"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Groups list */}
        <div className="grid gap-6">
          {selectedCollection.groups.map((group, index) => (
            <FacebookGroupCard 
              key={group._id} 
              group={group} 
              variant="detailed"
              showLocations={true}
              onEdit={() => openEditGroupModal(group, index)}
              onDelete={() => handleDeleteGroup(group._id)}
            />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // Main collections view
  return (
    <DashboardLayout 
      title="Facebook Group Collections" 
      description="Manage collections of Facebook groups for social media posting"
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

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Facebook Group Collections</h1>
            <p className="text-gray-600 mb-3">
              Manage and organize Facebook groups for targeted social media posting
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700 font-medium">
                {collections.length} Collections
              </span>
              <span className="bg-white px-3 py-1 rounded-full border border-green-200 text-green-700 font-medium">
                {filteredCollections.length} Showing
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={20} />
            Create Collection
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <SearchAndFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        memberCountFilter={memberCountFilter}
        onMemberCountFilterChange={setMemberCountFilter}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={clearFilters}
        hasActiveFilters={!!(searchTerm || locationFilter || memberCountFilter || sortBy || excludeLocations || maxMemberCount || minMemberCount)}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        excludeLocations={excludeLocations}
        onExcludeLocationsChange={setExcludeLocations}
        maxMemberCount={maxMemberCount}
        onMaxMemberCountChange={setMaxMemberCount}
        minMemberCount={minMemberCount}
        onMinMemberCountChange={setMinMemberCount}
      />

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-6">
            <Users size={80} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {collections.length === 0 ? 'No collections found' : 'No collections match your filters'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {collections.length === 0 
              ? 'Get started by creating your first Facebook group collection to organize your social media posting strategy.'
              : 'Try adjusting your search or filter criteria to find the collections you\'re looking for.'
            }
          </p>
          {collections.length === 0 && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Create First Collection
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection._id}
              collection={collection}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onClick={setSelectedCollection}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => { setShowCreateModal(false); resetForm(); }} 
        title="Create New Collection"
        size="lg"
        actions={
          <>
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleCreate}
            >
              {submitting ? 'Creating...' : 'Create Collection'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={formData.collectionName}
              onChange={(e) => setFormData(prev => ({ ...prev, collectionName: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Mirpur, All Top Groups"
              required
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Groups</label>
              <button
                type="button"
                onClick={addGroup}
                className="text-blue-600 text-sm hover:underline"
              >
                + Add Group
              </button>
            </div>
            
            {formData.groups.map((group, index) => (
              <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Group Name *"
                    value={group.name}
                    onChange={(e) => updateGroup(index, 'name', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="url"
                    placeholder="Group Link *"
                    value={group.link}
                    onChange={(e) => updateGroup(index, 'link', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Member Count *"
                    value={group.memberCount}
                    onChange={(e) => updateGroup(index, 'memberCount', parseInt(e.target.value) || 0)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Locations (comma-separated)"
                    value={group.locations.join(', ')}
                    onChange={(e) => updateGroupLocations(index, e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="text-red-600 text-sm mt-2 hover:underline"
                >
                  Remove Group
                </button>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => { setShowEditModal(false); setEditingCollection(null); resetForm(); }} 
        title="Edit Collection"
        size="lg"
        actions={
          <>
            <button
              type="button"
              onClick={() => { setShowEditModal(false); setEditingCollection(null); resetForm(); }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleEdit}
            >
              {submitting ? 'Updating...' : 'Update Collection'}
            </button>
          </>
        }
      >
        {editingCollection && (
          <form onSubmit={handleEdit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                value={formData.collectionName}
                onChange={(e) => setFormData(prev => ({ ...prev, collectionName: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Groups</label>
                <button
                  type="button"
                  onClick={addGroup}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Add Group
                </button>
              </div>
              
              {formData.groups.map((group, index) => (
                <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Group Name *"
                      value={group.name}
                      onChange={(e) => updateGroup(index, 'name', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Group Link *"
                      value={group.link}
                      onChange={(e) => updateGroup(index, 'link', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Member Count *"
                      value={group.memberCount}
                      onChange={(e) => updateGroup(index, 'memberCount', parseInt(e.target.value) || 0)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Locations (comma-separated)"
                      value={group.locations.join(', ')}
                      onChange={(e) => updateGroupLocations(index, e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGroup(index)}
                    className="text-red-600 text-sm mt-2 hover:underline"
                  >
                    Remove Group
                  </button>
                </div>
              ))}
            </div>
          </form>
        )}
      </Modal>

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
    </DashboardLayout>
  );
} 