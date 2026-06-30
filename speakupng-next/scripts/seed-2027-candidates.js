/**
 * Seeds 2027 Nigerian presidential candidates confirmed as party flagbearers
 * via party primaries (per BBC Pidgin reporting, 31 May 2026). Note: INEC's
 * own final consolidated candidate list has NOT been published yet — these
 * are party-level nominees, not an official INEC clearance list. Two
 * parties (PDP, Labour Party) have unresolved internal leadership disputes
 * and each has produced two rival faction candidates.
 *
 * Source:
 *   https://www.bbc.com/pidgin/articles/cx21z3g9d3qo
 *   "Nigerian political parties wey don announce dia presidential
 *   candidates for 2027 general elections" — Adesola Abisoye, BBC News
 *   Pidgin, 31 May 2026.
 *
 *   npm run db:candidates
 */
const { createPool } = require('@vercel/postgres');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

const SOURCE_URL = 'https://www.bbc.com/pidgin/articles/cx21z3g9d3qo';

const CANDIDATES_2027 = [
  { name: 'Bola Tinubu', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Kashim Shettima (unconfirmed for 2027)' },
  { name: 'Atiku Abubakar', party: 'African Democratic Congress', party_code: 'ADC', running_mate: null },
  { name: 'Peter Obi', party: 'Nigeria Democratic Congress', party_code: 'NDC', running_mate: 'Rabiu Kwankwaso' },
  { name: 'Anita Zugwai-Chukwu', party: 'Young Progressives Party', party_code: 'YPP', running_mate: null },
  { name: 'Seyi Makinde', party: 'Allied Peoples Movement', party_code: 'APM', running_mate: null },
  { name: 'Kennedy Ahanotu', party: 'Labour Party (Abure faction)', party_code: 'LP', running_mate: null },
  { name: 'Chibuzo Okereke', party: 'Labour Party (Usman faction)', party_code: 'LP', running_mate: null },
  { name: 'Sandy Onor', party: 'Peoples Democratic Party (Wike-backed faction)', party_code: 'PDP', running_mate: null },
  { name: 'Goodluck Jonathan', party: 'Peoples Democratic Party (rival faction)', party_code: 'PDP', running_mate: null },
  { name: 'Omoyele Sowore', party: 'African Action Congress', party_code: 'AAC', running_mate: null },
  { name: 'Adewole Adebayo', party: 'Social Democratic Party', party_code: 'SDP', running_mate: null },
  { name: 'Donald Duke', party: "People's Redemption Party", party_code: 'PRP', running_mate: null },
];

async function main() {
  console.log('Seeding 2027 presidential candidates (party-confirmed flagbearers)...');
  try {
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
    await sql.query(`ALTER TABLE election_candidates ADD COLUMN IF NOT EXISTS state VARCHAR`);
    await sql.query(`ALTER TABLE election_candidates ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'expected'`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_election_candidates_year ON election_candidates(election_year, election_type, state)`);

    await sql.query(`DELETE FROM election_candidates WHERE election_year = 2027 AND election_type = 'presidential'`);

    for (const c of CANDIDATES_2027) {
      await sql.query(
        `INSERT INTO election_candidates (id, election_year, election_type, candidate_name, party, party_code, running_mate, status, source_url, cleared_at)
         VALUES ($1, 2027, 'presidential', $2, $3, $4, $5, 'confirmed', $6, '2026-05-31')`,
        [randomUUID(), c.name, c.party, c.party_code, c.running_mate, SOURCE_URL]
      );
    }

    console.log(`✅ Seeded ${CANDIDATES_2027.length} party-confirmed 2027 presidential flagbearers (PDP and Labour Party each have 2 rival faction candidates).`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
