const { createPool } = require('@vercel/postgres');

const connectionString = process.env.evote_POSTGRES_URL || process.env.POSTGRES_URL;

const sql = createPool({
  connectionString,
});

async function main() {
  try {
    const eduCount = await sql.query('SELECT COUNT(*) FROM official_education');
    const careerCount = await sql.query('SELECT COUNT(*) FROM official_career_history');
    const electCount = await sql.query('SELECT COUNT(*) FROM historical_elections');
    const officialsWithBio = await sql.query('SELECT COUNT(*) FROM officials WHERE bio IS NOT NULL');
    const politiciansWithBio = await sql.query('SELECT COUNT(*) FROM politicians WHERE bio IS NOT NULL');
    
    console.log('=== Database Verification ===');
    console.log('Education records:', eduCount.rows[0].count);
    console.log('Career records:', careerCount.rows[0].count);
    console.log('Historical Election records:', electCount.rows[0].count);
    console.log('Officials with bio:', officialsWithBio.rows[0].count);
    console.log('Politicians with bio:', politiciansWithBio.rows[0].count);
    
    console.log('\nSample Education Records:');
    const sampleEdu = await sql.query(`
      SELECT e.institution, e.degree, o.full_name 
      FROM official_education e 
      JOIN officials o ON e.official_id = o.id 
      LIMIT 3
    `);
    console.log(sampleEdu.rows);
    
    console.log('\nSample Career Records:');
    const sampleCareer = await sql.query(`
      SELECT c.role_title, c.organisation, c.start_year, o.full_name 
      FROM official_career_history c 
      JOIN officials o ON c.official_id = o.id 
      LIMIT 3
    `);
    console.log(sampleCareer.rows);

    console.log('\nSample Historical Elections Records:');
    const sampleElect = await sql.query(`
      SELECT election_year, election_type, candidate_name, party, votes, is_winner 
      FROM historical_elections 
      ORDER BY election_year DESC, votes DESC 
      LIMIT 5
    `);
    console.log(sampleElect.rows);
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await sql.end();
  }
}

main();
