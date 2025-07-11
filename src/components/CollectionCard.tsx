'use client';

import React from 'react';
import { Eye, Edit, Trash2, MapPin, Users, Globe, Calendar } from 'lucide-react';

interface FacebookGroup {
  _id: string;
  name: string;
  link: string;
  memberCount: number;
  locations: any[];
}

interface Collection {
  _id: string;
  collectionName: string;
  slug: string;
  groups: FacebookGroup[];
  createdAt?: string;
  updatedAt?: string;
}

interface CollectionCardProps {
  collection: Collection;
  onView: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onView,
  onEdit,
  onDelete,
}) => {
  const totalMembers = collection.groups.reduce((sum, group) => sum + (group.memberCount || 0), 0);
  // Get unique locations from all groups
  const allLocations = collection.groups.flatMap(group => Array.isArray(group.locations) ? group.locations : []);
  const uniqueLocations = [...new Set(allLocations)];

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {collection.collectionName}
            </h3>
            <p className="text-sm text-gray-500 font-mono">
              /{collection.slug}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => onView(collection)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Collection"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => onEdit(collection)}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Edit Collection"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(collection._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Collection"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-2 mx-auto">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{collection.groups.length}</div>
            <div className="text-xs text-gray-500">Groups</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-2 mx-auto">
              <Users size={20} className="text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{formatMemberCount(totalMembers)}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mb-2 mx-auto">
              <MapPin size={20} className="text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{uniqueLocations.length}</div>
            <div className="text-xs text-gray-500">Locations</div>
          </div>
        </div>

        {/* Locations */}
        {uniqueLocations.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {uniqueLocations.slice(0, 3).map((location, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200"
                >
                  {location}
                </span>
              ))}
              {uniqueLocations.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200">
                  +{uniqueLocations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>
              {collection.createdAt ? new Date(collection.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <button
            onClick={() => onView(collection)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard; 