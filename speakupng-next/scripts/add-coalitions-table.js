const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding political_coalitions table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS political_coalitions (
        id VARCHAR PRIMARY KEY,
        event_type VARCHAR NOT NULL CHECK(event_type IN ('defection','coalition','endorsement','running_mate')),
        politician_name VARCHAR NOT NULL,
        from_party VARCHAR,
        to_party VARCHAR,
        description TEXT,
        source_url TEXT,
        event_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ political_coalitions table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
