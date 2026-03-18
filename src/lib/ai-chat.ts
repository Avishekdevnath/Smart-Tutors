import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI — same pattern as google-ai.ts
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ExtractedData {
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
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface TuitionQuestion {
  field: string;
  question: string;
  required: boolean;
  order: number;
  validationHint: string;
}

export interface KnowledgeArticle {
  topic: string;
  content: string;
}

export interface ChatPersona {
  name: string;
  greeting: string;
  personality: string;
}

export interface ChatConfig {
  persona: ChatPersona;
  tuitionQuestions: TuitionQuestion[];
  salaryGuidance?: boolean;
  confirmationMessage: string;
  successMessage: string;
  resumeMessage: string;
  escalationMessage: string;
  errorMessage: string;
  whatsappNumber: string;
  knowledgeArticles: KnowledgeArticle[];
  maxConversationsPerHour?: number;
}

export interface ChatResponse {
  reply: string;
  intent: 'post_tuition' | 'track_status' | 'faq' | 'support' | null;
  extractedData: ExtractedData;
  completeness: number;
  confirmedByUser: boolean;
  shouldEscalate: boolean;
  shouldCreateDraft: boolean;
}

// ─── System Prompt Builder ──────────────────────────────────────────────────

/**
 * Builds the system prompt that instructs Gemini how to behave as the AI persona.
 * The prompt encodes all persona config, question list, knowledge articles, and
 * structured JSON output requirements.
 */
export function buildSystemPrompt(
  config: ChatConfig,
  currentExtractedData: ExtractedData
): string {
  const { persona, tuitionQuestions, knowledgeArticles, confirmationMessage } = config;

  // Sort questions by order
  const sortedQuestions = [...tuitionQuestions].sort((a, b) => a.order - b.order);

  // Build question list string
  const questionList = sortedQuestions
    .map(
      (q, i) =>
        `  ${i + 1}. field="${q.field}" | required=${q.required} | hint="${q.validationHint}"\n     Question to ask: "${q.question}"`
    )
    .join('\n');

  // Build knowledge base string
  const knowledgeBase =
    knowledgeArticles.length > 0
      ? knowledgeArticles.map((k) => `  [${k.topic}]: ${k.content}`).join('\n')
      : '  (none)';

  // Summarise what is already collected so the AI never re-asks
  const alreadyCollected = Object.entries(currentExtractedData)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join('\n');

  return `
You are ${persona.name}, a smart AI assistant for Smart Tutors — a tuition media platform in Bangladesh.

${persona.personality}

## YOUR MISSION
Help guardians post tuition requests, answer FAQs, track tuition status, and escalate to a real person when needed.

## LANGUAGE HANDLING
- Auto-detect the user's language (Bengali, English, Banglish, or a mix) and reply in the SAME language/style.
- Handle broken words, typos, and misspellings gracefully — never correct the user rudely.
- Accept common transliterations: "ami", "amar", "chele", "meye", "din", "taka", etc.

## INTENT DETECTION
Classify every message into one of:
- "post_tuition"  — guardian wants to post a tuition (needs a tutor)
- "track_status"  — asking about an existing tuition (e.g., "ST-2345 ki obostha?")
- "faq"           — general question about the platform/service
- "support"       — wants to talk to a real person / admin
- null            — unclear, ask a clarifying question

## TUITION DATA COLLECTION (intent = "post_tuition")
Ask the following questions ONE AT A TIME, in order. Skip any field already provided.
Do NOT re-ask information the user already mentioned — even if given naturally mid-sentence.

Questions to collect (in this order):
${questionList}

RULES:
- Ask only ONE question per reply. Never bundle multiple questions.
- Be warm, conversational, and encouraging — like a helpful elder brother (বড় ভাই tone).
- Validate phone numbers: must match Bangladesh format 01XXXXXXXXX (11 digits, starts with 01).
  If invalid, politely ask again.
- For salary, accept natural input like "3000-4000", "৳3k", "three thousand" — extract numeric min/max.
- For location, extract division/district/area/subarea as best as possible from natural text.
- For medium, map user input to: "Bangla Medium", "English Medium", or "English Version".
- For tutorGender, map to: "male", "female", or "any".
- Once ALL required fields are collected, show a confirmation summary and ask if everything is correct.
  Confirmation message style: "${confirmationMessage}"

## ALREADY COLLECTED DATA (do NOT re-ask these)
${alreadyCollected || '  (nothing collected yet)'}

## COMPLETENESS SCORING
Count the required fields that are collected vs total required fields.
Required fields: ${sortedQuestions.filter((q) => q.required).map((q) => q.field).join(', ')}.
completeness = (collected required fields / total required fields) * 100, rounded to nearest integer.

## CONFIRMATION & DRAFT CREATION
- When the user confirms the summary (says "হ্যাঁ", "yes", "thik ase", "ok", "confirm", "সব ঠিক", etc.),
  set confirmedByUser=true and shouldCreateDraft=true.
- If the user wants to edit a field after seeing the summary, update that field and show the summary again.

## ESCALATION
If the user says they want a real person, mentions "admin", "manager", "human", "কারো সাথে কথা",
"real person", "মানুষ", "স্যার", or similar — set shouldEscalate=true immediately.

## KNOWLEDGE BASE (use naturally in conversation when relevant)
${knowledgeBase}

## CRITICAL OUTPUT FORMAT
You MUST respond with a SINGLE valid JSON object and NOTHING else — no markdown, no code fences, no extra text.

{
  "reply": "<your conversational reply to the user>",
  "intent": "<post_tuition | track_status | faq | support | null>",
  "extractedData": {
    "studentClass": "<string or null>",
    "subjects": ["<subject>"],
    "location": {
      "division": "<string or null>",
      "district": "<string or null>",
      "area": "<string or null>",
      "subarea": "<string or null>"
    },
    "medium": "<Bangla Medium | English Medium | English Version | null>",
    "tutorGender": "<male | female | any | null>",
    "daysPerWeek": <number or null>,
    "salary": { "min": <number or null>, "max": <number or null> },
    "additionalNotes": "<string or null>",
    "guardianName": "<string or null>",
    "guardianPhone": "<string or null>"
  },
  "completeness": <0-100>,
  "confirmedByUser": <true | false>,
  "shouldEscalate": <true | false>,
  "shouldCreateDraft": <true | false>
}

Always include ALL keys in extractedData, even if null.
Always merge new data with previously extracted data — never drop a field you already know.
`.trim();
}

// ─── Conversation History Builder ───────────────────────────────────────────

/**
 * Converts stored chat messages into Gemini's expected content parts format.
 * Keeps last 20 messages to stay within context window limits.
 */
function buildConversationHistory(
  messages: ChatMessage[]
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  // Trim to last 20 messages
  const recentMessages = messages.slice(-20);

  return recentMessages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

// ─── JSON Response Parser ────────────────────────────────────────────────────

/**
 * Parses Gemini's text response into a structured ChatResponse.
 * Falls back gracefully if JSON is malformed.
 */
function parseGeminiResponse(
  text: string,
  currentExtractedData: ExtractedData
): ChatResponse {
  // Strip any markdown code fences Gemini might add despite instructions
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Merge extractedData — new values override, but keep existing values for nulls
    const mergedData: ExtractedData = { ...currentExtractedData };
    if (parsed.extractedData) {
      const ed = parsed.extractedData;
      if (ed.studentClass != null) mergedData.studentClass = ed.studentClass;
      if (ed.subjects && ed.subjects.length > 0) mergedData.subjects = ed.subjects;
      if (ed.location) {
        mergedData.location = {
          ...mergedData.location,
          ...(ed.location.division != null && { division: ed.location.division }),
          ...(ed.location.district != null && { district: ed.location.district }),
          ...(ed.location.area != null && { area: ed.location.area }),
          ...(ed.location.subarea != null && { subarea: ed.location.subarea }),
        };
      }
      if (ed.medium != null) mergedData.medium = ed.medium;
      if (ed.tutorGender != null) mergedData.tutorGender = ed.tutorGender;
      if (ed.daysPerWeek != null) mergedData.daysPerWeek = ed.daysPerWeek;
      if (ed.salary) {
        mergedData.salary = {
          ...mergedData.salary,
          ...(ed.salary.min != null && { min: ed.salary.min }),
          ...(ed.salary.max != null && { max: ed.salary.max }),
        };
      }
      if (ed.additionalNotes != null) mergedData.additionalNotes = ed.additionalNotes;
      if (ed.guardianName != null) mergedData.guardianName = ed.guardianName;
      if (ed.guardianPhone != null) mergedData.guardianPhone = ed.guardianPhone;
    }

    return {
      reply: typeof parsed.reply === 'string' ? parsed.reply : text,
      intent: parsed.intent ?? null,
      extractedData: mergedData,
      completeness: typeof parsed.completeness === 'number' ? parsed.completeness : 0,
      confirmedByUser: parsed.confirmedByUser === true,
      shouldEscalate: parsed.shouldEscalate === true,
      shouldCreateDraft: parsed.shouldCreateDraft === true,
    };
  } catch {
    // JSON parse failed — return raw text as reply with unchanged extracted data
    return {
      reply: text,
      intent: null,
      extractedData: currentExtractedData,
      completeness: 0,
      confirmedByUser: false,
      shouldEscalate: false,
      shouldCreateDraft: false,
    };
  }
}

// ─── processMessage ──────────────────────────────────────────────────────────

/**
 * Sends a user message to Gemini and returns a structured ChatResponse.
 * Uses gemini-1.5-flash for speed and cost-efficiency in chat.
 */
export async function processMessage(
  userMessage: string,
  config: ChatConfig,
  conversationHistory: ChatMessage[],
  currentExtractedData: ExtractedData = {}
): Promise<ChatResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  });

  const systemPrompt = buildSystemPrompt(config, currentExtractedData);

  // Start chat with conversation history
  const history = buildConversationHistory(conversationHistory);

  const chat = model.startChat({
    history,
    systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  const text = response.text();

  return parseGeminiResponse(text, currentExtractedData);
}

// ─── streamMessage ───────────────────────────────────────────────────────────

/**
 * Streaming version of processMessage using Gemini's streamGenerateContent.
 *
 * Yields token strings as they arrive, then yields a final ChatResponse object.
 * Designed to be consumed by the SSE API route:
 *
 *   for await (const chunk of streamMessage(...)) {
 *     if (typeof chunk === 'string') {
 *       // send SSE event: token
 *     } else {
 *       // send SSE event: done (final state)
 *     }
 *   }
 */
export async function* streamMessage(
  userMessage: string,
  config: ChatConfig,
  conversationHistory: ChatMessage[],
  currentExtractedData: ExtractedData = {}
): AsyncGenerator<string | ChatResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  });

  const systemPrompt = buildSystemPrompt(config, currentExtractedData);
  const history = buildConversationHistory(conversationHistory);

  const chat = model.startChat({
    history,
    systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
  });

  const streamResult = await chat.sendMessageStream(userMessage);

  let fullText = '';

  // Stream tokens as they arrive
  for await (const chunk of streamResult.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      fullText += chunkText;
      yield chunkText;
    }
  }

  // Parse the complete accumulated response and yield final state
  const finalResponse = parseGeminiResponse(fullText, currentExtractedData);
  yield finalResponse;
}
