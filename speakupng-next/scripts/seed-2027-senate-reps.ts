import { createPool } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

const SENATE_CANDIDATES = [
  // Lagos State
  { state: 'Lagos', district: 'Lagos West', name: 'Idiat Oluranti Adebule', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Lagos West', name: 'Segun Adewale (Aeroland)', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Lagos', district: 'Lagos West', name: 'Moshood Salvador', party: 'Labour Party', party_code: 'LP' },
  { state: 'Lagos', district: 'Lagos Central', name: 'Wasiu Eshinlokun Sanni', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Lagos Central', name: 'Abiodun Dabiri', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Lagos', district: 'Lagos East', name: 'Tokunbo Abiru', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Lagos East', name: 'Nicholas Akobada', party: 'Peoples Democratic Party', party_code: 'PDP' },

  // FCT Abuja
  { state: 'FCT', district: 'FCT Senatorial District', name: 'Ireti Kingibe', party: 'Labour Party', party_code: 'LP' },
  { state: 'FCT', district: 'FCT Senatorial District', name: 'Philip Aduda', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'FCT', district: 'FCT Senatorial District', name: 'Zakari Angulu Dobi', party: 'All Progressives Congress', party_code: 'APC' },

  // Kano State
  { state: 'Kano', district: 'Kano Central', name: 'Rufai Sani Hanga', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },
  { state: 'Kano', district: 'Kano Central', name: 'Abdulsalam Abdulkarim Zaura', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kano', district: 'Kano South', name: 'Kawu Sumaila', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },
  { state: 'Kano', district: 'Kano South', name: 'Kabiru Gaya', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kano', district: 'Kano North', name: 'Barau Jibrin', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kano', district: 'Kano North', name: 'Sa’idu Ahmad Gwadabe', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },

  // Kaduna State
  { state: 'Kaduna', district: 'Kaduna Central', name: 'Lawal Adamu Usman (Mr. LA)', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Kaduna', district: 'Kaduna Central', name: 'Muhammad Sani Abdullahi (Dattijo)', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kaduna', district: 'Kaduna North', name: 'Khalid Ibrahim Mustapha', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Kaduna', district: 'Kaduna North', name: 'Suleiman Abdu Kwari', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kaduna', district: 'Kaduna South', name: 'Sunday Marshall Katung', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Kaduna', district: 'Kaduna South', name: 'Bulus Audu', party: 'All Progressives Congress', party_code: 'APC' },

  // Rivers State
  { state: 'Rivers', district: 'Rivers South East', name: 'Barry Mpigi', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Rivers', district: 'Rivers South East', name: 'Maurice Pronen', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Rivers', district: 'Rivers East', name: 'Allwell Onyesoh', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Rivers', district: 'Rivers West', name: 'Ipalibo Banigo', party: 'Peoples Democratic Party', party_code: 'PDP' },

  // Akwa Ibom State
  { state: 'Akwa Ibom', district: 'Akwa Ibom North West', name: 'Godswill Akpabio', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Akwa Ibom', district: 'Akwa Ibom North West', name: 'Emmanuel Enoidem', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Akwa Ibom', district: 'Akwa Ibom North East', name: 'Aniekan Bassey', party: 'Peoples Democratic Party', party_code: 'PDP' },

  // Edo State
  { state: 'Edo', district: 'Edo North', name: 'Adams Oshiomhole', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Edo', district: 'Edo North', name: 'Francis Alimikhena', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Edo', district: 'Edo South', name: 'Neda Imasuen', party: 'Labour Party', party_code: 'LP' },
  { state: 'Edo', district: 'Edo South', name: 'Matthew Urhoghide', party: 'All Progressives Congress', party_code: 'APC' },

  // Anambra State
  { state: 'Anambra', district: 'Anambra Central', name: 'Victor Umeh', party: 'Labour Party', party_code: 'LP' },
  { state: 'Anambra', district: 'Anambra Central', name: 'Uche Ekwunife', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Anambra', district: 'Anambra North', name: 'Tony Nwoye', party: 'Labour Party', party_code: 'LP' },
  { state: 'Anambra', district: 'Anambra North', name: 'Stella Oduah', party: 'Peoples Democratic Party', party_code: 'PDP' },

  // Oyo State
  { state: 'Oyo', district: 'Oyo South', name: 'Sharafadeen Alli', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Oyo', district: 'Oyo South', name: 'Joseph Tegbe', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Oyo', district: 'Oyo Central', name: 'Yunus Akintunde', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Oyo', district: 'Oyo North', name: 'Abdulfatai Buhari', party: 'All Progressives Congress', party_code: 'APC' },

  // Delta State
  { state: 'Delta', district: 'Delta Central', name: 'Ede Dafinone', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Delta', district: 'Delta Central', name: 'Ighoyota Amori', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Delta', district: 'Delta North', name: 'Ned Nwoko', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Delta', district: 'Delta North', name: 'Ken Kanma', party: 'Labour Party', party_code: 'LP' },

  // Ogun State
  { state: 'Ogun', district: 'Ogun East', name: 'Gbenga Daniel', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Ogun', district: 'Ogun West', name: 'Solomon Olamilekan Adeola (Yayi)', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Ogun', district: 'Ogun Central', name: 'Shuaib Afolabi Salisu', party: 'All Progressives Congress', party_code: 'APC' },

  // Borno State
  { state: 'Borno', district: 'Borno South', name: 'Mohammed Ali Ndume', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Borno', district: 'Borno South', name: 'Kudla Satumari', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Borno', district: 'Borno Central', name: 'Kaka Shehu Lawan', party: 'All Progressives Congress', party_code: 'APC' },
];

const REPS_CANDIDATES = [
  // Lagos State
  { state: 'Lagos', district: 'Eti-Osa Federal Constituency', name: 'Thaddeus Attah', party: 'Labour Party', party_code: 'LP' },
  { state: 'Lagos', district: 'Eti-Osa Federal Constituency', name: 'Bankole Wellington (Banky W)', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Lagos', district: 'Eti-Osa Federal Constituency', name: 'Ibrahim Babajide Obanikoro', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Ikeja Federal Constituency', name: 'James Abiodun Faleke', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Ikeja Federal Constituency', name: 'Kunle Okunola', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Lagos', district: 'Alimosho Federal Constituency', name: 'Ganiyu Adele Ayuba', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Lagos', district: 'Alimosho Federal Constituency', name: 'Olufemi Festus', party: 'Labour Party', party_code: 'LP' },
  { state: 'Lagos', district: 'Surulere I Federal Constituency', name: 'Fuad Laguda', party: 'All Progressives Congress', party_code: 'APC' },

  // FCT Abuja
  { state: 'FCT', district: 'AMAC / Bwari Federal Constituency', name: 'Joshua Chinedu Obika', party: 'Labour Party', party_code: 'LP' },
  { state: 'FCT', district: 'AMAC / Bwari Federal Constituency', name: 'Micah Jiba', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'FCT', district: 'Abaji / Gwagwalada / Kuje / Kwali', name: 'Abdulrahman Ajiya', party: 'All Progressives Congress', party_code: 'APC' },

  // Kaduna State
  { state: 'Kaduna', district: 'Zaria Federal Constituency', name: 'Tajudeen Abbas', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Kaduna', district: 'Chikun / Kajuru Federal Constituency', name: 'Ekene Abubakar Adams', party: 'Labour Party', party_code: 'LP' },

  // Abia State
  { state: 'Abia', district: 'Bende Federal Constituency', name: 'Benjamin Okezie Kalu', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Abia', district: 'Bende Federal Constituency', name: 'Frank Chinasa', party: 'Labour Party', party_code: 'LP' },
  { state: 'Abia', district: 'Aba North / Aba South Federal Constituency', name: 'Alex Ikwechegh', party: 'All Progressives Grand Alliance', party_code: 'APGA' },

  // Kano State
  { state: 'Kano', district: 'Kano Municipal Federal Constituency', name: 'Sagir Koki', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },
  { state: 'Kano', district: 'Kano Municipal Federal Constituency', name: 'Sha’aban Sharada', party: 'African Democratic Congress', party_code: 'ADC' },
  { state: 'Kano', district: 'Tarauni Federal Constituency', name: 'Mukhtar Umar Zakari', party: 'New Nigeria Peoples Party', party_code: 'NNPP' },
  { state: 'Kano', district: 'Tarauni Federal Constituency', name: 'Hafizu Kawu', party: 'All Progressives Congress', party_code: 'APC' },

  // Rivers State
  { state: 'Rivers', district: 'Obio / Akpor Federal Constituency', name: 'Kingsley Chinda', party: 'Peoples Democratic Party', party_code: 'PDP' },
  { state: 'Rivers', district: 'Port Harcourt II Federal Constituency', name: 'Blessing Chigeru Amadi', party: 'Peoples Democratic Party', party_code: 'PDP' },

  // Edo State
  { state: 'Edo', district: 'Owan East / Owan West Federal Constituency', name: 'Julius Ihonvbere', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Edo', district: 'Oredo Federal Constituency', name: 'Iyawe Esosa', party: 'Labour Party', party_code: 'LP' },

  // Oyo State
  { state: 'Oyo', district: 'Ibadan North Federal Constituency', name: 'Musiliu Olaide Akinremi', party: 'All Progressives Congress', party_code: 'APC' },
  { state: 'Oyo', district: 'Ibadan North East / South East', name: 'Abass Adigun (Agboworin)', party: 'Peoples Democratic Party', party_code: 'PDP' },
];

async function main() {
  console.log('Seeding Senate & House of Reps 2027 Candidates...');

  // Delete existing senate & reps
  await sql.query("DELETE FROM election_candidates WHERE election_year = 2027 AND election_type IN ('senate', 'reps')");

  // Insert Senate
  for (const c of SENATE_CANDIDATES) {
    await sql.query(
      `INSERT INTO election_candidates (id, election_year, election_type, state, district, candidate_name, party, party_code, status, source_url)
       VALUES ($1, 2027, 'senate', $2, $3, $4, $5, $6, 'confirmed', 'https://evote.ng/elections/2027/senate')`,
      [randomUUID(), c.state, c.district, c.name, c.party, c.party_code]
    );
  }
  console.log(`✅ Seeded ${SENATE_CANDIDATES.length} Senate candidates.`);

  // Insert Reps
  for (const c of REPS_CANDIDATES) {
    await sql.query(
      `INSERT INTO election_candidates (id, election_year, election_type, state, district, candidate_name, party, party_code, status, source_url)
       VALUES ($1, 2027, 'reps', $2, $3, $4, $5, $6, 'confirmed', 'https://evote.ng/elections/2027/reps')`,
      [randomUUID(), c.state, c.district, c.name, c.party, c.party_code]
    );
  }
  console.log(`✅ Seeded ${REPS_CANDIDATES.length} House of Representatives candidates.`);

  await sql.end();
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
