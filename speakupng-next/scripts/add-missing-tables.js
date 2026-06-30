/**
 * Adds the legacy tables that were missing from the Neon/Postgres schema.
 * Adapted from the old Supabase migrations: VARCHAR ids (app-generated),
 * no RLS, no auth.users references. Idempotent — safe to re-run.
 *
 *   npm run db:migrate
 */
const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding missing legacy tables to Neon Postgres...');
  try {
    // ---- Officials profile-enrichment columns ----
    console.log('Adding officials enrichment columns...');
    await sql.query(`
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS state_of_origin VARCHAR;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS lga_of_origin VARCHAR;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS religion VARCHAR;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS marital_status VARCHAR;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS education_summary TEXT;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS profile_generated BOOLEAN DEFAULT FALSE;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS profile_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE officials ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);

    // ---- Profile detail tables ----
    console.log('Creating official_career_history / official_education / official_achievements...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS official_career_history (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR REFERENCES officials(id) ON DELETE CASCADE,
        role_title VARCHAR NOT NULL,
        organisation VARCHAR,
        start_year INTEGER,
        end_year INTEGER,
        is_current BOOLEAN DEFAULT FALSE,
        category VARCHAR CHECK (category IN ('political','professional','military','academic','other'))
      );
      CREATE INDEX IF NOT EXISTS idx_career_history_official ON official_career_history(official_id);

      CREATE TABLE IF NOT EXISTS official_education (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR REFERENCES officials(id) ON DELETE CASCADE,
        institution VARCHAR,
        degree VARCHAR,
        field VARCHAR,
        year INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_education_official ON official_education(official_id);

      CREATE TABLE IF NOT EXISTS official_achievements (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR REFERENCES officials(id) ON DELETE CASCADE,
        title VARCHAR NOT NULL,
        description TEXT,
        year INTEGER,
        category VARCHAR,
        evidence_url TEXT,
        verified BOOLEAN DEFAULT FALSE
      );
      CREATE INDEX IF NOT EXISTS idx_achievements_official ON official_achievements(official_id);
    `);

    // ---- Mandate detail: milestones, evidence, opinions ----
    console.log('Creating promise_milestones / promise_evidence_submissions / promise_opinions...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS promise_milestones (
        id VARCHAR PRIMARY KEY,
        promise_id VARCHAR REFERENCES official_promises(id) ON DELETE CASCADE,
        milestone_title VARCHAR NOT NULL,
        target_date DATE,
        achieved BOOLEAN DEFAULT FALSE,
        note TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_milestones_promise ON promise_milestones(promise_id);

      CREATE TABLE IF NOT EXISTS promise_evidence_submissions (
        id VARCHAR PRIMARY KEY,
        promise_id VARCHAR REFERENCES official_promises(id) ON DELETE CASCADE,
        submitted_by VARCHAR,
        evidence_url TEXT NOT NULL,
        note TEXT,
        stance VARCHAR CHECK (stance IN ('supports','contradicts')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_evidence_promise ON promise_evidence_submissions(promise_id);

      CREATE TABLE IF NOT EXISTS promise_opinions (
        id VARCHAR PRIMARY KEY,
        promise_id VARCHAR REFERENCES official_promises(id) ON DELETE CASCADE,
        device_hash VARCHAR NOT NULL,
        anon_id VARCHAR,
        stance VARCHAR NOT NULL CHECK (stance IN ('supports','contradicts')),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_opinions_promise ON promise_opinions(promise_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_opinion_per_device ON promise_opinions(promise_id, device_hash);
    `);

    // ---- Sentiment views over promise_opinions ----
    console.log('Creating sentiment views...');
    await sql.query(`
      CREATE OR REPLACE VIEW promise_public_sentiment AS
      SELECT
        promise_id,
        COUNT(*) AS total_reviews,
        SUM(CASE WHEN stance = 'supports' THEN 1 ELSE 0 END) AS supports,
        SUM(CASE WHEN stance = 'contradicts' THEN 1 ELSE 0 END) AS contradicts,
        ROUND(((((SUM(CASE WHEN stance='supports' THEN 1 ELSE 0 END)
                 - SUM(CASE WHEN stance='contradicts' THEN 1 ELSE 0 END))::numeric
                 / NULLIF(COUNT(*),0)) + 1) / 2 * 100)::numeric, 2) AS sentiment_score
      FROM promise_opinions
      GROUP BY promise_id;

      CREATE OR REPLACE VIEW official_public_sentiment AS
      SELECT
        p.official_id,
        COUNT(o.id) AS total_reviews,
        SUM(CASE WHEN o.stance = 'supports' THEN 1 ELSE 0 END) AS supports,
        SUM(CASE WHEN o.stance = 'contradicts' THEN 1 ELSE 0 END) AS contradicts,
        ROUND(((((SUM(CASE WHEN o.stance='supports' THEN 1 ELSE 0 END)
                 - SUM(CASE WHEN o.stance='contradicts' THEN 1 ELSE 0 END))::numeric
                 / NULLIF(COUNT(o.id),0)) + 1) / 2 * 100)::numeric, 2) AS public_sentiment_score
      FROM official_promises p
      LEFT JOIN promise_opinions o ON o.promise_id = p.id
      GROUP BY p.official_id;
    `);

    // ---- Rewards / gamification ----
    console.log('Creating reward_points_ledger / reward_redemptions...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS reward_points_ledger (
        id VARCHAR PRIMARY KEY,
        anon_id VARCHAR,
        device_hash VARCHAR,
        action VARCHAR NOT NULL,
        points INTEGER NOT NULL,
        meta JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reward_points_actor ON reward_points_ledger(anon_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id VARCHAR PRIMARY KEY,
        anon_id VARCHAR,
        device_hash VARCHAR,
        provider VARCHAR DEFAULT 'vtpass',
        reward_type VARCHAR DEFAULT 'airtime',
        amount_ngn INTEGER NOT NULL,
        points_cost INTEGER NOT NULL,
        phone VARCHAR,
        network VARCHAR,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending','processing','success','failed','cancelled')),
        provider_ref VARCHAR,
        provider_response JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reward_redemptions_actor ON reward_redemptions(anon_id, created_at DESC);
    `);

    // ---- Device review locks (anti-abuse for ratings) ----
    console.log('Creating device_review_locks...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS device_review_locks (
        id VARCHAR PRIMARY KEY,
        device_hash VARCHAR NOT NULL,
        official_id VARCHAR REFERENCES officials(id) ON DELETE CASCADE,
        state VARCHAR,
        lga VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(device_hash, official_id)
      );
    `);

    // ---- Reports (canonical; routes previously created this inline) ----
    console.log('Creating reports...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR,
        politician_id VARCHAR,
        anon_id VARCHAR,
        description TEXT NOT NULL,
        evidence_url TEXT,
        is_anonymous INTEGER DEFAULT 1,
        categories TEXT,
        status VARCHAR NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
    `);

    // ---- News audit log + alerts (admin/news intelligence) ----
    console.log('Creating news_audit_log / news_alerts...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS news_audit_log (
        id VARCHAR PRIMARY KEY,
        news_item_id VARCHAR,
        action VARCHAR NOT NULL,
        actor VARCHAR,
        note TEXT,
        payload JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_news_audit_item ON news_audit_log(news_item_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS news_alerts (
        id VARCHAR PRIMARY KEY,
        profile_type VARCHAR CHECK (profile_type IN ('official','politician')),
        profile_id VARCHAR,
        news_item_id VARCHAR REFERENCES news_items(id) ON DELETE CASCADE,
        severity VARCHAR NOT NULL DEFAULT 'info' CHECK (severity IN ('info','watch','urgent')),
        title VARCHAR,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_news_alerts_unread ON news_alerts(is_read, created_at DESC);
    `);

    console.log('✅ Missing legacy tables added successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
