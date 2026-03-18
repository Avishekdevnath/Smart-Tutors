"use client";

import { useState, useRef } from "react";
import { Search, Loader2, MapPin, BookOpen, Users, Calendar, AlertCircle } from "lucide-react";
import { formatSalary } from "@/utils/formatSalary";

interface SearchResult {
  _id: string;
  stCode?: string;
  code?: string;
  class?: string;
  tuitionClass?: string;
  subjects?: string[];
  location?: string;
  area?: string;
  salary?: { min?: number; max?: number } | string;
  medium?: string;
  version?: string;
  matchScore?: number;
  matchReasons?: string[];
  applicantCount?: number;
  applicationCount?: number;
  createdAt?: string;
  postedAt?: string;
  status?: string;
}

interface Props {
  tutorId: string;
}

function getScoreBadgeClass(score: number): string {
  if (score > 80) return "bg-[#006A4E] text-white";
  if (score > 60) return "bg-amber-500 text-white";
  return "bg-gray-400 text-white";
}

function formatPostedDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "আজ পোস্ট হয়েছে";
  if (diffDays === 1) return "গতকাল পোস্ট হয়েছে";
  if (diffDays < 7) return `${diffDays} দিন আগে`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} সপ্তাহ আগে`;
  return `${Math.floor(diffDays / 30)} মাস আগে`;
}

export default function TutorSmartSearch({ tutorId }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSearched(false);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, tutorId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "সার্চ করতে সমস্যা হয়েছে");
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err?.message || "অজানা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#1C1917]">🔍 AI টিউশন সার্চ</h2>
        <p className="text-sm text-[#78716C] mt-1">
          আপনার পছন্দ অনুযায়ী টিউশন খুঁজুন — এলাকা, ক্লাস, বিষয় লিখুন
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="টিউশন খুঁজুন... (যেমন: মিরপুরে ক্লাস ৯ ফিজিক্স)"
          className="flex-1 px-4 py-3 rounded-lg border border-[#E8DDD0] bg-[#FFFDF7] text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:border-transparent text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 px-5 py-3 bg-[#006A4E] text-white rounded-lg font-medium text-sm hover:bg-[#005a42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          সার্চ করুন
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-[#006A4E] font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>কামরুল খুঁজছে...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && searched && results.length === 0 && (
        <div className="mt-6 text-center py-10 bg-[#F5F0E8] border border-[#E8DDD0] rounded-lg">
          <Search className="w-10 h-10 text-[#78716C] mx-auto mb-3 opacity-50" />
          <p className="text-[#1C1917] font-semibold mb-1">কোনো টিউশন পাওয়া যায়নি</p>
          <p className="text-sm text-[#78716C]">
            ভিন্ন কীওয়ার্ড দিয়ে চেষ্টা করুন — যেমন এলাকার নাম, ক্লাস বা বিষয়
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-[#78716C]">
            {results.length}টি টিউশন পাওয়া গেছে
          </p>
          {results.map((item) => {
            const score = Math.round((item.matchScore ?? 0) * 100);
            const stCode = item.stCode || item.code || "N/A";
            const tuitionClass = item.class || item.tuitionClass || "N/A";
            const subjects: string[] = item.subjects || [];
            const location = item.location || item.area || "N/A";
            const salary = item.salary;
            const medium = item.medium || item.version || "";
            const matchReasons: string[] = item.matchReasons || [];
            const applicantCount = item.applicantCount ?? item.applicationCount ?? 0;
            const postedDate = item.createdAt || item.postedAt;

            return (
              <div
                key={item._id}
                className="bg-white border border-[#E8DDD0] rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                {/* Top row: score + ST code */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Match score badge */}
                    {item.matchScore !== undefined && (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${getScoreBadgeClass(score)}`}
                      >
                        {score}% ম্যাচ
                      </span>
                    )}
                    {/* ST code badge */}
                    <span className="font-mono text-xs bg-[#006A4E] text-white px-2.5 py-1 rounded-full">
                      {stCode}
                    </span>
                    {/* Medium badge */}
                    {medium && (
                      <span className="text-xs bg-[#F5F0E8] text-[#78716C] border border-[#E8DDD0] px-2.5 py-1 rounded-full">
                        {medium}
                      </span>
                    )}
                  </div>
                  {/* Posted date */}
                  {postedDate && (
                    <span className="flex items-center gap-1 text-xs text-[#78716C]">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatPostedDate(postedDate)}
                    </span>
                  )}
                </div>

                {/* Class, subjects, location */}
                <div className="flex flex-wrap gap-4 text-sm text-[#1C1917] mb-3">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#006A4E]" />
                    <span className="font-medium">{tuitionClass}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#E07B2A]" />
                    {location}
                  </span>
                </div>

                {/* Subjects as tags */}
                {subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {subjects.map((sub) => (
                      <span
                        key={sub}
                        className="text-xs bg-[#F5F0E8] text-[#1C1917] border border-[#E8DDD0] px-2 py-0.5 rounded-full"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                {/* Salary */}
                {salary && (
                  <div className="text-sm font-semibold text-[#006A4E] mb-3">
                    {formatSalary(salary as any)}
                    <span className="text-xs font-normal text-[#78716C] ml-1">/ মাস</span>
                  </div>
                )}

                {/* Match reasons */}
                {matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {matchReasons.map((reason) => (
                      <span
                        key={reason}
                        className="text-xs bg-green-50 text-[#006A4E] border border-green-200 px-2 py-0.5 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom row: applicant count + apply button */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-[#E8DDD0]">
                  <span className="flex items-center gap-1.5 text-xs text-[#78716C]">
                    <Users className="w-3.5 h-3.5" />
                    {applicantCount} জন আবেদন করেছে
                  </span>
                  <a
                    href={`/tuitions/${item._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006A4E] text-white text-sm font-medium rounded-lg hover:bg-[#005a42] transition-colors"
                  >
                    আবেদন করুন
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
