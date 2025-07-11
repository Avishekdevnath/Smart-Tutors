'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function DashboardFooterWrapper() {
  const pathname = usePathname();
  
  // Don't show footer for dashboard pages (admin or tutor)
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/tutor/')) {
    return null;
  }
  
  // Show footer for all other pages
  return <Footer />;
} 