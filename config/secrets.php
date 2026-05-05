<?php
declare(strict_types=1);

/**
 * evote.ng — Server-side secrets
 * ──────────────────────────────────────────
 * Fill in the values below, or use the Admin Dashboard → Settings
 * panel to save them at runtime via api/save-secrets.php.
 *
 * IMPORTANT: Never commit this file with real keys to version control.
 */

return [
  // ── Supabase ────────────────────────────────────────────
  'SUPABASE_URL'              => '',   // e.g. https://xxxx.supabase.co
  'SUPABASE_ANON_KEY'         => '',   // Project Settings → API → anon (public)
  'SUPABASE_SERVICE_ROLE_KEY' => '',   // Project Settings → API → service_role (KEEP SECRET)

  // ── News Cron ───────────────────────────────────────────
  // Generate a strong random token: php -r "echo bin2hex(random_bytes(32));"
  'NEWS_CRON_TOKEN'           => '',

  // ── OpenRouter AI ───────────────────────────────────────
  'OPENROUTER_API_KEY'        => '',   // https://openrouter.ai/keys
  'OPENROUTER_MODEL'          => 'openai/gpt-4o-mini',

  // ── Admin emails (optional whitelist) ───────────────────
  'ADMIN_EMAILS' => [
    // 'admin@evote.ng',
  ],
];
