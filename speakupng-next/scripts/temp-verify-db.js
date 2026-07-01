const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Validating evote.ng database features connection...');
  try {
    const manifestosCount = await sql.query('SELECT COUNT(*) as count FROM official_manifestos');
    console.log(`- official_manifestos table connected. Records: ${manifestosCount.rows[0].count}`);

    const petitionsCount = await sql.query('SELECT COUNT(*) as count FROM governance_petitions');
    console.log(`- governance_petitions table connected. Records: ${petitionsCount.rows[0].count}`);

    const mockVotesCount = await sql.query('SELECT COUNT(*) as count FROM mock_votes_2027');
    console.log(`- mock_votes_2027 table connected. Records: ${mockVotesCount.rows[0].count}`);

    const mockGovVotesCount = await sql.query('SELECT COUNT(*) as count FROM mock_governorship_votes_2027');
    console.log(`- mock_governorship_votes_2027 table connected. Records: ${mockGovVotesCount.rows[0].count}`);

    console.log('✅ All backend features are fully verified and connected to database.');
  } catch (err) {
    console.error('❌ Connection verification failed:', err);
  } finally {
    await sql.end();
  }
}

main();
