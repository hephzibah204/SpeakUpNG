/**
 * Seeds verified historical Nigerian presidential election results
 * (2015, 2019, 2023) sourced from Wikipedia election result pages.
 * Gubernatorial/National Assembly results are NOT included yet — would
 * require per-state sourcing beyond this pass's scope.
 *
 *   npm run db:elections
 */
const { createPool } = require('@vercel/postgres');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

const ELECTIONS = [
  {
    year: 2015,
    source_url: 'https://en.wikipedia.org/wiki/2015_Nigerian_general_election',
    registered_voters: 67422005,
    valid_votes: 28587564,
    turnout_percent: 43.65,
    candidates: [
      { name: 'Muhammadu Buhari', party: 'All Progressives Congress (APC)', votes: 15424921, winner: true },
      { name: 'Goodluck Jonathan', party: "People's Democratic Party (PDP)", votes: 12853162, winner: false },
      { name: 'Adebayo Ayeni', party: 'African Peoples Alliance (APA)', votes: 53537, winner: false },
      { name: 'Ganiyu Galadima', party: 'Allied Congress Party of Nigeria (ACPN)', votes: 40311, winner: false },
    ],
  },
  {
    year: 2019,
    source_url: 'https://en.wikipedia.org/wiki/2019_Nigerian_general_election',
    registered_voters: 82344107,
    valid_votes: 27324583,
    turnout_percent: 34.75,
    candidates: [
      { name: 'Muhammadu Buhari', party: 'All Progressives Congress (APC)', votes: 15191847, winner: true },
      { name: 'Atiku Abubakar', party: "People's Democratic Party (PDP)", votes: 11262978, winner: false },
      { name: 'Felix Nicolas', party: 'Peoples Coalition Party (PCP)', votes: 110196, winner: false },
      { name: 'Obadiah Mailafia', party: 'African Democratic Congress (ADC)', votes: 97874, winner: false },
      { name: 'Gbor John Wilson Terwase', party: 'All Progressives Grand Alliance (APGA)', votes: 66851, winner: false },
    ],
  },
  {
    year: 2023,
    source_url: 'https://en.wikipedia.org/wiki/2023_Nigerian_general_election',
    registered_voters: null,
    valid_votes: null,
    turnout_percent: 26.71,
    candidates: [
      { name: 'Bola Tinubu', party: 'All Progressives Congress (APC)', votes: 8794726, winner: true },
      { name: 'Atiku Abubakar', party: "Peoples Democratic Party (PDP)", votes: 6984520, winner: false },
      { name: 'Peter Obi', party: 'Labour Party (LP)', votes: 6101533, winner: false },
      { name: 'Rabiu Kwankwaso', party: 'New Nigeria Peoples Party (NNPP)', votes: 1496687, winner: false },
    ],
  },
];

async function main() {
  console.log('Seeding historical_elections table...');
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS historical_elections (
        id VARCHAR PRIMARY KEY,
        election_year INTEGER NOT NULL,
        election_type VARCHAR NOT NULL DEFAULT 'presidential',
        candidate_name VARCHAR NOT NULL,
        party VARCHAR NOT NULL,
        votes BIGINT NOT NULL,
        is_winner BOOLEAN NOT NULL DEFAULT FALSE,
        registered_voters BIGINT,
        valid_votes BIGINT,
        turnout_percent NUMERIC(5,2),
        source_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_historical_elections_year ON historical_elections(election_year, election_type);
    `);

    // Idempotent: clear and re-insert so re-running doesn't duplicate
    await sql.query(`DELETE FROM historical_elections WHERE election_type = 'presidential'`);

    for (const election of ELECTIONS) {
      for (const c of election.candidates) {
        await sql.query(
          `INSERT INTO historical_elections (id, election_year, election_type, candidate_name, party, votes, is_winner, registered_voters, valid_votes, turnout_percent, source_url)
           VALUES ($1, $2, 'presidential', $3, $4, $5, $6, $7, $8, $9, $10)`,
          [randomUUID(), election.year, c.name, c.party, c.votes, c.winner, election.registered_voters, election.valid_votes, election.turnout_percent, election.source_url]
        );
      }
      console.log(`  ✓ ${election.year} presidential (${election.candidates.length} candidates)`);
    }

    console.log('✅ Historical elections seeded successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
