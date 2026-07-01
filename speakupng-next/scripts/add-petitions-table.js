const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding governance_petitions table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS governance_petitions (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        summary TEXT NOT NULL,
        target_official_id VARCHAR,
        signatures_count INT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ governance_petitions table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
