import OpenAI from 'openai';
import { config } from '../config/index.js';
import { AI_SUGGESTION_COUNT } from '../constants/aiReviews.js';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
/** Default when `GROQ_MODEL` unset — not a secret; override via env. */
const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';
/** Default when `OPENAI_MODEL` unset — not a secret; override via env. */
const OPENAI_DEFAULT_MODEL = 'gpt-4o-mini';

const systemPrompt = `You write realistic Google Maps reviews for restaurants. Output must be valid JSON only.`;

function resolveActiveLlm() {
  if (config.groqApiKey) {
    return {
      label: 'groq',
      client: new OpenAI({
        apiKey: config.groqApiKey,
        baseURL: GROQ_BASE_URL,
        maxRetries: 1,
        timeout: 60_000,
      }),
      model: config.groqModel || GROQ_DEFAULT_MODEL,
    };
  }
  if (config.openaiApiKey) {
    return {
      label: 'openai',
      client: new OpenAI({
        apiKey: config.openaiApiKey,
        maxRetries: 1,
        timeout: 60_000,
      }),
      model: config.openaiModel || OPENAI_DEFAULT_MODEL,
    };
  }
  return null;
}

/** Optional startup check (no chat completion). */
export async function logLlmConnectionStatus() {
  const llm = resolveActiveLlm();
  if (!llm) {
    console.log('[llm] No GROQ_API_KEY or OPENAI_API_KEY — AI suggestions use static fallbacks until a key is set');
    return;
  }
  try {
    await llm.client.models.list();
    console.log('[llm] %s API key OK (model: %s)', llm.label, llm.model);
  } catch (err) {
    const msg = err?.message || err?.error?.message || String(err);
    const status = err?.status;
    console.warn('[llm] %s key check failed%s — %s', llm.label, status != null ? ` (HTTP ${status})` : '', msg);
  }
}

function buildUserPrompt({ businessName, rating, location, serverName }) {
  const loc = [location?.address, location?.city].filter(Boolean).join(', ') || 'local area';
  const serverLine = serverName
    ? `Server Name (optional, only mention if it fits naturally): ${serverName}`
    : 'Server Name: not provided';
  const n = AI_SUGGESTION_COUNT;
  return `Generate ${n} medium-length, human-like Google reviews as a JSON object with key "reviews" (array of exactly ${n} strings).

Context:
- Restaurant Name: ${businessName}
- Rating the customer chose: ${rating} stars (only 4 or 5 — tone must match this exact number)
- Location: ${loc}
- ${serverLine}

Rules:
- Write like different real customers; each string 3-4 lines max.
- If rating is 5: enthusiastic, warm, highly positive (still believable).
- If rating is 4: clearly positive but slightly more grounded than a 5.
- Vary openings, rhythm, and focus (food, service, vibe, value, would return) across all ${n}.
- Do NOT repeat the same sentence structure across reviews.
- Avoid spammy clichés; do not use the word "amazing" more than once across all ${n}.
- Return ONLY valid JSON: {"reviews":[${Array.from({ length: n }, () => '"..."').join(',')}]}`;
}

function parseReviewsFromContent(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let s = raw.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/m, '').trim();
  }
  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch {
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      parsed = JSON.parse(s.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  const reviews = parsed.reviews;
  if (!Array.isArray(reviews) || reviews.length !== AI_SUGGESTION_COUNT) return null;
  const cleaned = reviews.map((r) => String(r).trim()).filter(Boolean);
  if (cleaned.length !== AI_SUGGESTION_COUNT) return null;
  return cleaned;
}

/** Groq (free tier) if `GROQ_API_KEY` is set; else OpenAI if `OPENAI_API_KEY` is set; else null → static fallbacks. */
export async function generateReviewsWithLlm(ctx) {
  const llm = resolveActiveLlm();
  if (!llm) {
    return null;
  }
  const userContent = buildUserPrompt(ctx);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  try {
    let raw;
    try {
      const completion = await llm.client.chat.completions.create({
        model: llm.model,
        temperature: 0.9,
        response_format: { type: 'json_object' },
        messages,
      });
      raw = completion.choices[0]?.message?.content;
    } catch (inner) {
      if (config.isDev) {
        console.warn('[llm] json_object request failed, retrying plain chat:', inner?.message || inner);
      }
      const completion = await llm.client.chat.completions.create({
        model: llm.model,
        temperature: 0.9,
        messages,
      });
      raw = completion.choices[0]?.message?.content;
    }
    let parsed = parseReviewsFromContent(raw);
    if (parsed) return parsed;

    if (config.isDev) {
      console.warn('[llm] First response not parseable; retrying without json_object');
    }
    const completionPlain = await llm.client.chat.completions.create({
      model: llm.model,
      temperature: 0.9,
      messages,
    });
    raw = completionPlain.choices[0]?.message?.content;
    parsed = parseReviewsFromContent(raw);
    if (parsed) return parsed;
    if (config.isDev && raw) {
      console.warn('[llm] Unparseable model output (first 500 chars):', String(raw).slice(0, 500));
    }
    if (config.isDev) {
      console.warn('[llm] Could not parse', AI_SUGGESTION_COUNT, 'reviews — using static fallbacks');
    }
    return null;
  } catch (err) {
    if (config.isDev) {
      console.warn('[llm] generateReviews failed — using static fallbacks:', err?.message || err);
    }
    return null;
  }
}

/** @deprecated use generateReviewsWithLlm */
export const generateReviewsWithOpenAI = generateReviewsWithLlm;
