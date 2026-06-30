const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding mock_governorship_votes_2027 table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS mock_governorship_votes_2027 (
        id VARCHAR PRIMARY KEY,
        candidate_name VARCHAR NOT NULL,
        party VARCHAR NOT NULL,
        state VARCHAR NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_mock_gov_candidate ON mock_governorship_votes_2027(candidate_name);
      CREATE INDEX IF NOT EXISTS idx_mock_gov_state ON mock_governorship_votes_2027(state);
    `);
    console.log('✅ mock_governorship_votes_2027 table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
