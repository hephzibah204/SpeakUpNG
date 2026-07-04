import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Purging unverified/assumed candidates from the database...');
  
  try {
    const result = await sql.query(`
      DELETE FROM election_candidates 
      WHERE source_url = 'https://speakup.ng/expanded-candidates'
    `);

    console.log(`✅ Successfully purged ${result.rowCount} assumed candidates.`);
  } catch (err) {
    console.error('❌ Purge failed:', err);
  } finally {
    await sql.end();
  }
}

main();
