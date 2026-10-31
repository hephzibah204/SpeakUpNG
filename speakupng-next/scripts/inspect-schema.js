const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });
const pool = createPool({ connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL });

async function check() {
  const newsCols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'news_items'"
  );
  console.log('news_items cols:', newsCols.rows);
  
  const candCols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'election_candidates'"
  );
  console.log('election_candidates cols:', candCols.rows);

  const candCount = await pool.query("SELECT COUNT(*) FROM election_candidates");
  console.log('election_candidates count:', candCount.rows[0]);

  const newsCount = await pool.query("SELECT COUNT(*) FROM news_items");
  console.log('news_items count:', newsCount.rows[0]);

  await pool.end();
}
check().catch(console.error);
