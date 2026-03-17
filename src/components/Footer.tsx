'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'টিউটর খুঁজুন', href: '/tutors' },
      { name: 'টিউশন দেখুন', href: '/tuitions' },
      { name: 'অভিভাবক পোর্টাল', href: '/guardians' },
      { name: 'টিউটর নিয়োগ করুন', href: '/hire-a-tutor' },
    ],
    company: [
      { name: 'আমাদের সম্পর্কে', href: '/about' },
      { name: 'যোগাযোগ', href: '/contact' },
      { name: 'গোপনীয়তা নীতি', href: '/privacy' },
      { name: 'সেবার শর্তাবলী', href: '/terms' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-[#1E293B] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/">
                <Image src="/logo.jpg" alt="Smart Tutors Logo" width={38} height={38} className="rounded-lg object-cover" />
              </Link>
              <span className="font-heading font-bold text-xl text-white">Smart Tutors</span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 max-w-sm">
              ঢাকাজুড়ে যোগ্য ও যাচাইকৃত টিউটরদের সাথে পরিবারগুলোকে সংযুক্ত করছি।
              আপনার টিউশন প্রয়োজনীয়তা পোস্ট করুন অথবা টিউটর হিসেবে নিবন্ধন করুন — সম্পূর্ণ বিনামূল্যে।
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6 text-sm text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-[#E07B2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>smarttutorsmedia@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-[#E07B2A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-8 h-8 bg-white/10 hover:bg-[#006A4E] rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4 uppercase tracking-wider">সেবাসমূহ</h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[#94A3B8] hover:text-white text-sm transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4 uppercase tracking-wider">কোম্পানি</h3>
            <ul className="space-y-2.5 mb-8">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[#94A3B8] hover:text-white text-sm transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <h3 className="font-heading font-semibold text-white text-sm mb-3 uppercase tracking-wider">আপডেট পান</h3>
            {subscribed ? (
              <p className="text-green-400 text-sm">সাবস্ক্রাইব করার জন্য ধন্যবাদ!</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল"
                  required
                  className="flex-1 min-w-0 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#006A4E] transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#006A4E] hover:bg-[#007D5C] text-white rounded-lg text-sm font-semibold transition-colors duration-200 shrink-0 cursor-pointer"
                >
                  যান
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#64748B] text-sm">
            &copy; {currentYear} Smart Tutors. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-[#64748B] hover:text-white text-sm transition-colors duration-200">
              গোপনীয়তা নীতি
            </Link>
            <Link href="/terms" className="text-[#64748B] hover:text-white text-sm transition-colors duration-200">
              সেবার শর্তাবলী
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
