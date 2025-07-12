'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AcademicCapIcon, 
  MapPinIcon, 
  StarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Helper function to format location
const formatLocation = (location: string | { division: string; district: string; area: string }): string => {
  if (typeof location === 'string') {
    return location;
  }
  if (location && typeof location === 'object') {
    const { division, district, area } = location;
    return [area, district, division].filter(Boolean).join(', ');
  }
  return 'Location not specified';
};

interface Tutor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: number;
  location: string | { division: string; district: string; area: string };
  status: string;
  rating?: number;
}

interface Tuition {
  _id: string;
  code: string;
  guardianName: string;
  guardianNumber: string;
  class: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  dailyHours?: string;
  salary: string;
  location: string | { division: string; district: string; area: string };
  tutorGender: string;
  specialRemarks?: string;
  urgent?: boolean;
  status: string;
  createdAt: string;
  applications?: Array<{tutorId: string; appliedDate: string; _id?: string}>;
}

export function TopTutorsSection() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch('/api/tutors');
        if (response.ok) {
          const data = await response.json();
          // Get top 6 tutors (you can modify this logic based on your criteria)
          const topTutors = data.slice(0, 6);
          setTutors(topTutors);
        }
      } catch (error) {
        console.error('Error fetching tutors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top Tutors
            </h2>
            <p className="text-xl text-gray-600">
              Meet our most qualified and experienced tutors
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Top Tutors
          </h2>
          <p className="text-xl text-gray-600">
            Meet our most qualified and experienced tutors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {tutor.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tutor.name || 'Tutor Name'}</h3>
                  <p className="text-sm text-gray-600">{tutor.subjects?.slice(0, 2).join(', ') || 'Subject'}</p>
                </div>
              </div>
              
                             <div className="space-y-2 mb-4">
                 <div className="flex items-center text-sm text-gray-600">
                   <MapPinIcon className="h-4 w-4 mr-2" />
                   <span>{formatLocation(tutor.location)}</span>
                 </div>
                <div className="flex items-center text-sm text-gray-600">
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  <span>{tutor.experience || 0} years experience</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <StarIcon className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>{tutor.rating || 4.5} rating</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tutor.status === 'active' ? 'bg-green-100 text-green-800' :
                  tutor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {tutor.status || 'Available'}
                </span>
                <Link href={`/tutors/${tutor._id}`}>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Profile →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/tuitions">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              View All Tuitions
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LatestTuitionsSection() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTuitions = async () => {
      try {
        const response = await fetch('/api/tuitions');
        if (response.ok) {
          const data = await response.json();
          // Get latest 6 available tuitions
          const availableTuitions = data.filter((tuition: Tuition) => 
            ['open', 'available'].includes(tuition.status)
          );
          const latestTuitions = availableTuitions.slice(0, 6);
          setTuitions(latestTuitions);
        }
      } catch (error) {
        console.error('Error fetching tuitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTuitions();
  }, []);

  const getApplicationsCount = (applications?: Array<{tutorId: string; appliedDate: string; _id?: string}>) => {
    return Array.isArray(applications) ? applications.length : 0;
  };

  const getDaysAgo = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              🎯 Fresh Opportunities
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Latest Tuitions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover new teaching opportunities posted by families across Dhaka
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            🎯 Fresh Opportunities
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Latest Tuitions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover new teaching opportunities posted by families across Dhaka
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tuitions.map((tuition) => (
            <div 
              key={tuition._id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{tuition.code}</h3>
                    <div className="flex items-center gap-2">
                      {tuition.urgent && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                          🔥 URGENT
                        </span>
                      )}
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                        {tuition.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm">{tuition.class} • {tuition.version}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Subjects */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    📚 Subjects
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {tuition.subjects?.slice(0, 4).map((subject, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                        {subject}
                      </span>
                    ))}
                    {tuition.subjects?.length > 4 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium">
                        +{tuition.subjects.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">{formatLocation(tuition.location)}</span>
                </div>

                {/* Schedule */}
                <div className="flex items-center text-gray-600 mb-3">
                  <ClockIcon className="w-4 h-4 mr-2 text-green-500" />
                  <span className="text-sm">
                    {tuition.weeklyDays}
                    {tuition.dailyHours && ` • ${tuition.dailyHours}`}
                  </span>
                </div>

                {/* Salary */}
                <div className="flex items-center text-gray-600 mb-4">
                  <span className="w-4 h-4 mr-2 text-yellow-500 font-semibold text-sm flex items-center justify-center">৳</span>
                  <span className="text-lg font-bold text-green-600">{tuition.salary}</span>
                </div>

                {/* Tutor Requirements */}
                {tuition.tutorGender && tuition.tutorGender !== 'Not specified' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                    <span className="text-sm text-purple-700">
                      <strong>Preferred:</strong> {tuition.tutorGender} tutor
                    </span>
                  </div>
                )}

                {/* Bottom Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span className="font-medium text-blue-600">
                        {getApplicationsCount(tuition.applications)} applied
                      </span>
                    </div>
                    <span>•</span>
                    <span>{getDaysAgo(tuition.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/tuition/${tuition.code}`}>
                      <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200">
                        View Details
                      </button>
                    </Link>
                    <Link href={`/tutors/register?tuition=${tuition.code}`}>
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 group-hover:shadow-lg">
                        Apply Now →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/tuitions">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-2xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              🚀 Explore All Tuitions
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
} 