import { createPool } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

const ASSEMBLY_CANDIDATES = [
  // Lagos State Assembly
  { state: 'Lagos', district: 'Agege I Constituency', name: 'Mudashiru Obasa', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Surulere I Constituency', name: 'Desmond Elliot', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Amuwo-Odofin I Constituency', name: 'Foluke Osafile', party: 'Labour Party', party_code: 'LP' },
  { state: 'Lagos', district: 'Ikeja I Constituency', name: 'Adedamola Kasunmu', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Alimosho I Constituency', name: 'Luqman Orelope', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Eti-Osa I Constituency', name: 'Noheem Adams', party: 'All Progressives Congress', party_code: 'APC' },

  // Kano State Assembly
  { state: 'Kano', district: 'Dala State Constituency', name: 'Lawan Husaini Dala', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },
  { state: 'Kano', district: 'Kano Municipal State Constituency', name: 'Sarki Aliyu Daneji', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },
  { state: 'Kano', district: 'Nasarawa State Constituency', name: 'Umar Abdullahi', party: 'All Progressives Congress', party_code: 'APC' },

  // Rivers State Assembly
  { state: 'Rivers', district: 'Port Harcourt I Constituency', name: 'Solomon Wami', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Rivers', district: 'Obio/Akpor I Constituency', name: 'Martin Amaewhule', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Rivers', district: 'Ahoada East II Constituency', name: 'Edison Ehie', party: 'Peoples Democratic Party', party_code: 'PDP' },

  // Kaduna State Assembly
  { state: 'Kaduna', district: 'Zaria City Constituency', name: 'Dahiru Liman', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kaduna', district: 'Kaduna South Constituency', name: 'Henry Zachariah', party: 'Peoples Democratic Party', party_code: 'PDP' },

  // Oyo State Assembly
  { state: 'Oyo', district: 'Ibarapa East Constituency', name: 'Adebo Ogundoyin', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Oyo', district: 'Oyo East / West Constituency', name: 'Olorunpoto Rahaman', party: 'All Progressives Congress', party_code: 'APC' },
];

const LGA_CANDIDATES = [
  // Lagos LGAs
  { state: 'Lagos', district: 'Ikeja Local Government', name: 'Mojeed Balogun', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Ikeja Local Government', name: 'Tunde Daramola', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Lagos', district: 'Alimosho Local Government', name: 'Jelili Sulaimon', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Alimosho Local Government', name: 'Babatunde Adeyemi', party: 'Labour Party', party_code: 'LP' },
  { state: 'Lagos', district: 'Eti-Osa Local Government', name: 'Saheed Bankole', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Surulere Local Government', name: 'Bamidele Yusuf', party: 'All Progressives Congress', party_code: 'APC' },

  // Kano LGAs
  { state: 'Kano', district: 'Kano Municipal Local Government', name: 'Faizu Alfindiki', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },
  { state: 'Kano', district: 'Kano Municipal Local Government', name: 'Lawan Garba', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kano', district: 'Fagge Local Government', name: 'Habibu Saleh', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },

  // Rivers LGAs
  { state: 'Rivers', district: 'Port Harcourt City Local Government (PHALGA)', name: 'Ezebunwo Ichemati', party: 'Action Peoples Party', party_code: 'APP' },
  { state: 'Rivers', district: 'Obio/Akpor Local Government', name: 'Chijioke Ihunwo', party: 'Action Peoples Party', party_code: 'APP' },

  // FCT Area Councils
  { state: 'FCT', district: 'Abuja Municipal Area Council (AMAC)', name: 'Christopher Maikalangu', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'FCT', district: 'Abuja Municipal Area Council (AMAC)', name: 'Murtala Karshi', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'FCT', district: 'Bwari Area Council', name: 'John Gabaya', party: 'Peoples Democratic Party', party_code: 'PDP' },
];

async function main() {
  console.log('Setting up tables and candidates for all election race tiers...');

  // Create tables for State Assembly and LGA mock voting
  await sql.query(`
    CREATE TABLE IF NOT EXISTS mock_assembly_votes_2027 (
      id VARCHAR PRIMARY KEY,
      candidate_name VARCHAR NOT NULL,
      party VARCHAR NOT NULL,
      state VARCHAR NOT NULL,
      district VARCHAR NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS mock_lga_votes_2027 (
      id VARCHAR PRIMARY KEY,
      candidate_name VARCHAR NOT NULL,
      party VARCHAR NOT NULL,
      state VARCHAR NOT NULL,
      district VARCHAR NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ Created mock_assembly_votes_2027 and mock_lga_votes_2027 tables.');

  // Clean existing candidates for assembly & lga
  await sql.query("DELETE FROM election_candidates WHERE election_year = 2027 AND election_type IN ('assembly', 'lga')");

  // Insert Assembly candidates
  for (const c of ASSEMBLY_CANDIDATES) {
    await sql.query(
      `INSERT INTO election_candidates (id, election_year, election_type, state, district, candidate_name, party, party_code, status, source_url)
       VALUES ($1, 2027, 'assembly', $2, $3, $4, $5, $6, 'confirmed', 'https://evote.ng/elections/2027/assembly')`,
      [randomUUID(), c.state, c.district, c.name, c.party, c.party_code]
    );
  }
  console.log(`✅ Seeded ${ASSEMBLY_CANDIDATES.length} State House of Assembly candidates.`);

  // Insert LGA candidates
  for (const c of LGA_CANDIDATES) {
    await sql.query(
      `INSERT INTO election_candidates (id, election_year, election_type, state, district, candidate_name, party, party_code, status, source_url)
       VALUES ($1, 2027, 'lga', $2, $3, $4, $5, $6, 'confirmed', 'https://evote.ng/elections/2027/lga')`,
      [randomUUID(), c.state, c.district, c.name, c.party, c.party_code]
    );
  }
  console.log(`✅ Seeded ${LGA_CANDIDATES.length} Local Government Chairmanship candidates.`);

  await sql.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
