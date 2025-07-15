'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on all dashboard pages (admin and tutor)
  const isDashboardPage = pathname?.startsWith('/dashboard') || 
                         pathname?.startsWith('/tutor/dashboard') ||
                         pathname?.startsWith('/tutor/applications') ||
                         pathname?.startsWith('/tutor/profile') ||
                         pathname?.startsWith('/tutor/settings') ||
                         pathname?.startsWith('/tutor/tuitions');
  
  if (isDashboardPage) {
    return null;
  }
  
  return <Navbar />;
} 