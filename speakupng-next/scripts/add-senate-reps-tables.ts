import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Migrating database for Senate & House of Reps 2027 mock voting...');

  await sql.query(`
    CREATE TABLE IF NOT EXISTS mock_senate_votes_2027 (
      id VARCHAR PRIMARY KEY,
      candidate_name VARCHAR NOT NULL,
      party VARCHAR NOT NULL,
      state VARCHAR NOT NULL,
      district VARCHAR NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ Created mock_senate_votes_2027 table.');

  await sql.query(`
    CREATE TABLE IF NOT EXISTS mock_reps_votes_2027 (
      id VARCHAR PRIMARY KEY,
      candidate_name VARCHAR NOT NULL,
      party VARCHAR NOT NULL,
      state VARCHAR NOT NULL,
      constituency VARCHAR NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ Created mock_reps_votes_2027 table.');

  await sql.query(`
    ALTER TABLE election_candidates ADD COLUMN IF NOT EXISTS district VARCHAR;
  `);
  console.log('✅ Added district column to election_candidates.');

  await sql.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
