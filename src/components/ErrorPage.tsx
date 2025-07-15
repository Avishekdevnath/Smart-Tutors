'use client';

import Link from 'next/link';
import { 
  ExclamationTriangleIcon, 
  HomeIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ErrorPageProps {
  code?: string;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showSearchButton?: boolean;
  customActions?: React.ReactNode;
}

export default function ErrorPage({
  code = '404',
  title = 'Page Not Found',
  message = 'The page you are looking for doesn\'t exist or has been moved.',
  showHomeButton = true,
  showBackButton = true,
  showSearchButton = false,
  customActions
}: ErrorPageProps) {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Error Code */}
          <div className="text-9xl font-bold text-gray-200 mb-4">
            {code}
          </div>
          
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            
            {/* Message */}
            <p className="text-gray-600 mb-8">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              {customActions ? (
                customActions
              ) : (
                <>
                  {showHomeButton && (
                    <Link
                      href="/"
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Go to Home
                    </Link>
                  )}

                  {showBackButton && (
                    <button
                      onClick={handleGoBack}
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Go Back
                    </button>
                  )}

                  {showSearchButton && (
                    <Link
                      href="/search"
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Search
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@smarttutors.com" className="text-blue-600 hover:text-blue-500">
                  support@smarttutors.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Predefined error page components
export function NotFoundPage({ 
  title = "Page Not Found",
  message = "The page you are looking for doesn't exist or has been moved."
}: { title?: string; message?: string } = {}) {
  return (
    <ErrorPage
      code="404"
      title={title}
      message={message}
    />
  );
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      code="500"
      title="Server Error"
      message="Something went wrong on our end. Please try again later."
      showSearchButton={false}
    />
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code="401"
      title="Unauthorized"
      message="You don't have permission to access this page. Please log in to continue."
      showSearchButton={false}
      customActions={
        <Link
          href="/login"
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Log In
        </Link>
      }
    />
  );
}

export function ForbiddenPage() {
  return (
    <ErrorPage
      code="403"
      title="Access Forbidden"
      message="You don't have the necessary permissions to access this resource."
      showSearchButton={false}
    />
  );
} 