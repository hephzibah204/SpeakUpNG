const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });
const sql = createPool({ connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL });
async function main() {
  const r = await sql.query("SELECT id, full_name, role FROM officials WHERE full_name ILIKE ANY(ARRAY['%Tinubu%','%Sanwo%','%Makinde%','%Otti%','%Mbah%','%Eno%','%Zulum%']) ORDER BY full_name LIMIT 20");
  console.log(JSON.stringify(r.rows, null, 2));
  await sql.end();
}
main().catch(console.error);
