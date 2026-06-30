const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });
const sql = createPool({ connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL });
async function main() {
  // Check if fact_check_votes table exists
  const r1 = await sql.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('fact_checks','fact_check_votes') AND table_schema = 'public'");
  console.log('Tables:', JSON.stringify(r1.rows));
  
  // Check fact_checks count
  const r2 = await sql.query('SELECT COUNT(*) FROM fact_checks');
  console.log('fact_checks count:', r2.rows[0].count);
  
  // Check constraint on status column
  const r3 = await sql.query("SELECT conname, consrc FROM pg_constraint WHERE conrelid = 'fact_checks'::regclass AND contype = 'c'");
  console.log('Constraints:', JSON.stringify(r3.rows));
  
  await sql.end();
}
main().catch(console.error);
