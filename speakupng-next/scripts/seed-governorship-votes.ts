import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding mock 2027 governorship race preview votes for DB candidates...');
  try {
    // 1. Fetch genuine candidates from the database
    const { rows: candidates } = await sql.query(`
      SELECT candidate_name as name, party, state 
      FROM election_candidates 
      WHERE election_year = 2027 AND election_type = 'governorship'
    `);

    if (candidates.length === 0) {
      console.log('No governorship candidates found in election_candidates table.');
      return;
    }

    // 2. Clear existing mock votes
    await sql.query('DELETE FROM mock_governorship_votes_2027');

    const votes = [];
    // 3. Generate 1200 mock votes to distribute amongst candidates
    for (let i = 0; i < 1200; i++) {
      const candidate = candidates[Math.floor(Math.random() * candidates.length)];
      votes.push({
        id: randomUUID(),
        candidate_name: candidate.name,
        party: candidate.party,
        state: candidate.state
      });
    }

    for (const v of votes) {
      await sql.query(`
        INSERT INTO mock_governorship_votes_2027 (id, candidate_name, party, state)
        VALUES ($1, $2, $3, $4)
      `, [v.id, v.candidate_name, v.party, v.state]);
    }

    console.log(`✅ Seeded ${votes.length} mock 2027 governorship preview votes for ${candidates.length} candidates.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sql.end();
  }
}

main();
