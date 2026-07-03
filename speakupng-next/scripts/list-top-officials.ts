import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  try {
    const res = await sql.query(`
      SELECT id, full_name, role, state, tier, rating_count, rating_avg
      FROM officials
      ORDER BY rating_count DESC, rating_avg DESC
      LIMIT 30
    `);
    console.log('Top 30 Officials by Rating Count:');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();
