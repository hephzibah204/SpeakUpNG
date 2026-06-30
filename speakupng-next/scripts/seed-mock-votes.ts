import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding official 2027 presidential candidates from BBC report...');
  try {
    const candidates = [
      { name: 'Bola Ahmed Tinubu', party: 'APC', description: 'Incumbent President seeking re-election. Winner of APC primary with 10.9M+ votes.' },
      { name: 'Atiku Abubakar', party: 'ADC', description: 'Former Vice President, running under the Africa Democratic Congress after winning its primary.' },
      { name: 'Peter Obi & Rabiu Kwankwaso', party: 'NDC', description: 'Peter Obi is the Presidential Flagbearer of the Nigeria Democratic Coalition (NDC) with former Kano Governor Rabiu Kwankwaso as VP.' },
      { name: 'Anita Zugwai-Chukwu', party: 'YPP', description: 'Sole female presidential candidate, elected unopposed at the Young Progressives Party national convention.' },
      { name: 'Seyi Makinde', party: 'APM', description: 'Current Oyo State Governor, endorsed as the Allied Peoples Movement presidential candidate.' },
      { name: 'Prince Kennedy Ahanotu', party: 'LP (Abure)', description: 'National Youth Leader adopted by the Abure faction of the Labour Party.' },
      { name: 'Chibuzo Okereke', party: 'LP (Usman)', description: 'Governance expert and policy strategist nominated by the Nenadi Usman LP faction.' },
      { name: 'Sandy Onor', party: 'PDP (Wike)', description: 'Former Senator nominated as consensus candidate by the Wike-backed PDP faction.' },
      { name: 'Goodluck Jonathan', party: 'PDP (Affirmed)', description: 'Former President affirmed as candidate by a PDP faction.' },
      { name: 'Omoyele Sowore', party: 'AAC', description: 'Journalist and human rights activist representing the African Action Congress.' },
      { name: 'Adewole Adebayo', party: 'SDP', description: 'Lawyer and politician emerged as the Social Democratic Party presidential flagbearer.' },
      { name: 'Donald Duke', party: 'PRP', description: 'Former Governor of Cross River State representing the People\'s Redemption Party.' }
    ];

    const regions = ['North West', 'North East', 'North Central', 'South West', 'South East', 'South South'];

    // Clear existing mock votes to align with the new candidate pool
    await sql.query('DELETE FROM mock_votes_2027');

    const votes = [];
    // Generate ~300 mock votes spread across the new candidates with realistic regional preferences
    for (let i = 0; i < 300; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      let candidate = candidates[Math.floor(Math.random() * candidates.length)];

      // Apply regional weights for realistic distribution
      if (region === 'South West') {
        candidate = Math.random() < 0.4 ? candidates[0] : (Math.random() < 0.3 ? candidates[2] : candidates[4]); // Tinubu, Obi, Makinde
      } else if (region === 'South East') {
        candidate = Math.random() < 0.7 ? candidates[2] : candidates[0]; // Obi-Kwankwaso (NDC) dominant
      } else if (region === 'North West') {
        candidate = Math.random() < 0.5 ? candidates[2] : candidates[0]; // NDC strong due to Kwankwaso
      } else if (region === 'North East') {
        candidate = Math.random() < 0.6 ? candidates[1] : candidates[0]; // Atiku (ADC) strong
      } else if (region === 'South South') {
        candidate = Math.random() < 0.4 ? candidates[8] : (Math.random() < 0.4 ? candidates[2] : candidates[11]); // Jonathan, Obi, Donald Duke
      }

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

    console.log(`✅ Seeded ${votes.length} updated mock votes across 12 candidates successfully.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sql.end();
  }
}

main();
