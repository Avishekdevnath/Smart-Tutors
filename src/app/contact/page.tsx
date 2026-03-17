'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-[#E8DDD0] rounded-lg focus:ring-2 focus:ring-[#006A4E] focus:border-transparent transition-colors bg-white text-[#1C1917]";

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Hero */}
      <section className="bg-[#006A4E] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">যোগাযোগ করুন</h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto">
            Smart Tutors সম্পর্কে কোনো প্রশ্ন আছে? আমরা আপনার কথা শুনতে চাই।
            বার্তা পাঠান — আমরা যত দ্রুত সম্ভব উত্তর দেব।
          </p>
        </div>
        {/* wave */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#FFFDF7" />
        </svg>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-card border border-[#E8DDD0] p-8">
            <h2 className="font-heading text-2xl font-bold text-[#1C1917] mb-6">বার্তা পাঠান</h2>

            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
                <div className="font-semibold mb-1">ধন্যবাদ আমাদের সাথে যোগাযোগ করার জন্য!</div>
                <div>আপনার বার্তা পেয়েছি। শীঘ্রই আপনার সাথে যোগাযোগ করব।</div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
                দুঃখিত, বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#1C1917] mb-2">পূর্ণ নাম *</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputCls} placeholder="আপনার পূর্ণ নাম" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#1C1917] mb-2">ফোন নম্বর *</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={inputCls} placeholder="+880 1XXX XXX XXX" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1C1917] mb-2">ইমেইল (ঐচ্ছিক)</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="your@email.com" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#1C1917] mb-2">বিষয় *</label>
                  <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className={inputCls}>
                    <option value="">বিষয় নির্বাচন করুন</option>
                    <option value="general">সাধারণ জিজ্ঞাসা</option>
                    <option value="support">টেকনিক্যাল সহায়তা</option>
                    <option value="demo">ডেমো অনুরোধ</option>
                    <option value="pricing">মূল্য সংক্রান্ত</option>
                    <option value="partnership">অংশীদারিত্ব</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#1C1917] mb-2">বার্তা *</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={6} className={inputCls} placeholder="কীভাবে আমরা আপনাকে সাহায্য করতে পারি..." />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E07B2A] hover:bg-[#c96d22] text-white py-4 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1C1917] mb-4">যোগাযোগের তথ্য</h2>
              <p className="text-[#78716C] leading-relaxed">
                আমরা সর্বদা আপনাকে সাহায্য করতে এবং যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#006A4E]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1C1917] mb-1">অফিস ঠিকানা</h3>
                  <p className="text-[#78716C] text-sm">ঢাকা, বাংলাদেশ</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#006A4E]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1C1917] mb-1">ইমেইল</h3>
                  <a href="mailto:smarttutorsmedia@gmail.com" className="text-[#006A4E] hover:underline text-sm">smarttutorsmedia@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#006A4E]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1C1917] mb-1">ফোন</h3>
                  <p className="text-[#78716C] text-sm">আমাদের সাথে ফোনে যোগাযোগ করুন</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#006A4E]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1C1917] mb-1">অফিস সময়</h3>
                  <p className="text-[#78716C] text-sm">
                    সোম – শুক্র: সকাল ৯টা – সন্ধ্যা ৬টা<br />
                    শনি: সকাল ১০টা – বিকাল ৪টা<br />
                    রবি: বন্ধ
                  </p>
                </div>
              </div>
            </div>

            {/* CTA card */}
            <div className="bg-[#006A4E] rounded-2xl p-6 text-white">
              <h3 className="font-heading text-lg font-bold mb-2">এখনই শুরু করুন</h3>
              <p className="text-green-100 text-sm mb-4">
                হাজারো পরিবার ইতিমধ্যে Smart Tutors-এর মাধ্যমে সেরা টিউটর খুঁজে পেয়েছে।
              </p>
              <a href="/hire-a-tutor" className="inline-block px-5 py-2.5 bg-[#E07B2A] hover:bg-[#c96d22] text-white rounded-lg text-sm font-semibold transition-colors">
                টিউটর নিয়োগ করুন →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
