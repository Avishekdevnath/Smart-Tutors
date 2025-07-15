'use client';

import { ExternalLink, Users, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { formatLocation } from '@/utils/location';

interface FacebookGroup {
  _id: string;
  name: string;
  link: string;
  memberCount: number;
  locations: any; // Can be string array, ObjectId, or other formats
}

interface FacebookGroupCardProps {
  group: FacebookGroup;
  showLocations?: boolean;
  showDate?: boolean;
  date?: string;
  variant?: 'default' | 'compact' | 'detailed';
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function FacebookGroupCard({ 
  group, 
  showLocations = true, 
  showDate = false, 
  date,
  variant = 'default',
  onEdit,
  onDelete
}: FacebookGroupCardProps) {
  const formattedLocation = formatLocation(group.locations);

  const openGroupLink = () => {
    if (group.link) {
      window.open(group.link, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate mb-1">
              {group.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{group.memberCount?.toLocaleString() || 'N/A'} members</span>
              </div>
              {showLocations && formattedLocation && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="truncate">{formattedLocation}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openGroupLink}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Visit Group"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {group.name}
            </h3>
            
            {/* Info grid - mobile responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-blue-500 flex-shrink-0" />
                <span>{group.memberCount?.toLocaleString() || 'N/A'} members</span>
              </div>
              
              {showLocations && formattedLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-green-500 flex-shrink-0" />
                  <span className="truncate">{formattedLocation}</span>
                </div>
              )}
              
              {showDate && date && (
                <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                  <Calendar size={16} className="text-purple-500 flex-shrink-0" />
                  <span>{date}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Edit Group"
              >
                <Edit size={18} />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Group"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            <button
              onClick={openGroupLink}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Visit Group"
            >
              <ExternalLink size={18} />
            </button>
          </div>
        </div>

        {/* Footer - mobile responsive */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs sm:text-sm text-gray-500">
              Group ID: {group._id}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Facebook Group
              </span>
              {variant === 'detailed' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Detailed View
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 