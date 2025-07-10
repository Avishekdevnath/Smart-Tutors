'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function DashboardFooterWrapper() {
  const pathname = usePathname();
  
  // Don't show footer for dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }
  
  // Show footer for all other pages
  return <Footer />;
} 