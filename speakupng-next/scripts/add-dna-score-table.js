/**
 * Migration: Creates the official_dna_scores table for the Political DNA Score feature.
 * Idempotent — safe to re-run.
 *
 *   node scripts/add-dna-score-table.js
 */
const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Creating official_dna_scores table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS official_dna_scores (
        id VARCHAR PRIMARY KEY,
        official_id VARCHAR REFERENCES officials(id) ON DELETE CASCADE,
        leadership INT NOT NULL DEFAULT 0,
        integrity INT NOT NULL DEFAULT 0,
        transparency INT NOT NULL DEFAULT 0,
        accountability INT NOT NULL DEFAULT 0,
        accessibility INT NOT NULL DEFAULT 0,
        youth_support INT NOT NULL DEFAULT 0,
        economic_performance INT NOT NULL DEFAULT 0,
        education_performance INT NOT NULL DEFAULT 0,
        healthcare_performance INT NOT NULL DEFAULT 0,
        innovation INT NOT NULL DEFAULT 0,
        national_acceptance INT NOT NULL DEFAULT 0,
        legislative_productivity INT NOT NULL DEFAULT 0,
        overall_score INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_dna_scores_official_unique ON official_dna_scores(official_id);
      CREATE INDEX IF NOT EXISTS idx_dna_scores_overall ON official_dna_scores(overall_score DESC);
    `);

    console.log('✅ official_dna_scores table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
