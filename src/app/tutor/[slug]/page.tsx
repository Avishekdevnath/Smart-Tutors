'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, Share2, Phone, Mail, MapPin, GraduationCap, BookOpen, Users } from 'lucide-react';

interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gender?: string;
  version?: string;
  group?: string;
  academicQualifications?: {
    sscResult?: string;
    hscResult?: string;
    oLevelResult?: string;
    aLevelResult?: string;
  };
  schoolName?: string;
  collegeName?: string;
  university?: string;
  universityShortForm?: string;
  department?: string;
  yearAndSemester?: string;
  preferredSubjects?: string[];
  preferredLocation?: string[];
  experience?: string;
  profileStatus: string;
  totalApplications?: number;
  successfulTuitions?: number;
}

export default function PublicTutorProfilePage() {
  const params = useParams();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTutorProfile();
  }, []);

  const fetchTutorProfile = async () => {
    try {
      setLoading(true);
      const slug = params.slug as string;
      
      // Convert slug back to name (replace hyphens with spaces and capitalize)
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const response = await fetch(`/api/tutors/public/${encodeURIComponent(name)}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setTutor(data.tutor);
      } else {
        setError(data.error || 'Tutor not found');
      }
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
      setError('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = () => {
    try {
      // Create a new window with the CV content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download CV');
        return;
      }

      // Add CSS styles for better printing
      const styles = `
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .cv-header { 
            text-align: center; 
            border-bottom: 2px solid #059669; 
            padding-bottom: 20px; 
            margin-bottom: 20px;
          }
          .cv-header h3 { 
            font-size: 24px; 
            font-weight: bold; 
            margin: 0 0 5px 0;
          }
          .cv-header p { 
            margin: 2px 0; 
            color: #666;
          }
          .cv-section { 
            margin-bottom: 20px; 
          }
          .cv-section h4 { 
            font-size: 18px; 
            font-weight: bold; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px; 
            margin-bottom: 10px;
            color: #333;
          }
          .cv-section p { 
            margin: 3px 0; 
            font-size: 14px;
          }
          .cv-section span { 
            font-weight: 600; 
            color: #555;
          }
          .cv-tags { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
            margin-top: 10px;
          }
          .cv-tag { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 500;
            border: 1px solid;
          }
          .cv-tag.blue { 
            background-color: #dbeafe; 
            color: #1e40af; 
            border-color: #93c5fd;
          }
          .cv-tag.green { 
            background-color: #dcfce7; 
            color: #166534; 
            border-color: #86efac;
          }
          .cv-footer { 
            border-top: 2px solid #059669; 
            padding-top: 15px; 
            text-align: center; 
            margin-top: 20px;
          }
          .cv-footer .brand { 
            background: linear-gradient(135deg, #dcfce7 0%, #dbeafe 100%); 
            padding: 15px; 
            border-radius: 8px;
          }
          .cv-footer .brand h5 { 
            color: #059669; 
            font-weight: bold; 
            font-size: 18px; 
            margin: 0 0 5px 0;
          }
          .cv-footer .brand p { 
            color: #059669; 
            font-size: 14px; 
            margin: 2px 0;
          }
          .cv-footer .brand small { 
            color: #666; 
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .cv-header, .cv-section, .cv-footer { page-break-inside: avoid; }
          }
        </style>
      `;

      // Create the HTML content for the CV
      const cvHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${tutor?.name || 'Tutor'} - CV</title>
          <meta charset="UTF-8">
          ${styles}
        </head>
        <body>
          <div class="cv-header">
            <h3>${tutor?.name || 'Tutor Name'}</h3>
            <p>${tutor?.university || 'University'} - ${tutor?.department || 'Department'}</p>
            <p style="color: #059669; font-weight: 600; font-size: 14px;">TUITION WANTED | WANT TO TEACH</p>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 10px;">
              <p style="color: #6b7280; font-size: 11px; margin: 0;">Smart Tutors - Professional Tuition Services</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="cv-section">
              <h4>Personal Information</h4>
              <p><span>Name:</span> ${tutor?.name || 'Not specified'}</p>
              <p><span>Phone:</span> ${tutor?.phone || 'Not specified'}</p>
              <p><span>Gender:</span> ${tutor?.gender || 'Not specified'}</p>
              <p><span>Address:</span> ${tutor?.address || 'Not specified'}</p>
              <p><span>Experience:</span> ${tutor?.experience || 'Not specified'}</p>
            </div>

            <div class="cv-section">
              <h4>Academic Background</h4>
              <p><span>University:</span> ${tutor?.university || 'Not specified'}</p>
              <p><span>Department:</span> ${tutor?.department || 'Not specified'}</p>
              <p><span>Year & Semester:</span> ${tutor?.yearAndSemester || 'Not specified'}</p>
              <p><span>Version:</span> ${tutor?.version || 'Not specified'}</p>
              <p><span>Group:</span> ${tutor?.group || 'Not specified'}</p>
            </div>

            <div class="cv-section">
              <h4>Educational Institutions</h4>
              <p><span>School:</span> ${tutor?.schoolName || 'Not specified'}</p>
              <p><span>College:</span> ${tutor?.collegeName || 'Not specified'}</p>
              <p><span>University:</span> ${tutor?.university || 'Not specified'}</p>
              <p><span>University Short:</span> ${tutor?.universityShortForm || 'Not specified'}</p>
            </div>

            <div class="cv-section">
              <h4>Academic Results</h4>
              <p><span>SSC Result:</span> ${tutor?.academicQualifications?.sscResult || 'Not specified'}</p>
              <p><span>HSC Result:</span> ${tutor?.academicQualifications?.hscResult || 'Not specified'}</p>
              <p><span>O-Level Result:</span> ${tutor?.academicQualifications?.oLevelResult || 'Not specified'}</p>
              <p><span>A-Level Result:</span> ${tutor?.academicQualifications?.aLevelResult || 'Not specified'}</p>
            </div>
          </div>

          <div class="cv-section">
            <h4>Preferred Subjects</h4>
            <div class="cv-tags">
              ${tutor?.preferredSubjects?.map((subject: string) => 
                `<span class="cv-tag blue">${subject}</span>`
              ).join('') || '<p style="color: #999;">No subjects specified</p>'}
            </div>
          </div>

          <div class="cv-section">
            <h4>Preferred Teaching Areas</h4>
            <div class="cv-tags">
              ${tutor?.preferredLocation?.map((location: string) => 
                `<span class="cv-tag green">${location}</span>`
              ).join('') || '<p style="color: #999;">No locations specified</p>'}
            </div>
          </div>

          <div class="cv-footer">
            <div class="brand">
              <h5>Smart Tutors</h5>
              <p>Your Trusted Partner for Quality Education</p>
              <small>Contact us for professional tuition services | Visit our website for more tutors</small>
            </div>
          </div>
        </body>
        </html>
      `;

      // Write the HTML to the new window
      printWindow.document.write(cvHTML);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error downloading CV');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${tutor?.name} - Tutor Profile`,
          text: `Check out ${tutor?.name}'s tutor profile on Smart Tutors`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Profile link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Profile link copied to clipboard!');
      } catch (clipboardError) {
        alert('Failed to copy link. Please copy manually: ' + url);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor Not Found</h1>
          <p className="text-gray-600">{error || 'The tutor profile you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {tutor.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tutor.name}</h1>
                <p className="text-gray-600">{tutor.university} - {tutor.department}</p>
                <p className="text-sm text-green-600 font-semibold">TUITION WANTED | WANT TO TEACH</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadCV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download size={16} />
                Download CV
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-4">
            <p>Smart Tutors - Professional Tuition Services</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users size={20} className="mr-2 text-green-600" />
              Personal Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Name:</span>
                <span className="text-gray-900">{tutor.name}</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-2 text-green-600 w-4" />
                <span className="font-medium text-gray-700 w-24">Phone:</span>
                <span className="text-gray-900">{tutor.phone}</span>
              </div>
              {tutor.email && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-green-600 w-4" />
                  <span className="font-medium text-gray-700 w-24">Email:</span>
                  <span className="text-gray-900">{tutor.email}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Gender:</span>
                <span className="text-gray-900">{tutor.gender || 'Not specified'}</span>
              </div>
              {tutor.address && (
                <div className="flex items-start">
                  <MapPin size={16} className="mr-2 text-green-600 w-4 mt-1" />
                  <span className="font-medium text-gray-700 w-24">Address:</span>
                  <span className="text-gray-900">{tutor.address}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Experience:</span>
                <span className="text-gray-900">{tutor.experience || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GraduationCap size={20} className="mr-2 text-green-600" />
              Academic Background
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">University:</span>
                <span className="text-gray-900">{tutor.university || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Department:</span>
                <span className="text-gray-900">{tutor.department || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Year & Semester:</span>
                <span className="text-gray-900">{tutor.yearAndSemester || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Version:</span>
                <span className="text-gray-900">{tutor.version || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Group:</span>
                <span className="text-gray-900">{tutor.group || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Educational Institutions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Educational Institutions</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">School:</span>
                <span className="text-gray-900">{tutor.schoolName || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">College:</span>
                <span className="text-gray-900">{tutor.collegeName || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">University:</span>
                <span className="text-gray-900">{tutor.university || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">University Short:</span>
                <span className="text-gray-900">{tutor.universityShortForm || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Academic Results */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Results</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">SSC Result:</span>
                <span className="text-gray-900">{tutor.academicQualifications?.sscResult || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">HSC Result:</span>
                <span className="text-gray-900">{tutor.academicQualifications?.hscResult || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">O-Level Result:</span>
                <span className="text-gray-900">{tutor.academicQualifications?.oLevelResult || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">A-Level Result:</span>
                <span className="text-gray-900">{tutor.academicQualifications?.aLevelResult || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Subjects */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen size={20} className="mr-2 text-green-600" />
            Preferred Subjects
          </h2>
          <div className="flex flex-wrap gap-2">
            {tutor.preferredSubjects?.map((subject, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {subject}
              </span>
            )) || <p className="text-gray-500">No subjects specified</p>}
          </div>
        </div>

        {/* Preferred Teaching Areas */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-green-600" />
            Preferred Teaching Areas
          </h2>
          <div className="flex flex-wrap gap-2">
            {tutor.preferredLocation?.map((location, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                {location}
              </span>
            )) || <p className="text-gray-500">No locations specified</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{tutor.totalApplications || 0}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{tutor.successfulTuitions || 0}</div>
            <div className="text-sm text-gray-600">Successful Tuitions</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{tutor.tutorId}</div>
            <div className="text-sm text-gray-600">Tutor ID</div>
          </div>
        </div>
      </div>
    </div>
  );
} 