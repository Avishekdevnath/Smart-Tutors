'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function TestLogout() {
  const { data: session, status } = useSession();
  const [logoutStatus, setLogoutStatus] = useState('');

  const handleLogout = async () => {
    try {
      setLogoutStatus('Logging out...');
      console.log('Current session before logout:', session);
      
      const result = await signOut({ 
        callbackUrl: '/',
        redirect: false  // Don't redirect immediately
      });
      
      console.log('SignOut result:', result);
      setLogoutStatus('Logout successful, redirecting...');
      
      // Manual redirect after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutStatus('Logout failed: ' + error);
    }
  };

  const forceLogout = () => {
    // Clear all possible session storage
    localStorage.clear();
    sessionStorage.clear();
    // Clear cookies by setting them to expire
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    // Force page reload
    window.location.href = '/';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Logout Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Status</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>User:</strong> {session?.user?.name || 'Not logged in'}</p>
        <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
        <p><strong>User Type:</strong> {(session?.user as any)?.userType || 'N/A'}</p>
      </div>

      {session ? (
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Test NextAuth Logout
          </button>
          
          <button
            onClick={forceLogout}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 ml-4"
          >
            Force Logout (Clear All)
          </button>
          
          {logoutStatus && (
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p>{logoutStatus}</p>
            </div>
          )}
        </div>
      ) : (
        <p>You are not logged in. <a href="/tutors/login" className="text-blue-600 underline">Login here</a></p>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
        <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify({ session, status }, null, 2)}
        </pre>
      </div>
    </div>
  );
} 