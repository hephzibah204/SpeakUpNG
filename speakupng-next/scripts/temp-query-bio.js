const { createPool } = require('@vercel/postgres');

const connectionString = process.env.evote_POSTGRES_URL || process.env.POSTGRES_URL;

const sql = createPool({
  connectionString,
});

async function main() {
  try {
    const eduCount = await sql.query('SELECT COUNT(*) FROM official_education');
    const careerCount = await sql.query('SELECT COUNT(*) FROM official_career_history');
    const achCount = await sql.query('SELECT COUNT(*) FROM official_achievements');
    
    console.log('Education records:', eduCount.rows[0].count);
    console.log('Career records:', careerCount.rows[0].count);
    console.log('Achievement records:', achCount.rows[0].count);
    
    // Let's also see if any officials have bios
    const officialsWithBio = await sql.query('SELECT COUNT(*) FROM officials WHERE bio IS NOT NULL OR profile_bio IS NOT NULL');
    console.log('Officials with bio/profile_bio:', officialsWithBio.rows[0].count);
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await sql.end();
  }
}

main();
