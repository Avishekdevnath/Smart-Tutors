'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, Phone, Mail, MapPin, GraduationCap, User } from 'lucide-react';
import { formatTutorStatus, formatTutorVersion, formatTutorGroup } from '@/utils/tutorUtils';

interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  version?: string;
  group?: string;
  universityShortForm?: string;
  preferredLocation?: string[];
  status: string;
  gender?: string;
  department?: string;
  yearAndSemester?: string;
  createdAt: string;
}

interface TutorCardProps {
  tutor: Tutor;
  onView: (tutor: Tutor) => void;
  onEdit: (tutor: Tutor) => void;
  onDelete: (tutor: Tutor) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function TutorCard({ 
  tutor, 
  onView, 
  onEdit, 
  onDelete, 
  sortField, 
  sortOrder 
}: TutorCardProps) {
  const [showActions, setShowActions] = useState(false);

  const statusInfo = formatTutorStatus(tutor.status);
  const versionInfo = tutor.version ? formatTutorVersion(tutor.version) : null;
  const groupInfo = tutor.group ? formatTutorGroup(tutor.group) : null;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Tutor Header - Desktop Horizontal, Mobile Vertical */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 lg:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center relative flex-shrink-0">
              <span className="text-white font-bold text-sm lg:text-lg">
                {tutor.tutorId.slice(-2)}
              </span>
              {/* Sort indicator */}
              {sortField === 'tutorId' && (
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
                <span>{tutor.name}</span>
                <span className="text-sm text-gray-500">({tutor.tutorId})</span>
              </h3>
              <p className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                {tutor.gender && <span>{tutor.gender}</span>}
                {versionInfo && <span>• {versionInfo.label}</span>}
                {groupInfo && <span>• {groupInfo.label}</span>}
              </p>
            </div>
          </div>
          
          {/* Status and Action buttons - Desktop Horizontal, Mobile Vertical */}
          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => onView(tutor)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(tutor)}
                className="text-green-600 hover:text-green-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                title="Edit Tutor"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(tutor)}
                className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Tutor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Details - Desktop 3 columns, Mobile 1 column */}
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="break-all">{tutor.phone}</span>
              </p>
              {tutor.email && (
                <p className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="break-all">{tutor.email}</span>
                </p>
              )}
              {tutor.address && (
                <p className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="break-words">{tutor.address}</span>
                </p>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Academic Information
            </h4>
            <div className="space-y-2 text-sm">
              {tutor.universityShortForm && (
                <p><span className="font-medium">University:</span> {tutor.universityShortForm}</p>
              )}
              {tutor.department && (
                <p><span className="font-medium">Department:</span> {tutor.department}</p>
              )}
              {tutor.yearAndSemester && (
                <p><span className="font-medium">Year/Semester:</span> {tutor.yearAndSemester}</p>
              )}
              {versionInfo && (
                <p><span className="font-medium">Version:</span> 
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${versionInfo.bgColor} ${versionInfo.color}`}>
                    {versionInfo.label}
                  </span>
                </p>
              )}
              {groupInfo && (
                <p><span className="font-medium">Group:</span> 
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${groupInfo.bgColor} ${groupInfo.color}`}>
                    {groupInfo.label}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Additional Information
            </h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Status:</span> 
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </p>
              {tutor.preferredLocation && tutor.preferredLocation.length > 0 && (
                <p><span className="font-medium">Preferred Locations:</span> {tutor.preferredLocation.join(', ')}</p>
              )}
              <p><span className="font-medium">Joined:</span> {new Date(tutor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 