/**
 * Seeds UNCONFIRMED/expected 2027 Nigerian governorship candidates.
 *
 * IMPORTANT: Unlike the presidential list, INEC has not published a
 * finalized governorship candidate list as of this script's writing.
 * Governorship elections are scheduled for 6 February 2027 (separate from
 * the 16 January 2027 presidential poll) and party primaries/clearance for
 * most states have not concluded. Every row here is seeded with
 * status='expected' (incumbents widely reported as seeking re-election, or
 * open races awaiting nomination) — NOT a confirmed candidate list.
 *
 * Source: https://elections.civic.ng/candidates/candidates-not-yet-declared
 *
 *   npm run db:governors
 */
const { createPool } = require('@vercel/postgres');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

const SOURCE_URL = 'https://elections.civic.ng/candidates/candidates-not-yet-declared';

// Only states with a reported incumbent/expected candidate. Open races
// (e.g. Oyo, Ogun, Bauchi successor races) are intentionally omitted —
// seeding a placeholder name would misrepresent an empty field as data.
const EXPECTED_GOVERNORSHIP_2027 = [
  { name: 'Siminalayi Fubara', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Rivers' },
  { name: 'Abba Kabir Yusuf', party: 'New Nigeria Peoples Party', party_code: 'NNPP', state: 'Kano' },
  { name: 'Peter Mbah', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Enugu' },
  { name: 'Alex Otti', party: 'Labour Party', party_code: 'LP', state: 'Abia' },
  { name: 'Uba Sani', party: 'All Progressives Congress', party_code: 'APC', state: 'Kaduna' },
  { name: 'Mohammed Bago', party: 'All Progressives Congress', party_code: 'APC', state: 'Niger' },
  { name: 'Dikko Radda', party: 'All Progressives Congress', party_code: 'APC', state: 'Katsina' },
  { name: 'Femi Hamzat', party: 'All Progressives Congress', party_code: 'APC', state: 'Lagos' },
];

async function main() {
  console.log('Seeding EXPECTED (unconfirmed) 2027 governorship candidates...');
  try {
    // Table + columns created by seed-2027-candidates.js; re-run guards here too.
    await sql.query(`
      CREATE TABLE IF NOT EXISTS election_candidates (
        id VARCHAR PRIMARY KEY,
        election_year INTEGER NOT NULL,
        election_type VARCHAR NOT NULL DEFAULT 'presidential',
        state VARCHAR,
        candidate_name VARCHAR NOT NULL,
        party VARCHAR NOT NULL,
        party_code VARCHAR,
        running_mate VARCHAR,
        status VARCHAR NOT NULL DEFAULT 'expected' CHECK (status IN ('confirmed','expected')),
        official_id VARCHAR REFERENCES officials(id) ON DELETE SET NULL,
        politician_id VARCHAR REFERENCES politicians(id) ON DELETE SET NULL,
        source_url TEXT NOT NULL,
        cleared_at DATE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await sql.query(`DELETE FROM election_candidates WHERE election_year = 2027 AND election_type = 'governorship'`);

    for (const c of EXPECTED_GOVERNORSHIP_2027) {
      await sql.query(
        `INSERT INTO election_candidates (id, election_year, election_type, state, candidate_name, party, party_code, status, source_url)
         VALUES ($1, 2027, 'governorship', $2, $3, $4, $5, 'expected', $6)`,
        [randomUUID(), c.state, c.name, c.party, c.party_code, SOURCE_URL]
      );
    }

    console.log(`✅ Seeded ${EXPECTED_GOVERNORSHIP_2027.length} EXPECTED (not yet confirmed) governorship candidates.`);
    console.log('   Remaining 20 on-cycle states have no reported candidate yet and were left empty.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
