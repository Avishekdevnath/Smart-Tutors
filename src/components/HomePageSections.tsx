'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AcademicCapIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
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
  title: string;
  subject: string;
  level: string;
  location: string | { division: string; district: string; area: string };
  salary: number;
  status: string;
  createdAt: string;
  applications?: number;
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
          <Link href="/tutors">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              View All Tutors
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
          // Get latest 6 tuitions
          const latestTuitions = data.slice(0, 6);
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

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest Tuitions
            </h2>
            <p className="text-xl text-gray-600">
              New opportunities for qualified tutors
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Tuitions
          </h2>
          <p className="text-xl text-gray-600">
            New opportunities for qualified tutors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tuitions.map((tuition) => (
            <div key={tuition._id} className="bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300 p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {tuition.title || 'Tuition Title'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  tuition.status === 'open' ? 'bg-green-100 text-green-800' :
                  tuition.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {tuition.status || 'Open'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  <span>{tuition.subject || 'Subject'} - {tuition.level || 'Level'}</span>
                </div>
                                 <div className="flex items-center text-sm text-gray-600">
                   <MapPinIcon className="h-4 w-4 mr-2" />
                   <span>{formatLocation(tuition.location)}</span>
                 </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  <span>${tuition.salary || 0}/month</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>{new Date(tuition.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {tuition.applications || 0} applications
                </span>
                <Link href={`/tuitions/${tuition._id}`}>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details →
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