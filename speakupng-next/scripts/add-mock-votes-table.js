const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding mock_votes_2027 table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS mock_votes_2027 (
        id VARCHAR PRIMARY KEY,
        candidate_name VARCHAR NOT NULL,
        party VARCHAR NOT NULL,
        voter_region VARCHAR NOT NULL CHECK(voter_region IN ('North West','North East','North Central','South West','South East','South South')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_mock_votes_candidate ON mock_votes_2027(candidate_name);
      CREATE INDEX IF NOT EXISTS idx_mock_votes_region ON mock_votes_2027(voter_region);
    `);
    console.log('✅ mock_votes_2027 table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
