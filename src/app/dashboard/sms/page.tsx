'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface UserOption {
  label: string;
  value: string;
  type: 'tutor' | 'guardian';
  phone: string;
}

const SmsDashboardPage = () => {
  const [tab, setTab] = useState<'single' | 'bulk'>('single');
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Single SMS state
  const [singleNumber, setSingleNumber] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  const [singleUser, setSingleUser] = useState<UserOption | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<string | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk SMS state
  const [bulkNumbers, setBulkNumbers] = useState<string>('');
  const [bulkUsers, setBulkUsers] = useState<UserOption[]>([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Phone number validation function
  const isValidPhoneNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/[\s\-\(\)]/g, '');
    const bangladeshRegex = /^8801[3-9]\d{8}$/;
    const localRegex = /^01[3-9]\d{8}$/;
    return bangladeshRegex.test(cleanNumber) || localRegex.test(cleanNumber);
  };

  // Fetch balance
  useEffect(() => {
    setLoadingBalance(true);
    fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check-balance' })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Balance API response:', data);
        if (data.success && data.data?.balance !== undefined) {
          setBalance(`${data.data.balance}`);
        } else {
          setBalance(data.error || 'N/A');
        }
      })
      .catch((error) => {
        console.error('Balance fetch error:', error);
        setBalance('Error');
      })
      .finally(() => setLoadingBalance(false));
  }, []);

  // Fetch tutors and guardians
  useEffect(() => {
    setLoadingUsers(true);
    Promise.all([
      fetch('/api/tutors').then(res => res.json()),
      fetch('/api/guardians').then(res => res.json())
    ]).then(([tutors, guardians]) => {
      const tutorOptions = (Array.isArray(tutors) ? tutors : tutors.tutors || []).map((t: any) => ({
        label: `Tutor: ${t.name} (${t.phone})`,
        value: t._id,
        type: 'tutor',
        phone: t.phone
      }));
      const guardianOptions = (Array.isArray(guardians) ? guardians : guardians.guardians || []).map((g: any) => ({
        label: `Guardian: ${g.name} (${g.number})`,
        value: g._id,
        type: 'guardian',
        phone: g.number
      }));
      setUsers([...tutorOptions, ...guardianOptions]);
    }).finally(() => setLoadingUsers(false));
  }, []);

  // Handlers
  const handleSendSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleLoading(true);
    setSingleResult(null);
    setSingleError(null);
    
    const number = singleUser ? singleUser.phone : singleNumber;
    
    // Client-side validation
    if (!number) {
      setSingleError('Please select a user or enter a phone number');
      setSingleLoading(false);
      return;
    }
    
    if (!singleMessage.trim()) {
      setSingleError('Please enter a message');
      setSingleLoading(false);
      return;
    }
    
    if (!isValidPhoneNumber(number)) {
      setSingleError('Invalid phone number format. Use format: 88017XXXXXXXX, 88018XXXXXXXX, 88019XXXXXXXX, or 017XXXXXXXX');
      setSingleLoading(false);
      return;
    }
    
    console.log('Sending single SMS to:', number);
    console.log('Message:', singleMessage);
    
    const res = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send-single', number, message: singleMessage })
    });
    const data = await res.json();
    
    console.log('SMS API response:', data);
    
    if (data.success) {
      setSingleResult('SMS sent successfully!');
      setSingleMessage('');
      setSingleNumber('');
      setSingleUser(null);
    } else {
      setSingleError(data.error || 'Failed to send SMS');
    }
    setSingleLoading(false);
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkLoading(true);
    setBulkResult(null);
    setBulkError(null);
    
    // Combine selected users and pasted numbers
    const numbers = [
      ...bulkUsers.map(u => u.phone),
      ...bulkNumbers.split(',').map(n => n.trim()).filter(Boolean)
    ];
    
    if (numbers.length === 0) {
      setBulkError('Please select users or enter phone numbers');
      setBulkLoading(false);
      return;
    }
    
    if (!bulkMessage.trim()) {
      setBulkError('Please enter a message');
      setBulkLoading(false);
      return;
    }
    
    // Validate all numbers
    const invalidNumbers = numbers.filter(num => !isValidPhoneNumber(num));
    if (invalidNumbers.length > 0) {
      setBulkError(`Invalid phone number format: ${invalidNumbers.join(', ')}. Use format: 88017XXXXXXXX, 88018XXXXXXXX, 88019XXXXXXXX, or 017XXXXXXXX`);
      setBulkLoading(false);
      return;
    }
    
    const uniqueNumbers = Array.from(new Set(numbers));
    const res = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send-bulk-same', numbers: uniqueNumbers, message: bulkMessage })
    });
    const data = await res.json();
    
    if (data.success) {
      setBulkResult(`Bulk SMS sent successfully to ${uniqueNumbers.length} recipients!`);
      setBulkMessage('');
      setBulkNumbers('');
      setBulkUsers([]);
    } else {
      setBulkError(data.error || 'Failed to send bulk SMS');
    }
    setBulkLoading(false);
  };

  return (
    <DashboardLayout title="SMS Center" description="Send SMS to tutors and guardians">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Admin SMS Center</h1>
        <div className="mb-6 flex items-center gap-4">
          <span className="font-medium">SMS Balance:</span>
          {loadingBalance ? (
            <span className="text-gray-500 animate-pulse">Loading...</span>
          ) : (
            <span className="text-blue-600 font-semibold">{balance}</span>
          )}
          <button
            onClick={() => {
              setLoadingBalance(true);
              fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check-balance' })
              })
                .then(res => res.json())
                .then(data => {
                  console.log('Balance API response:', data);
                  if (data.success && data.data?.balance !== undefined) {
                    setBalance(`${data.data.balance}`);
                  } else {
                    setBalance(data.error || 'N/A');
                  }
                })
                .catch((error) => {
                  console.error('Balance fetch error:', error);
                  setBalance('Error');
                })
                .finally(() => setLoadingBalance(false));
            }}
            className="ml-4 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
          >
            Refresh
          </button>
        </div>
        <div className="mb-6 flex gap-2">
          <button
            className={`px-4 py-2 rounded-t-md border-b-2 font-medium ${tab === 'single' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 bg-gray-100'}`}
            onClick={() => setTab('single')}
          >
            Send Single SMS
          </button>
          <button
            className={`px-4 py-2 rounded-t-md border-b-2 font-medium ${tab === 'bulk' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 bg-gray-100'}`}
            onClick={() => setTab('bulk')}
          >
            Send Bulk SMS
          </button>
        </div>
        {/* Single SMS Tab */}
        {tab === 'single' && (
          <form onSubmit={handleSendSingle} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block font-medium mb-1">Select User (optional)</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={singleUser?.value || ''}
                onChange={e => {
                  const found = users.find(u => u.value === e.target.value);
                  setSingleUser(found || null);
                  setSingleNumber('');
                }}
                disabled={loadingUsers}
              >
                <option value="">-- Select Tutor/Guardian --</option>
                {users.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Or Enter Number</label>
              <input
                type="text"
                className={`w-full border rounded px-3 py-2 ${singleNumber && !isValidPhoneNumber(singleNumber) ? 'border-red-500' : ''}`}
                placeholder="8801XXXXXXXXX or 017XXXXXXXX"
                value={singleNumber}
                onChange={e => {
                  setSingleNumber(e.target.value);
                  setSingleUser(null);
                }}
                disabled={!!singleUser}
              />
              {singleNumber && !isValidPhoneNumber(singleNumber) && (
                <p className="text-red-500 text-sm mt-1">
                  Invalid format. Use: 88017XXXXXXXX, 88018XXXXXXXX, 88019XXXXXXXX, or 017XXXXXXXX
                </p>
              )}
            </div>
            <div>
              <label className="block font-medium mb-1">Message</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                maxLength={160}
                value={singleMessage}
                onChange={e => setSingleMessage(e.target.value)}
                required
              />
              <div className="text-xs text-gray-500 text-right">{singleMessage.length}/160</div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
              disabled={singleLoading}
            >
              {singleLoading ? 'Sending...' : 'Send SMS'}
            </button>
            {singleResult && (
              <div className="mt-2 text-sm font-medium text-center text-green-600 bg-green-50 p-2 rounded">
                {singleResult}
              </div>
            )}
            {singleError && (
              <div className="mt-2 text-sm font-medium text-center text-red-600 bg-red-50 p-2 rounded">
                {singleError}
              </div>
            )}
          </form>
        )}
        {/* Bulk SMS Tab */}
        {tab === 'bulk' && (
          <form onSubmit={handleSendBulk} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block font-medium mb-1">Select Users (optional)</label>
              <select
                className="w-full border rounded px-3 py-2"
                multiple
                value={bulkUsers.map(u => u.value)}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions).map(opt => users.find(u => u.value === opt.value)).filter(Boolean) as UserOption[];
                  setBulkUsers(selected);
                }}
                disabled={loadingUsers}
                size={Math.min(6, users.length)}
              >
                {users.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</div>
            </div>
            <div>
              <label className="block font-medium mb-1">Or Enter Numbers (comma separated)</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={2}
                placeholder="8801XXXXXXXXX,8801YYYYYYYY or 017XXXXXXXX,018YYYYYYYY"
                value={bulkNumbers}
                onChange={e => setBulkNumbers(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">
                Format: 88017XXXXXXXX, 88018XXXXXXXX, 88019XXXXXXXX, or 017XXXXXXXX
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Message</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                maxLength={160}
                value={bulkMessage}
                onChange={e => setBulkMessage(e.target.value)}
                required
              />
              <div className="text-xs text-gray-500 text-right">{bulkMessage.length}/160</div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
              disabled={bulkLoading}
            >
              {bulkLoading ? 'Sending...' : 'Send Bulk SMS'}
            </button>
            {bulkResult && (
              <div className="mt-2 text-sm font-medium text-center text-green-600 bg-green-50 p-2 rounded">
                {bulkResult}
              </div>
            )}
            {bulkError && (
              <div className="mt-2 text-sm font-medium text-center text-red-600 bg-red-50 p-2 rounded">
                {bulkError}
              </div>
            )}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SmsDashboardPage; 