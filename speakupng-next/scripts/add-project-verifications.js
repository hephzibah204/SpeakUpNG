const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding project_verifications table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS project_verifications (
        id VARCHAR PRIMARY KEY,
        project_id VARCHAR REFERENCES official_projects(id) ON DELETE CASCADE,
        status VARCHAR NOT NULL CHECK (status IN ('completed', 'ongoing', 'abandoned')),
        photo_url TEXT,
        comment TEXT,
        device_hash VARCHAR NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_verifications_project ON project_verifications(project_id);
    `);
    console.log('✅ project_verifications table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
