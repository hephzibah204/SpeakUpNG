const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding official_manifestos table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS official_manifestos (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR, -- Can be null for aspirants who are not in officials table yet
        politician_id VARCHAR REFERENCES politicians(id) ON DELETE CASCADE,
        title VARCHAR NOT NULL,
        summary TEXT,
        cost_feasibility JSONB NOT NULL DEFAULT '{}'::jsonb,
        sdg_alignment JSONB NOT NULL DEFAULT '[]'::jsonb,
        milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_manifesto_politician ON official_manifestos(politician_id);
    `);
    console.log('✅ official_manifestos table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
