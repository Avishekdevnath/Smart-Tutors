# Home Page UI/UX Improvements (Bangla-First, Friendly)

## Summary
Redesign the home page to serve both Guardians and Tutors equally, with a Bangla-first tone and English used for key terms (e.g., Post Tuition, Register as Tutor). The page should surface all primary actions above the fold while clearly separating the two user paths.

## Goals
- Make the page immediately understandable for both Guardians and Tutors.
- Keep all primary actions visible within one scroll.
- Use Bangla-first copy with English keywords for clarity.
- Build trust without using fake metrics.

## Non-Goals
- No redesign of admin or dashboard pages.
- No changes to core data models or backend flows.

## Audience
- Guardians who want to post a tuition quickly.
- Tutors who want to find and apply for verified tuitions.

## Content Strategy (Bangla-first)
- Main copy is Bangla.
- English terms are used for action keywords and labels.
- Avoid long English paragraphs.

## IA and Layout
1. Split hero for two audiences.
2. Action rail with all core CTAs.
3. How it works section with two columns (Guardian / Tutor).
4. Trust & Safety section (no fake stats).
5. Latest Tuitions preview (existing section).
6. Final CTA with two primary actions.

## Hero (Split)
Guardian card:
- Title: “??? ?????????”
- Body: “????? ??????? ??????? Tutor ??????”
- Primary CTA: “Tuition Post ????” (tag: Post Tuition)
- Secondary CTA: “Browse Tuitions”

Tutor card:
- Title: “??? ?????”
- Body: “????? ???????? ???? ???? ??? Tuition ??????”
- Primary CTA: “Tutor ?????? Register ????” (tag: Register as Tutor)
- Secondary CTA: “Browse Tuitions”

## Action Rail (All Core Actions)
- Tuition Post
- Browse Tuitions
- Register as Tutor
- Contact / Support
Each tile shows Bangla label with a smaller English sublabel.

## How It Works
Guardian flow:
- Step 1: Tuition Post
- Step 2: ???? Tutor ????? ???
- Step 3: Demo ?????
- Step 4: Confirm Tutor

Tutor flow:
- Step 1: Profile ????
- Step 2: Apply
- Step 3: Profile Share (No contact details)
- Step 4: Demo & Confirm

## Trust & Safety
- Verification: ??????? ? ???????? ?????
- Privacy: ?????? ???? ??????? ???? ????? ??
- Fee: ????? ????? 60% (?–?? ???), negotiable

## Visual Direction
- Friendly, warm, and approachable.
- Use rounded cards and soft gradients.
- Limit heavy gradients to CTAs only.

## Typography
- Bangla: Noto Sans Bengali
- English: Plus Jakarta Sans or Sora

## Color System (Example)
- Primary: #0F766E
- Accent: #F59E0B
- Support: #4F46E5
- Background: #F8FAFC
- Text: #0F172A and #475569

## Components to Update
- src/app/page.tsx
- HeroSplit component (new or inline)
- ActionRail component (new or inline)
- HowItWorks component (new or inline)
- TrustSafety component (new or inline)
- LatestTuitionsSection (reuse)
- FinalCTA component (new or inline)

## Accessibility
- Minimum 4.5:1 contrast for text.
- 44px minimum tap targets.
- Logical heading order.

## Acceptance Criteria
- All four core actions visible within one scroll.
- Bangla-first copy with consistent English keywords.
- No fake stats displayed.
- Clear separation of Guardian and Tutor paths.
- Looks good on mobile and desktop.
