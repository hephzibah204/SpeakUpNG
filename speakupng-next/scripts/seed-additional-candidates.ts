import { createPool } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function executeLocal(queryString: string, params: any[] = []) {
  let i = 1;
  const query = queryString.replace(/\?/g, () => `$${i++}`);
  await sql.query(query, params);
}

const ADDITIONAL_CANDIDATES = [
  // Additional Presidential Aspirants
  { name: 'Nyesom Wike', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Rivers', type: 'presidential' },
  { name: 'Nasir El-Rufai', party: 'All Progressives Congress', party_code: 'APC', state: 'Kaduna', type: 'presidential' },
  { name: 'Aminu Tambuwal', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Sokoto', type: 'presidential' },
  { name: 'Bukola Saraki', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Kwara', type: 'presidential' },
  { name: 'Rochas Okorocha', party: 'All Progressives Congress', party_code: 'APC', state: 'Imo', type: 'presidential' },

  // Additional Governorship Candidates for key states
  { name: 'Dapo Abiodun', party: 'All Progressives Congress', party_code: 'APC', state: 'Ogun', type: 'governorship' },
  { name: 'Ladi Adebutu', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Ogun', type: 'governorship' },
  
  { name: 'Bala Mohammed', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Bauchi', type: 'governorship' },
  { name: 'Sadique Abubakar', party: 'All Progressives Congress', party_code: 'APC', state: 'Bauchi', type: 'governorship' },

  { name: 'Abdullahi Sule', party: 'All Progressives Congress', party_code: 'APC', state: 'Nasarawa', type: 'governorship' },
  { name: 'David Ombugadu', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Nasarawa', type: 'governorship' },

  { name: 'Sheriff Oborevwori', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Delta', type: 'governorship' },
  { name: 'Ovie Omo-Agege', party: 'All Progressives Congress', party_code: 'APC', state: 'Delta', type: 'governorship' },

  { name: 'Ahmadu Fintiri', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Adamawa', type: 'governorship' },
  { name: 'Aishatu Dahiru (Binani)', party: 'All Progressives Congress', party_code: 'APC', state: 'Adamawa', type: 'governorship' },
  
  { name: 'Godwin Obaseki', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Edo', type: 'governorship' },
  { name: 'Monday Okpebholo', party: 'All Progressives Congress', party_code: 'APC', state: 'Edo', type: 'governorship' },
  
  { name: 'Lucky Aiyedatiwa', party: 'All Progressives Congress', party_code: 'APC', state: 'Ondo', type: 'governorship' },
  { name: 'Agboola Ajayi', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Ondo', type: 'governorship' },
  
  { name: 'Hope Uzodinma', party: 'All Progressives Congress', party_code: 'APC', state: 'Imo', type: 'governorship' },
  { name: 'Samuel Anyanwu', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Imo', type: 'governorship' },

  { name: 'Duoye Diri', party: 'Peoples Democratic Party', party_code: 'PDP', state: 'Bayelsa', type: 'governorship' },
  { name: 'Timipre Sylva', party: 'All Progressives Congress', party_code: 'APC', state: 'Bayelsa', type: 'governorship' },

  { name: 'Charles Soludo', party: 'All Progressives Grand Alliance', party_code: 'APGA', state: 'Anambra', type: 'governorship' },
  { name: 'Ifeanyi Ubah', party: 'All Progressives Congress', party_code: 'APC', state: 'Anambra', type: 'governorship' },
  { name: 'Valentine Ozigbo', party: 'Labour Party', party_code: 'LP', state: 'Anambra', type: 'governorship' },
];

async function main() {
  console.log('Seeding additional 2027 presidential and governorship candidates...');
  
  try {
    let count = 0;
    for (const c of ADDITIONAL_CANDIDATES) {
      await executeLocal(
        `INSERT INTO election_candidates (id, election_year, election_type, state, candidate_name, party, party_code, status, source_url)
         VALUES (?, 2027, ?, ?, ?, ?, ?, 'expected', 'https://speakup.ng/expanded-candidates')`,
        [randomUUID(), c.type, c.state || null, c.name, c.party, c.party_code]
      );
      count++;
    }

    console.log(`✅ Successfully seeded ${count} additional candidates.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sql.end();
  }
}

main();
