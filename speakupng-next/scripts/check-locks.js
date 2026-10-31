const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });
const pool = createPool({ connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL });

async function check() {
  const res = await pool.query("SELECT pid, state, query, wait_event_type, wait_event FROM pg_stat_activity WHERE state != 'idle'");
  console.log('Active queries:', res.rows);
  await pool.end();
}
check().catch(console.error);
