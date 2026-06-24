-- Migration 001: Initial schema for evote.ng
-- Converts Supabase PostgreSQL schema to Cloudflare D1 (SQLite)

-- ============================================
-- Officials table
-- ============================================
CREATE TABLE IF NOT EXISTS officials (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  common_name TEXT,
  role TEXT,
  tier TEXT NOT NULL DEFAULT 'federal_executive',
  website TEXT,
  photo_url TEXT,
  state TEXT,
  rating_avg REAL NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  profile_bio TEXT,
  aspiring_for TEXT,
  previous_offices TEXT,
  wiki_title TEXT,
  wiki_url TEXT,
  social_links TEXT DEFAULT '{}',
  source_urls TEXT DEFAULT '[]',
  source_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_officials_status ON officials(status);
CREATE INDEX IF NOT EXISTS idx_officials_tier ON officials(tier, status);
CREATE INDEX IF NOT EXISTS idx_officials_state ON officials(state, status);
CREATE INDEX IF NOT EXISTS idx_officials_rating ON officials(rating_count DESC);

-- ============================================
-- States table
-- ============================================
CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  region TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_states_name ON states(name);

-- ============================================
-- Politicians table
-- ============================================
CREATE TABLE IF NOT EXISTS politicians (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  common_name TEXT,
  party TEXT NOT NULL,
  aspiration_title TEXT,
  aspiring_for TEXT,
  previous_offices TEXT,
  wiki_title TEXT,
  wiki_url TEXT,
  bio TEXT,
  profile_bio TEXT,
  photo_url TEXT,
  aliases TEXT NOT NULL DEFAULT '[]',
  social_links TEXT NOT NULL DEFAULT '{}',
  source_urls TEXT NOT NULL DEFAULT '[]',
  source_notes TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_politicians_active ON politicians(is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_politicians_party ON politicians(party, is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_politicians_name ON politicians(LOWER(full_name));
CREATE INDEX IF NOT EXISTS idx_politicians_common_name ON politicians(LOWER(common_name));

-- ============================================
-- Public Ratings table
-- ============================================
CREATE TABLE IF NOT EXISTS public_ratings (
  id TEXT PRIMARY KEY,
  official_id TEXT NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
  overall REAL NOT NULL CHECK(overall >= 0 AND overall <= 5),
  accountability INTEGER CHECK(accountability BETWEEN 1 AND 5),
  service INTEGER CHECK(service BETWEEN 1 AND 5),
  transparency INTEGER CHECK(transparency BETWEEN 1 AND 5),
  responsiveness INTEGER CHECK(responsiveness BETWEEN 1 AND 5),
  power INTEGER CHECK(power BETWEEN 1 AND 5),
  security INTEGER CHECK(security BETWEEN 1 AND 5),
  economic_stability INTEGER CHECK(economic_stability BETWEEN 1 AND 5),
  education INTEGER CHECK(education BETWEEN 1 AND 5),
  healthcare INTEGER CHECK(healthcare BETWEEN 1 AND 5),
  reviewer_state TEXT,
  review_text TEXT,
  device_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ratings_official ON public_ratings(official_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_device ON public_ratings(official_id, device_hash);

-- ============================================
-- Politician Ratings table
-- ============================================
CREATE TABLE IF NOT EXISTS politician_ratings (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  device_hash TEXT NOT NULL,
  overall REAL NOT NULL CHECK(overall >= 0 AND overall <= 5),
  accountability INTEGER CHECK(accountability BETWEEN 1 AND 5),
  service INTEGER CHECK(service BETWEEN 1 AND 5),
  transparency INTEGER CHECK(transparency BETWEEN 1 AND 5),
  responsiveness INTEGER CHECK(responsiveness BETWEEN 1 AND 5),
  power INTEGER CHECK(power BETWEEN 1 AND 5),
  security INTEGER CHECK(security BETWEEN 1 AND 5),
  economic_stability INTEGER CHECK(economic_stability BETWEEN 1 AND 5),
  education INTEGER CHECK(education BETWEEN 1 AND 5),
  healthcare INTEGER CHECK(healthcare BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_politician_ratings_politician ON politician_ratings(politician_id, created_at DESC);

-- ============================================
-- Official Promises (Mandates) table
-- ============================================
CREATE TABLE IF NOT EXISTS official_promises (
  id TEXT PRIMARY KEY,
  official_id TEXT REFERENCES officials(id) ON DELETE CASCADE,
  politician_id TEXT REFERENCES politicians(id) ON DELETE CASCADE,
  promise_title TEXT NOT NULL,
  promise_detail TEXT,
  promise_category TEXT,
  promise_date TEXT,
  promise_source TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'fulfilled', 'broken', 'disputed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent >= 0 AND progress_percent <= 100),
  evidence_url TEXT,
  verified_by TEXT,
  last_updated TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_promises_official ON official_promises(official_id);
CREATE INDEX IF NOT EXISTS idx_promises_politician ON official_promises(politician_id);
CREATE INDEX IF NOT EXISTS idx_promises_politician_status ON official_promises(politician_id, status);

-- ============================================
-- News Sources table
-- ============================================
CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  home_url TEXT NOT NULL,
  feed_url TEXT NOT NULL UNIQUE,
  ingest_type TEXT NOT NULL DEFAULT 'rss',
  credibility_tier TEXT NOT NULL DEFAULT 'tier2' CHECK(credibility_tier IN ('tier1', 'tier2', 'blocked')),
  is_active INTEGER NOT NULL DEFAULT 1,
  allow_full_text INTEGER NOT NULL DEFAULT 0,
  allow_images INTEGER NOT NULL DEFAULT 1,
  max_fetch_kb INTEGER NOT NULL DEFAULT 512,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_news_sources_feed_url ON news_sources(LOWER(feed_url));

-- ============================================
-- News Items table
-- ============================================
CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES news_sources(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_at TEXT,
  content_hash TEXT NOT NULL,
  raw_json TEXT NOT NULL DEFAULT '{}',
  summary TEXT,
  sentiment_score REAL,
  topic TEXT,
  categories TEXT DEFAULT '[]',
  is_politics INTEGER NOT NULL DEFAULT 0,
  matched_profiles TEXT DEFAULT '[]',
  image_url TEXT,
  site_name TEXT,
  author TEXT,
  content_text TEXT,
  content_html TEXT,
  content_extracted_at TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK(moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_items_published ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_status ON news_items(moderation_status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_source ON news_items(source_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_hash ON news_items(content_hash);
CREATE INDEX IF NOT EXISTS idx_news_items_topic ON news_items(topic);

-- ============================================
-- News Profile Matches table
-- ============================================
CREATE TABLE IF NOT EXISTS news_profile_matches (
  id TEXT PRIMARY KEY,
  profile_type TEXT NOT NULL CHECK(profile_type IN ('official', 'politician')),
  profile_id TEXT NOT NULL,
  news_item_id TEXT NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  confidence REAL NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'keyword',
  matched_terms TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(profile_type, profile_id, news_item_id)
);

CREATE INDEX IF NOT EXISTS idx_news_profile_matches_profile ON news_profile_matches(profile_type, profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_profile_matches_item ON news_profile_matches(news_item_id);

-- ============================================
-- News Audit Log table
-- ============================================
CREATE TABLE IF NOT EXISTS news_audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  reason TEXT,
  meta TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_audit_created ON news_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_audit_target ON news_audit_log(target_type, target_id, created_at DESC);

-- ============================================
-- Admin Secrets table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_secrets (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- Static Files table (for Cloudflare Worker)
-- ============================================
CREATE TABLE IF NOT EXISTS static_files (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text/html',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- Views
-- ============================================
-- Official rating aggregates view
CREATE VIEW IF NOT EXISTS official_rating_agg AS
SELECT
  official_id,
  COUNT(*) as rating_count,
  ROUND(AVG(overall), 2) as rating_avg,
  ROUND(AVG(accountability), 2) as accountability_avg,
  ROUND(AVG(service), 2) as service_avg,
  ROUND(AVG(transparency), 2) as transparency_avg,
  ROUND(AVG(responsiveness), 2) as responsiveness_avg,
  ROUND(AVG(power), 2) as power_avg,
  ROUND(AVG(security), 2) as security_avg,
  ROUND(AVG(economic_stability), 2) as economic_stability_avg,
  ROUND(AVG(education), 2) as education_avg,
  ROUND(AVG(healthcare), 2) as healthcare_avg
FROM public_ratings
GROUP BY official_id;

-- Politician rating aggregates view
CREATE VIEW IF NOT EXISTS politician_rating_agg AS
SELECT
  politician_id,
  COUNT(*) as rating_count,
  ROUND(AVG(overall), 2) as rating_avg,
  ROUND(AVG(accountability), 2) as accountability_avg,
  ROUND(AVG(service), 2) as service_avg,
  ROUND(AVG(transparency), 2) as transparency_avg,
  ROUND(AVG(responsiveness), 2) as responsiveness_avg,
  ROUND(AVG(power), 2) as power_avg,
  ROUND(AVG(security), 2) as security_avg,
  ROUND(AVG(economic_stability), 2) as economic_stability_avg,
  ROUND(AVG(education), 2) as education_avg,
  ROUND(AVG(healthcare), 2) as healthcare_avg
FROM politician_ratings
GROUP BY politician_id;

-- Official mandate scores view
CREATE VIEW IF NOT EXISTS official_mandate_scores AS
SELECT
  official_id,
  COUNT(*) as total_promises,
  SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
  SUM(CASE WHEN status = 'broken' THEN 1 ELSE 0 END) as broken,
  SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) as disputed,
  CASE
    WHEN COUNT(*) > 0 THEN
      (SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) + SUM(CASE WHEN status = 'in_progress' THEN 0.4 ELSE 0 END)) / CAST(COUNT(*) AS REAL) * 100
    ELSE 0
  END as mandate_score
FROM official_promises
WHERE official_id IS NOT NULL
GROUP BY official_id;

-- Politician mandate scores view
CREATE VIEW IF NOT EXISTS politician_mandate_scores AS
SELECT
  politician_id,
  COUNT(*) as total_promises,
  SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
  SUM(CASE WHEN status = 'broken' THEN 1 ELSE 0 END) as broken,
  SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) as disputed,
  CASE
    WHEN COUNT(*) > 0 THEN
      (SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) + SUM(CASE WHEN status = 'in_progress' THEN 0.4 ELSE 0 END)) / CAST(COUNT(*) AS REAL) * 100
    ELSE 0
  END as mandate_score
FROM official_promises
WHERE politician_id IS NOT NULL
GROUP BY politician_id;

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE TRIGGER IF NOT EXISTS trg_officials_updated_at
  AFTER UPDATE ON officials
  FOR EACH ROW
BEGIN
  UPDATE officials SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_politicians_updated_at
  AFTER UPDATE ON politicians
  FOR EACH ROW
BEGIN
  UPDATE politicians SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_news_sources_updated_at
  AFTER UPDATE ON news_sources
  FOR EACH ROW
BEGIN
  UPDATE news_sources SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_news_items_updated_at
  AFTER UPDATE ON news_items
  FOR EACH ROW
BEGIN
  UPDATE news_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- Seed data: Nigerian states
-- ============================================
INSERT OR IGNORE INTO states (id, name, code, region) VALUES
  ('state-001', 'Abia', 'AB', 'South-East'),
  ('state-002', 'Adamawa', 'AD', 'North-East'),
  ('state-003', 'Akwa Ibom', 'AK', 'South-South'),
  ('state-004', 'Anambra', 'AN', 'South-East'),
  ('state-005', 'Bauchi', 'BA', 'North-East'),
  ('state-006', 'Bayelsa', 'BY', 'South-South'),
  ('state-007', 'Benue', 'BE', 'North-Central'),
  ('state-008', 'Borno', 'BO', 'North-East'),
  ('state-009', 'Cross River', 'CR', 'South-South'),
  ('state-010', 'Delta', 'DE', 'South-South'),
  ('state-011', 'Ebonyi', 'EB', 'South-East'),
  ('state-012', 'Edo', 'ED', 'South-South'),
  ('state-013', 'Ekiti', 'EK', 'South-West'),
  ('state-014', 'Enugu', 'EN', 'South-East'),
  ('state-015', 'FCT', 'FC', 'North-Central'),
  ('state-016', 'Gombe', 'GO', 'North-East'),
  ('state-017', 'Imo', 'IM', 'South-East'),
  ('state-018', 'Jigawa', 'JI', 'North-West'),
  ('state-019', 'Kaduna', 'KD', 'North-West'),
  ('state-020', 'Kano', 'KN', 'North-West'),
  ('state-021', 'Katsina', 'KT', 'North-West'),
  ('state-022', 'Kebbi', 'KE', 'North-West'),
  ('state-023', 'Kogi', 'KO', 'North-Central'),
  ('state-024', 'Kwara', 'KW', 'North-Central'),
  ('state-025', 'Lagos', 'LA', 'South-West'),
  ('state-026', 'Nasarawa', 'NA', 'North-Central'),
  ('state-027', 'Niger', 'NI', 'North-Central'),
  ('state-028', 'Ogun', 'OG', 'South-West'),
  ('state-029', 'Ondo', 'ON', 'South-West'),
  ('state-030', 'Osun', 'OS', 'South-West'),
  ('state-031', 'Oyo', 'OY', 'South-West'),
  ('state-032', 'Plateau', 'PL', 'North-Central'),
  ('state-033', 'Rivers', 'RI', 'South-South'),
  ('state-034', 'Sokoto', 'SO', 'North-West'),
  ('state-035', 'Taraba', 'TA', 'North-East'),
  ('state-036', 'Yobe', 'YO', 'North-East'),
  ('state-037', 'Zamfara', 'ZA', 'North-West');
