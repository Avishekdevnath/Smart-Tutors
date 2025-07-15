'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { formatLocation, formatAddress } from '@/utils/location';
import { generateTuitionPost } from '@/lib/google-ai';

interface Tuition {
  _id: string;
  code: string;
  guardianName: string;
  guardianNumber: string;
  class: string;
  version: string;
  subjects: string[];
  weeklyDays: string;
  weeklyHours?: string;
  dailyHours?: string;
  salary: string;
  location?: string;
  startMonth?: string;
  tutorGender: string;
  specialRemarks?: string;
  urgent?: boolean;
  guardianAddress?: string;
}

interface TuitionPostGeneratorProps {
  tuition: Tuition;
}

export default function TuitionPostGenerator({ tuition }: TuitionPostGeneratorProps) {
  const [copiedPost, setCopiedPost] = useState<string | null>(null);
  const [detailedPost, setDetailedPost] = useState<string>('');
  const [shortPost, setShortPost] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [aiError, setAiError] = useState(false);

  const WHATSAPP_NUMBER = '01516539430';

  // Generate posts on component mount
  useEffect(() => {
    generatePosts();
  }, [tuition]);

  const generatePosts = async () => {
    if (useAI) {
      await generateAIPosts();
    } else {
      generateManualPosts();
    }
  };

  const generateAIPosts = async () => {
    setIsGenerating(true);
    setAiError(false);
    
    try {
      const locationLine = getLocationLine(tuition);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tuition-post',
          code: tuition.code,
          class: tuition.class,
          version: tuition.version,
          subjects: tuition.subjects,
          weeklyDays: tuition.weeklyDays,
          dailyHours: tuition.dailyHours || tuition.weeklyHours, // Use dailyHours, fallback to weeklyHours
          salary: tuition.salary,
          location: locationLine,
          tutorGender: tuition.tutorGender,
          specialRemarks: tuition.specialRemarks,
          urgent: tuition.urgent
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setDetailedPost(result.data.detailedPost);
        setShortPost(result.data.shortPost);
      } else {
        setAiError(true);
        generateManualPosts();
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      setAiError(true);
      generateManualPosts();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateManualPosts = () => {
    const locationLine = getLocationLine(tuition);
    const tutorLine = getTutorLine(tuition);
    const classLine = getClassLine(tuition);
    const shortClassLine = getShortClassLine(tuition);
    const remarksLine = tuition.specialRemarks ? `remarks: ${tuition.specialRemarks}` : '';
    const hoursText = tuition.dailyHours || tuition.weeklyHours || '';
    
    // Generate detailed post
    const detailed = [
      `🔴 Tuition Code: ${tuition.code}`,
      `✅ ${tutorLine}`,
      `✒️ Class: ${classLine}`,
      `🕒 Weekly: ${tuition.weeklyDays}${hoursText ? ` (${hoursText} hours daily)` : ''}`,
      `💸 Salary: ${tuition.salary}`,
      locationLine ? `🏠 Location: ${locationLine}` : '',
      remarksLine,
      `👉 Only Whatsapp: ${WHATSAPP_NUMBER}`
    ].filter(Boolean).join('\n');
    
    // Generate short post
    const short = [
      `${tutorLine}, ${shortClassLine}, ${tuition.weeklyDays}${hoursText ? ` (${hoursText} hours daily)` : ''}, ${tuition.salary}, ${locationLine}${tuition.specialRemarks ? `, ${tuition.specialRemarks}` : ''}.`,
      `👉 Only Whatsapp: ${WHATSAPP_NUMBER}`
    ].filter(Boolean).join('\n');
    
    setDetailedPost(detailed);
    setShortPost(short);
  };

  function getTutorLine(tuition: Tuition): string {
    let line = '';
    if (tuition.tutorGender && tuition.tutorGender !== 'Not specified') {
      line += `Experienced ${tuition.tutorGender} Tutor Needed`;
    } else {
      line += 'Experienced Tutor Needed';
    }
    if (tuition.specialRemarks) {
      line += ` (${tuition.specialRemarks})`;
    }
    return line;
  }

  function getClassLine(tuition: Tuition): string {
    let classStr = tuition.class;
    if (tuition.version && tuition.version !== 'Others') {
      classStr += ` (${tuition.version})`;
    }
    if (tuition.subjects && tuition.subjects.length > 0) {
              classStr += ` – ${Array.isArray(tuition.subjects) ? tuition.subjects.join(', ') : tuition.subjects || 'Not specified'}`;
    }
    return classStr;
  }

  function getShortClassLine(tuition: Tuition): string {
    let classStr = tuition.class;
    if (tuition.version && tuition.version !== 'Others') {
      classStr += ` (${tuition.version})`;
    }
    if (tuition.subjects && tuition.subjects.length > 0) {
              classStr += `, ${Array.isArray(tuition.subjects) ? tuition.subjects.join(', ') : tuition.subjects || 'Not specified'}`;
    }
    return classStr;
  }

  function getLocationLine(tuition: Tuition): string {
    if (tuition.guardianAddress) {
      return formatAddress(tuition.guardianAddress);
    }
    if (tuition.location) {
      return formatLocation(tuition.location);
    }
    return '';
  }

  const copyToClipboard = async (text: string, postType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPost(postType);
      setTimeout(() => setCopiedPost(null), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Generated Posts</h3>
          {useAI && <Sparkles size={16} className="text-yellow-500" />}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseAI(!useAI)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              useAI 
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {useAI ? <Sparkles size={12} /> : <MessageSquare size={12} />}
            {useAI ? 'AI Mode' : 'Manual Mode'}
          </button>
          
          <button
            onClick={generatePosts}
            disabled={isGenerating}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {aiError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ AI generation failed. Showing manual posts. You can try again or switch to manual mode.
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Detailed Post */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Detailed Post</h4>
            <button
              onClick={() => copyToClipboard(detailedPost, 'detailed')}
              disabled={isGenerating}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                copiedPost === 'detailed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } disabled:opacity-50`}
            >
              {copiedPost === 'detailed' ? (
                <>
                  <Check size={12} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-sm">Generating AI-powered post...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed">
                {detailedPost}
              </pre>
            )}
          </div>
        </div>

        {/* Short Post */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Short Post</h4>
            <button
              onClick={() => copyToClipboard(shortPost, 'short')}
              disabled={isGenerating}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                copiedPost === 'short'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {copiedPost === 'short' ? (
                <>
                  <Check size={12} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-sm">Generating AI-powered post...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed">
                {shortPost}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 