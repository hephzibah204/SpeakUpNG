const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding government_performance table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS government_performance (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR REFERENCES officials(id) ON DELETE CASCADE,
        education_score INT NOT NULL,
        healthcare_score INT NOT NULL,
        roads_score INT NOT NULL,
        agriculture_score INT NOT NULL,
        jobs_score INT NOT NULL,
        security_score INT NOT NULL,
        infrastructure_score INT NOT NULL,
        digital_economy_score INT NOT NULL,
        overall_score INT NOT NULL,
        tier VARCHAR NOT NULL CHECK (tier IN ('federal','state','local')),
        year INT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_performance_official ON government_performance(official_id);
    `);
    console.log('✅ government_performance table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
