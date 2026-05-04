begin;

alter table if exists public.officials
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists social_instagram text,
  add column if not exists social_facebook text,
  add column if not exists social_youtube text,
  add column if not exists social_linkedin text,
  add column if not exists social_tiktok text;

commit;

