import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding mock 2027 governorship race preview votes for all 37 official candidates...');
  try {
    const candidates = [
      { name: "Mbah Peter Ndubuisi", party: "APC", state: "Enugu" },
      { name: "Sani Uba", party: "APC", state: "Kaduna" },
      { name: "Aliyu Ahmed", party: "APC", state: "Sokoto" },
      { name: "Aliyu Wadada Ahmed", party: "APC", state: "Nasarawa" },
      { name: "Chinda Kingsley Ogundu", party: "APC", state: "Rivers" },
      { name: "Jamilu Isyaku Gwamna", party: "APC", state: "Gombe" },
      { name: "Yusuf Abba Kabir", party: "APC", state: "Kano" },
      { name: "Umaru Dikko Radda", party: "APC", state: "Katsina" },
      { name: "Idris Nasir", party: "APC", state: "Kebbi" },
      { name: "Namadi Umar Alhaji", party: "APC", state: "Jigawa" },
      { name: "Lawal Dauda", party: "APC", state: "Zamfara" },
      { name: "Mustapha Gubio", party: "APC", state: "Borno" },
      { name: "Baba Wali", party: "APC", state: "Yobe" },
      { name: "Mohammed Abdullahi Abubakar", party: "APC", state: "Bauchi" },
      { name: "Ahmed Galadima", party: "APC", state: "Adamawa" },
      { name: "Kefas Agbu", party: "APC", state: "Taraba" },
      { name: "Salihu Danladi", party: "APC", state: "Kwara" },
      { name: "Mohammed Umaru Bago", party: "APC", state: "Niger" },
      { name: "Alia Hyacinth Iormem", party: "APC", state: "Benue" },
      { name: "Mutfwang Caleb Manasseh", party: "APC", state: "Plateau" },
      { name: "Obafemi Hamzat", party: "APC", state: "Lagos" },
      { name: "Adeola Solomon Olamilekan", party: "APC", state: "Ogun" },
      { name: "Alli Sharafadeen Abiodun", party: "APC", state: "Oyo" },
      { name: "Eno Umo Bassey", party: "APC", state: "Akwa Ibom" },
      { name: "Oborevwori Sheriff Francis Orohwedor", party: "APC", state: "Delta" },
      { name: "Otu Bassey Edet", party: "APC", state: "Cross River" },
      { name: "Eric Opah", party: "APC", state: "Abia" },
      { name: "Nwifuru Francis Ogbonna", party: "APC", state: "Ebonyi" },
      { name: "Oladipupo Adebutu", party: "PDP", state: "Ogun" },
      { name: "Garba Yakubu Lado", party: "PDP", state: "Katsina" },
      { name: "Lamido Mustapha Sule", party: "PDP", state: "Jigawa" },
      { name: "Maurice Vunobolki", party: "PDP", state: "Adamawa" },
      { name: "Adedeji Doherty", party: "PDP", state: "Lagos" },
      { name: "Michael Aondoakaa", party: "PDP", state: "Benue" },
      { name: "Hazeem Gbolarumi", party: "PDP", state: "Oyo" },
      { name: "Ogboru Great Ovedje", party: "ADC", state: "Delta" },
      { name: "Taofeek Adegoke", party: "ADC", state: "Oyo" }
    ];

    // Clear existing mock votes
    await sql.query('DELETE FROM mock_governorship_votes_2027');

    const votes = [];
    // Generate 1200 mock votes to distribute amongst all 37 candidates
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

    console.log(`✅ Seeded ${votes.length} mock 2027 governorship preview votes for 37 candidates.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sql.end();
  }
}

main();
