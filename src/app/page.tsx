import Link from 'next/link';
import { TopTutorsSection, LatestTuitionsSection } from '@/components/HomePageSections';
import ReviewsSection from '@/components/ReviewsSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Tutors
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Management System
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Streamline your tuition business with our comprehensive platform. 
              Manage tutors, connect with guardians, and grow your educational services efficiently.
            </p>
            <div className="flex flex-col items-center justify-center py-12">
              <h1 className="text-4xl font-bold mb-4 text-center">Find the Best Tutors in Dhaka</h1>
              <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">Smart Tutors connects you with qualified, verified tutors for all subjects and classes. Guardians can easily post tuition requirements and track applications.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/hire-a-tutor" className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all">Hire a Tutor</a>
                <Link href="/tutors">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Get Started
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Tuitions Section */}
      <LatestTuitionsSection />

      {/* Public Tuition Details Promotion */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              🔗 Share & Apply
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Share Tuition Links with Anyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every tuition has a public page that can be shared via SMS, social media, or messaging apps. 
              Potential tutors can view details and apply directly without needing an account first.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Sharing</h3>
              <p className="text-gray-600">
                Copy and share tuition links with potential tutors through any platform
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Information</h3>
              <p className="text-gray-600">
                Complete tuition details including subjects, schedule, salary, and requirements
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Application</h3>
              <p className="text-gray-600">
                One-click application process with pre-filled tuition information
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Example Tuition Link
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <code className="text-blue-600 font-mono text-sm break-all">
                  https://yoursite.com/tuition/ST150
                </code>
              </div>
              <p className="text-gray-600 mb-6">
                Anyone with this link can view the tuition details and apply directly
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/tuitions">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    Browse All Tuitions
                  </button>
                </Link>
                <Link href="/tutors/register">
                  <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200">
                    Become a Tutor
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Tutors Section */}
      <TopTutorsSection />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Tuition Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From tutor management to tuition assignments, we've got you covered with powerful tools and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tutor Management</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive tutor profiles with academic qualifications, experience tracking, and performance monitoring.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Academic qualification tracking</li>
                <li>• Experience and skill management</li>
                <li>• Performance analytics</li>
                <li>• Document management</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tuition Management</h3>
              <p className="text-gray-600 mb-6">
                Streamlined tuition assignment process with guardian matching and application tracking.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Smart tutor-guardian matching</li>
                <li>• Application tracking system</li>
                <li>• Schedule management</li>
                <li>• Payment tracking</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Guardian Portal</h3>
              <p className="text-gray-600 mb-6">
                Dedicated portal for guardians to find tutors, track progress, and manage communications.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Tutor search and filtering</li>
                <li>• Progress tracking</li>
                <li>• Direct communication</li>
                <li>• Payment management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Active Tutors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-blue-100">Happy Guardians</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2000+</div>
              <div className="text-blue-100">Tuitions Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Tuition Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful tuition centers that trust Smart Tutors to manage their operations efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tutors">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Managing Tutors
              </button>
            </Link>
            <Link href="/contact">
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300">
                Schedule Demo
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
