import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Clearing simulated votes from the database...');
  
  try {
    const resPres = await sql.query(`DELETE FROM mock_votes_2027`);
    console.log(`✅ Cleared ${resPres.rowCount} simulated presidential votes.`);

    const resGov = await sql.query(`DELETE FROM mock_governorship_votes_2027`);
    console.log(`✅ Cleared ${resGov.rowCount} simulated governorship votes.`);

  } catch (err) {
    console.error('❌ Failed to clear simulated votes:', err);
  } finally {
    await sql.end();
  }
}

main();
