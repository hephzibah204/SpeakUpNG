const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Checking correct record counts for all major tables...');
  try {
    const tables = [
      'officials',
      'politicians',
      'official_promises',
      'official_projects',
      'election_incidents',
      'fact_checks',
      'political_coalitions',
      'governance_petitions',
      'official_manifestos',
      'bills',
      'budget_allocations',
      'civic_learning_modules',
      'civic_quizzes'
    ];

    for (const t of tables) {
      try {
        const res = await sql.query(`SELECT COUNT(*) as count FROM ${t}`);
        console.log(`- ${t}: ${res.rows[0].count} record(s)`);
      } catch (err) {
        console.log(`- ${t}: Table does not exist or error: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();
