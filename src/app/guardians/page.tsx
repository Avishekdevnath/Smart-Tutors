import Link from 'next/link';

export default function GuardiansPage() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'অগ্রগতি ট্র্যাকিং',
      desc: 'বিস্তারিত রিপোর্ট ও বিশ্লেষণের মাধ্যমে আপনার সন্তানের একাডেমিক অগ্রগতি পর্যবেক্ষণ করুন।',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'সরাসরি যোগাযোগ',
      desc: 'আমাদের নিরাপদ মেসেজিং সিস্টেমের মাধ্যমে টিউটরদের সাথে সরাসরি যোগাযোগ করুন।',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'সময়সূচি ব্যবস্থাপনা',
      desc: 'টিউটরিং সেশন, হোমওয়ার্ক এবং গুরুত্বপূর্ণ তারিখ পরিচালনা করুন সহজেই।',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#006A4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'পারফরম্যান্স রিপোর্ট',
      desc: 'আপনার সন্তানের শক্তি, উন্নতির ক্ষেত্র এবং সুপারিশ নিয়ে বিস্তারিত রিপোর্ট পান।',
    },
  ];

  const benefits = [
    {
      color: 'bg-[#006A4E]',
      title: 'রিয়েল-টাইম আপডেট',
      desc: 'আপনার সন্তানের অগ্রগতি ও আসন্ন সেশন সম্পর্কে তাৎক্ষণিক বিজ্ঞপ্তি পান।',
    },
    {
      color: 'bg-[#E07B2A]',
      title: 'নিরাপদ প্ল্যাটফর্ম',
      desc: 'এন্টারপ্রাইজ-গ্রেড নিরাপত্তা দিয়ে আপনার সন্তানের তথ্য সুরক্ষিত রাখা হয়।',
    },
    {
      color: 'bg-[#006A4E]',
      title: 'বিশেষজ্ঞ সহায়তা',
      desc: 'শিক্ষা বিশেষজ্ঞ ও সহায়তা দলের সাথে যখনই প্রয়োজন যোগাযোগ করুন।',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Hero */}
      <section className="bg-[#006A4E] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5">
            অভিভাবক পোর্টাল
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            আপনার সন্তানের শিক্ষার সাথে সংযুক্ত থাকুন। অগ্রগতি পর্যবেক্ষণ করুন, টিউটরের সাথে যোগাযোগ করুন এবং একাডেমিক পারফরম্যান্স ট্র্যাক করুন।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 bg-[#E07B2A] hover:bg-[#c96d22] text-white rounded-lg font-semibold transition-colors">
              অ্যাক্সেস নিন
            </Link>
            <Link href="/tuitions" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#006A4E] transition-colors">
              টিউটর খুঁজুন
            </Link>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#FFFDF7" />
        </svg>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-[#1C1917] mb-4">
            আপনার সন্তানের শিক্ষায় সর্বোচ্চ সহায়তা
          </h2>
          <p className="text-[#78716C] max-w-2xl mx-auto">
            আমাদের পূর্ণাঙ্গ অভিভাবক পোর্টাল আপনাকে সন্তানের শেখার যাত্রায় সক্রিয়ভাবে যুক্ত থাকতে সাহায্য করে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-card border border-[#E8DDD0] hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-[#006A4E]/10 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-heading font-semibold text-[#1C1917] mb-2">{f.title}</h3>
              <p className="text-[#78716C] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-[#1C1917] mb-8">
                কেন অভিভাবকরা আমাদের প্ল্যাটফর্ম বেছে নেন
              </h2>
              <div className="space-y-6">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${b.color} rounded-full flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1C1917]">{b.title}</h3>
                      <p className="text-[#78716C] text-sm mt-1">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#006A4E]/5 border border-[#006A4E]/20 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-[#006A4E] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl font-bold text-[#1C1917] mb-3">নিরাপদ অভিভাবক অ্যাক্সেস</h3>
              <p className="text-[#78716C] mb-6">
                হাজারো অভিভাবক ইতিমধ্যে আমাদের প্ল্যাটফর্মে তাদের সন্তানের শিক্ষার যাত্রায় বিশ্বাস রাখছেন।
              </p>
              <Link href="/contact" className="inline-block px-6 py-3 bg-[#E07B2A] hover:bg-[#c96d22] text-white rounded-lg font-semibold transition-colors">
                আজই শুরু করুন →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#006A4E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            আপনার সন্তানের শিক্ষার নিয়ন্ত্রণ নিতে প্রস্তুত?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            সক্রিয় অভিভাবকদের আমাদের কমিউনিটিতে যোগ দিন এবং আপনার সন্তানকে সাফল্যের জন্য প্রয়োজনীয় সহায়তা দিন।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 bg-[#E07B2A] hover:bg-[#c96d22] text-white rounded-lg font-semibold transition-colors">
              যোগাযোগ করুন
            </Link>
            <Link href="/tuitions" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#006A4E] transition-colors">
              টিউশন দেখুন
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
