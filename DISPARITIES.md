# Legacy → Next.js Migration Disparity Report

Legacy app: `legacy/` (HTML + PHP + Supabase/Postgres)
Current app: `speakupng-next/` (Next.js App Router + Cloudflare D1/SQLite)

Status legend: ❌ missing in Next · ⚠️ partial/changed · ✅ present · ➕ new in Next

---

## 1. Pages / Routes

| Legacy page | Next route | Status |
|---|---|---|
| `index.html` | `app/page.tsx` | ✅ |
| `official.html` | `app/official/[slug]`, `app/official/id/[id]` | ✅ |
| `politician.html` | `app/politician/[slug]`, `app/politician/id/[id]` | ✅ |
| `politicians.html` | `app/politicians` | ✅ |
| `news.html` | `app/news` | ✅ |
| `news-post.html` / `news-item.html` | `app/news/[slug]` | ⚠️ two legacy views collapsed to one |
| `news-curated.html` | — | ❌ |
| `blog.html` | `app/blog` | ✅ |
| `blog-post.html` | `app/blog/[slug]` | ✅ |
| `leaderboard.html` | `app/leaderboard` | ⚠️ rewards backend missing (see §3) |
| `polls.html` | `app/polls` | ✅ (backend rebuilt, see §3) |
| `promise.html` | `app/promise` | ⚠️ mandate detail tables missing (see §3) |
| `agencies.html` / `agencies/index.html` | `app/agencies` | ✅ |
| `404.html` | — | ❌ no `not-found.tsx` |
| **`admin/` (15 pages)** | — | ❌ **entire admin UI missing** |

### Admin pages with NO Next equivalent (whole section gone)
`admin/index.html`, `login.html`, `dashboard.html`, `officials.html`, `politicians.html`,
`governors.html`, `profiles.html`, `mandate.html`, `ratings.html`, `reports.html`,
`polls.html`, `content.html`, `news-intel.html`, `alerts.html`, `ai-manager.html`

There is no `app/admin/*` UI at all — only one API route (`api/admin/secrets`).

---

## 2. API Endpoints

| Legacy PHP API | Purpose | Next equivalent | Status |
|---|---|---|---|
| `admin-secrets.php` / `save-secrets.php` | secrets mgmt | `api/admin/secrets` (POST) | ⚠️ partial |
| `cms-content.php` | blog/news CMS | — | ❌ |
| `news-admin.php` | news moderation | — | ❌ |
| `politicians-admin.php` | politician CRUD | — | ❌ |
| `fetch-official-profile.php` | AI profile enrich | — | ❌ |
| `repair-official.php` | profile repair | — | ❌ |
| `fetch-mandate-context.php` | AI mandate context | — | ❌ |
| `verify-promise-progress.php` | AI promise verify | — | ❌ |
| `get-official-sentiment.php` | sentiment analysis | — | ❌ |
| `openrouter-chat.php` | LLM chat proxy | — | ❌ |

### Next API routes with NO legacy counterpart (➕ new / rebuilt)
`api/officials`, `api/politicians`, `api/politicians/[slug]`, `api/politicians/promises`,
`api/polls` + `api/polls/vote`, `api/promise` + `api/promise/[id]`, `api/ratings`,
`api/reports`, `api/search`, `api/stats`, `api/news`

**Theme:** all read/public APIs were rebuilt in Next; **every AI/admin/CMS write API was dropped.**

---

## 3. Database Schema

### Tables present in legacy, MISSING in Next D1 migrations
**Profile enrichment**
- `official_career_history`
- `official_education`
- `official_achievements`
- (plus `officials` enrichment columns: `date_of_birth`, `state_of_origin`, `lga_of_origin`, `religion`, `marital_status`, `education_summary`, `profile_bio`, `profile_generated`, `profile_verified`, `profile_updated_at`)

**Mandate / promises detail**
- `promise_milestones`
- `promise_evidence_submissions`
- `promise_opinions`
- `promise_assessments`
- `mandate_audit_events`
- `promise_ai_verifications`

**Rewards / gamification** (powers leaderboard)
- `reward_points_ledger`
- `reward_redemptions`

**Vote/rating integrity**
- `device_review_locks` + `ratings.device_hash` column

**News clustering / alerts**
- `news_alerts`
- `news_duplicate_clusters`
- `news_item_clusters`

**Agencies** — legacy seeded into `officials` (tier=`federal_agency`); confirm Next seed parity.

### Tables only in Next (➕)
`polls`, `poll_votes`, `public_ratings`, `states`, `static_files`, `admin_secrets`

### Kept in both
`officials`, `politicians`, `politician_ratings`, `official_promises`,
`news_items`, `news_sources`, `news_audit_log`, `news_profile_matches`

---

## 4. Feature-level gaps

1. **AI layer entirely removed** — OpenRouter chat, official profile generation, mandate context,
   promise-progress verification, sentiment analysis. No D1 tables (`promise_ai_verifications`)
   or routes for any of it.
2. **Admin / CMS** — no admin auth, dashboard, moderation, or content editing in Next.
3. **Rewards & gamification** — `reward_points_ledger`/`reward_redemptions` gone; leaderboard
   likely renders without its scoring source.
4. **Mandate scorecard depth** — milestones, evidence submissions, opinions, assessments,
   audit events all missing; `app/promise` can only show flat promise data.
5. **Anti-abuse on ratings** — device fingerprinting (`device_review_locks`, `device_hash`,
   `js/device-fingerprint.js`) not carried over.
6. **News intelligence** — duplicate clustering and alerts dropped.
7. **Supabase Auth** — no replacement auth strategy implemented in Next.

---

## 5. Incomplete / in-progress signals in Next

- `app/page.tsx.bak`, `app/page.tsx.disabled` — competing home-page versions left in tree
- `app/layout.tsx.disabled` — disabled layout
- Root scratch files: `convert.js`, `refactor.js`, `temp1.js`, `live_evote.html`
- Migration helper scripts still reference Supabase/Postgres:
  `scripts/migrate-from-supabase.js`, `scripts/seed-postgres.js`

---

## Priority recommendation
1. Decide admin strategy (rebuild vs. drop) — single biggest gap.
2. Port mandate-detail + profile-enrichment tables if those pages must match legacy.
3. Decide whether the AI layer is in scope for the new stack.
4. Resolve device-fingerprinting / vote-integrity before launch.
5. Clean up `.bak`/`.disabled`/scratch files.
