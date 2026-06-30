const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  try {
    const officialsCount = await sql.query('SELECT COUNT(*) FROM officials');
    const politiciansCount = await sql.query('SELECT COUNT(*) FROM politicians');
    const promisesCount = await sql.query('SELECT COUNT(*) FROM official_promises');
    const projectsCount = await sql.query('SELECT COUNT(*) FROM official_projects');

    console.log('--- Database Record Counts ---');
    console.log(`Officials: ${officialsCount.rows[0].count}`);
    console.log(`Politicians (Candidates): ${politiciansCount.rows[0].count}`);
    console.log(`Promises/Mandates: ${promisesCount.rows[0].count}`);
    console.log(`Projects Delivered: ${projectsCount.rows[0].count}`);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();
