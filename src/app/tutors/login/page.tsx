"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function TutorLoginPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        username: phoneOrEmail,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("ফোন/ইমেইল বা পাসওয়ার্ড সঠিক নয়");
      } else if (result?.ok) {
        router.replace("/tutor/dashboard");
      }
    } catch {
      setError("কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border border-[#E8DDD0] rounded-lg focus:ring-2 focus:ring-[#006A4E] focus:border-transparent bg-white text-[#1C1917] placeholder:text-[#a8a29e]";

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-[#006A4E] rounded-2xl items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#1C1917]">টিউটর লগইন</h1>
          <p className="text-[#78716C] text-sm mt-2">আপনার টিউটর অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-[#E8DDD0] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="phoneOrEmail" className="block text-sm font-medium text-[#1C1917] mb-2">
                ফোন নম্বর বা ইমেইল
              </label>
              <input
                id="phoneOrEmail"
                type="text"
                required
                className={inputCls}
                placeholder="017XXXXXXXX বা email@example.com"
                value={phoneOrEmail}
                onChange={e => setPhoneOrEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1C1917] mb-2">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`${inputCls} pr-12`}
                  placeholder="পাসওয়ার্ড দিন"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] p-1"
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#006A4E] hover:bg-[#005a40] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>

          <p className="text-center text-sm text-[#78716C] mt-6">
            অ্যাকাউন্ট নেই?{' '}
            <Link href="/tutors/register" className="text-[#006A4E] font-medium hover:underline">
              রেজিস্ট্রেশন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
