const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Creating official_promises table in Neon Postgres...');

  try {
    await sql.query(`
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
        verified_by TEXT,
        last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_promises_official ON official_promises(official_id);
      CREATE INDEX IF NOT EXISTS idx_promises_politician ON official_promises(politician_id);
      CREATE INDEX IF NOT EXISTS idx_promises_official_status ON official_promises(official_id, status);
      CREATE INDEX IF NOT EXISTS idx_promises_politician_status ON official_promises(politician_id, status);
    `);

    console.log('✅ official_promises table created successfully!');
  } catch (err) {
    console.error('❌ Table creation failed:', err);
  }
}

main();
