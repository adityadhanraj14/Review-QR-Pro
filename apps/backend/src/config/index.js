import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name) {
  const v = process.env[name];
  if (v == null || String(v).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(v).trim();
}

const nodeEnv = requireEnv('NODE_ENV');

/** Daily scan charts: ANALYTICS_TIMEZONE if set; else host IANA zone; else UTC. */
function resolveAnalyticsTimezone() {
  const raw = process.env.ANALYTICS_TIMEZONE?.trim();
  if (raw) return raw;
  try {
    const system = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (system && typeof system === 'string') return system;
  } catch {
    /* ignore */
  }
  return 'UTC';
}

export const config = {
  port: parseInt(requireEnv('PORT'), 10),
  nodeEnv,
  mongodbUri: requireEnv('MONGODB_URI'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: requireEnv('JWT_EXPIRES_IN'),
  cookieExpiry: parseInt(requireEnv('COOKIE_EXPIRY'), 10),
  frontendUrl: requireEnv('FRONTEND_URL').replace(/\/$/, ''),
  publicAppUrl: requireEnv('PUBLIC_APP_URL').replace(/\/$/, ''),
  /** Groq (free tier): https://console.groq.com — OpenAI-compatible API */
  groqApiKey: process.env.GROQ_API_KEY?.trim() ?? '',
  groqModel: process.env.GROQ_MODEL?.trim() ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() ?? '',
  openaiModel: process.env.OPENAI_MODEL?.trim() ?? '',
  analyticsTimezone: resolveAnalyticsTimezone(),
  isDev: nodeEnv === 'development',
  isProd: nodeEnv === 'production',
};
