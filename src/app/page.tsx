import Link from 'next/link';
import { TopTutorsSection, LatestTuitionsSection } from '@/components/HomePageSections';
import ReviewsSection from '@/components/ReviewsSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#006A4E]">
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#E07B2A]/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/[0.03] rounded-full" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto">

            {/* Two-column layout: text left, info cards right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left — main copy */}
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-[#E07B2A] rounded-full animate-pulse" />
                  ঢাকার #১ টিউশন প্ল্যাটফর্ম
                </div>

                <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white mb-4 leading-tight">
                  সঠিক টিউটর,<br />
                  <span className="text-[#E07B2A]">সঠিক সময়ে</span>
                </h1>

                <p className="text-green-100 text-lg leading-relaxed mb-2">
                  যোগ্য ও যাচাইকৃত টিউটরের সাথে সংযুক্ত হন —{' '}
                  <span className="text-white font-semibold">সব Subject, সব Class।</span>
                </p>
                <p className="text-green-200 text-sm mb-8">
                  Find verified tutors for all subjects and classes across Dhaka.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/hire-a-tutor">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E07B2A] hover:bg-[#C96A1A] text-white px-7 py-3.5 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      টিউটর খুঁজুন
                    </button>
                  </Link>
                  <Link href="/tutors/register">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 cursor-pointer">
                      টিউটর হিসেবে যোগ দিন
                    </button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-6 mt-8 text-sm text-green-200">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#E07B2A]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    বিনামূল্যে পোস্ট করুন
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#E07B2A]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Verified Tutors
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#E07B2A]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    দ্রুত সংযোগ
                  </div>
                </div>
              </div>

              {/* Right — stat cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '500+', label: 'Active Tutors', bn: 'সক্রিয় টিউটর', icon: '👨‍🏫' },
                  { value: '1,000+', label: 'Guardians', bn: 'সন্তুষ্ট অভিভাবক', icon: '👨‍👩‍👧' },
                  { value: '2,000+', label: 'Tuitions Done', bn: 'সম্পন্ন টিউশন', icon: '📚' },
                  { value: '98%', label: 'Satisfaction', bn: 'সন্তুষ্টির হার', icon: '⭐' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
                    <p className="text-2xl mb-1" role="img" aria-hidden="true">{stat.icon}</p>
                    <p className="font-heading font-bold text-2xl text-white">{stat.value}</p>
                    <p className="text-green-100 text-xs font-medium mt-0.5">{stat.bn}</p>
                    <p className="text-green-300 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Wave bottom edge */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#FFFDF7"/>
          </svg>
        </div>
      </section>


      {/* ── Latest Tuitions ───────────────────────────────────────── */}
      <LatestTuitionsSection />

      {/* ── Share & Apply ─────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-[#E8DDD0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-[#E07B2A] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              শেয়ার করুন ও আবেদন করুন — Share &amp; Apply
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1917] mb-4">
              টিউশন লিংক যেকারো সাথে শেয়ার করুন
            </h2>
            <p className="text-[#78716C] text-base font-medium mb-1">Share Tuition Links with Anyone</p>
            <p className="text-[#78716C] text-base max-w-2xl mx-auto">
              প্রতিটি টিউশনের একটি পাবলিক পেজ আছে। SMS বা সোশ্যাল মিডিয়ায় শেয়ার করুন —
              টিউটররা সরাসরি আবেদন করতে পারবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-14">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                ),
                bg: 'bg-green-50',
                title: 'সহজ শেয়ারিং',
                en: 'Easy Sharing',
                desc: 'WhatsApp, Facebook বা SMS-এ টিউশন লিংক শেয়ার করুন।',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#E07B2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                bg: 'bg-orange-50',
                title: 'সম্পূর্ণ তথ্য',
                en: 'Detailed Information',
                desc: 'Subject, Schedule, Salary — সব তথ্য এক পেজে।',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                bg: 'bg-green-50',
                title: 'দ্রুত আবেদন',
                en: 'Quick Application',
                desc: 'এক ক্লিকে আবেদন — কোনো Account ছাড়াই।',
              },
            ].map((item) => (
              <div key={item.en} className="flex flex-col items-center text-center p-6 rounded-2xl border border-[#E8DDD0] bg-[#FFFDF7] hover:shadow-card-hover transition-shadow duration-200">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-heading text-lg font-bold text-[#1C1917] mb-2">{item.title}</h3>
                <p className="text-[#78716C] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Example link card */}
          <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-2xl p-8 max-w-xl mx-auto text-center">
            <h3 className="font-heading text-xl font-bold text-[#1C1917] mb-3">
              উদাহরণ Tuition Link
            </h3>
            <div className="bg-white border border-[#E8DDD0] rounded-lg px-4 py-3 mb-5">
              <code className="text-[#006A4E] font-mono text-sm break-all">https://yoursite.com/tuition/ST150</code>
            </div>
            <p className="text-[#78716C] text-sm mb-6">
              এই লিংক দিয়ে যে কেউ টিউশনের বিস্তারিত দেখতে ও আবেদন করতে পারবেন।
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tuitions">
                <button className="w-full sm:w-auto bg-[#006A4E] hover:bg-[#005540] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 cursor-pointer">
                  সব Tuition দেখুন
                </button>
              </Link>
              <Link href="/tutors/register">
                <button className="w-full sm:w-auto border-2 border-[#006A4E] text-[#006A4E] hover:bg-[#006A4E] hover:text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 cursor-pointer">
                  Tutor হিসেবে যোগ দিন
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Tutors ────────────────────────────────────────────── */}
      <TopTutorsSection />

      {/* ── Reviews ───────────────────────────────────────────────── */}
      <ReviewsSection />

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-[#E8DDD0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1917] mb-3">
              টিউটর ও টিউশন খোঁজার সম্পূর্ণ সমাধান
            </h2>
            <p className="text-[#006A4E] font-semibold text-sm uppercase tracking-widest mb-3">
              Complete Tuition Management Platform
            </p>
            <p className="text-[#78716C] text-base max-w-2xl mx-auto">
              Tutor management থেকে tuition assignment — সব কিছু এক জায়গায়।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                iconBg: 'bg-green-50',
                title: 'Tutor Management',
                subtitle: 'টিউটর ব্যবস্থাপনা',
                desc: 'Comprehensive tutor profiles with academic qualifications, experience tracking, and performance monitoring.',
                items: ['Academic Qualification Tracking', 'Experience & Skill Management', 'Performance Analytics', 'Document Management'],
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#E07B2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                iconBg: 'bg-orange-50',
                title: 'Tuition Management',
                subtitle: 'টিউশন ব্যবস্থাপনা',
                desc: 'Streamlined tuition assignment process with guardian matching and application tracking.',
                items: ['Smart Tutor-Guardian Matching', 'Application Tracking System', 'Schedule Management', 'Payment Tracking'],
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                iconBg: 'bg-green-50',
                title: 'Guardian Portal',
                subtitle: 'অভিভাবক পোর্টাল',
                desc: 'Dedicated portal for guardians to find tutors, track progress, and manage communications.',
                items: ['Tutor Search & Filtering', 'Progress Tracking', 'Direct Communication', 'Payment Management'],
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-2xl p-8 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-[#1C1917] mb-0.5">{feature.title}</h3>
                <p className="text-[#006A4E] text-xs font-semibold uppercase tracking-wide mb-3">{feature.subtitle}</p>
                <p className="text-[#78716C] text-sm leading-relaxed mb-5">{feature.desc}</p>
                <ul className="space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#78716C]">
                      <svg className="w-4 h-4 text-[#006A4E] shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-20 bg-[#006A4E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
            আজই শুরু করুন
          </h2>
          <p className="text-green-200 font-semibold text-sm uppercase tracking-widest mb-4">
            Ready to Transform Your Tuition Business?
          </p>
          <p className="text-green-100 text-base mb-10 max-w-xl mx-auto">
            শত শত সফল টিউশন সেন্টার Smart Tutors-এর উপর আস্থা রাখছে তাদের কার্যক্রম পরিচালনার জন্য।
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tutors">
              <button className="w-full sm:w-auto bg-[#E07B2A] hover:bg-[#C96A1A] text-white px-8 py-3.5 rounded-lg font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                Tutors দেখুন — Browse Tutors
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white hover:text-[#006A4E] px-8 py-3.5 rounded-lg font-semibold text-base transition-colors duration-200 cursor-pointer">
                Demo নিন — Schedule Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
