'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function FacebookGroupsPage() {
  const [collections, setCollections] = useState<FacebookGroupCollection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<FacebookGroupCollection[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<FacebookGroupCollection | null>(null);
  const [formData, setFormData] = useState<FormData>({
    collectionName: '',
    groups: []
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
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/facebook-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Collection created successfully!');
        setCollections(result.data);
        setShowCreateModal(false);
        resetForm();
      } else {
        setError(result.error || 'Failed to create collection');
      }
    } catch (error) {
      setError('An error occurred while creating collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/facebook-groups/${editingCollection._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Collection updated successfully!');
        setCollections(result.data);
        setShowEditModal(false);
        setEditingCollection(null);
        resetForm();
      } else {
        setError(result.error || 'Failed to update collection');
      }
    } catch (error) {
      setError('An error occurred while updating collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/facebook-groups/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Collection deleted successfully!');
        setCollections(result.data);
      } else {
        setError(result.error || 'Failed to delete collection');
      }
    } catch (error) {
      setError('An error occurred while deleting collection');
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
      groups: [...prev.groups, { name: '', link: '', memberCount: 0, locations: [] }]
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
    const locationArray = locations.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
    updateGroup(index, 'locations', locationArray);
  };

  const resetForm = () => {
    setFormData({ collectionName: '', groups: [] });
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

  if (loading) {
    return (
      <DashboardLayout title="Facebook Groups" description="Loading...">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      {/* Success/Error Messages - Mobile Responsive */}
      {success && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-4 sm:px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="font-medium text-sm sm:text-base">{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-4 sm:px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="font-medium text-sm sm:text-base">{error}</span>
          </div>
        </div>
      )}

      {/* Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6 mb-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0 lg:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Facebook Group Collections</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              Manage and organize Facebook groups for targeted social media posting
            </p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0 text-sm">
              <span className="bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700 font-medium inline-block w-fit">
                {collections.length} Collections
              </span>
              <span className="bg-white px-3 py-1 rounded-full border border-green-200 text-green-700 font-medium inline-block w-fit">
                {filteredCollections.length} Showing
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
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

      {/* Collections Grid - Mobile Responsive */}
      {filteredCollections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-12 text-center">
          <div className="text-gray-400 mb-6">
            <Users size={80} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            {collections.length === 0 ? 'No collections found' : 'No collections match your filters'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
            {collections.length === 0 
              ? 'Get started by creating your first Facebook group collection to organize your social media posting strategy.'
              : 'Try adjusting your search or filter criteria to find the collections you\'re looking for.'
            }
          </p>
          {collections.length === 0 && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
            >
              Create First Collection
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection._id}
              collection={collection}
              onView={(collection) => router.push(`/dashboard/facebook-groups/${collection._id}`)}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Modal - Mobile Responsive */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => { setShowCreateModal(false); resetForm(); }} 
        title="Create New Collection"
        size="lg"
        actions={
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 touch-target"
              onClick={handleCreate}
            >
              {submitting ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={formData.collectionName}
              onChange={(e) => setFormData(prev => ({ ...prev, collectionName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="e.g., Mirpur, All Top Groups"
              required
            />
          </div>
          
          <div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-2">
              <label className="block text-sm font-medium text-gray-700">Groups</label>
              <button
                type="button"
                onClick={addGroup}
                className="text-blue-600 text-sm hover:underline w-fit touch-target px-2 py-1"
              >
                + Add Group
              </button>
            </div>
            
            {formData.groups.map((group, index) => (
              <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Group Name *"
                    value={group.name}
                    onChange={(e) => updateGroup(index, 'name', e.target.value)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                    required
                  />
                  <input
                    type="url"
                    placeholder="Group Link *"
                    value={group.link}
                    onChange={(e) => updateGroup(index, 'link', e.target.value)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Member Count *"
                    value={group.memberCount}
                    onChange={(e) => updateGroup(index, 'memberCount', parseInt(e.target.value) || 0)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Locations (comma-separated)"
                    value={group.locations.join(', ')}
                    onChange={(e) => updateGroupLocations(index, e.target.value)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="text-red-600 text-sm mt-2 hover:underline touch-target px-2 py-1"
                >
                  Remove Group
                </button>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* Edit Modal - Mobile Responsive */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => { setShowEditModal(false); setEditingCollection(null); resetForm(); }} 
        title="Edit Collection"
        size="lg"
        actions={
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); setEditingCollection(null); resetForm(); }}
              className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 touch-target"
              onClick={handleEdit}
            >
              {submitting ? 'Updating...' : 'Update Collection'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={formData.collectionName}
              onChange={(e) => setFormData(prev => ({ ...prev, collectionName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="e.g., Mirpur, All Top Groups"
              required
            />
          </div>
          
          <div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-2">
              <label className="block text-sm font-medium text-gray-700">Groups</label>
              <button
                type="button"
                onClick={addGroup}
                className="text-blue-600 text-sm hover:underline w-fit touch-target px-2 py-1"
              >
                + Add Group
              </button>
            </div>
            
            {formData.groups.map((group, index) => (
              <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Group Name *"
                    value={group.name}
                    onChange={(e) => updateGroup(index, 'name', e.target.value)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                    required
                  />
                  <input
                    type="url"
                    placeholder="Group Link *"
                    value={group.link}
                    onChange={(e) => updateGroup(index, 'link', e.target.value)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Member Count *"
                    value={group.memberCount}
                    onChange={(e) => updateGroup(index, 'memberCount', parseInt(e.target.value) || 0)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Locations (comma-separated)"
                    value={group.locations.join(', ')}
                    onChange={(e) => updateGroupLocations(index, e.target.value)}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="text-red-600 text-sm mt-2 hover:underline touch-target px-2 py-1"
                >
                  Remove Group
                </button>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
      `}</style>
    </DashboardLayout>
  );
} 