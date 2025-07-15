'use client';

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function CopyButton({ 
  text, 
  label = "Copy", 
  className = "",
  size = 'sm',
  variant = 'outline'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`
        inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      title={`Copy ${label.toLowerCase()}`}
    >
      {copied ? (
        <>
          <CheckIcon className={`${iconSize[size]} mr-1 text-green-500`} />
          Copied!
        </>
      ) : (
        <>
          <ClipboardIcon className={`${iconSize[size]} mr-1`} />
          {label}
        </>
      )}
    </button>
  );
}

// Specialized component for copying guardian info (for guardian management page)
interface CopyGuardianInfoProps {
  guardianName: string;
  guardianNumber: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export function CopyGuardianInfo({ 
  guardianName, 
  guardianNumber, 
  size = 'sm',
  variant = 'outline',
  className = ""
}: CopyGuardianInfoProps) {
  const guardianInfo = `Name: ${guardianName}\nPhone: ${guardianNumber}`;
  
  return (
    <CopyButton
      text={guardianInfo}
      label="Copy Info"
      size={size}
      variant={variant}
      className={className}
    />
  );
}

// Specialized component for copying tuition guardian info (for tuition page)
interface CopyTuitionGuardianInfoProps {
  tuitionCode: string;
  guardianName: string;
  guardianNumber: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export function CopyTuitionGuardianInfo({ 
  tuitionCode,
  guardianName, 
  guardianNumber, 
  size = 'sm',
  variant = 'outline',
  className = ""
}: CopyTuitionGuardianInfoProps) {
  const tuitionGuardianInfo = `Tuition Code: ${tuitionCode}\nGuardian Info:\nName: ${guardianName}\nPhone: ${guardianNumber}`;
  
  return (
    <CopyButton
      text={tuitionGuardianInfo}
      label="Copy Guardian Info"
      size={size}
      variant={variant}
      className={className}
    />
  );
} 