'use client';

import { useState } from 'react';

export default function TestPage() {
  const [tutors, setTutors] = useState([]);
  const [tuitions, setTuitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testTutorsAPI = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/tutors');
      const data = await response.json();
      if (response.ok) {
        setTutors(data);
      } else {
        setError(data.error || 'Failed to fetch tutors');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const testTuitionsAPI = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/tuitions');
      const data = await response.json();
      if (response.ok) {
        setTuitions(data);
      } else {
        setError(data.error || 'Failed to fetch tuitions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test API Endpoints</h2>
          <div className="space-x-4">
            <button
              onClick={testTutorsAPI}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test Tutors API'}
            </button>
            <button
              onClick={testTuitionsAPI}
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test Tuitions API'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {tutors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Tutors ({tutors.length})</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">{JSON.stringify(tutors, null, 2)}</pre>
            </div>
          </div>
        )}

        {tuitions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Tuitions ({tuitions.length})</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">{JSON.stringify(tuitions, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 