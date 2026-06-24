-- Migration 002: Additional indexes, triggers, and views
-- Improves query performance and data integrity

-- ============================================
-- Additional Indexes
-- ============================================

-- Officials: composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_officials_tier_state ON officials(tier, state, status);
CREATE INDEX IF NOT EXISTS idx_officials_name_search ON officials(LOWER(full_name));
CREATE INDEX IF NOT EXISTS idx_officials_common_name_search ON officials(LOWER(common_name));

-- Politicians: additional search and filter indexes
CREATE INDEX IF NOT EXISTS idx_politicians_created ON politicians(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_politicians_aspiring ON politicians(aspiring_for, is_active);

-- Public ratings: composite for aggregate queries
CREATE INDEX IF NOT EXISTS idx_ratings_official_created ON public_ratings(official_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_device_official ON public_ratings(device_hash, official_id);
CREATE INDEX IF NOT EXISTS idx_ratings_overall ON public_ratings(official_id, overall);

-- Politician ratings: composite for aggregate queries
CREATE INDEX IF NOT EXISTS idx_politician_ratings_device ON politician_ratings(device_hash, politician_id);
CREATE INDEX IF NOT EXISTS idx_politician_ratings_overall ON politician_ratings(politician_id, overall);

-- News items: full-text search and filtering indexes
CREATE INDEX IF NOT EXISTS idx_news_items_topic_status ON news_items(topic, moderation_status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_title_search ON news_items(LOWER(title));

-- News profile matches: confidence-based lookups
CREATE INDEX IF NOT EXISTS idx_news_profile_matches_confidence ON news_profile_matches(profile_type, profile_id, confidence DESC);

-- Official promises: status-based lookups
CREATE INDEX IF NOT EXISTS idx_promises_official_status ON official_promises(official_id, status);
CREATE INDEX IF NOT EXISTS idx_promises_category ON official_promises(promise_category, status);

-- ============================================
-- Additional Triggers
-- ============================================

-- Trigger to auto-update public_ratings aggregate on officials
CREATE TRIGGER IF NOT EXISTS trg_public_ratings_insert
  AFTER INSERT ON public_ratings
  FOR EACH ROW
BEGIN
  UPDATE officials SET
    rating_count = (SELECT COUNT(*) FROM public_ratings WHERE official_id = NEW.official_id),
    rating_avg = ROUND((SELECT AVG(overall) FROM public_ratings WHERE official_id = NEW.official_id), 2),
    updated_at = datetime('now')
  WHERE id = NEW.official_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_public_ratings_delete
  AFTER DELETE ON public_ratings
  FOR EACH ROW
BEGIN
  UPDATE officials SET
    rating_count = (SELECT COUNT(*) FROM public_ratings WHERE official_id = OLD.official_id),
    rating_avg = CASE
      WHEN (SELECT COUNT(*) FROM public_ratings WHERE official_id = OLD.official_id) > 0
      THEN ROUND((SELECT AVG(overall) FROM public_ratings WHERE official_id = OLD.official_id), 2)
      ELSE 0
    END,
    updated_at = datetime('now')
  WHERE id = OLD.official_id;
END;

-- Trigger to auto-update politician_ratings aggregate on politicians
CREATE TRIGGER IF NOT EXISTS trg_politician_ratings_insert
  AFTER INSERT ON politician_ratings
  FOR EACH ROW
BEGIN
  UPDATE politicians SET updated_at = datetime('now')
  WHERE id = NEW.politician_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_politician_ratings_delete
  AFTER DELETE ON politician_ratings
  FOR EACH ROW
BEGIN
  UPDATE politicians SET updated_at = datetime('now')
  WHERE id = OLD.politician_id;
END;

-- Trigger to prevent duplicate ratings from same device on same official in 24h
CREATE TRIGGER IF NOT EXISTS trg_public_ratings_ratelimit
  BEFORE INSERT ON public_ratings
  FOR EACH ROW
BEGIN
  SELECT RAISE(ABORT, 'You can only rate an official once every 24 hours')
  WHERE EXISTS (
    SELECT 1 FROM public_ratings
    WHERE official_id = NEW.official_id
      AND device_hash = NEW.device_hash
      AND created_at > datetime('now', '-1 day')
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_politician_ratings_ratelimit
  BEFORE INSERT ON politician_ratings
  FOR EACH ROW
BEGIN
  SELECT RAISE(ABORT, 'You can only rate a politician once every 24 hours')
  WHERE EXISTS (
    SELECT 1 FROM politician_ratings
    WHERE politician_id = NEW.politician_id
      AND device_hash = NEW.device_hash
      AND created_at > datetime('now', '-1 day')
  );
END;

-- ============================================
-- Additional Views
-- ============================================

-- Officials with state names
CREATE VIEW IF NOT EXISTS officials_with_state AS
SELECT
  o.*,
  s.name AS state_name,
  s.code AS state_code,
  s.region AS state_region
FROM officials o
LEFT JOIN states s ON o.state = s.id;

-- Agency statistics view
CREATE VIEW IF NOT EXISTS agency_stats AS
SELECT
  o.id,
  o.full_name,
  o.common_name,
  o.role,
  o.tier,
  o.website,
  o.photo_url,
  o.rating_avg,
  o.rating_count,
  o.bio,
  o.status,
  s.name AS state_name,
  s.code AS state_code
FROM officials o
LEFT JOIN states s ON o.state = s.id
WHERE o.tier IN ('federal_agency', 'state_agency');

-- Politician with rating summary
CREATE VIEW IF NOT EXISTS politicians_with_ratings AS
SELECT
  p.*,
  COALESCE(agg.rating_count, 0) AS rating_count,
  COALESCE(agg.rating_avg, 0) AS rating_avg
FROM politicians p
LEFT JOIN politician_rating_agg agg ON p.id = agg.politician_id;
