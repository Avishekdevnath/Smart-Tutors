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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </section>

      {/* Latest Tuitions Section */}
      <LatestTuitionsSection />

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
