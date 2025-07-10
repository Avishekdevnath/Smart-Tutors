'use client';

import React from 'react';
import { Eye, Edit, Trash2, MapPin, Users, Globe } from 'lucide-react';

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
  const allLocations = collection.groups.flatMap(group => {
    if (Array.isArray(group.locations)) {
      return group.locations;
    }
    return [];
  });
  const uniqueLocations = [...new Set(allLocations)].slice(0, 3); // Show max 3 locations

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {collection.collectionName}
            </h3>
            
            {/* Stats grid - mobile responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe size={16} className="text-blue-500 flex-shrink-0" />
                <span>{collection.groups.length} groups</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-green-500 flex-shrink-0" />
                <span>{totalMembers.toLocaleString()} members</span>
              </div>
              
              {uniqueLocations.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2 sm:col-span-1">
                  <MapPin size={16} className="text-purple-500 flex-shrink-0" />
                  <span className="truncate">
                    {uniqueLocations.length === 1 
                      ? uniqueLocations[0] 
                      : `${uniqueLocations.length} locations`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Location tags - mobile responsive */}
            {uniqueLocations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {uniqueLocations.map((location, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {location}
                  </span>
                ))}
                {allLocations.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    +{allLocations.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Action buttons - mobile responsive */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onView(collection)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Collection"
            >
              <Eye size={18} />
            </button>
            
            <button
              onClick={() => onEdit(collection)}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
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

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs sm:text-sm text-gray-500">
              Slug: {collection.slug}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Collection
              </span>
              {collection.createdAt && (
                <span className="text-xs text-gray-500">
                  {new Date(collection.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard; 