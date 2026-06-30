// Environment variables for Next.js
// This file is used by Next.js to configure environment variables
// In production, these should be set in the deployment platform

export const env = {
  // Database configuration (Neon Postgres via @vercel/postgres)
  POSTGRES_URL: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL || '',

  // Application configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://evote.ng',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.evote.ng',

  // Admin authentication (Neon-native, no Supabase)
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || '',
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || '',

  // News ingestion
  NEWS_CRON_TOKEN: process.env.NEWS_CRON_TOKEN || '',

  // OpenRouter AI
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
  OPENROUTER_REFERER: process.env.OPENROUTER_REFERER || 'https://evote.ng',
};
