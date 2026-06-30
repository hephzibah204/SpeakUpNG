const { createPool } = require('@vercel/postgres');

const connectionString = process.env.evote_POSTGRES_URL || process.env.POSTGRES_URL;
console.log('Connecting...');

const sql = createPool({
  connectionString,
});

async function main() {
  try {
    const officialsCount = await sql.query('SELECT COUNT(*) FROM officials');
    const politiciansCount = await sql.query('SELECT COUNT(*) FROM politicians');
    
    console.log('Officials count:', officialsCount.rows[0].count);
    console.log('Politicians count:', politiciansCount.rows[0].count);
    
    const sampleOfficials = await sql.query('SELECT id, full_name, common_name, wiki_title, bio, profile_bio FROM officials LIMIT 5');
    console.log('\nSample Officials:');
    console.log(JSON.stringify(sampleOfficials.rows, null, 2));
    
    const samplePoliticians = await sql.query('SELECT id, full_name, common_name, party, bio, profile_bio FROM politicians LIMIT 5');
    console.log('\nSample Politicians:');
    console.log(JSON.stringify(samplePoliticians.rows, null, 2));
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await sql.end();
  }
}

main();
