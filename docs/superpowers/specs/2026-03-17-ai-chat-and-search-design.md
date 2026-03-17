# AI Chat Widget & Tutor Smart Search — Design Spec

**Date:** 2026-03-17
**Status:** Draft
**Approach:** Monolithic (inside existing Next.js app)

---

## 1. Overview

Transform Smart Tutors from a manual tuition listing platform into an AI-powered tuition media platform with two core features:

1. **AI Chat Widget ("কামরুল")** — Conversational tuition posting for guardians + customer care (FAQ, status tracking, escalation to WhatsApp). This is the platform's **USP** — the differentiator that makes Smart Tutors stand out.
2. **Traditional Guardian Form** — Standard form-based tuition posting for guardians who prefer structured input. Parallel path alongside the chat.
3. **AI Tutor Smart Search** — Natural language tuition search with AI match scoring for tutors

### Tuition Posting: Two Paths

Guardians choose whichever they prefer:
- **Option A: AI Chat (কামরুল)** — conversational, no-friction, the "wow" factor
- **Option B: Traditional Form** — structured, familiar, always available (also serves as Gemini-down fallback)

Both paths create `draft` tuitions → admin reviews → publishes. Same pipeline, different entry points.

### Core Principles

- **No guardian contact data visible publicly** — phone, name, address are admin-only. Tutors see: class, subjects, area, medium, salary range, gender preference, ST code.
- **No tuition goes live without admin approval** — AI creates drafts, admin reviews and publishes.
- **Multilingual** — Bengali, English, Banglish, broken/misspelled words all handled.
- **AI persona and questions are fully admin-customizable** — zero code deployments to change chat behavior.
- **Gemini Pro** powers all AI features (already integrated).
- **Track adoption** — monitor chat vs form conversion rates to inform future investment (WhatsApp bot if chat adoption is low).

---

## 2. System Architecture

### Approach: Monolithic

Everything lives inside the existing Next.js 15 app. No new services, no new infrastructure.

- **Chat Widget** → React components + `/api/ai/chat` endpoint
- **Guardian Form** → Public tuition posting form at `/post-tuition` (Gemini-down fallback + alternative path)
- **Conversation state** → New `Conversation` MongoDB model
- **Tuition creation** → Chat OR form creates Tuition as `draft`
- **Tutor search** → `/api/ai/search` endpoint → Gemini parses query → MongoDB aggregation with scoring
- **Escalation** → AI detects "real person" intent → WhatsApp link to admin
- **Admin review** → Dashboard page to view conversations, review drafts, publish tuitions

### Tech Stack (No Changes)

- Next.js 15 App Router (TypeScript)
- MongoDB + Mongoose
- Google Gemini Pro API
- Tailwind CSS with brand tokens (#006A4E, #E07B2A, #FFFDF7, #E8DDD0, #F5F0E8)
- Vercel deployment

---

## 3. Data Models

### 3.1 Conversation Model (NEW)

```typescript
// src/models/Conversation.ts

interface IConversation {
  sessionId: string;              // unique per conversation
  browserSessionId: string;       // persists in localStorage across sessions
                                  // one browserSessionId can have multiple conversations
                                  // resume fetches the latest 'active' conversation for this ID
  guardianId?: ObjectId;          // if registered guardian
  userPhone?: string;             // collected during chat
  userName?: string;              // collected during chat
  userType: 'guardian' | 'tutor' | 'unknown';

  intent:
    | 'post_tuition'
    | 'track_status'
    | 'faq'
    | 'support'
    | null;
  // Note: 'tutor_search' removed from chat intents — tutors use the
  // dedicated search UI (Section 6), not the chat widget.

  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;

  // Conversation state (not tuition data)
  completeness: number;           // 0-100% of required fields collected
  confirmedByUser: boolean;       // guardian approved before posting

  extractedData: {
    studentClass?: string;
    subjects?: string[];
    location?: {
      division?: string;
      district?: string;
      area?: string;
      subarea?: string;
    };
    medium?: string;              // 'Bangla Medium' | 'English Medium' | 'English Version'
                                  // Maps to Tuition model's 'version' field
                                  // Maps to Tutor model's short codes: BM/EM/EV
    tutorGender?: string;         // 'male' | 'female' | 'any'
    daysPerWeek?: number;
    salary?: { min?: number; max?: number };
    additionalNotes?: string;
  };

  status: 'active' | 'completed' | 'escalated' | 'abandoned';
  tuitionId?: ObjectId;           // linked after draft tuition is created
  escalationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 SiteSettings Extension (chatConfig + searchConfig)

Added to existing `SiteSettings` model:

```typescript
chatConfig: {
  persona: {
    name: string;                  // "কামরুল"
    greeting: string;              // opening message (AI auto-detects language)
                                   // e.g., "আসসালামু আলাইকুম! আমি smart agent কামরুল।"
    personality: string;           // system prompt snippet for tone (textarea in admin)
                                   // e.g., "তুমি কামরুল, বড় ভাইয়ের মতো কথা বলো। casual tone রাখো।"
  };

  tuitionQuestions: Array<{
    field: string;                 // maps to extractedData field
    question: string;              // question text (AI auto-detects user language)
    required: boolean;
    order: number;
    validationHint: string;        // helps AI validate: "class 1-12, HSC, Honours"
  }>;

  salaryGuidance: boolean;         // suggest rates from existing tuition data (Phase 2, optional)

  confirmationMessage: string;     // uses {{code}} placeholder (matches existing SMS template syntax)
  successMessage: string;          // "✅ আপনার তথ্য আমাদের টিমের কাছে পাঠানো হয়েছে..."
  resumeMessage: string;           // "আবার স্বাগতম! আমরা শেষবার এখানে ছিলাম..."
  escalationMessage: string;       // "আমি আপনাকে আমাদের টিমের সাথে যুক্ত করছি!"
  errorMessage: string;            // fallback when Gemini fails
  whatsappNumber: string;          // admin WhatsApp for escalation

  knowledgeArticles: Array<{
    topic: string;                 // "media fee", "registration", "pricing"
    content: string;               // knowledge chunk AI weaves into conversation naturally
  }>;

  maxConversationsPerHour: number; // rate limiting per IP (API cost control)
};

searchConfig: {
  weights: {
    location: number;              // default 0.30
    subject: number;               // default 0.25
    class: number;                 // default 0.20
    salary: number;                // default 0.15
    medium: number;                // default 0.05
    gender: number;                // default 0.05
  };
};
```

**Simplification notes:**
- Single message field per config item (no `_bn`/`_en` variants). The AI auto-detects the user's language and responds accordingly. Admin writes messages in Bengali since that's the primary audience. The AI handles translation naturally.
- Placeholder syntax uses `{{code}}` to match existing SMS template conventions in SiteSettings.

### 3.3 Tuition Model Changes

**Status enum — add `'draft'`:**

```typescript
// Current: ['open', 'available', 'demo running', 'booked', 'booked by other']
// New:     ['draft', 'open', 'available', 'demo running', 'booked', 'booked by other']
```

Only `'draft'` is being added. `draft` tuitions are invisible to tutors and public. Only admin sees them.

**Salary field — migrate from String to structured object:**

```typescript
// Current: salary: { type: String }
// New:
salary: {
  min: { type: Number },
  max: { type: Number }
}
```

This is required for:
- Chat → draft creation (AI extracts min/max from natural language)
- Search scoring (numeric comparison for salary alignment)

**Migration strategy:** Write a one-time migration script that parses existing string salary values (e.g., "3000-4000", "5000") into `{ min, max }` format. Existing code that reads salary will need updating.

**Location field — add structured `locationData` alongside existing string:**

```typescript
// Keep existing: location: { type: String }  (for display)
// Add new:
locationData: {
  division: String,
  district: String,
  area: String,
  subarea: String,
  locationRef: { type: Schema.Types.ObjectId, ref: 'Location' }  // optional
}
```

This is required for hierarchical location scoring in search (same area=100%, same district=70%, same division=40%). The existing `location` string is kept for backward compatibility and display. The new `locationData` is used for scoring.

**Source tracking — know where tuitions come from:**

```typescript
// Add to Tuition model
source: {
  type: String,
  enum: ['chat', 'form', 'admin'],   // chat = AI কামরুল, form = guardian form, admin = dashboard
  default: 'admin'
}
```

This enables tracking chat vs form adoption rates in the admin dashboard.

**Code generation — conditional for drafts:**

The existing `pre('validate')` hook auto-generates ST codes. Modify to **skip code generation when status is 'draft'**. Code is generated when admin publishes (changes status from 'draft' to 'open').

### 3.4 Guardian Model Changes

**Make `address` optional:**

```typescript
// Current: address: { type: String, required: true }
// New:     address: { type: String }  // optional — chat collects location, not street address
```

The chat collects area-level location, not a full street address. Making `address` optional prevents validation errors during guardian creation from chat.

**Find-or-create logic:**

When creating a guardian from chat data:
1. Look up Guardian by phone number (`number` field, which has `unique: true`)
2. If exists → link to existing Guardian, optionally update name
3. If not found → create new Guardian with name + phone + location as address

### 3.5 No Changes To

- Tutor model
- Location model
- All other existing models

---

## 4. AI Chat Widget

### 4.1 Component Architecture

```
src/components/ChatWidget/
  ChatWidget.tsx          — Main wrapper: bubble + panel/fullscreen toggle
  ChatBubble.tsx          — Floating button (bottom-right, all public pages)
  ChatPanel.tsx           — Desktop: 400px side panel | Mobile: fullscreen overlay
  ChatMessage.tsx         — Single message bubble (user/assistant styling)
  ChatInput.tsx           — Text input + send button, fixed at bottom
  ChatHeader.tsx          — কামরুল avatar + name + minimize/close
  ChatConfirmation.tsx    — Tuition summary rendered as a styled chat message
                            with "✏️ Edit" and "✅ Confirm" button row
```

### 4.2 Behavior

- Loads on **every public page** but NOT on `/dashboard/*` or `/tutor/*` portal pages
- **Scoping:** Added to root `layout.tsx` as a client component that checks `usePathname()` — hides when path starts with `/dashboard` or `/tutor` (no route group restructuring needed)
- Fetches `chatConfig` from `/api/ai/config` on mount via a new `useChatConfig` hook with 5-minute TTL cache (separate from existing `useSettings` hook)
- Stores `browserSessionId` in localStorage
- On open → checks for existing active conversation → resumes or starts new
- Messages stream via **Server-Sent Events (SSE)** from `/api/ai/chat` — real-time typing effect
- **Desktop (>=768px):** floating bubble → expands to 400px chat panel, bottom-right
- **Mobile (<768px):** floating bubble → taps open **fullscreen overlay** with back arrow

### 4.3 Z-Index Strategy

```
Chat bubble:     z-30  (below modals, above content)
Chat panel:      z-40  (above bubble, below modals)
Mobile overlay:  z-50  (fullscreen, above everything except modals)
Modals:          z-[60] (always on top)
```

### 4.4 State Management

Local `useReducer` — no global state library:

```typescript
interface ChatState {
  isOpen: boolean;
  messages: Message[];
  conversationId: string | null;
  extractedData: Partial<TuitionExtractedData>;
  completeness: number;
  isStreaming: boolean;
  status: 'active' | 'confirming' | 'completed' | 'escalated';
}
```

### 4.5 Error Handling & Gemini-Down Fallback

- Gemini API fails → show admin-configured `errorMessage` from SiteSettings
- Network offline → "ইন্টারনেট সংযোগ নেই, আবার চেষ্টা করুন"
- Rate limit hit → "এই মুহূর্তে অনেক মানুষ কথা বলছে, কিছুক্ষণ পর আসুন"
- **Gemini down for extended period** → Chat widget shows: "আমাদের AI এখন ব্যস্ত। আপনি সরাসরি ফর্ম পূরণ করে টিউশন পোস্ট করতে পারেন!" with a button linking to `/post-tuition` (the traditional form). This ensures tuition posting is **never fully blocked** by AI downtime.

---

## 4B. Guardian Tuition Form (Traditional Path)

### Public page: `/post-tuition`

A standard form-based tuition posting page for guardians who prefer structured input or when the AI chat is unavailable.

**Fields** (match the same data the chat collects):
- Student class (dropdown)
- Subjects (multi-select)
- Location (area, district — using existing LocationSearch component)
- Medium (radio: Bangla Medium / English Medium / English Version)
- Preferred tutor gender (radio: Male / Female / Any)
- Days per week (dropdown: 1-7)
- Salary range (min-max number inputs)
- Guardian name (text)
- Phone number (text, validated Bangladesh format)
- Additional notes (textarea, optional)

**Behavior:**
- No login required
- Submits to the same draft pipeline — creates Tuition with `status: 'draft'`
- Guardian sees: "আপনার টিউশনের তথ্য জমা হয়েছে! ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে SMS-এ জানাবো।"
- Admin reviews and publishes — same flow as chat-created drafts
- Form uses existing brand styling (green/saffron/cream theme)

**Dual CTA on homepage:**
The homepage should present both options prominently:
- "কামরুলের সাথে কথা বলুন" → opens chat widget
- "ফর্ম পূরণ করুন" → navigates to `/post-tuition`

---

## 5. AI Conversation Engine

### 5.1 Three Layers

**Layer 1 — Intent Detection:**
First message → Gemini classifies:
- "আমার বাচ্চার জন্য টিউটর দরকার" → `post_tuition`
- "ST-2345 কি অবস্থা?" → `track_status`
- "কিভাবে টিউটর হবো?" → `faq`
- "admin er sathe kotha bolte chai" → escalation → WhatsApp link
- Unclear → ask a clarifying question

**Layer 2 — Conversation Engine (post_tuition):**
System prompt includes:
- Persona config (name, personality) from SiteSettings
- Question list with order and validation hints from SiteSettings
- Knowledge articles for FAQ handling
- Instructions: one question at a time, warm/human tone, accept messy input, normalize data, track completeness, handle partial-info first messages (don't re-ask what's already provided)
- Salary guidance: suggest rates from existing tuition data when `salaryGuidance` is enabled (Phase 2)
- Phone validation: Bangladesh format (01XXXXXXXXX, 11 digits) — re-ask if invalid
- Confirmation: summarize all fields, allow field-level edits, re-confirm after edits
- **Conversation history management:** Send last 20 messages + system prompt + current extractedData summary to Gemini. Older messages are truncated to stay within Gemini's context window.

**Layer 3 — Action Execution:**
After user confirms (`confirmedByUser: true`):
1. **Find or create Guardian:** Look up by phone → link if exists, create if new (name + phone + formatted location as address)
2. Create `Tuition` with `status: 'draft'` + extracted data (no ST code yet)
3. Update `Conversation` with `tuitionId`, set status `completed`
4. AI tells guardian the admin-configured `successMessage`
5. Admin gets notification → reviews draft → edits if needed → publishes (ST code generated at publish time) → SMS sent to guardian

### 5.2 Field Mapping: extractedData → Tuition Model

| extractedData field | Tuition model field | Transformation |
|---|---|---|
| studentClass | class | Direct map |
| subjects | subjects | Direct map (array) |
| location | location (string) + locationData (structured) | Format as "Area, District" for display; structured for scoring |
| medium | version | Map: "Bangla Medium"→"Bangla Medium", etc. |
| tutorGender | genderPreference | Direct map |
| daysPerWeek | daysPerWeek | Direct map |
| salary | salary | Direct map as `{ min, max }` |
| additionalNotes | requirements | Direct map |

Guardian data (name, phone) maps to `guardianName` and `guardianNumber` on the Tuition model.

### 5.3 Example Conversation Flow

```
কামরুল:  আসসালামু আলাইকুম! আমি smart agent কামরুল।
          আপনাকে কিভাবে সাহায্য করতে পারি?

User:     amar chele er jonno tutor lagbe

কামরুল:  অবশ্যই! আপনার ছেলে কোন ক্লাসে পড়ে?

User:     class 8

কামরুল:  ক্লাস ৮, বুঝেছি! কোন কোন সাবজেক্টে টিউটর চান?

User:     math ar science

কামরুল:  Math আর Science — দারুণ!
          বাসা কোন এলাকায় বলুন?

User:     mirpur dhaka

কামরুল:  মিরপুর, ঢাকা 👍
          English Medium না Bangla Medium?

User:     bangla

কামরুল:  ঠিক আছে! সপ্তাহে কয়দিন পড়াতে চাইবেন?

User:     3 din

কামরুল:  ৩ দিন, বুঝলাম। ছেলে না মেয়ে টিউটর পছন্দ করবেন?

User:     male

কামরুল:  বেতন কত দিতে চাইবেন মাসে?

User:     3000-4000

কামরুল:  আপনার নামটা জানালে ভালো হয়!

User:     karim

কামরুল:  করিম ভাই, আপনার ফোন নম্বরটা দিন — আপডেট পাঠাবো।

User:     01712345678

কামরুল:  ধন্যবাদ! একটু দেখে নিন সব ঠিক আছে কিনা:

          📋 টিউশনের তথ্য:
          • ক্লাস: ৮
          • সাবজেক্ট: Math, Science
          • এলাকা: মিরপুর, ঢাকা
          • মাধ্যম: বাংলা
          • সপ্তাহে: ৩ দিন
          • বেতন: ৳৩,০০০ - ৳৪,০০০
          • টিউটর: পুরুষ
          • অভিভাবক: করিম
          • ফোন: 01712345678

          সব ঠিক? কিছু পরিবর্তন করতে চাইলে বলুন!

User:     ha thik ase

কামরুল:  ✅ আপনার তথ্য আমাদের টিমের কাছে পাঠানো হয়েছে!
          ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে
          SMS-এ জানাবো। ধন্যবাদ! 🙏
```

### 5.4 Escalation to WhatsApp

When AI detects user wants a real person:
- Triggers: "admin", "manager", "real person", "মানুষ", "কারো সাথে কথা বলতে চাই"
- AI responds with admin-configured `escalationMessage`
- Shows WhatsApp button: `https://wa.me/{{whatsappNumber}}?text=Smart+Tutor+Conversation+{{sessionId}}`
- Conversation marked `escalated` in DB with reason

### 5.5 Conversation Resume

- Same browser → localStorage `browserSessionId` → fetch latest `active` conversation for that ID → resume
- AI shows admin-configured `resumeMessage` + summary of what's already collected
- If conversation is >24 hours old with no activity → auto-mark `abandoned`
- One `browserSessionId` can have multiple conversations (previous ones completed/abandoned, latest one active)

---

## 6. AI Tutor Smart Search

### 6.1 Search Flow

1. Tutor (logged in) types in smart search bar: "gulshan e class 9 physics tuition"
2. `/api/ai/search` sends query + tutor profile to Gemini
3. Gemini extracts: `{ location: "Gulshan", class: "9", subjects: ["Physics"] }`
4. MongoDB aggregation filters Tuitions (status: `open` or `available` only)
5. Each result scored against tutor's profile
6. Results returned sorted by match score

### 6.2 Match Score Calculation (Pure Logic, No AI)

```
score = (
  locationScore * weights.location +   // same area=100%, same district=70%, same division=40%
  subjectScore  * weights.subject  +   // % overlap between tutor subjects and tuition needs
  classScore    * weights.class    +   // tutor's preferred range includes this class
  salaryScore   * weights.salary   +   // tutor's expected vs tuition budget alignment
  mediumScore   * weights.medium   +   // medium match bonus (Tutor 'BM' ↔ Tuition 'Bangla Medium')
  genderScore   * weights.gender       // gender preference match
)
```

Weights stored in `SiteSettings.searchConfig.weights` — admin-tunable via Business Settings.

**Medium mapping for scoring:**
- Tutor `version: 'BM'` ↔ Tuition `version: 'Bangla Medium'`
- Tutor `version: 'EM'` ↔ Tuition `version: 'English Medium'`
- Tutor `version: 'EV'` ↔ Tuition `version: 'English Version'`

### 6.3 Results UI

Each match card shows:
- **Match badge:** "৯২% ম্যাচ" (green >80%, amber >60%, gray <60%)
- ST code, class, subjects, area (NOT exact address), salary range, medium
- **Why it matched:** chips like "আপনার এলাকা", "আপনার সাবজেক্ট"
- Posted date + number of tutors already applied
- **Apply** button (one tap)

**No guardian contact info visible** — no phone, no name, no address.

### 6.4 Empty State

Before searching, show "Recommended for You" — auto-scored tuitions based on tutor's profile fields. No query needed.

### 6.5 Gemini Usage

- **One API call per search** — parse natural language → structured params
- **Zero API calls for scoring** — pure MongoDB aggregation
- **Fallback:** if Gemini can't parse → basic text search against tuition fields
- **Button-triggered search** (tutor presses Enter or clicks Search) — not as-you-type. Reduces Gemini API calls significantly. A tutor typing "gulshan e class 9 physics" would trigger 4-5 calls with debounce; button-trigger means 1 call.

---

## 7. Admin Features

### 7.1 Conversations Dashboard (`/dashboard/conversations`)

**Layout:**
- Left: conversation list with filters
- Right: selected conversation detail
- Mobile: list → tap → full thread (standard messaging pattern)

**Conversation List Shows:**
- User name + phone (admin-only data)
- Last message preview
- Status badge: 🟢 Active | 🟡 Escalated | ✅ Completed | ⚪ Abandoned
- Intent badge: "টিউশন পোস্ট" | "স্ট্যাটাস" | "সাহায্য"
- Time since last message
- Completeness bar for tuition posts

**Filters:**
- Status (All / Active / Escalated / Completed / Abandoned)
- Intent type
- Date range
- Search by phone or name

**Conversation Detail Panel:**
- Full message thread (read-only)
- Extracted tuition data sidebar (editable for admin)
- Escalation reason (if escalated)

### 7.2 Draft Tuition Review

When a conversation has `status: completed` and created a draft tuition:

- Left panel: full chat log (read-only)
- Right panel: extracted tuition data (all fields editable by admin)
- Admin actions:
  - **Publish** → tuition status changes from `draft` to `open`, ST code auto-generated at this point, SMS sent to guardian with ST code
  - **Reject** → with reason, guardian notified via SMS
- Draft list sorted oldest-first (FIFO)
- Draft count badge on sidebar for urgency

### 7.3 AI Chat Settings (in Business Settings)

New tab: "AI Chat Settings"
- Persona name & greeting editor
- Personality/tone textarea (system prompt snippet)
- Drag-and-drop question list reordering
- Toggle required/optional per question
- Validation hint per question
- Knowledge article manager (topic + content)
- WhatsApp number for escalation
- Rate limit setting (max conversations/hour per IP)
- Confirmation/success/error/resume message editors
- Salary guidance toggle
- **Test Chat** button — opens actual chat widget in test mode

### 7.4 Search Config (in Business Settings)

New section under AI settings:
- Weight sliders for each scoring factor (location, subject, class, salary, medium, gender)
- Must sum to 1.0 — UI validates this

### 7.5 Conversation Stats (top of conversations page)

Quick numbers: total conversations today, tuitions posted, escalated, success rate percentage.

### 7.6 Auto-cleanup

Conversations with `status: 'active'` and no messages for 24 hours → auto-mark `abandoned`.

Implementation: Vercel Cron Job — `GET /api/cron/cleanup-conversations` endpoint, configured in `vercel.json` with hourly schedule.

---

## 8. API Routes

```
POST   /api/ai/chat           — Send message, get AI response (SSE stream)
GET    /api/ai/chat/[id]      — Resume conversation by sessionId
POST   /api/ai/search         — Tutor smart search (parse + score)
GET    /api/ai/config         — Public chat config (persona, greeting)
POST   /api/tuitions/draft    — Guardian form submission → creates draft tuition
GET    /api/cron/cleanup-conversations — Vercel Cron: abandon stale conversations
```

### 8.1 POST /api/ai/chat

**Request:**
```json
{
  "sessionId": "uuid",
  "browserSessionId": "uuid",
  "message": "amar chele er jonno tutor lagbe"
}
```

**Response:** SSE stream with the following event format:

```
event: token
data: {"text": "অবশ্যই"}

event: token
data: {"text": "! আপনার"}

event: done
data: {"conversationId": "uuid", "extractedData": {...}, "completeness": 25, "status": "active"}
```

- `event: token` — individual text chunks as Gemini generates them (client appends to current message)
- `event: done` — final event with updated conversation state (extractedData, completeness, status)
- Client uses `fetch()` with `ReadableStream` to consume the SSE (not EventSource, since it's a POST)
- If stream drops mid-response, client shows last received text + "..." and enables retry

### 8.2 GET /api/ai/chat/[id]

**Request:** `GET /api/ai/chat/{sessionId}`
**Response:** Full conversation object for resuming.

### 8.3 POST /api/ai/search

**Request:**
```json
{
  "query": "gulshan e class 9 physics tuition",
  "tutorId": "ObjectId"
}
```

**Response:**
```json
{
  "results": [
    {
      "tuitionId": "...",
      "code": "ST-4521",
      "class": "9",
      "subjects": ["Physics"],
      "area": "Gulshan",
      "salary": { "min": 4000, "max": 6000 },
      "medium": "English Medium",
      "matchScore": 92,
      "matchReasons": ["আপনার এলাকা", "আপনার সাবজেক্ট"],
      "appliedCount": 3,
      "postedDate": "2026-03-15"
    }
  ],
  "parsedQuery": { "location": "Gulshan", "class": "9", "subjects": ["Physics"] }
}
```

### 8.4 GET /api/ai/config

**Response:** Public subset of chatConfig (persona name, greeting — no whatsapp number, no knowledge articles, no rate limits).

### 8.5 POST /api/tuitions/draft

**Request:** Guardian form submission
```json
{
  "class": "8",
  "subjects": ["Math", "Science"],
  "location": "Mirpur, Dhaka",
  "locationData": { "division": "Dhaka", "district": "Dhaka", "area": "Mirpur" },
  "version": "Bangla Medium",
  "genderPreference": "male",
  "daysPerWeek": 3,
  "salary": { "min": 3000, "max": 4000 },
  "guardianName": "Karim",
  "guardianNumber": "01712345678",
  "requirements": "optional notes",
  "source": "form"
}
```

**Response:**
```json
{
  "success": true,
  "message": "আপনার টিউশনের তথ্য জমা হয়েছে!"
}
```

Creates Tuition with `status: 'draft'`, `source: 'form'`. Same admin review pipeline as chat-created drafts.

### 8.6 GET /api/cron/cleanup-conversations

Vercel Cron endpoint. Configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-conversations",
    "schedule": "0 * * * *"
  }]
}
```

Marks conversations with `status: 'active'` and `updatedAt > 24 hours ago` as `abandoned`.

---

## 9. Privacy & Security

- **No guardian contact data in public API responses** — phone, name, address never returned in tuition search results or public pages
- **Tutor must be logged in** to use smart search (session validated server-side)
- **Rate limiting** on chat endpoint — `maxConversationsPerHour` enforced **per IP address** using in-memory counter (reset hourly). Prevents abuse and controls Gemini API costs.
- **Phone validation** — Bangladesh format only (01XXXXXXXXX, 11 digits)
- **Conversation data** — stored in MongoDB, accessible only to admin via dashboard
- **Gemini API key** — server-side only, never exposed to client
- **Draft tuitions** — invisible to all except admin until published
- **CSRF** — POST endpoints validate origin header; SSE endpoint requires valid sessionId
- **Bot prevention** — honeypot field in chat input (hidden field that bots fill, humans don't). More sophisticated prevention (CAPTCHA) can be added if abuse occurs.

---

## 10. Brand Integration

All new UI components follow existing brand tokens:
- Primary: `#006A4E` (Bangladesh green)
- CTA/Accent: `#E07B2A` (saffron)
- Background: `#FFFDF7` (warm cream)
- Borders: `#E8DDD0`
- Light BG: `#F5F0E8`
- Muted text: `#78716C`
- Dark text: `#1C1917`
- Chat bubble (AI): `bg-[#FFFDF7]` with `border border-[#E8DDD0]`
- Chat bubble (User): `bg-[#006A4E] text-white`
- Match score badge: green >80%, amber >60%, gray <60%
- All buttons, focus rings, and interactive elements follow existing patterns

---

## 11. Data Migrations Required

### 11.1 Tuition Salary: String → Object

```javascript
// Migration script: migrate-salary.ts
// Parse existing string salary values into { min, max }
// Examples:
//   "3000-4000"  → { min: 3000, max: 4000 }
//   "5000"       → { min: 5000, max: 5000 }
//   "3000-5000"  → { min: 3000, max: 5000 }
//   ""           → { min: null, max: null }
```

All existing code that reads `tuition.salary` as a string must be updated to read `tuition.salary.min` / `tuition.salary.max`.

### 11.2 Tuition Status Enum

Add `'draft'` to the Mongoose enum. No data migration needed — existing tuitions keep their current status.

### 11.3 Tuition Code Generation

Modify the `pre('validate')` hook to skip code generation when `status === 'draft'`. Code is generated when status changes from `draft` to `open` (admin publish action).

### 11.4 Location Data Backfill

Existing tuitions have `location` as a plain string (e.g., "Mirpur, Dhaka") but no structured `locationData`. The search scoring algorithm requires structured location data for hierarchical matching.

**Migration script:** Parse existing `location` strings and attempt to match against the Location model's known areas/districts/divisions. For each tuition:
1. Split the location string by comma/space
2. Fuzzy-match each part against Location model entries
3. Populate `locationData` with matched division/district/area
4. If no match found → leave `locationData` empty (search falls back to text matching for these tuitions)

**Graceful degradation:** Tuitions without `locationData` still appear in search results — they just get a lower location score (0% instead of hierarchical match). New tuitions (from chat or form) will always have structured `locationData`.

### 11.5 Guardian Address

Change `address` from `required: true` to optional. No data migration — existing guardians keep their addresses.

---

## 12. What's NOT in This Phase

- WhatsApp bot integration (just link for now — consider if chat widget adoption is low)
- Push notifications
- Advanced analytics / demand heatmaps (Phase 2 — source tracking data feeds into this)
- Tutor reviews / leaderboard
- Live admin chat (escalation goes to WhatsApp)
- Voice input
- Image/document sharing in chat
- Salary guidance from existing data (Phase 2 optional)
- Auto-publish with "pending verification" badge (consider if admin review becomes a bottleneck past ~30-40 posts/day)
