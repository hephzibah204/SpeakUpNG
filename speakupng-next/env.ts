// Environment variables for Next.js
// This file is used by Next.js to configure environment variables
// In production, these should be set in the deployment platform

export const env = {
  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Cloudflare D1 configuration
  CLOUDFLARE_D1_DATABASE_ID: process.env.CLOUDFLARE_D1_DATABASE_ID || '',
  CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN || '',
  
  // Application configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://evote.ng',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.evote.ng',
  
  // Authentication
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Admin emails
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || '',
  
  // News ingestion
  NEWS_CRON_TOKEN: process.env.NEWS_CRON_TOKEN || '',
  
  // OpenRouter AI
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
};
