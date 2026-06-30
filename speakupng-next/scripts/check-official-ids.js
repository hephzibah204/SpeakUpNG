const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  try {
    const res = await sql.query(`
      SELECT id, full_name, role FROM officials 
      WHERE full_name ILIKE '%Tinubu%' 
         OR full_name ILIKE '%Sanwo-Olu%' 
         OR full_name ILIKE '%Makinde%'
    `);
    console.log('Found officials:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();
