/**
 * Adds tables for the "core civic features" roadmap phase:
 * fact checker, election incident reporting, coalition/defection tracker,
 * and gamification (reuses reward_points_ledger from add-missing-tables.js).
 *
 *   npm run db:civic
 */
const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding civic-features tables to Neon Postgres...');
  try {
    console.log('Creating fact_checks...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS fact_checks (
        id VARCHAR PRIMARY KEY,
        claim TEXT NOT NULL,
        context TEXT,
        official_id VARCHAR REFERENCES officials(id) ON DELETE SET NULL,
        politician_id VARCHAR REFERENCES politicians(id) ON DELETE SET NULL,
        submitted_by VARCHAR,
        evidence_url TEXT,
        status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','community_review','expert_review','resolved')),
        label VARCHAR CHECK (label IN ('true','mostly_true','misleading','false','unverified')),
        ai_assessment TEXT,
        expert_note TEXT,
        reviewed_by VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_fact_checks_status ON fact_checks(status, created_at DESC);

      CREATE TABLE IF NOT EXISTS fact_check_votes (
        id VARCHAR PRIMARY KEY,
        fact_check_id VARCHAR REFERENCES fact_checks(id) ON DELETE CASCADE,
        device_hash VARCHAR NOT NULL,
        stance VARCHAR NOT NULL CHECK (stance IN ('credible','not_credible')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(fact_check_id, device_hash)
      );
    `);

    console.log('Creating election_incidents...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS election_incidents (
        id VARCHAR PRIMARY KEY,
        category VARCHAR NOT NULL CHECK (category IN ('vote_buying','violence','ballot_snatching','missing_materials','delayed_officials','card_reader_failure','intimidation','fake_polling_unit','other')),
        description TEXT NOT NULL,
        state VARCHAR,
        lga VARCHAR,
        polling_unit VARCHAR,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        photo_url TEXT,
        video_url TEXT,
        reporter_name VARCHAR,
        reporter_contact VARCHAR,
        device_hash VARCHAR,
        status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','escalated')),
        reviewer_note TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON election_incidents(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_incidents_state ON election_incidents(state, lga);
    `);

    console.log('Creating political_events (coalition & defection tracker)...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS political_events (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR REFERENCES officials(id) ON DELETE SET NULL,
        politician_id VARCHAR REFERENCES politicians(id) ON DELETE SET NULL,
        event_type VARCHAR NOT NULL CHECK (event_type IN ('defection','coalition','endorsement','running_mate','alliance')),
        from_party VARCHAR,
        to_party VARCHAR,
        description TEXT,
        source_url TEXT,
        event_date DATE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_political_events_date ON political_events(event_date DESC);
    `);

    console.log('✅ Civic-features tables added successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
