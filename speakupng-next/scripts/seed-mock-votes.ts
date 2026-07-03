import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding official 2027 presidential candidates from database...');
  try {
    // 1. Fetch genuine candidates from the database
    const { rows: candidates } = await sql.query(`
      SELECT candidate_name as name, party 
      FROM election_candidates 
      WHERE election_year = 2027 AND election_type = 'presidential'
    `);

    if (candidates.length === 0) {
      console.log('No presidential candidates found in election_candidates table. Run seed-2027-candidates.js first.');
      return;
    }

    const regions = ['North West', 'North East', 'North Central', 'South West', 'South East', 'South South'];

    // 2. Clear existing mock votes
    await sql.query('DELETE FROM mock_votes_2027');

    const votes = [];
    // 3. Generate ~300 mock votes spread across the real candidates
    for (let i = 0; i < 300; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      let candidate = candidates[Math.floor(Math.random() * candidates.length)];

      votes.push({
        id: randomUUID(),
        candidate_name: candidate.name,
        party: candidate.party,
        voter_region: region
      });
    }

    for (const v of votes) {
      await sql.query(`
        INSERT INTO mock_votes_2027 (id, candidate_name, party, voter_region)
        VALUES ($1, $2, $3, $4)
      `, [v.id, v.candidate_name, v.party, v.voter_region]);
    }

    console.log(`✅ Seeded ${votes.length} updated mock votes across ${candidates.length} dynamic candidates successfully.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sql.end();
  }
}

main();
