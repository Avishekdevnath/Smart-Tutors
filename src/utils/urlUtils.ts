/**
 * Utility functions for handling URLs in both development and production
 */

/**
 * Get the base URL for the application
 * Dynamically detects the current environment and returns the appropriate URL
 */
export function getBaseUrl(): string {
  // In production, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // In server-side rendering, use environment variable or fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.NEXTAUTH_URL || 
         process.env.VERCEL_URL ? 
         `https://${process.env.VERCEL_URL}` : 
         'http://localhost:3000';
}

/**
 * Get the admin login URL
 */
export function getAdminLoginUrl(): string {
  return `${getBaseUrl()}/admin/login`;
}

/**
 * Get the tutor login URL
 */
export function getTutorLoginUrl(): string {
  return `${getBaseUrl()}/tutors/login`;
}

/**
 * Get the admin dashboard URL
 */
export function getAdminDashboardUrl(): string {
  return `${getBaseUrl()}/dashboard`;
}

/**
 * Get the tutor dashboard URL
 */
export function getTutorDashboardUrl(): string {
  return `${getBaseUrl()}/tutor/dashboard`;
}

/**
 * Check if the current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get the appropriate login URL based on user type
 */
export function getLoginUrl(userType?: string): string {
  if (userType === 'admin') {
    return getAdminLoginUrl();
  }
  return getTutorLoginUrl();
}

/**
 * Get the appropriate dashboard URL based on user type
 */
export function getDashboardUrl(userType?: string): string {
  if (userType === 'admin') {
    return getAdminDashboardUrl();
  }
  return getTutorDashboardUrl();
} 