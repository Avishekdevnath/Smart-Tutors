# AI Chat Widget & Tutor Smart Search — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI chat widget (কামরুল) for conversational tuition posting, a public guardian form, AI-powered tutor search with match scoring, and an admin conversations dashboard.

**Architecture:** Monolithic — everything inside the existing Next.js 15 app. Gemini Pro for NLP (chat + search parsing), MongoDB for conversation state, pure logic for match scoring. Two tuition posting paths (chat + form) both create drafts for admin review.

**Tech Stack:** Next.js 15 App Router, TypeScript, MongoDB/Mongoose, Google Gemini Pro (`@google/generative-ai`), Tailwind CSS, Vercel Cron Jobs

**Spec:** `docs/superpowers/specs/2026-03-17-ai-chat-and-search-design.md`

---

## File Structure

### New Files

```
src/models/Conversation.ts                    — Conversation Mongoose model
src/lib/ai-chat.ts                            — Gemini chat engine (system prompt builder, intent detection, conversation logic)
src/lib/ai-search.ts                          — Gemini search parser + match scoring logic
src/hooks/useChatConfig.ts                    — Chat config hook with 5-min TTL cache
src/hooks/useChatStore.ts                     — Chat state management (useReducer)

src/components/ChatWidget/ChatWidget.tsx      — Main wrapper: bubble + panel/fullscreen
src/components/ChatWidget/ChatBubble.tsx      — Floating button (bottom-right)
src/components/ChatWidget/ChatPanel.tsx       — Desktop panel / Mobile fullscreen
src/components/ChatWidget/ChatMessage.tsx     — Single message bubble
src/components/ChatWidget/ChatInput.tsx       — Text input + send button
src/components/ChatWidget/ChatHeader.tsx      — Agent name + avatar + close
src/components/ChatWidget/ChatConfirmation.tsx — Tuition summary as chat message

src/app/post-tuition/page.tsx                 — Public guardian tuition form
src/app/api/ai/chat/route.ts                  — POST: send message (SSE stream)
src/app/api/ai/chat/[id]/route.ts             — GET: resume conversation
src/app/api/ai/search/route.ts                — POST: tutor smart search
src/app/api/ai/config/route.ts                — GET: public chat config
src/app/api/tuitions/draft/route.ts           — POST: guardian form → draft tuition
src/app/api/cron/cleanup-conversations/route.ts — Vercel Cron: abandon stale conversations

src/app/dashboard/conversations/page.tsx      — Admin conversations dashboard

vercel.json                                   — Cron job configuration

src/scripts/migrate-salary.ts                 — One-time: salary String → {min, max}
src/scripts/migrate-location-data.ts          — One-time: backfill locationData
```

### Modified Files

```
src/models/SiteSettings.ts                    — Add chatConfig + searchConfig schemas
src/models/Tuition.ts                         — Add 'draft' status, salary→object, locationData, source field, conditional code generation
src/models/Guardian.ts                        — Make address optional
src/hooks/useSettings.ts                      — Add chatConfig to ISiteSettings interface + defaults
src/app/layout.tsx                            — Add ChatWidget (conditionally rendered)
src/components/DashboardSidebar.tsx            — Add "Conversations" menu item with draft badge
src/app/dashboard/business-settings/page.tsx  — Add "AI Chat Settings" + "Search Config" tabs
src/app/api/tuitions/route.ts                 — Handle new salary object format
src/app/dashboard/tuitions/page.tsx           — Update salary display for {min, max} format
```

---

## Task Execution Order

Tasks are ordered by dependency. Tasks 1-4 are data layer (must come first). Tasks 5-7 are AI engine. Tasks 8-11 are frontend. Task 12 is admin dashboard. Tasks 13-14 are migrations and cleanup.

**Independent task groups (can run in parallel via subagents):**
- Group A: Tasks 1-4 (data layer) — sequential
- Group B: Task 5 (ai-chat lib) — after Task 1-2
- Group C: Task 6 (ai-search lib) — after Task 1-2
- After Groups complete: Tasks 7-14

---

## Task 1: Tuition Model Changes

**Files:**
- Modify: `src/models/Tuition.ts`

- [ ] **Step 1: Add 'draft' to status enum**

In `src/models/Tuition.ts`, find the status field and add 'draft':

```typescript
status: {
  type: String,
  enum: ['draft', 'open', 'available', 'demo running', 'booked', 'booked by other'],
  default: 'open'
}
```

- [ ] **Step 2: Change salary from String to structured object**

Replace the salary field:

```typescript
// Before:
// salary: { type: String }

// After:
salary: {
  type: {
    min: { type: Number },
    max: { type: Number }
  },
  default: {}
}
```

- [ ] **Step 3: Add locationData structured field**

Add after the existing `location` field:

```typescript
locationData: {
  division: { type: String },
  district: { type: String },
  area: { type: String },
  subarea: { type: String },
  locationRef: { type: Schema.Types.ObjectId, ref: 'Location' }
}
```

- [ ] **Step 4: Add source tracking field**

Add to the schema:

```typescript
source: {
  type: String,
  enum: ['chat', 'form', 'admin'],
  default: 'admin'
}
```

- [ ] **Step 5: Make code generation conditional for drafts**

In the `pre('validate')` hook (around line 56-118), wrap the code generation logic:

```typescript
// At the start of the pre('validate') hook, add:
if (this.status === 'draft') {
  // Skip code generation for drafts — code assigned when admin publishes
  return next();
}
```

Also make the `code` field not required (since drafts won't have one):

```typescript
// Before:
// code: { type: String, required: true, unique: true }

// After:
code: { type: String, unique: true, sparse: true }
```

The `sparse: true` index allows multiple documents with null/undefined code (drafts).

- [ ] **Step 6: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No NEW errors from these changes (pre-existing API route errors are acceptable).

- [ ] **Step 7: Commit**

```bash
git add src/models/Tuition.ts
git commit -m "feat(models): add draft status, structured salary, locationData, source to Tuition"
```

---

## Task 2: Guardian Model Change

**Files:**
- Modify: `src/models/Guardian.ts`

- [ ] **Step 1: Make address optional**

In `src/models/Guardian.ts`, change:

```typescript
// Before:
// address: { type: String, required: true, trim: true }

// After:
address: { type: String, trim: true }
```

- [ ] **Step 2: Commit**

```bash
git add src/models/Guardian.ts
git commit -m "feat(models): make Guardian address optional for chat-created guardians"
```

---

## Task 3: SiteSettings Model — Add chatConfig + searchConfig

**Files:**
- Modify: `src/models/SiteSettings.ts`
- Modify: `src/hooks/useSettings.ts`

- [ ] **Step 1: Add chatConfig schema to SiteSettings**

In `src/models/SiteSettings.ts`, add to the ISiteSettings interface:

```typescript
chatConfig: {
  persona: {
    name: string;
    greeting: string;
    personality: string;
  };
  tuitionQuestions: Array<{
    field: string;
    question: string;
    required: boolean;
    order: number;
    validationHint: string;
  }>;
  salaryGuidance: boolean;
  confirmationMessage: string;
  successMessage: string;
  resumeMessage: string;
  escalationMessage: string;
  errorMessage: string;
  whatsappNumber: string;
  knowledgeArticles: Array<{
    topic: string;
    content: string;
  }>;
  maxConversationsPerHour: number;
};
searchConfig: {
  weights: {
    location: number;
    subject: number;
    class: number;
    salary: number;
    medium: number;
    gender: number;
  };
};
```

- [ ] **Step 2: Add the Mongoose schema definition**

Add the chatConfig and searchConfig fields to the SiteSettingsSchema:

```typescript
chatConfig: {
  persona: {
    name: { type: String, default: 'কামরুল' },
    greeting: { type: String, default: 'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?' },
    personality: { type: String, default: 'তুমি কামরুল, একজন বড় ভাইয়ের মতো কথা বলো। casual এবং friendly tone রাখো। বাংলা, English, Banglish সব ভাষায় কথা বলতে পারো।' }
  },
  tuitionQuestions: {
    type: [{
      field: String,
      question: String,
      required: { type: Boolean, default: true },
      order: Number,
      validationHint: String
    }],
    default: [
      { field: 'studentClass', question: 'আপনার সন্তান কোন ক্লাসে পড়ে?', required: true, order: 1, validationHint: 'class 1-12, HSC, Honours, Masters' },
      { field: 'subjects', question: 'কোন কোন সাবজেক্টে টিউটর চান?', required: true, order: 2, validationHint: 'Math, English, Physics, Chemistry, etc.' },
      { field: 'location', question: 'আপনার বাসা কোন এলাকায়?', required: true, order: 3, validationHint: 'এলাকার নাম এবং জেলা' },
      { field: 'medium', question: 'English Medium না Bangla Medium?', required: true, order: 4, validationHint: 'Bangla Medium, English Medium, English Version' },
      { field: 'daysPerWeek', question: 'সপ্তাহে কয়দিন পড়াতে চান?', required: true, order: 5, validationHint: '1-7 days' },
      { field: 'salary', question: 'মাসে বেতন কত দিতে চাইবেন?', required: true, order: 6, validationHint: 'amount or range like 3000-5000' },
      { field: 'tutorGender', question: 'ছেলে না মেয়ে টিউটর পছন্দ করবেন?', required: false, order: 7, validationHint: 'male, female, or any' },
      { field: 'guardianName', question: 'আপনার নামটা জানালে ভালো হয়!', required: true, order: 8, validationHint: 'guardian full name' },
      { field: 'guardianPhone', question: 'আপনার ফোন নম্বরটা দিন, আপডেট পাঠাবো।', required: true, order: 9, validationHint: '01XXXXXXXXX, 11 digits Bangladesh number' }
    ]
  },
  salaryGuidance: { type: Boolean, default: false },
  confirmationMessage: { type: String, default: 'সব ঠিক আছে? কিছু পরিবর্তন করতে চাইলে বলুন!' },
  successMessage: { type: String, default: '✅ আপনার তথ্য আমাদের টিমের কাছে পাঠানো হয়েছে! ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে SMS-এ জানাবো। 🙏' },
  resumeMessage: { type: String, default: 'আবার স্বাগতম! আমরা শেষবার এখানে ছিলাম...' },
  escalationMessage: { type: String, default: 'আমি আপনাকে আমাদের টিমের সাথে যুক্ত করছি!' },
  errorMessage: { type: String, default: 'একটু সমস্যা হচ্ছে, কিছুক্ষণ পর আবার চেষ্টা করুন। অথবা সরাসরি ফর্ম পূরণ করুন!' },
  whatsappNumber: { type: String, default: '' },
  knowledgeArticles: {
    type: [{
      topic: String,
      content: String
    }],
    default: []
  },
  maxConversationsPerHour: { type: Number, default: 50 }
},
searchConfig: {
  weights: {
    location: { type: Number, default: 0.30 },
    subject: { type: Number, default: 0.25 },
    class: { type: Number, default: 0.20 },
    salary: { type: Number, default: 0.15 },
    medium: { type: Number, default: 0.05 },
    gender: { type: Number, default: 0.05 }
  }
}
```

- [ ] **Step 3: Update useSettings.ts with chatConfig and searchConfig defaults**

In `src/hooks/useSettings.ts`, add to the ISiteSettings interface and DEFAULT_SETTINGS:

```typescript
// Add to ISiteSettings interface:
chatConfig: {
  persona: { name: string; greeting: string; personality: string };
  tuitionQuestions: Array<{ field: string; question: string; required: boolean; order: number; validationHint: string }>;
  salaryGuidance: boolean;
  confirmationMessage: string;
  successMessage: string;
  resumeMessage: string;
  escalationMessage: string;
  errorMessage: string;
  whatsappNumber: string;
  knowledgeArticles: Array<{ topic: string; content: string }>;
  maxConversationsPerHour: number;
};
searchConfig: {
  weights: { location: number; subject: number; class: number; salary: number; medium: number; gender: number };
};

// Add to DEFAULT_SETTINGS:
chatConfig: {
  persona: { name: 'কামরুল', greeting: 'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?', personality: '' },
  tuitionQuestions: [],
  salaryGuidance: false,
  confirmationMessage: '',
  successMessage: '',
  resumeMessage: '',
  escalationMessage: '',
  errorMessage: '',
  whatsappNumber: '',
  knowledgeArticles: [],
  maxConversationsPerHour: 50
},
searchConfig: {
  weights: { location: 0.30, subject: 0.25, class: 0.20, salary: 0.15, medium: 0.05, gender: 0.05 }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/models/SiteSettings.ts src/hooks/useSettings.ts
git commit -m "feat(models): add chatConfig and searchConfig to SiteSettings"
```

---

## Task 4: Conversation Model

**Files:**
- Create: `src/models/Conversation.ts`

- [ ] **Step 1: Create the Conversation model**

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  sessionId: string;
  browserSessionId: string;
  guardianId?: mongoose.Types.ObjectId;
  userPhone?: string;
  userName?: string;
  userType: 'guardian' | 'tutor' | 'unknown';
  intent: 'post_tuition' | 'track_status' | 'faq' | 'support' | null;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  completeness: number;
  confirmedByUser: boolean;
  extractedData: {
    studentClass?: string;
    subjects?: string[];
    location?: {
      division?: string;
      district?: string;
      area?: string;
      subarea?: string;
    };
    medium?: string;
    tutorGender?: string;
    daysPerWeek?: number;
    salary?: { min?: number; max?: number };
    additionalNotes?: string;
    guardianName?: string;
    guardianPhone?: string;
  };
  status: 'active' | 'completed' | 'escalated' | 'abandoned';
  tuitionId?: mongoose.Types.ObjectId;
  escalationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  sessionId: { type: String, required: true, unique: true },
  browserSessionId: { type: String, required: true, index: true },
  guardianId: { type: Schema.Types.ObjectId, ref: 'Guardian' },
  userPhone: { type: String },
  userName: { type: String },
  userType: { type: String, enum: ['guardian', 'tutor', 'unknown'], default: 'unknown' },
  intent: { type: String, enum: ['post_tuition', 'track_status', 'faq', 'support', null], default: null },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  completeness: { type: Number, default: 0 },
  confirmedByUser: { type: Boolean, default: false },
  extractedData: {
    studentClass: String,
    subjects: [String],
    location: {
      division: String,
      district: String,
      area: String,
      subarea: String
    },
    medium: String,
    tutorGender: String,
    daysPerWeek: Number,
    salary: {
      min: Number,
      max: Number
    },
    additionalNotes: String,
    guardianName: String,
    guardianPhone: String
  },
  status: { type: String, enum: ['active', 'completed', 'escalated', 'abandoned'], default: 'active' },
  tuitionId: { type: Schema.Types.ObjectId, ref: 'Tuition' },
  escalationReason: String
}, {
  timestamps: true
});

// Index for resuming conversations
ConversationSchema.index({ browserSessionId: 1, status: 1, updatedAt: -1 });
// Index for cleanup cron
ConversationSchema.index({ status: 1, updatedAt: 1 });

const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
```

- [ ] **Step 2: Commit**

```bash
git add src/models/Conversation.ts
git commit -m "feat(models): add Conversation model for AI chat sessions"
```

---

## Task 5: AI Chat Engine

**Files:**
- Create: `src/lib/ai-chat.ts`

- [ ] **Step 1: Create the AI chat engine**

This file contains: system prompt builder, intent detection, conversation processing, action execution (draft creation).

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface ChatConfig {
  persona: { name: string; greeting: string; personality: string };
  tuitionQuestions: Array<{ field: string; question: string; required: boolean; order: number; validationHint: string }>;
  confirmationMessage: string;
  successMessage: string;
  escalationMessage: string;
  errorMessage: string;
  whatsappNumber: string;
  knowledgeArticles: Array<{ topic: string; content: string }>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ExtractedData {
  studentClass?: string;
  subjects?: string[];
  location?: { division?: string; district?: string; area?: string; subarea?: string };
  medium?: string;
  tutorGender?: string;
  daysPerWeek?: number;
  salary?: { min?: number; max?: number };
  additionalNotes?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface ChatResponse {
  reply: string;
  intent: string | null;
  extractedData: ExtractedData;
  completeness: number;
  confirmedByUser: boolean;
  shouldEscalate: boolean;
  shouldCreateDraft: boolean;
}

function buildSystemPrompt(config: ChatConfig, extractedData: ExtractedData, completeness: number): string {
  const questionsGuide = config.tuitionQuestions
    .sort((a, b) => a.order - b.order)
    .map(q => `- Field: ${q.field} | Question: ${q.question} | Required: ${q.required} | Validation: ${q.validationHint}`)
    .join('\n');

  const knowledgeBase = config.knowledgeArticles
    .map(a => `- ${a.topic}: ${a.content}`)
    .join('\n');

  return `You are ${config.persona.name}, an AI assistant for Smart Tutors — a tuition media platform in Bangladesh.

${config.persona.personality}

YOUR CAPABILITIES:
1. Help guardians post tuition requests (post_tuition)
2. Check tuition status by ST code (track_status)
3. Answer FAQs about the platform (faq)
4. General support queries (support)

LANGUAGE: Auto-detect the user's language (Bengali, English, Banglish, broken words) and respond in the same language. Be flexible with spelling mistakes and shorthand.

INTENT DETECTION:
- First message: classify intent as post_tuition, track_status, faq, or support
- If user wants to talk to a real person/admin/manager → set shouldEscalate=true

TUITION POSTING FLOW:
Ask ONE question at a time in a warm, conversational tone. Do NOT ask about info already provided.

Questions to collect (in order):
${questionsGuide}

Currently collected data:
${JSON.stringify(extractedData, null, 2)}

Completeness: ${completeness}%

RULES:
- If the first message contains multiple pieces of info, extract all of them. Don't re-ask.
- Accept messy input: "class 8-9", "scienc", "dhanmondi er kache" — normalize them.
- Phone validation: Must be 01XXXXXXXXX (11 digits). Re-ask if invalid.
- When all required fields are collected, show a summary and ask for confirmation.
- If user confirms → set confirmedByUser=true and shouldCreateDraft=true
- If user wants to edit a field after summary, update that field only and re-confirm.
- Confirmation message: ${config.confirmationMessage}
- After confirmation: ${config.successMessage}

ESCALATION:
If user asks for a real person, admin, manager, or human: set shouldEscalate=true
Escalation message: ${config.escalationMessage}

KNOWLEDGE BASE (use naturally in conversation when relevant):
${knowledgeBase || 'No articles configured yet.'}

RESPONSE FORMAT:
You must respond with valid JSON only. No markdown, no extra text.
{
  "reply": "your message to the user",
  "intent": "post_tuition|track_status|faq|support|null",
  "extractedData": { ...updated extracted data... },
  "completeness": 0-100,
  "confirmedByUser": false,
  "shouldEscalate": false,
  "shouldCreateDraft": false
}`;
}

export async function processMessage(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  config: ChatConfig,
  currentExtractedData: ExtractedData,
  currentCompleteness: number
): Promise<ChatResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = buildSystemPrompt(config, currentExtractedData, currentCompleteness);

  // Keep last 20 messages to stay within context window
  const recentHistory = conversationHistory.slice(-20);

  const chatHistory = recentHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: msg.content }]
  }));

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: 'System instructions: ' + systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ' + config.persona.name + '. I will follow all instructions and respond in JSON format.' }] },
      ...chatHistory
    ]
  });

  const result = await chat.sendMessage(userMessage);
  const responseText = result.response.text();

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed: ChatResponse = JSON.parse(jsonMatch[0]);
    return {
      reply: parsed.reply || config.errorMessage,
      intent: parsed.intent || null,
      extractedData: { ...currentExtractedData, ...parsed.extractedData },
      completeness: parsed.completeness ?? currentCompleteness,
      confirmedByUser: parsed.confirmedByUser ?? false,
      shouldEscalate: parsed.shouldEscalate ?? false,
      shouldCreateDraft: parsed.shouldCreateDraft ?? false
    };
  } catch {
    // If JSON parsing fails, return the raw text as reply
    return {
      reply: responseText || config.errorMessage,
      intent: null,
      extractedData: currentExtractedData,
      completeness: currentCompleteness,
      confirmedByUser: false,
      shouldEscalate: false,
      shouldCreateDraft: false
    };
  }
}

export async function* streamMessage(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  config: ChatConfig,
  currentExtractedData: ExtractedData,
  currentCompleteness: number
): AsyncGenerator<{ type: 'token' | 'done'; data: string | ChatResponse }> {
  // For SSE streaming, we first get the full response then stream it token by token
  // Gemini's streaming API sends chunks, but we need structured JSON at the end
  const response = await processMessage(
    userMessage, conversationHistory, config, currentExtractedData, currentCompleteness
  );

  // Stream the reply text character by character (simulated streaming for smooth UX)
  const words = response.reply.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    yield { type: 'token', data: chunk };
  }

  // Final event with full state
  yield { type: 'done', data: response };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai-chat.ts
git commit -m "feat(lib): add AI chat engine with Gemini integration"
```

---

## Task 6: AI Search Engine

**Files:**
- Create: `src/lib/ai-search.ts`

- [ ] **Step 1: Create the AI search engine**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface SearchParams {
  subjects?: string[];
  class?: string;
  location?: string;
  district?: string;
  division?: string;
  area?: string;
  salary?: { min?: number; max?: number };
  medium?: string;
  gender?: string;
}

interface TutorProfile {
  preferredSubjects: string[];
  preferredLocation: string[];
  version: string; // 'BM' | 'EM' | 'EV'
  location?: { division?: string; district?: string; area?: string };
  gender?: string;
}

interface SearchWeights {
  location: number;
  subject: number;
  class: number;
  salary: number;
  medium: number;
  gender: number;
}

interface MatchResult {
  tuitionId: string;
  code: string;
  class: string;
  subjects: string[];
  area: string;
  salary: { min: number | null; max: number | null };
  medium: string;
  matchScore: number;
  matchReasons: string[];
  appliedCount: number;
  postedDate: string;
}

// Map tutor short codes to tuition version strings
const MEDIUM_MAP: Record<string, string> = {
  'BM': 'Bangla Medium',
  'EM': 'English Medium',
  'EV': 'English Version'
};

export async function parseSearchQuery(query: string): Promise<SearchParams> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Parse this Bangladesh tuition search query into structured parameters. The query may be in Bengali, English, Banglish, or broken words.

Query: "${query}"

Return ONLY valid JSON:
{
  "subjects": ["subject1", "subject2"] or null,
  "class": "class level" or null,
  "location": "area name" or null,
  "district": "district name" or null,
  "division": "division name" or null,
  "salary": { "min": number, "max": number } or null,
  "medium": "Bangla Medium" or "English Medium" or "English Version" or null,
  "gender": "male" or "female" or null
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {};
  }
}

function calculateLocationScore(
  tuition: { location?: string; locationData?: { division?: string; district?: string; area?: string } },
  tutorProfile: TutorProfile
): number {
  const tuitionArea = tuition.locationData?.area?.toLowerCase() || '';
  const tuitionDistrict = tuition.locationData?.district?.toLowerCase() || '';
  const tuitionDivision = tuition.locationData?.division?.toLowerCase() || '';

  const tutorArea = tutorProfile.location?.area?.toLowerCase() || '';
  const tutorDistrict = tutorProfile.location?.district?.toLowerCase() || '';
  const tutorDivision = tutorProfile.location?.division?.toLowerCase() || '';

  // Also check preferredLocation array (string matching)
  const prefLocations = tutorProfile.preferredLocation.map(l => l.toLowerCase());
  const locationString = tuition.location?.toLowerCase() || '';
  const prefMatch = prefLocations.some(pl => locationString.includes(pl) || pl.includes(tuitionArea));

  if (tuitionArea && tutorArea && tuitionArea === tutorArea) return 1.0;
  if (prefMatch) return 0.9;
  if (tuitionDistrict && tutorDistrict && tuitionDistrict === tutorDistrict) return 0.7;
  if (tuitionDivision && tutorDivision && tuitionDivision === tutorDivision) return 0.4;
  return 0;
}

function calculateSubjectScore(tuitionSubjects: string[], tutorSubjects: string[]): number {
  if (!tuitionSubjects.length || !tutorSubjects.length) return 0;
  const normalizedTutor = tutorSubjects.map(s => s.toLowerCase());
  const matches = tuitionSubjects.filter(s => normalizedTutor.includes(s.toLowerCase()));
  return matches.length / tuitionSubjects.length;
}

function calculateMediumScore(tuitionVersion: string, tutorVersion: string): number {
  const tutorMedium = MEDIUM_MAP[tutorVersion] || tutorVersion;
  return tuitionVersion === tutorMedium ? 1.0 : 0;
}

function calculateSalaryScore(
  tuitionSalary: { min?: number; max?: number },
  tutorExpected?: number
): number {
  if (!tuitionSalary?.min && !tuitionSalary?.max) return 0.5; // neutral if unknown
  if (!tutorExpected) return 0.5;
  const avg = ((tuitionSalary.min || 0) + (tuitionSalary.max || tuitionSalary.min || 0)) / 2;
  const diff = Math.abs(avg - tutorExpected) / avg;
  return Math.max(0, 1 - diff);
}

function getMatchReasons(scores: Record<string, number>): string[] {
  const reasons: string[] = [];
  if (scores.location >= 0.7) reasons.push('আপনার এলাকা');
  if (scores.subject >= 0.5) reasons.push('আপনার সাবজেক্ট');
  if (scores.class >= 1.0) reasons.push('আপনার পছন্দের ক্লাস');
  if (scores.medium >= 1.0) reasons.push('আপনার মাধ্যম');
  if (scores.salary >= 0.7) reasons.push('বেতন মিলেছে');
  return reasons;
}

export async function searchTuitions(
  query: string,
  tutorProfile: TutorProfile,
  weights: SearchWeights
): Promise<{ results: MatchResult[]; parsedQuery: SearchParams }> {
  await dbConnect();

  // Parse the natural language query via Gemini
  const parsedQuery = await parseSearchQuery(query);

  // Build MongoDB filter — only open/available tuitions
  const filter: Record<string, unknown> = {
    status: { $in: ['open', 'available'] }
  };

  if (parsedQuery.subjects?.length) {
    filter.subjects = { $in: parsedQuery.subjects.map(s => new RegExp(s, 'i')) };
  }
  if (parsedQuery.class) {
    filter.class = new RegExp(parsedQuery.class, 'i');
  }
  if (parsedQuery.location || parsedQuery.area) {
    const locQuery = parsedQuery.location || parsedQuery.area;
    filter.$or = [
      { location: new RegExp(locQuery!, 'i') },
      { 'locationData.area': new RegExp(locQuery!, 'i') },
      { 'locationData.district': new RegExp(locQuery!, 'i') }
    ];
  }

  const tuitions = await Tuition.find(filter).limit(50).lean();

  // Score each result
  const results: MatchResult[] = tuitions.map((t: Record<string, unknown>) => {
    const scores = {
      location: calculateLocationScore(t as { location?: string; locationData?: { division?: string; district?: string; area?: string } }, tutorProfile),
      subject: calculateSubjectScore((t.subjects as string[]) || [], tutorProfile.preferredSubjects),
      class: 1.0, // if it passed the filter, class matches
      salary: calculateSalaryScore((t.salary as { min?: number; max?: number }) || {}, undefined),
      medium: calculateMediumScore((t.version as string) || '', tutorProfile.version),
      gender: 1.0 // default match
    };

    const totalScore = Math.round(
      (scores.location * weights.location +
       scores.subject * weights.subject +
       scores.class * weights.class +
       scores.salary * weights.salary +
       scores.medium * weights.medium +
       scores.gender * weights.gender) * 100
    );

    return {
      tuitionId: String((t as Record<string, unknown>)._id),
      code: (t.code as string) || '',
      class: (t.class as string) || '',
      subjects: (t.subjects as string[]) || [],
      area: (t.location as string) || '',
      salary: (t.salary as { min: number | null; max: number | null }) || { min: null, max: null },
      medium: (t.version as string) || '',
      matchScore: totalScore,
      matchReasons: getMatchReasons(scores),
      appliedCount: ((t.applications as unknown[]) || []).length,
      postedDate: (t.createdAt as Date)?.toISOString().split('T')[0] || ''
    };
  });

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  return { results, parsedQuery };
}

// Fallback: basic text search when Gemini can't parse
export async function fallbackSearch(query: string): Promise<MatchResult[]> {
  await dbConnect();
  const regex = new RegExp(query.split(/\s+/).join('|'), 'i');
  const tuitions = await Tuition.find({
    status: { $in: ['open', 'available'] },
    $or: [
      { subjects: regex },
      { class: regex },
      { location: regex }
    ]
  }).limit(20).lean();

  return tuitions.map((t: Record<string, unknown>) => ({
    tuitionId: String(t._id),
    code: (t.code as string) || '',
    class: (t.class as string) || '',
    subjects: (t.subjects as string[]) || [],
    area: (t.location as string) || '',
    salary: (t.salary as { min: number | null; max: number | null }) || { min: null, max: null },
    medium: (t.version as string) || '',
    matchScore: 50,
    matchReasons: [],
    appliedCount: ((t.applications as unknown[]) || []).length,
    postedDate: (t.createdAt as Date)?.toISOString().split('T')[0] || ''
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai-search.ts
git commit -m "feat(lib): add AI search engine with Gemini parsing and match scoring"
```

---

## Task 7: API Routes

**Files:**
- Create: `src/app/api/ai/chat/route.ts`
- Create: `src/app/api/ai/chat/[id]/route.ts`
- Create: `src/app/api/ai/search/route.ts`
- Create: `src/app/api/ai/config/route.ts`
- Create: `src/app/api/tuitions/draft/route.ts`
- Create: `src/app/api/cron/cleanup-conversations/route.ts`
- Create: `vercel.json`

- [ ] **Step 1: Create POST /api/ai/chat (SSE streaming)**

`src/app/api/ai/chat/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import SiteSettings from '@/models/SiteSettings';
import Guardian from '@/models/Guardian';
import Tuition from '@/models/Tuition';
import { processMessage } from '@/lib/ai-chat';
// Rate limiting: in-memory per-IP counter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxPerHour: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= maxPerHour) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // CSRF: validate origin header
    const origin = request.headers.get('origin');
    const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'].filter(Boolean);
    if (origin && !allowedOrigins.includes(origin)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const body = await request.json();
    const { sessionId, browserSessionId, message } = body;

    if (!message?.trim()) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Get chat config
    const settings = await SiteSettings.findOne() || {};
    const chatConfig = (settings as Record<string, unknown>).chatConfig as Record<string, unknown> || {};
    const maxConversations = (chatConfig.maxConversationsPerHour as number) || 50;

    // Rate limit check
    if (!checkRateLimit(ip, maxConversations)) {
      return Response.json({ error: 'এই মুহূর্তে অনেক মানুষ কথা বলছে, কিছুক্ষণ পর আসুন' }, { status: 429 });
    }

    // Find or create conversation
    let conversation = sessionId
      ? await Conversation.findOne({ sessionId })
      : null;

    if (!conversation) {
      const newSessionId = sessionId || crypto.randomUUID();
      conversation = new Conversation({
        sessionId: newSessionId,
        browserSessionId: browserSessionId || crypto.randomUUID(),
        status: 'active',
        messages: [],
        extractedData: {},
        completeness: 0,
        confirmedByUser: false
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Process with AI
    const config = {
      persona: (chatConfig.persona as { name: string; greeting: string; personality: string }) || { name: 'কামরুল', greeting: '', personality: '' },
      tuitionQuestions: (chatConfig.tuitionQuestions as Array<{ field: string; question: string; required: boolean; order: number; validationHint: string }>) || [],
      confirmationMessage: (chatConfig.confirmationMessage as string) || '',
      successMessage: (chatConfig.successMessage as string) || '',
      escalationMessage: (chatConfig.escalationMessage as string) || '',
      errorMessage: (chatConfig.errorMessage as string) || 'একটু সমস্যা হচ্ছে।',
      whatsappNumber: (chatConfig.whatsappNumber as string) || '',
      knowledgeArticles: (chatConfig.knowledgeArticles as Array<{ topic: string; content: string }>) || []
    };

    const aiResponse = await processMessage(
      message,
      conversation.messages.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      config,
      conversation.extractedData || {},
      conversation.completeness || 0
    );

    // Handle escalation
    if (aiResponse.shouldEscalate) {
      const whatsappUrl = config.whatsappNumber
        ? `https://wa.me/${config.whatsappNumber}?text=Smart+Tutor+Conversation+${conversation.sessionId}`
        : null;
      aiResponse.reply += whatsappUrl ? `\n\n[WhatsApp-এ কথা বলুন](${whatsappUrl})` : '';
      conversation.status = 'escalated';
      conversation.escalationReason = 'User requested real person';
    }

    // Add assistant message
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.reply,
      timestamp: new Date()
    });

    // Update conversation state
    conversation.intent = aiResponse.intent || conversation.intent;
    conversation.extractedData = aiResponse.extractedData;
    conversation.completeness = aiResponse.completeness;
    conversation.confirmedByUser = aiResponse.confirmedByUser;

    // Extract phone and name if available
    if (aiResponse.extractedData.guardianPhone) {
      conversation.userPhone = aiResponse.extractedData.guardianPhone;
    }
    if (aiResponse.extractedData.guardianName) {
      conversation.userName = aiResponse.extractedData.guardianName;
    }

    // Handle draft creation
    if (aiResponse.shouldCreateDraft && aiResponse.confirmedByUser) {
      const data = aiResponse.extractedData;

      // Find or create guardian
      let guardian = await Guardian.findOne({ number: conversation.userPhone });
      if (!guardian) {
        guardian = await Guardian.create({
          name: conversation.userName || 'Unknown',
          number: conversation.userPhone,
          address: data.location
            ? `${data.location.area || ''}, ${data.location.district || ''}`
            : ''
        });
      }
      conversation.guardianId = guardian._id;

      // Create draft tuition
      const tuition = await Tuition.create({
        guardianName: conversation.userName || guardian.name,
        guardianNumber: conversation.userPhone || guardian.number,
        guardian: guardian._id,
        class: data.studentClass || '',
        subjects: data.subjects || [],
        version: data.medium || 'Bangla Medium',
        location: data.location
          ? `${data.location.area || ''}, ${data.location.district || ''}`
          : '',
        locationData: data.location || {},
        salary: data.salary || {},
        weeklyDays: data.daysPerWeek ? String(data.daysPerWeek) : '',
        tutorGender: data.tutorGender || 'any',
        status: 'draft',
        source: 'chat'
      });

      conversation.tuitionId = tuition._id;
      conversation.status = 'completed';
    }

    await conversation.save();

    // SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream reply word by word
        const words = aiResponse.reply.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`));
        }

        // Final state
        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({
          conversationId: conversation.sessionId,
          extractedData: conversation.extractedData,
          completeness: conversation.completeness,
          status: conversation.status,
          intent: conversation.intent
        })}\n\n`));

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create GET /api/ai/chat/[id]**

`src/app/api/ai/chat/[id]/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Try sessionId first, then browserSessionId (find latest active)
    let conversation = await Conversation.findOne({ sessionId: id });
    if (!conversation) {
      conversation = await Conversation.findOne({
        browserSessionId: id,
        status: 'active'
      }).sort({ updatedAt: -1 });
    }

    if (!conversation) {
      return Response.json({ conversation: null }, { status: 200 });
    }

    return Response.json({ conversation });
  } catch (error) {
    console.error('Chat resume error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create POST /api/ai/search**

`src/app/api/ai/search/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';
import SiteSettings from '@/models/SiteSettings';
import { searchTuitions, fallbackSearch } from '@/lib/ai-search';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // Require authenticated tutor
    const session = await getServerSession();
    if (!session?.user) {
      return Response.json({ error: 'Login required' }, { status: 401 });
    }

    await dbConnect();
    const { query, tutorId } = await request.json();

    if (!query?.trim()) {
      return Response.json({ error: 'Search query required' }, { status: 400 });
    }

    // Get tutor profile
    const tutor = await Tutor.findById(tutorId).populate('location').lean();
    if (!tutor) {
      return Response.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Get search weights from settings
    const settings = await SiteSettings.findOne();
    const weights = (settings as Record<string, unknown>)?.searchConfig?.weights || {
      location: 0.30, subject: 0.25, class: 0.20,
      salary: 0.15, medium: 0.05, gender: 0.05
    };

    const tutorProfile = {
      preferredSubjects: (tutor as Record<string, unknown>).preferredSubjects as string[] || [],
      preferredLocation: (tutor as Record<string, unknown>).preferredLocation as string[] || [],
      version: (tutor as Record<string, unknown>).version as string || 'BM',
      location: (tutor as Record<string, unknown>).location as { division?: string; district?: string; area?: string } || {},
      gender: (tutor as Record<string, unknown>).gender as string || ''
    };

    try {
      const { results, parsedQuery } = await searchTuitions(query, tutorProfile, weights);
      return Response.json({ results, parsedQuery });
    } catch {
      // Fallback to basic search if Gemini fails
      const results = await fallbackSearch(query);
      return Response.json({ results, parsedQuery: { raw: query } });
    }
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create GET /api/ai/config**

`src/app/api/ai/config/route.ts`:

```typescript
import { dbConnect } from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne();
    const chatConfig = (settings as Record<string, unknown>)?.chatConfig || {};
    const persona = (chatConfig as Record<string, unknown>)?.persona || {};

    // Return only public config — no whatsapp number, no knowledge articles, no rate limits
    return Response.json({
      persona: {
        name: (persona as Record<string, unknown>).name || 'কামরুল',
        greeting: (persona as Record<string, unknown>).greeting || 'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?'
      }
    });
  } catch (error) {
    console.error('Config API error:', error);
    return Response.json({
      persona: { name: 'কামরুল', greeting: 'আসসালামু আলাইকুম!' }
    });
  }
}
```

- [ ] **Step 5: Create POST /api/tuitions/draft**

`src/app/api/tuitions/draft/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Guardian from '@/models/Guardian';
import Tuition from '@/models/Tuition';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      class: studentClass, subjects, location, locationData, version,
      genderPreference, daysPerWeek, salary, guardianName, guardianNumber,
      requirements
    } = body;

    // Validate required fields
    if (!studentClass || !subjects?.length || !guardianName || !guardianNumber) {
      return Response.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Validate Bangladesh phone
    if (!/^01\d{9}$/.test(guardianNumber)) {
      return Response.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Honeypot check (bot prevention)
    if (body._hp) {
      return Response.json({ success: true, message: 'Thank you!' }); // silently ignore
    }

    // Find or create guardian
    let guardian = await Guardian.findOne({ number: guardianNumber });
    if (!guardian) {
      guardian = await Guardian.create({
        name: guardianName,
        number: guardianNumber,
        address: location || ''
      });
    }

    // Create draft tuition
    await Tuition.create({
      guardianName,
      guardianNumber,
      guardian: guardian._id,
      class: studentClass,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      version: version || 'Bangla Medium',
      location: location || '',
      locationData: locationData || {},
      salary: salary || {},
      weeklyDays: daysPerWeek ? String(daysPerWeek) : '',
      tutorGender: genderPreference || 'any',
      specialRemarks: requirements || '',
      status: 'draft',
      source: 'form'
    });

    return Response.json({
      success: true,
      message: 'আপনার টিউশনের তথ্য জমা হয়েছে! ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে SMS-এ জানাবো।'
    });
  } catch (error) {
    console.error('Draft tuition error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 6: Create cron cleanup endpoint**

`src/app/api/cron/cleanup-conversations/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const result = await Conversation.updateMany(
      { status: 'active', updatedAt: { $lt: cutoff } },
      { $set: { status: 'abandoned' } }
    );

    return Response.json({
      success: true,
      abandoned: result.modifiedCount
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 7: Create vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-conversations",
      "schedule": "0 * * * *"
    }
  ]
}
```

- [ ] **Step 8: Commit**

```bash
git add src/app/api/ai/ src/app/api/tuitions/draft/ src/app/api/cron/ vercel.json
git commit -m "feat(api): add chat, search, config, draft, and cron API routes"
```

---

## Task 8: Chat Hooks

**Files:**
- Create: `src/hooks/useChatConfig.ts`
- Create: `src/hooks/useChatStore.ts`

- [ ] **Step 1: Create useChatConfig hook**

```typescript
'use client';

import { useState, useEffect } from 'react';

interface ChatPersona {
  name: string;
  greeting: string;
}

interface ChatConfig {
  persona: ChatPersona;
}

let cachedConfig: ChatConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchChatConfig(): Promise<ChatConfig> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const res = await fetch('/api/ai/config');
    if (!res.ok) throw new Error('Failed to fetch config');
    cachedConfig = await res.json();
    cacheTimestamp = now;
    return cachedConfig!;
  } catch {
    return {
      persona: {
        name: 'কামরুল',
        greeting: 'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?'
      }
    };
  }
}

export function useChatConfig() {
  const [config, setConfig] = useState<ChatConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    fetchChatConfig().then(c => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  return { config, loading };
}
```

- [ ] **Step 2: Create useChatStore hook**

```typescript
'use client';

import { useReducer, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ExtractedData {
  studentClass?: string;
  subjects?: string[];
  location?: { division?: string; district?: string; area?: string; subarea?: string };
  medium?: string;
  tutorGender?: string;
  daysPerWeek?: number;
  salary?: { min?: number; max?: number };
  additionalNotes?: string;
}

interface ChatState {
  isOpen: boolean;
  messages: Message[];
  sessionId: string | null;
  extractedData: Partial<ExtractedData>;
  completeness: number;
  isStreaming: boolean;
  status: 'idle' | 'active' | 'confirming' | 'completed' | 'escalated';
  error: string | null;
}

type ChatAction =
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | { type: 'START_STREAMING' }
  | { type: 'APPEND_TOKEN'; text: string }
  | { type: 'STREAM_DONE'; data: { conversationId: string; extractedData: ExtractedData; completeness: number; status: string; intent: string } }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESTORE_CONVERSATION'; messages: Message[]; sessionId: string; extractedData: ExtractedData; completeness: number; status: string }
  | { type: 'RESET' };

const initialState: ChatState = {
  isOpen: false,
  messages: [],
  sessionId: null,
  extractedData: {},
  completeness: 0,
  isStreaming: false,
  status: 'idle',
  error: null
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'user', content: action.content, timestamp: new Date() }],
        error: null
      };
    case 'START_STREAMING':
      return {
        ...state,
        isStreaming: true,
        messages: [...state.messages, { role: 'assistant', content: '', timestamp: new Date() }]
      };
    case 'APPEND_TOKEN': {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + action.text };
      }
      return { ...state, messages: msgs };
    }
    case 'STREAM_DONE':
      return {
        ...state,
        isStreaming: false,
        sessionId: action.data.conversationId,
        extractedData: action.data.extractedData,
        completeness: action.data.completeness,
        status: action.data.status as ChatState['status']
      };
    case 'SET_ERROR':
      return { ...state, isStreaming: false, error: action.error };
    case 'RESTORE_CONVERSATION':
      return {
        ...state,
        messages: action.messages,
        sessionId: action.sessionId,
        extractedData: action.extractedData,
        completeness: action.completeness,
        status: action.status as ChatState['status']
      };
    case 'RESET':
      return { ...initialState, isOpen: state.isOpen };
    default:
      return state;
  }
}

export function useChatStore() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(async (content: string) => {
    dispatch({ type: 'ADD_USER_MESSAGE', content });
    dispatch({ type: 'START_STREAMING' });

    const browserSessionId = localStorage.getItem('st_browser_session')
      || (() => { const id = crypto.randomUUID(); localStorage.setItem('st_browser_session', id); return id; })();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          browserSessionId,
          message: content
        })
      });

      if (!res.ok) {
        const err = await res.json();
        dispatch({ type: 'SET_ERROR', error: err.error || 'Something went wrong' });
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        dispatch({ type: 'SET_ERROR', error: 'No response stream' });
        return;
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: token')) continue;
          if (line.startsWith('event: done')) continue;
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.text !== undefined) {
              dispatch({ type: 'APPEND_TOKEN', text: data.text });
            } else if (data.conversationId) {
              dispatch({ type: 'STREAM_DONE', data });
            }
          }
        }
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Network error — please try again' });
    }
  }, [state.sessionId]);

  const resumeConversation = useCallback(async () => {
    const browserSessionId = localStorage.getItem('st_browser_session');
    if (!browserSessionId) return;

    try {
      const res = await fetch(`/api/ai/chat/${browserSessionId}`);
      const data = await res.json();
      if (data.conversation) {
        dispatch({
          type: 'RESTORE_CONVERSATION',
          messages: data.conversation.messages,
          sessionId: data.conversation.sessionId,
          extractedData: data.conversation.extractedData || {},
          completeness: data.conversation.completeness || 0,
          status: data.conversation.status
        });
      }
    } catch {
      // No conversation to resume — that's fine
    }
  }, []);

  return { state, dispatch, sendMessage, resumeConversation };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useChatConfig.ts src/hooks/useChatStore.ts
git commit -m "feat(hooks): add useChatConfig and useChatStore for chat widget"
```

---

## Task 9: Chat Widget Components

**Files:**
- Create: `src/components/ChatWidget/ChatWidget.tsx`
- Create: `src/components/ChatWidget/ChatBubble.tsx`
- Create: `src/components/ChatWidget/ChatPanel.tsx`
- Create: `src/components/ChatWidget/ChatMessage.tsx`
- Create: `src/components/ChatWidget/ChatInput.tsx`
- Create: `src/components/ChatWidget/ChatHeader.tsx`
- Create: `src/components/ChatWidget/ChatConfirmation.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create ChatBubble.tsx**

```typescript
'use client';

interface ChatBubbleProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export default function ChatBubble({ onClick, hasUnread }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-[#006A4E] hover:bg-[#005a40] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:ring-offset-2"
      aria-label="Chat with কামরুল"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E07B2A] rounded-full border-2 border-white" />
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create ChatHeader.tsx**

```typescript
'use client';

interface ChatHeaderProps {
  agentName: string;
  onClose: () => void;
  onBack?: () => void;
  isMobile: boolean;
}

export default function ChatHeader({ agentName, onClose, onBack, isMobile }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#006A4E] text-white rounded-t-xl">
      {isMobile && onBack && (
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
        {agentName.charAt(0)}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{agentName}</p>
        <p className="text-xs text-white/70">Smart Tutor সাহায্যকারী</p>
      </div>
      {!isMobile && (
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create ChatMessage.tsx**

```typescript
'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  agentName: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, agentName, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isUser
        ? 'bg-[#006A4E] text-white rounded-2xl rounded-br-md'
        : 'bg-[#FFFDF7] border border-[#E8DDD0] text-[#1C1917] rounded-2xl rounded-bl-md'
      } px-4 py-2.5 text-sm leading-relaxed`}>
        {!isUser && (
          <p className="text-[10px] font-semibold text-[#006A4E] mb-1">{agentName}</p>
        )}
        <p className="whitespace-pre-wrap">{content}{isStreaming && <span className="inline-block w-1.5 h-4 bg-[#006A4E] ml-0.5 animate-pulse" />}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ChatInput.tsx**

```typescript
'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-[#E8DDD0] bg-white">
      {/* Honeypot field for bots */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'আপনার মেসেজ লিখুন...'}
          disabled={disabled}
          className="flex-1 px-4 py-2.5 bg-[#F5F0E8] border border-[#E8DDD0] rounded-full text-sm text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#006A4E] focus:border-transparent disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="w-10 h-10 bg-[#006A4E] hover:bg-[#005a40] disabled:bg-[#E8DDD0] text-white rounded-full flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create ChatConfirmation.tsx**

```typescript
'use client';

interface ExtractedData {
  studentClass?: string;
  subjects?: string[];
  location?: { division?: string; district?: string; area?: string };
  medium?: string;
  tutorGender?: string;
  daysPerWeek?: number;
  salary?: { min?: number; max?: number };
}

interface ChatConfirmationProps {
  data: ExtractedData;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function ChatConfirmation({ data, onConfirm, onEdit }: ChatConfirmationProps) {
  const locationStr = data.location
    ? [data.location.area, data.location.district, data.location.division].filter(Boolean).join(', ')
    : '';
  const salaryStr = data.salary
    ? `৳${data.salary.min?.toLocaleString() || '?'} - ৳${data.salary.max?.toLocaleString() || '?'}`
    : '';

  return (
    <div className="bg-[#FFFDF7] border border-[#E8DDD0] rounded-xl p-4 mx-3 my-2">
      <p className="text-xs font-semibold text-[#006A4E] mb-3">📋 টিউশনের তথ্য</p>
      <div className="space-y-1.5 text-sm text-[#1C1917]">
        {data.studentClass && <p>• ক্লাস: {data.studentClass}</p>}
        {data.subjects?.length && <p>• সাবজেক্ট: {data.subjects.join(', ')}</p>}
        {locationStr && <p>• এলাকা: {locationStr}</p>}
        {data.medium && <p>• মাধ্যম: {data.medium}</p>}
        {data.daysPerWeek && <p>• সপ্তাহে: {data.daysPerWeek} দিন</p>}
        {salaryStr && <p>• বেতন: {salaryStr}</p>}
        {data.tutorGender && <p>• টিউটর: {data.tutorGender === 'male' ? 'পুরুষ' : data.tutorGender === 'female' ? 'মহিলা' : 'যেকোনো'}</p>}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 text-sm border border-[#E8DDD0] text-[#78716C] rounded-lg hover:bg-[#F5F0E8] transition-colors"
        >
          ✏️ পরিবর্তন
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-3 py-2 text-sm bg-[#006A4E] text-white rounded-lg hover:bg-[#005a40] transition-colors"
        >
          ✅ ঠিক আছে
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create ChatPanel.tsx**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  agentName: string;
  isStreaming: boolean;
  isCompleted: boolean;
  error: string | null;
  isMobile: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

export default function ChatPanel({
  messages, agentName, isStreaming, isCompleted, error, isMobile, onSend, onClose
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const panelClasses = isMobile
    ? 'fixed inset-0 z-50 flex flex-col bg-white'
    : 'fixed bottom-24 right-6 z-40 w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-white rounded-xl shadow-2xl border border-[#E8DDD0] overflow-hidden';

  return (
    <div className={panelClasses}>
      <ChatHeader
        agentName={agentName}
        onClose={onClose}
        onBack={isMobile ? onClose : undefined}
        isMobile={isMobile}
      />

      <div className="flex-1 overflow-y-auto p-4 bg-[#F5F0E8]/30">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            agentName={agentName}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        {error && (
          <div className="text-center text-sm text-red-600 bg-red-50 rounded-lg p-2 mx-4">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={onSend}
        disabled={isStreaming || isCompleted}
        placeholder={isCompleted ? 'কথোপকথন শেষ হয়েছে' : undefined}
      />

      {isCompleted && (
        <div className="p-2 bg-[#006A4E]/5 border-t border-[#E8DDD0] text-center">
          <a href="/post-tuition" className="text-xs text-[#006A4E] hover:underline">
            ফর্ম পূরণ করে আরেকটি টিউশন পোস্ট করুন →
          </a>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create ChatWidget.tsx (main wrapper)**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatBubble from './ChatBubble';
import ChatPanel from './ChatPanel';
import { useChatConfig } from '@/hooks/useChatConfig';
import { useChatStore } from '@/hooks/useChatStore';

export default function ChatWidget() {
  const pathname = usePathname();
  const { config } = useChatConfig();
  const { state, dispatch, sendMessage, resumeConversation } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);

  // Hide on dashboard and tutor portal pages
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/tutor') || pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Try to resume conversation on first open
  useEffect(() => {
    if (state.isOpen && state.messages.length === 0) {
      resumeConversation().then(() => {
        // If no conversation to resume, show greeting
        if (state.messages.length === 0 && config?.persona.greeting) {
          dispatch({
            type: 'RESTORE_CONVERSATION',
            messages: [{
              role: 'assistant' as const,
              content: config.persona.greeting,
              timestamp: new Date()
            }],
            sessionId: '',
            extractedData: {},
            completeness: 0,
            status: 'active'
          });
        }
      });
    }
  }, [state.isOpen]);

  return (
    <>
      {!state.isOpen && (
        <ChatBubble onClick={() => dispatch({ type: 'OPEN' })} />
      )}
      {state.isOpen && (
        <ChatPanel
          messages={state.messages}
          agentName={config?.persona.name || 'কামরুল'}
          isStreaming={state.isStreaming}
          isCompleted={state.status === 'completed'}
          error={state.error}
          isMobile={isMobile}
          onSend={sendMessage}
          onClose={() => dispatch({ type: 'CLOSE' })}
        />
      )}
    </>
  );
}
```

- [ ] **Step 8: Add ChatWidget to root layout**

In `src/app/layout.tsx`, add the ChatWidget import and render it inside the body:

```typescript
import ChatWidget from '@/components/ChatWidget/ChatWidget';

// Inside the body, after <main> or at the end before closing </body>:
<ChatWidget />
```

- [ ] **Step 9: Commit**

```bash
git add src/components/ChatWidget/ src/app/layout.tsx
git commit -m "feat(ui): add chat widget with bubble, panel, messages, and streaming"
```

---

## Task 10: Guardian Tuition Form Page

**Files:**
- Create: `src/app/post-tuition/page.tsx`

**Note:** The codebase already has `src/app/hire-a-tutor/page.tsx` — a similar guardian page. This new `/post-tuition` page replaces it as the primary guardian form. Add a redirect from `/hire-a-tutor` to `/post-tuition` to avoid duplicate pages.

- [ ] **Step 1: Create the public guardian form**

Build a form page at `/post-tuition` with all tuition fields. Uses the brand design tokens. Submits to `POST /api/tuitions/draft`. Shows success message after submission.

Key elements:
- Student class dropdown (1-12, HSC, Honours, Masters)
- Subjects multi-input (text input that adds chips)
- Location using existing `LocationSearch` component (import from `@/components/LocationSearch`, accepts `onLocationSelect` prop)
- Medium radio buttons (Bangla Medium / English Medium / English Version)
- Tutor gender radio (Male / Female / Any)
- Days per week dropdown (1-7)
- Salary range (two number inputs: min-max)
- Guardian name text input
- Phone number input (validated 01XXXXXXXXX)
- Additional notes textarea
- Hidden honeypot field (`_hp`)
- Submit button: "টিউশন পোস্ট করুন" in brand green
- Success state: shows confirmation message with link to chat
- All fields use `focus:ring-[#006A4E]`, brand borders, cream backgrounds

- [ ] **Step 2: Add redirect from /hire-a-tutor**

In `src/app/hire-a-tutor/page.tsx`, replace with a redirect:
```typescript
import { redirect } from 'next/navigation';
export default function HireATutor() { redirect('/post-tuition'); }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/post-tuition/page.tsx
git commit -m "feat(ui): add public guardian tuition form at /post-tuition"
```

---

## Task 11: Tutor Smart Search UI

**Files:**
- This will be integrated into the existing tutor tuitions page or a new tutor search page.
- Create: `src/components/TutorSmartSearch.tsx`

- [ ] **Step 1: Create TutorSmartSearch component**

A search bar component with:
- Text input styled with brand colors
- Search button (not debounced — button-triggered)
- Results list with match cards (score badge, ST code, class, subjects, area, salary, medium, match reasons, apply button)
- Empty state: "Recommended for You" auto-scored results
- Loading state during Gemini parsing
- Error fallback message

- [ ] **Step 2: Integrate into tutor portal**

Add the TutorSmartSearch component to the tutor's tuitions/search page.

- [ ] **Step 3: Commit**

```bash
git add src/components/TutorSmartSearch.tsx
git commit -m "feat(ui): add tutor smart search with AI match scoring"
```

---

## Task 12: Admin Conversations Dashboard

**Files:**
- Create: `src/app/dashboard/conversations/page.tsx`
- Modify: `src/components/DashboardSidebar.tsx`

- [ ] **Step 1: Add "Conversations" to sidebar**

In `src/components/DashboardSidebar.tsx`, add a new menu item in the "Communication" group:

```typescript
{
  name: 'Conversations',
  href: '/dashboard/conversations',
  icon: ChatBubbleLeftRightIcon, // from heroicons
}
```

Add a draft count badge that fetches from a new endpoint or inline query.

- [ ] **Step 2: Create the conversations dashboard page**

`src/app/dashboard/conversations/page.tsx`:

Key elements:
- **Stats bar** at top: total today, drafts pending, escalated, success rate
- **Left panel**: conversation list with status/intent badges, search, filters (status, intent, date range)
- **Right panel**: selected conversation detail — full message thread (read-only), extracted data sidebar (editable), action buttons
- **Draft review mode**: when viewing a completed conversation with a draft tuition:
  - Show extracted data as editable form
  - "Publish" button → changes tuition status from `draft` to `open` (triggers code generation + SMS)
  - "Reject" button → with reason input, notifies guardian
- **Mobile**: list view → tap → full thread
- All styled with brand colors

- [ ] **Step 3: Add API endpoints for admin conversation management**

Create `src/app/api/conversations/route.ts`:
- GET: list conversations with filters (admin only)
- PUT: update conversation / publish draft tuition

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/conversations/ src/components/DashboardSidebar.tsx src/app/api/conversations/
git commit -m "feat(admin): add conversations dashboard with draft review and publish"
```

---

## Task 13: Business Settings — AI Chat & Search Config Tabs

**Files:**
- Modify: `src/app/dashboard/business-settings/page.tsx`

- [ ] **Step 1: Add "AI Chat Settings" tab (Tab 7)**

Add a new tab to the existing 6-tab business settings page:

Content:
- Persona name input
- Greeting textarea
- Personality/tone textarea (system prompt snippet)
- Tuition questions list with drag-and-drop reordering (field, question, required toggle, validation hint, order)
- Knowledge articles manager (add/edit/delete topic+content pairs)
- WhatsApp number input for escalation
- Rate limit number input (max conversations/hour)
- Message editors: confirmation, success, resume, escalation, error
- Salary guidance toggle
- **Test Chat** button → opens the actual chat widget in test mode (on the current page)

- [ ] **Step 2: Add "Search Config" section (Tab 8 or subsection of Tab 7)**

- Weight sliders for each scoring dimension (location, subject, class, salary, medium, gender)
- Shows current values, validates sum ≈ 1.0
- Save updates `searchConfig.weights` in SiteSettings

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/business-settings/page.tsx
git commit -m "feat(admin): add AI Chat Settings and Search Config to business settings"
```

---

## Task 14: Data Migrations

**Files:**
- Create: `src/scripts/migrate-salary.ts`
- Create: `src/scripts/migrate-location-data.ts`

- [ ] **Step 1: Create salary migration script**

`src/scripts/migrate-salary.ts`:

```typescript
// Run with: npx ts-node src/scripts/migrate-salary.ts
// Converts salary from String to { min, max } for all existing tuitions

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrateSalary() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const collection = db.collection('tuitions');

  const tuitions = await collection.find({ salary: { $type: 'string' } }).toArray();
  console.log(`Found ${tuitions.length} tuitions with string salary`);

  for (const t of tuitions) {
    const salaryStr = String(t.salary || '').trim();
    let min: number | null = null;
    let max: number | null = null;

    if (salaryStr.includes('-')) {
      const parts = salaryStr.split('-').map(s => parseInt(s.replace(/[^\d]/g, '')));
      min = parts[0] || null;
      max = parts[1] || parts[0] || null;
    } else {
      const num = parseInt(salaryStr.replace(/[^\d]/g, ''));
      if (!isNaN(num)) { min = num; max = num; }
    }

    await collection.updateOne(
      { _id: t._id },
      { $set: { salary: { min, max } } }
    );
  }

  console.log('Salary migration complete');
  await mongoose.disconnect();
}

migrateSalary().catch(console.error);
```

- [ ] **Step 2: Create location data backfill script**

`src/scripts/migrate-location-data.ts`:

```typescript
// Run with: npx ts-node src/scripts/migrate-location-data.ts
// Parses existing location strings and populates locationData

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrateLocationData() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const tuitions = db.collection('tuitions');
  const locations = db.collection('locations');

  const allTuitions = await tuitions.find({
    location: { $exists: true, $ne: '' },
    locationData: { $exists: false }
  }).toArray();

  console.log(`Found ${allTuitions.length} tuitions to backfill`);

  const allLocations = await locations.find({}).toArray();

  for (const t of allTuitions) {
    const locStr = String(t.location || '').toLowerCase();
    const parts = locStr.split(/[,\s]+/).filter(Boolean);

    // Try to match against known locations
    let bestMatch = null;
    let bestScore = 0;

    for (const loc of allLocations) {
      let score = 0;
      const area = (loc.area || '').toLowerCase();
      const district = (loc.district || '').toLowerCase();
      const division = (loc.division || '').toLowerCase();

      for (const part of parts) {
        if (area.includes(part) || part.includes(area)) score += 3;
        if (district.includes(part) || part.includes(district)) score += 2;
        if (division.includes(part) || part.includes(division)) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = loc;
      }
    }

    if (bestMatch && bestScore >= 2) {
      await tuitions.updateOne(
        { _id: t._id },
        {
          $set: {
            locationData: {
              division: bestMatch.division,
              district: bestMatch.district,
              area: bestMatch.area,
              subarea: bestMatch.subarea || '',
              locationRef: bestMatch._id
            }
          }
        }
      );
    }
  }

  console.log('Location data backfill complete');
  await mongoose.disconnect();
}

migrateLocationData().catch(console.error);
```

- [ ] **Step 3: Update existing salary display code**

Search all files that read `tuition.salary` as a string and update to handle `{ min, max }` format. Key files:
- `src/app/dashboard/tuitions/page.tsx`
- `src/components/TuitionEditForm.tsx`
- `src/app/api/tuitions/route.ts`

Create a helper:
```typescript
// src/utils/formatSalary.ts
export function formatSalary(salary: { min?: number; max?: number } | string | undefined): string {
  if (!salary) return 'N/A';
  if (typeof salary === 'string') return salary; // backward compat
  const { min, max } = salary;
  if (min && max && min !== max) return `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
  if (min) return `৳${min.toLocaleString()}`;
  if (max) return `৳${max.toLocaleString()}`;
  return 'N/A';
}
```

- [ ] **Step 4: Commit**

```bash
git add src/scripts/ src/utils/formatSalary.ts
git commit -m "feat(scripts): add salary and location data migration scripts"
```

---

## Task 15: Update Tuitions API + Display for New Salary Format

**Files:**
- Modify: `src/app/api/tuitions/route.ts`
- Modify: `src/app/dashboard/tuitions/page.tsx`

- [ ] **Step 1: Update tuitions API to handle salary object**

In the POST handler of `src/app/api/tuitions/route.ts`, ensure new tuitions accept salary as `{ min, max }` object.

- [ ] **Step 2: Update tuitions dashboard page**

Replace all `tuition.salary` string displays with `formatSalary(tuition.salary)` calls.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/tuitions/route.ts src/app/dashboard/tuitions/page.tsx
git commit -m "feat: update tuitions API and dashboard for structured salary format"
```

---

## Task 16: Homepage Dual CTA

**Files:**
- Modify: `src/app/page.tsx` (or the homepage hero section component)

- [ ] **Step 1: Add dual CTA buttons to homepage hero**

Add two prominent buttons to the homepage hero section:

```typescript
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <button
    onClick={() => {/* trigger chat widget open */}}
    className="px-8 py-4 bg-[#006A4E] hover:bg-[#005a40] text-white rounded-xl font-semibold text-lg transition-colors shadow-lg"
  >
    কামরুলের সাথে কথা বলুন
  </button>
  <a
    href="/post-tuition"
    className="px-8 py-4 bg-[#E07B2A] hover:bg-[#c96a1f] text-white rounded-xl font-semibold text-lg transition-colors shadow-lg text-center"
  >
    ফর্ম পূরণ করুন
  </a>
</div>
```

The chat button dispatches a custom event that the ChatWidget listens for to open.

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(ui): add dual CTA (chat + form) to homepage hero"
```

---

## Task 17: Final Integration Test

- [ ] **Step 1: Start dev server and test chat widget**

Run: `npm run dev`

Test:
1. Visit homepage → chat bubble appears bottom-right
2. Click bubble → panel opens (desktop) or fullscreen (mobile)
3. Type "amar chele er jonno tutor lagbe" → AI responds
4. Complete full conversation flow → draft created
5. Visit `/dashboard` → bubble should NOT appear

- [ ] **Step 2: Test guardian form**

1. Visit `/post-tuition` → form renders with all fields
2. Fill and submit → success message shown
3. Check DB → draft tuition created with `source: 'form'`

- [ ] **Step 3: Test admin conversations dashboard**

1. Visit `/dashboard/conversations` → conversations list loads
2. Click a completed conversation → detail panel shows
3. Click "Publish" on a draft → tuition status changes to `open`, code generated

- [ ] **Step 4: Test tutor search**

1. Log in as tutor → navigate to search
2. Type "mirpur e physics tuition" → click Search
3. Results appear with match scores

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete AI chat widget, tutor search, and admin conversations"
```

---

## Dependency Graph

```
Task 1 (Tuition model) ──┬── Task 14+15 (Migrations + salary display) ⚠️ RUN RIGHT AFTER Task 1
Task 2 (Guardian model) ──┤
Task 3 (SiteSettings)  ──┼── Task 5 (AI chat lib) ──┐
Task 4 (Conversation)  ──┘   Task 6 (AI search lib) ─┼── Task 7 (API routes) ──┐
                                                       │                        │
                              Task 8 (Chat hooks) ─────┘                        │
                                                                                │
                              Task 9 (Chat widget) ────────── needs Task 7,8    │
                              Task 10 (Guardian form) ──────── needs Task 7     │
                              Task 11 (Tutor search UI) ───── needs Task 7      │
                              Task 12 (Admin dashboard) ───── needs Task 7      │
                              Task 13 (Business settings) ─── needs Task 3      │
                              Task 16 (Homepage dual CTA) ─── needs Task 9      │
                              Task 17 (Integration test) ──── needs all         │
```

**⚠️ CRITICAL ORDERING:** Tasks 14+15 MUST run immediately after Task 1. Changing salary from String to Object breaks all existing salary displays until formatSalary helper is in place.

**Parallelizable groups:**
- After Tasks 1-4 + 14-15: Tasks 5+6 can run in parallel
- After Tasks 5-8: Tasks 9+10+11+12+13+16 can run in parallel
