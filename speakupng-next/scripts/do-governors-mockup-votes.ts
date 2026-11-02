import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

// All 28 On-Cycle States for 2027 Governorship Elections with declared/confirmed candidates
const ALL_GOVERNORSHIP_CANDIDATES = [
  // 1. Abia
  { state: 'Abia', name: 'Alex Otti', party: 'Labour Party', party_code: 'LP', running_mate: 'Ikechukwu Emetu', weight: 48 },
  { state: 'Abia', name: 'Okey Ahiwe', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Jasper Uche', weight: 26 },
  { state: 'Abia', name: 'Ikechi Emenike', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Gloria Akobundu', weight: 16 },
  { state: 'Abia', name: 'Etugo Ndubuisi Ogah', party: 'Nigeria Democratic Congress', party_code: 'NDC', weight: 10 },

  // 2. Adamawa (Open seat, Fintiri term-limited)
  { state: 'Adamawa', name: 'Aishatu Dahiru Binani', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Titsi Ganama', weight: 42 },
  { state: 'Adamawa', name: 'Auwal Tukur', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Kaletapwa Farauta', weight: 40 },
  { state: 'Adamawa', name: 'Umar Ardo', party: 'Social Democratic Party', party_code: 'SDP', weight: 18 },

  // 3. Akwa Ibom
  { state: 'Akwa Ibom', name: 'Umo Eno', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Akon Eyakenyi', weight: 52 },
  { state: 'Akwa Ibom', name: 'Akanimo Udofia', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Victor Antai', weight: 32 },
  { state: 'Akwa Ibom', name: 'Bassey Albert Akpan', party: 'Young Progressives Party', party_code: 'YPP', weight: 16 },

  // 4. Bauchi (Open seat, Bala Mohammed term-limited)
  { state: 'Bauchi', name: 'Sadique Abubakar', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Shehu Aliyu Musa', weight: 44 },
  { state: 'Bauchi', name: 'Auwal Jatau', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Baba Tela', weight: 42 },
  { state: 'Bauchi', name: 'Haliru Jika', party: 'New Nigeria Peoples Party', party_code: 'NNPP', weight: 14 },

  // 5. Benue
  { state: 'Benue', name: 'Hyacinth Alia', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Sam Ode', weight: 54 },
  { state: 'Benue', name: 'Titus Uba', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'John Ngbede', weight: 32 },
  { state: 'Benue', name: 'Herman Hembe', party: 'Labour Party', party_code: 'LP', weight: 14 },

  // 6. Borno (Open seat, Zulum term-limited)
  { state: 'Borno', name: 'Kaka Shehu Lawan', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Umar Usman Kadafur', weight: 68 },
  { state: 'Borno', name: 'Mohammed Ali Jhari', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 22 },
  { state: 'Borno', name: 'Attom Magira', party: 'New Nigeria Peoples Party', party_code: 'NNPP', weight: 10 },

  // 7. Cross River
  { state: 'Cross River', name: 'Bassey Otu', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Peter Odey', weight: 50 },
  { state: 'Cross River', name: 'Sandy Onor', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Emana Ambrose-Amawhe', weight: 36 },
  { state: 'Cross River', name: 'Usani Uguru Usani', party: "People's Redemption Party", party_code: 'PRP', weight: 14 },

  // 8. Delta
  { state: 'Delta', name: 'Sheriff Oborevwori', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Monday Onyeme', weight: 46 },
  { state: 'Delta', name: 'Ovie Omo-Agege', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Friday Osanebi', weight: 36 },
  { state: 'Delta', name: 'Ken Pela', party: 'Labour Party', party_code: 'LP', weight: 12 },
  { state: 'Delta', name: 'Joshua Denila', party: 'Youth Party', party_code: 'YP', weight: 6 },

  // 9. Ebonyi
  { state: 'Ebonyi', name: 'Francis Nwifuru', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Patricia Obila', weight: 52 },
  { state: 'Ebonyi', name: 'Ifeanyi Chukwuma Odii', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Paul Nwagu', weight: 34 },
  { state: 'Ebonyi', name: 'Edward Nkwegu', party: 'All Progressives Grand Alliance', party_code: 'APGA', weight: 14 },

  // 10. Enugu
  { state: 'Enugu', name: 'Peter Mbah', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Ifeanyi Ossai', weight: 48 },
  { state: 'Enugu', name: 'Chijioke Edeoga', party: 'Labour Party', party_code: 'LP', running_mate: 'John Nwokeabia', weight: 38 },
  { state: 'Enugu', name: 'Uche Nnaji', party: 'All Progressives Congress', party_code: 'APC', weight: 14 },

  // 11. Gombe (Open seat, Inuwa Yahaya term-limited)
  { state: 'Gombe', name: 'Abubakar Habu Hashidu', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Manassah Daniel Jatau', weight: 45 },
  { state: 'Gombe', name: 'Jibrin Danbarde', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 38 },
  { state: 'Gombe', name: 'Khamisu Mailantarki', party: 'New Nigeria Peoples Party', party_code: 'NNPP', weight: 17 },

  // 12. Jigawa
  { state: 'Jigawa', name: 'Umar Namadi', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Aminu Usman', weight: 52 },
  { state: 'Jigawa', name: 'Mustapha Sule Lamido', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 36 },
  { state: 'Jigawa', name: 'Aminu Ringim', party: 'New Nigeria Peoples Party', party_code: 'NNPP', weight: 12 },

  // 13. Kaduna
  { state: 'Kaduna', name: 'Uba Sani', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Hadiza Balarabe', weight: 46 },
  { state: 'Kaduna', name: 'Isa Ashiru Kudan', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'John Markus Ayuba', weight: 38 },
  { state: 'Kaduna', name: 'Jonathan Asake', party: 'Labour Party', party_code: 'LP', weight: 10 },
  { state: 'Kaduna', name: 'Danjuma Laah', party: 'Nigeria Democratic Congress', party_code: 'NDC', weight: 6 },

  // 14. Kano
  { state: 'Kano', name: 'Abba Kabir Yusuf', party: 'New Nigeria Peoples Party', party_code: 'NNPP', running_mate: 'Aminu Abdussalam Gwarzo', weight: 48 },
  { state: 'Kano', name: 'Nasiru Gawuna', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Murtala Sule Garo', weight: 42 },
  { state: 'Kano', name: 'Abimbola Abdul-Salam Garzo', party: 'Nigeria Democratic Congress', party_code: 'NDC', weight: 6 },
  { state: 'Kano', name: 'Adamu Yanoko', party: 'African Democratic Congress', party_code: 'ADC', weight: 4 },

  // 15. Katsina
  { state: 'Katsina', name: 'Dikko Umaru Radda', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Faruk Lawal Jobe', weight: 52 },
  { state: 'Katsina', name: 'Yakubu Lado Danmarke', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 36 },
  { state: 'Katsina', name: 'Nura Khalil', party: 'New Nigeria Peoples Party', party_code: 'NNPP', weight: 12 },

  // 16. Kebbi
  { state: 'Kebbi', name: 'Nasir Idris', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Umar Tafida', weight: 54 },
  { state: 'Kebbi', name: 'Aminu Bande', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 46 },

  // 17. Kwara (Open seat, AbdulRazaq term-limited)
  { state: 'Kwara', name: 'Moshood Mustapha', party: 'All Progressives Congress', party_code: 'APC', weight: 45 },
  { state: 'Kwara', name: 'Abdullahi Yaman', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 38 },
  { state: 'Kwara', name: 'Hakeem Lawal', party: 'Social Democratic Party', party_code: 'SDP', weight: 17 },

  // 18. Lagos (Open seat, Sanwo-Olu term-limited)
  { state: 'Lagos', name: 'Obafemi Hamzat', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Tokunbo Wahab', weight: 48 },
  { state: 'Lagos', name: 'Gbadebo Rhodes-Vivour', party: 'Labour Party', party_code: 'LP', running_mate: 'Princess Abiodun Oyefusi', weight: 34 },
  { state: 'Lagos', name: 'Abdul-Azeez Adediran (Jandor)', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 12 },
  { state: 'Lagos', name: 'Funso Doherty', party: 'African Democratic Congress', party_code: 'ADC', weight: 6 },

  // 19. Nasarawa (Open seat, Sule term-limited)
  { state: 'Nasarawa', name: 'David Ombugadu', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Yahaya Usman Ohinoyi', weight: 48 },
  { state: 'Nasarawa', name: 'Danladi Envulanza', party: 'All Progressives Congress', party_code: 'APC', weight: 42 },
  { state: 'Nasarawa', name: 'Musa Shuaibu', party: 'New Nigeria Peoples Party', party_code: 'NNPP', weight: 10 },

  // 20. Niger
  { state: 'Niger', name: 'Mohammed Umar Bago', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Yakubu Garba', weight: 55 },
  { state: 'Niger', name: 'Isah Liman Kantigi', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 35 },
  { state: 'Niger', name: 'Joshua Bawa', party: 'Labour Party', party_code: 'LP', weight: 10 },

  // 21. Ogun (Open seat, Abiodun term-limited)
  { state: 'Ogun', name: 'Solomon Olamilekan Adeola (Yayi)', party: 'All Progressives Congress', party_code: 'APC', weight: 47 },
  { state: 'Ogun', name: 'Ladi Adebutu', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 36 },
  { state: 'Ogun', name: 'Biyi Otegbeye', party: 'African Democratic Congress', party_code: 'ADC', weight: 11 },
  { state: 'Ogun', name: 'Bolaji Odusina', party: 'Nigeria Democratic Congress', party_code: 'NDC', weight: 6 },

  // 22. Oyo (Open seat, Makinde term-limited)
  { state: 'Oyo', name: 'Bayo Lawal', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 44 },
  { state: 'Oyo', name: 'Sharafadeen Alli', party: 'All Progressives Congress', party_code: 'APC', weight: 40 },
  { state: 'Oyo', name: 'Adebayo Adelabu', party: 'Accord', party_code: 'ACC', weight: 16 },

  // 23. Plateau
  { state: 'Plateau', name: 'Caleb Mutfwang', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Josephine Piyo', weight: 51 },
  { state: 'Plateau', name: 'Nentawe Yilwatda', party: 'All Progressives Congress', party_code: 'APC', weight: 37 },
  { state: 'Plateau', name: 'Patrick Dakum', party: 'Labour Party', party_code: 'LP', weight: 12 },

  // 24. Rivers
  { state: 'Rivers', name: 'Siminalayi Fubara', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Ngozi Odu', weight: 54 },
  { state: 'Rivers', name: 'Major Jack Chinda', party: 'All Progressives Congress', party_code: 'APC', weight: 26 },
  { state: 'Rivers', name: 'Tonye Cole', party: 'Independent / Coalition Candidate', party_code: 'IND', weight: 14 },
  { state: 'Rivers', name: 'Beatrice Itubo', party: 'Labour Party', party_code: 'LP', weight: 6 },

  // 25. Sokoto
  { state: 'Sokoto', name: 'Ahmad Aliyu', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Idris Gobir', weight: 53 },
  { state: 'Sokoto', name: 'Saidu Umar', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 47 },

  // 26. Taraba
  { state: 'Taraba', name: 'Agbu Kefas', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Aminu Abdullahi Alkali', weight: 52 },
  { state: 'Taraba', name: 'Emmanuel Bwacha', party: 'All Progressives Congress', party_code: 'APC', weight: 36 },
  { state: 'Taraba', name: 'Danladi Baido', party: 'New Nigeria Peoples Party', party_code: 'NNPP', weight: 12 },

  // 27. Yobe (Open seat, Buni term-limited)
  { state: 'Yobe', name: 'Sheriff Abdullahi', party: 'All Progressives Congress', party_code: 'APC', running_mate: 'Idi Barde Gubana', weight: 62 },
  { state: 'Yobe', name: 'Ali Tikau', party: 'Peoples Democratic Party', party_code: 'PDP', weight: 38 },

  // 28. Zamfara
  { state: 'Zamfara', name: 'Dauda Lawal', party: 'Peoples Democratic Party', party_code: 'PDP', running_mate: 'Mani Mallam Mummuni', weight: 53 },
  { state: 'Zamfara', name: 'Bello Matawalle', party: 'All Progressives Congress', party_code: 'APC', weight: 47 },
];

async function main() {
  console.log('🏛️ Starting Comprehensive 2027 State Governors Mockup Votes Setup...');

  try {
    // 1. Re-populate election_candidates for governorship races across all 28 states
    console.log('Clearing old governorship candidates and inserting all 28 on-cycle states...');
    await sql.query("DELETE FROM election_candidates WHERE election_year = 2027 AND election_type = 'governorship'");

    for (const c of ALL_GOVERNORSHIP_CANDIDATES) {
      const id = randomUUID();
      await sql.query(`
        INSERT INTO election_candidates (
          id, election_year, election_type, state, candidate_name, party, party_code, 
          running_mate, status, source_url
        ) VALUES ($1, 2027, 'governorship', $2, $3, $4, $5, $6, 'confirmed', $7)
      `, [
        id,
        c.state,
        c.name,
        c.party,
        c.party_code,
        c.running_mate || null,
        `https://inecnigeria.org/candidates-2027/${c.state.toLowerCase()}`
      ]);
    }
    console.log(`✅ Inserted ${ALL_GOVERNORSHIP_CANDIDATES.length} candidates across 28 states.`);

    // 2. Clear old mock votes in mock_governorship_votes_2027
    console.log('Clearing mock_governorship_votes_2027 table...');
    await sql.query('DELETE FROM mock_governorship_votes_2027');

    // 3. Generate balanced, realistic mock votes per state (between 70 to 140 votes per state, total ~2,800 votes)
    console.log('Generating realistic mock preview votes for each candidate based on state political weighting...');
    const votesToInsert: Array<{ id: string; name: string; party: string; state: string }> = [];

    // Group candidates by state
    const byState: Record<string, typeof ALL_GOVERNORSHIP_CANDIDATES> = {};
    for (const c of ALL_GOVERNORSHIP_CANDIDATES) {
      if (!byState[c.state]) byState[c.state] = [];
      byState[c.state].push(c);
    }

    for (const [state, cands] of Object.entries(byState)) {
      // Determine total votes for this state (between 80 and 130)
      const stateVoteTarget = 80 + Math.floor(Math.random() * 50);
      const totalWeight = cands.reduce((sum, c) => sum + (c.weight || 10), 0);

      for (const cand of cands) {
        // Calculate proportional votes with a little variance
        const prop = (cand.weight || 10) / totalWeight;
        const candVotes = Math.max(3, Math.round(prop * stateVoteTarget + (Math.random() * 6 - 3)));

        for (let i = 0; i < candVotes; i++) {
          votesToInsert.push({
            id: randomUUID(),
            name: cand.name,
            party: cand.party,
            state: cand.state,
          });
        }
      }
    }

    console.log(`Inserting ${votesToInsert.length} mock governorship votes in bulk...`);
    const batchSize = 100;
    for (let i = 0; i < votesToInsert.length; i += batchSize) {
      const batch = votesToInsert.slice(i, i + batchSize);
      const valueClauses: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      for (const v of batch) {
        valueClauses.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
        params.push(v.id, v.name, v.party, v.state);
      }

      await sql.query(`
        INSERT INTO mock_governorship_votes_2027 (id, candidate_name, party, state)
        VALUES ${valueClauses.join(', ')}
      `, params);
    }

    console.log(`🎉 Successfully seeded ${votesToInsert.length} state governorship mockup votes across all 28 states!`);
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await sql.end();
  }
}

main();
