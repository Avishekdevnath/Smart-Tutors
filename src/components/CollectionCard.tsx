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
  const allLocations = collection.groups.flatMap(group => Array.isArray(group.locations) ? group.locations : []);
  const uniqueLocations = [...new Set(allLocations)];
  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm hover:shadow transition-all duration-150">
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
              {collection.collectionName}
            </h3>
            {/* Stats grid - minimal */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Globe size={14} className="text-blue-500 flex-shrink-0" />
                <span>{collection.groups.length} groups</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Users size={14} className="text-green-500 flex-shrink-0" />
                <span>{totalMembers.toLocaleString()} members</span>
              </div>
              {uniqueLocations.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600 col-span-2 sm:col-span-1">
                  <MapPin size={14} className="text-purple-500 flex-shrink-0" />
                  <span className="truncate">
                    {uniqueLocations.length === 1 
                      ? uniqueLocations[0] 
                      : `${uniqueLocations.length} locations`
                    }
                  </span>
                </div>
              )}
            </div>
            {/* Location tags - up to 2 */}
            {uniqueLocations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {uniqueLocations.slice(0, 2).map((location, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700"
                  >
                    {location}
                  </span>
                ))}
                {uniqueLocations.length > 2 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                    +{uniqueLocations.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Action buttons - minimal */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onView(collection)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View Collection"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onEdit(collection)}
              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
              title="Edit Collection"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(collection._id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Collection"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {/* Footer - subtle */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="text-[11px] sm:text-xs text-gray-400">
              Slug: {collection.slug}
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                Collection
              </span>
              {collection.createdAt && (
                <span className="text-[10px] text-gray-400">
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