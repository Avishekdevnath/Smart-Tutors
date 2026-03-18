import OpenAI from 'openai';
import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchParams {
  subjects?: string[];
  class?: string;
  location?: string;
  district?: string;
  division?: string;
  salaryMin?: number;
  salaryMax?: number;
  medium?: string;
  gender?: string;
}

export interface TutorProfile {
  preferredSubjects?: string[];
  preferredLocation?: string[];
  /** Tutor medium code: 'BM' | 'EM' | 'EV' */
  version?: string;
  gender?: string;
}

export interface SearchWeights {
  location?: number;
  subject?: number;
  class?: number;
  salary?: number;
  medium?: number;
  gender?: number;
}

export interface TuitionSearchResult {
  tuition: Record<string, unknown>;
  matchScore: number;
  matchReasons: string[];
}

// Default weights (mirrors SiteSettings.searchConfig defaults)
const DEFAULT_WEIGHTS: Required<SearchWeights> = {
  location: 0.30,
  subject: 0.25,
  class: 0.20,
  salary: 0.15,
  medium: 0.05,
  gender: 0.05,
};

// Medium mapping: tutor version code → tuition version string
const MEDIUM_MAP: Record<string, string> = {
  BM: 'Bangla Medium',
  EM: 'English Medium',
  EV: 'English Version',
};

// ---------------------------------------------------------------------------
// 1. parseSearchQuery — Gemini 1.5 Flash NLU extraction
// ---------------------------------------------------------------------------

/**
 * Sends the raw user query to Gemini 1.5 Flash and extracts structured search
 * parameters as a {@link SearchParams} object.
 *
 * Falls back to an empty object when the AI call or JSON parse fails.
 */
export async function parseSearchQuery(query: string): Promise<SearchParams> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 256,
      messages: [{
        role: 'system',
        content: `You are a search query parser for a Bangladeshi tuition-finding platform.
Extract structured parameters from the user query and return ONLY valid JSON.
All keys are optional – omit any key you cannot determine.
JSON schema:
{
  "subjects": string[],
  "class": string,
  "location": string,
  "district": string,
  "division": string,
  "salaryMin": number,
  "salaryMax": number,
  "medium": "Bangla Medium" | "English Medium" | "English Version" | "Others",
  "gender": "Male" | "Female" | "Any"
}
Return ONLY the JSON object, no markdown.`
      }, {
        role: 'user',
        content: query
      }]
    });

    const text = (completion.choices[0]?.message?.content || '').trim();
    const jsonText = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    const parsed: SearchParams = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error('[ai-search] parseSearchQuery error:', error);
    return {};
  }
}

// ---------------------------------------------------------------------------
// 2. Scoring helpers (pure logic – no AI)
// ---------------------------------------------------------------------------

function calculateLocationScore(
  tuition: Record<string, unknown>,
  tutorProfile: TutorProfile,
  params: SearchParams
): { score: number; reason: string | null } {
  const preferred: string[] = tutorProfile.preferredLocation ?? [];
  const locationData = tuition.locationData as Record<string, string> | undefined;
  const tuitionLocation = (tuition.location as string | undefined) ?? '';

  const normalize = (s: string) => s.toLowerCase().trim();

  const tuitionTokens = [
    tuitionLocation,
    locationData?.area ?? '',
    locationData?.subarea ?? '',
    locationData?.district ?? '',
    locationData?.division ?? '',
  ]
    .filter(Boolean)
    .map(normalize);

  // Check tutor preferred locations
  for (const loc of preferred) {
    const normLoc = normalize(loc);
    if (tuitionTokens.some((t) => t.includes(normLoc) || normLoc.includes(t))) {
      return { score: 1, reason: 'আপনার এলাকা' };
    }
  }

  // Check parsed query location
  if (params.location) {
    const normParam = normalize(params.location);
    if (tuitionTokens.some((t) => t.includes(normParam) || normParam.includes(t))) {
      return { score: 0.8, reason: 'পছন্দের এলাকা' };
    }
  }

  if (params.district) {
    const normDistrict = normalize(params.district);
    if (
      normalize(locationData?.district ?? '').includes(normDistrict) ||
      normalize(tuitionLocation).includes(normDistrict)
    ) {
      return { score: 0.5, reason: 'একই জেলা' };
    }
  }

  if (params.division) {
    const normDivision = normalize(params.division);
    if (normalize(locationData?.division ?? '').includes(normDivision)) {
      return { score: 0.3, reason: 'একই বিভাগ' };
    }
  }

  return { score: 0, reason: null };
}

function calculateSubjectScore(
  tuition: Record<string, unknown>,
  tutorProfile: TutorProfile,
  params: SearchParams
): { score: number; reason: string | null } {
  const preferred: string[] = tutorProfile.preferredSubjects ?? [];
  const tuitionSubjects: string[] = (tuition.subjects as string[] | undefined) ?? [];

  const normalize = (s: string) => s.toLowerCase().trim();
  const tuitionNorm = tuitionSubjects.map(normalize);

  // Check tutor preferred subjects
  const matchedPreferred = preferred.filter((s) =>
    tuitionNorm.some((ts) => ts.includes(normalize(s)) || normalize(s).includes(ts))
  );

  if (matchedPreferred.length > 0) {
    const ratio = matchedPreferred.length / Math.max(tuitionSubjects.length, 1);
    return { score: Math.min(1, 0.6 + ratio * 0.4), reason: 'আপনার সাবজেক্ট' };
  }

  // Check query subjects
  const querySubjects = params.subjects ?? [];
  const matchedQuery = querySubjects.filter((s) =>
    tuitionNorm.some((ts) => ts.includes(normalize(s)) || normalize(s).includes(ts))
  );

  if (matchedQuery.length > 0) {
    const ratio = matchedQuery.length / Math.max(querySubjects.length, 1);
    return { score: ratio, reason: 'সাবজেক্ট মিলেছে' };
  }

  return { score: 0, reason: null };
}

function calculateMediumScore(
  tuition: Record<string, unknown>,
  tutorProfile: TutorProfile
): { score: number; reason: string | null } {
  const tutorMedium = tutorProfile.version ? MEDIUM_MAP[tutorProfile.version] : undefined;
  const tuitionVersion = tuition.version as string | undefined;

  if (!tutorMedium || !tuitionVersion) return { score: 0, reason: null };

  if (tutorMedium === tuitionVersion) {
    return { score: 1, reason: 'আপনার মিডিয়াম' };
  }

  return { score: 0, reason: null };
}

function calculateSalaryScore(
  tuition: Record<string, unknown>,
  params: SearchParams
): { score: number; reason: string | null } {
  const salary = tuition.salary as { min?: number; max?: number } | undefined;
  if (!salary) return { score: 0.5, reason: null }; // neutral when no salary info

  const tuitionMin = salary.min ?? 0;
  const tuitionMax = salary.max ?? salary.min ?? 0;

  if (!params.salaryMin && !params.salaryMax) {
    // No salary expectation in query – give full score (don't penalise)
    return { score: 1, reason: null };
  }

  const queryMin = params.salaryMin ?? 0;
  const queryMax = params.salaryMax ?? params.salaryMin ?? Infinity;

  // Check overlap between [tuitionMin, tuitionMax] and [queryMin, queryMax]
  if (tuitionMax >= queryMin && tuitionMin <= queryMax) {
    return { score: 1, reason: 'বেতন পরিসীমা ঠিক আছে' };
  }

  // Partial proximity
  const gap = Math.min(
    Math.abs(tuitionMin - queryMax),
    Math.abs(tuitionMax - queryMin)
  );
  const base = Math.max(tuitionMax, queryMax) || 1;
  const proximityScore = Math.max(0, 1 - gap / base);
  return { score: proximityScore * 0.5, reason: null };
}

function calculateClassScore(
  tuition: Record<string, unknown>,
  params: SearchParams
): { score: number; reason: string | null } {
  if (!params.class) return { score: 1, reason: null }; // no preference – neutral

  const normalize = (s: string) => s.toLowerCase().trim();
  const tuitionClass = normalize((tuition.class as string | undefined) ?? '');
  const queryClass = normalize(params.class);

  if (tuitionClass === queryClass) return { score: 1, reason: 'ক্লাস মিলেছে' };
  if (tuitionClass.includes(queryClass) || queryClass.includes(tuitionClass)) {
    return { score: 0.7, reason: 'কাছাকাছি ক্লাস' };
  }

  return { score: 0, reason: null };
}

function calculateGenderScore(
  tuition: Record<string, unknown>,
  tutorProfile: TutorProfile
): { score: number; reason: string | null } {
  const required = (tuition.tutorGender as string | undefined) ?? 'Not specified';
  const tutorGender = tutorProfile.gender;

  if (!tutorGender || required === 'Not specified' || required === 'Any') {
    return { score: 1, reason: null };
  }

  if (required.toLowerCase() === tutorGender.toLowerCase()) {
    return { score: 1, reason: 'লিঙ্গ মিলেছে' };
  }

  return { score: 0, reason: null };
}

// ---------------------------------------------------------------------------
// 3. searchTuitions — full AI-powered search flow
// ---------------------------------------------------------------------------

/**
 * Main search entry point.
 *
 * 1. Parses the natural language `query` via Gemini 1.5 Flash.
 * 2. Builds a MongoDB filter limited to open/available tuitions.
 * 3. Fetches candidates and scores each one against the tutor profile.
 * 4. Returns results sorted by `matchScore` descending.
 */
export async function searchTuitions(
  query: string,
  tutorProfile: TutorProfile = {},
  weights: SearchWeights = {}
): Promise<TuitionSearchResult[]> {
  await dbConnect();

  const resolvedWeights: Required<SearchWeights> = {
    ...DEFAULT_WEIGHTS,
    ...weights,
  };

  // 1. Parse query
  let params: SearchParams = {};
  try {
    params = await parseSearchQuery(query);
  } catch {
    // parseSearchQuery already logs; continue with empty params
  }

  // 2. Build MongoDB filter
  const filter: Record<string, unknown> = {
    status: { $in: ['open', 'available'] },
  };

  if (params.subjects && params.subjects.length > 0) {
    filter.subjects = {
      $elemMatch: {
        $regex: params.subjects.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
        $options: 'i',
      },
    };
  }

  if (params.class) {
    filter.class = { $regex: params.class, $options: 'i' };
  }

  if (params.medium) {
    filter.version = params.medium;
  }

  if (params.gender && params.gender !== 'Any') {
    filter.$or = [
      { tutorGender: { $regex: params.gender, $options: 'i' } },
      { tutorGender: 'Not specified' },
    ];
  }

  // Location: search across all location fields
  if (params.location || params.district || params.division) {
    const locationTerms = [params.location, params.district, params.division].filter(Boolean) as string[];
    const locRegex = locationTerms
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    filter.$or = [
      ...(filter.$or as unknown[] ?? []),
      { location: { $regex: locRegex, $options: 'i' } },
      { 'locationData.area': { $regex: locRegex, $options: 'i' } },
      { 'locationData.subarea': { $regex: locRegex, $options: 'i' } },
      { 'locationData.district': { $regex: locRegex, $options: 'i' } },
      { 'locationData.division': { $regex: locRegex, $options: 'i' } },
    ];
  }

  // 3. Fetch candidates (lean for performance)
  let candidates: Record<string, unknown>[] = [];
  try {
    candidates = await Tuition.find(filter).lean().limit(200).exec() as Record<string, unknown>[];
  } catch (error) {
    console.error('[ai-search] Tuition.find error:', error);
    return fallbackSearch(query);
  }

  // 4. Score each candidate
  const results: TuitionSearchResult[] = candidates.map((tuition) => {
    const locationResult = calculateLocationScore(tuition, tutorProfile, params);
    const subjectResult = calculateSubjectScore(tuition, tutorProfile, params);
    const mediumResult = calculateMediumScore(tuition, tutorProfile);
    const salaryResult = calculateSalaryScore(tuition, params);
    const classResult = calculateClassScore(tuition, params);
    const genderResult = calculateGenderScore(tuition, tutorProfile);

    const rawScore =
      locationResult.score * resolvedWeights.location +
      subjectResult.score * resolvedWeights.subject +
      classResult.score * resolvedWeights.class +
      salaryResult.score * resolvedWeights.salary +
      mediumResult.score * resolvedWeights.medium +
      genderResult.score * resolvedWeights.gender;

    const matchScore = Math.round(Math.min(100, rawScore * 100));

    const matchReasons = [
      locationResult.reason,
      subjectResult.reason,
      mediumResult.reason,
      salaryResult.reason,
      classResult.reason,
      genderResult.reason,
    ].filter(Boolean) as string[];

    return { tuition, matchScore, matchReasons };
  });

  // 5. Sort by score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

// ---------------------------------------------------------------------------
// 4. fallbackSearch — basic regex search when Gemini fails
// ---------------------------------------------------------------------------

/**
 * Simple keyword-based regex search used as a fallback when the Gemini API
 * call inside {@link searchTuitions} fails.
 *
 * Searches tuition location, subjects, class and version fields with the raw
 * query string and returns results with a neutral `matchScore` of 50.
 */
export async function fallbackSearch(query: string): Promise<TuitionSearchResult[]> {
  try {
    await dbConnect();

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = { $regex: escapedQuery, $options: 'i' };

    const tuitions = await Tuition.find({
      status: { $in: ['open', 'available'] },
      $or: [
        { location: regex },
        { subjects: regex },
        { class: regex },
        { version: regex },
        { 'locationData.area': regex },
        { 'locationData.district': regex },
        { 'locationData.division': regex },
      ],
    })
      .lean()
      .limit(50)
      .exec() as Record<string, unknown>[];

    return tuitions.map((tuition) => ({
      tuition,
      matchScore: 50,
      matchReasons: ['অনুসন্ধান ফলাফল'],
    }));
  } catch (error) {
    console.error('[ai-search] fallbackSearch error:', error);
    return [];
  }
}
