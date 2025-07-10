'use client';

import { useState, useEffect } from 'react';
import TutorTable from '@/components/TutorTable';
import { apiGet, apiDelete } from '@/utils/api';

interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  phone: string;
  email?: string;
  version?: string;
  group?: string;
  status: string;
  address?: string;
  universityShortForm?: string;
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    setError('');
    
    const result = await apiGet<Tutor[]>('/api/tutors');
    
    if (result.data) {
      setTutors(result.data);
    } else {
      setError(result.error || 'Failed to fetch tutors');
    }
    
    setLoading(false);
  };

  const handleDelete = async (tutorId: string) => {
    if (confirm('Are you sure you want to delete this tutor?')) {
      const result = await apiDelete(`/api/tutors/${tutorId}`);
      
      if (result.message) {
        // Refresh the list after successful deletion
        fetchTutors();
      } else {
        setError(result.error || 'Failed to delete tutor');
      }
    }
  };

  const handleEdit = (tutor: Tutor) => {
    // TODO: Implement edit functionality
    console.log('Edit tutor:', tutor);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading tutors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tutors Management</h1>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Tutor
        </button>
      </div>

      <TutorTable 
        tutors={tutors} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {tutors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tutors found. Add your first tutor to get started.
        </div>
      )}
    </div>
  );
} 