const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Dropping and recreating fact_checks table...');
  try {
    await sql.query('DROP TABLE IF EXISTS fact_checks CASCADE');
    await sql.query(`
      CREATE TABLE fact_checks (
        id VARCHAR PRIMARY KEY,
        claim TEXT NOT NULL,
        submitted_by VARCHAR,
        official_id VARCHAR,
        evidence_url TEXT,
        status VARCHAR DEFAULT 'pending' CHECK(status IN ('pending','true','mostly_true','misleading','false','unverified')),
        expert_notes TEXT,
        community_upvotes INT DEFAULT 0,
        community_downvotes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_factchecks_official ON fact_checks(official_id);
    `);
    console.log('✅ fact_checks table recreated successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
