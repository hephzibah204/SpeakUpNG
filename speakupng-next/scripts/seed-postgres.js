const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function seed() {
  console.log('Seeding Postgres database...');

  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS states (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL UNIQUE,
        code VARCHAR,
        region VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS officials (
        id VARCHAR PRIMARY KEY,
        full_name VARCHAR NOT NULL,
        common_name VARCHAR,
        role VARCHAR,
        tier VARCHAR NOT NULL DEFAULT 'federal_executive',
        website VARCHAR,
        photo_url VARCHAR,
        state VARCHAR,
        rating_avg REAL NOT NULL DEFAULT 0,
        rating_count INTEGER NOT NULL DEFAULT 0,
        bio TEXT,
        profile_bio TEXT,
        aspiring_for VARCHAR,
        previous_offices TEXT,
        wiki_title VARCHAR,
        wiki_url VARCHAR,
        social_links JSONB DEFAULT '{}'::jsonb,
        source_urls JSONB DEFAULT '[]'::jsonb,
        source_notes TEXT,
        status VARCHAR NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS politicians (
        id VARCHAR PRIMARY KEY,
        full_name VARCHAR NOT NULL,
        common_name VARCHAR,
        party VARCHAR NOT NULL,
        aspiration_title VARCHAR,
        aspiring_for VARCHAR,
        previous_offices TEXT,
        wiki_title VARCHAR,
        wiki_url VARCHAR,
        bio TEXT,
        profile_bio TEXT,
        photo_url VARCHAR,
        aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
        social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
        source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        source_notes TEXT,
        priority INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        rating_avg REAL NOT NULL DEFAULT 0,
        rating_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS polls (
        id VARCHAR PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL DEFAULT '[]'::jsonb,
        total_votes INTEGER NOT NULL DEFAULT 0,
        status VARCHAR NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed')),
        closes_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS poll_votes (
        id VARCHAR PRIMARY KEY,
        poll_id VARCHAR NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        anon_id VARCHAR NOT NULL,
        option_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(poll_id, anon_id)
      );

      CREATE TABLE IF NOT EXISTS public_ratings (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
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
        reviewer_state VARCHAR,
        review_text TEXT,
        device_hash VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_secrets (
        id VARCHAR PRIMARY KEY,
        key VARCHAR NOT NULL UNIQUE,
        value VARCHAR NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS official_promises (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR REFERENCES officials(id) ON DELETE CASCADE,
        politician_id VARCHAR REFERENCES politicians(id) ON DELETE CASCADE,
        promise_title VARCHAR NOT NULL,
        promise_detail TEXT,
        promise_category VARCHAR,
        promise_date VARCHAR,
        promise_source TEXT,
        status VARCHAR NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'fulfilled', 'broken', 'disputed')),
        progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent >= 0 AND progress_percent <= 100),
        evidence_url TEXT,
        verified_by VARCHAR,
        last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS promise_assessments (
        id VARCHAR PRIMARY KEY,
        promise_id VARCHAR NOT NULL REFERENCES official_promises(id) ON DELETE CASCADE,
        user_id VARCHAR,
        device_hash VARCHAR NOT NULL,
        anon_id VARCHAR,
        fulfilled BOOLEAN NOT NULL,
        completion_percent INTEGER CHECK (completion_percent BETWEEN 0 AND 100),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(promise_id, device_hash)
      );

      CREATE TABLE IF NOT EXISTS mandate_audit_events (
        id VARCHAR PRIMARY KEY,
        event_type VARCHAR NOT NULL,
        promise_id VARCHAR,
        record_table VARCHAR NOT NULL,
        record_id VARCHAR,
        actor_user_id VARCHAR,
        actor_device_hash VARCHAR,
        anon_id VARCHAR,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS promise_ai_verifications (
        id VARCHAR PRIMARY KEY,
        promise_id VARCHAR REFERENCES official_promises(id) ON DELETE CASCADE,
        evidence_original_url TEXT NOT NULL,
        evidence_canonical_url TEXT NOT NULL,
        evidence_url_hash VARCHAR NOT NULL,
        model VARCHAR NOT NULL,
        verdict VARCHAR NOT NULL CHECK (verdict IN ('supports','contradicts','unclear')),
        confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        explanation TEXT,
        created_by VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Views
      CREATE OR REPLACE VIEW official_rating_agg AS
      SELECT
        official_id,
        COUNT(*) as rating_count,
        ROUND(AVG(overall)::numeric, 2) as rating_avg,
        ROUND(AVG(accountability)::numeric, 2) as accountability_avg,
        ROUND(AVG(service)::numeric, 2) as service_avg,
        ROUND(AVG(transparency)::numeric, 2) as transparency_avg,
        ROUND(AVG(responsiveness)::numeric, 2) as responsiveness_avg,
        ROUND(AVG(power)::numeric, 2) as power_avg,
        ROUND(AVG(security)::numeric, 2) as security_avg,
        ROUND(AVG(economic_stability)::numeric, 2) as economic_stability_avg,
        ROUND(AVG(education)::numeric, 2) as education_avg,
        ROUND(AVG(healthcare)::numeric, 2) as healthcare_avg
      FROM public_ratings
      GROUP BY official_id;

      CREATE OR REPLACE VIEW promise_public_completion AS
      SELECT
        promise_id,
        COUNT(*) as total_votes,
        SUM(CASE WHEN fulfilled THEN 1 ELSE 0 END) as yes_votes,
        SUM(CASE WHEN fulfilled THEN 0 ELSE 1 END) as no_votes,
        ROUND((SUM(CASE WHEN fulfilled THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*),0)) * 100, 2) as fulfilled_rate,
        ROUND(AVG(CASE WHEN fulfilled THEN completion_percent::numeric ELSE NULL END), 2) as avg_completion_yes,
        ROUND(
          (
            (SUM(CASE WHEN fulfilled THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*),0))
            * (AVG(CASE WHEN fulfilled THEN completion_percent::numeric ELSE NULL END) / 100)
            * 100
          )
        , 2) as completion_score,
        MAX(created_at) as last_vote_at
      FROM promise_assessments
      GROUP BY promise_id;

      CREATE OR REPLACE VIEW official_mandate_scores AS
      SELECT
        p.official_id,
        COUNT(DISTINCT p.id) as total_promises,
        COUNT(c.promise_id) as scored_promises,
        ROUND(AVG(c.completion_score), 2) as mandate_score,
        SUM(c.total_votes) as total_votes,
        MAX(c.last_vote_at) as last_vote_at
      FROM official_promises p
      LEFT JOIN promise_public_completion c ON c.promise_id = p.id
      GROUP BY p.official_id;

      -- Create functions for triggers
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE OR REPLACE FUNCTION update_poll_total_votes()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE polls SET total_votes = total_votes + 1, updated_at = NOW() WHERE id = NEW.poll_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION update_official_ratings()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE officials SET
            rating_count = (SELECT COUNT(*) FROM public_ratings WHERE official_id = NEW.official_id),
            rating_avg = COALESCE(ROUND((SELECT AVG(overall) FROM public_ratings WHERE official_id = NEW.official_id)::numeric, 2), 0),
            updated_at = NOW()
          WHERE id = NEW.official_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE officials SET
            rating_count = (SELECT COUNT(*) FROM public_ratings WHERE official_id = OLD.official_id),
            rating_avg = COALESCE(ROUND((SELECT AVG(overall) FROM public_ratings WHERE official_id = OLD.official_id)::numeric, 2), 0),
            updated_at = NOW()
          WHERE id = OLD.official_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      -- Apply triggers (Drop if exists to make it idempotent)
      DROP TRIGGER IF EXISTS trg_officials_updated_at ON officials;
      CREATE TRIGGER trg_officials_updated_at BEFORE UPDATE ON officials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS trg_poll_votes_insert ON poll_votes;
      CREATE TRIGGER trg_poll_votes_insert AFTER INSERT ON poll_votes FOR EACH ROW EXECUTE FUNCTION update_poll_total_votes();

      DROP TRIGGER IF EXISTS trg_public_ratings_insert ON public_ratings;
      CREATE TRIGGER trg_public_ratings_insert AFTER INSERT ON public_ratings FOR EACH ROW EXECUTE FUNCTION update_official_ratings();

      DROP TRIGGER IF EXISTS trg_public_ratings_delete ON public_ratings;
      CREATE TRIGGER trg_public_ratings_delete AFTER DELETE ON public_ratings FOR EACH ROW EXECUTE FUNCTION update_official_ratings();
    `);

    // Insert seeds
    await sql.query(`
      INSERT INTO states (id, name, code, region) VALUES 
        ('state-001', 'Abia', 'AB', 'South-East'),
        ('state-025', 'Lagos', 'LA', 'South-West')
      ON CONFLICT(name) DO NOTHING;

      INSERT INTO polls (id, question, options, total_votes, status, closes_at) VALUES 
      ('poll-1', 'How would you rate the current economic policies?', '[{"text":"Excellent","votes":150},{"text":"Fair","votes":300},{"text":"Poor","votes":850}]', 1300, 'active', NOW() + INTERVAL '7 days'),
      ('poll-2', 'Who should be the next president?', '[{"text":"Bola Ahmed Tinubu (APC)","votes":400},{"text":"Atiku Abubakar (PDP)","votes":350},{"text":"Peter Obi (LP)","votes":600},{"text":"Rabiu Kwankwaso (NNPP)","votes":150}]', 1500, 'active', NOW() + INTERVAL '14 days')
      ON CONFLICT(id) DO NOTHING;
    `);

    console.log('Successfully seeded Postgres schema and data.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seed();
