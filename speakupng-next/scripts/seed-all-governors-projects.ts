import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding robust, comprehensive promises and projects for all key Governors and Aspirants...');
  try {
    // We will query the database to get the actual IDs of the governors and politicians so we map them correctly
    const officials = await sql.query('SELECT id, full_name, state FROM officials WHERE tier = \'state_executive\' OR LOWER(role) LIKE \'%governor%\'');
    const politicians = await sql.query('SELECT id, full_name, party FROM politicians');

    console.log(`Found ${officials.rows.length} governors and ${politicians.rows.length} politicians in the database.`);

    const promises = [];
    const projects = [];

    // Helper to find ID by name match
    const findOfficialId = (nameQuery: string) => {
      const found = officials.rows.find(o => o.full_name.toLowerCase().includes(nameQuery.toLowerCase()));
      return found ? found.id : null;
    };

    const findPoliticianId = (nameQuery: string) => {
      const found = politicians.rows.find(p => p.full_name.toLowerCase().includes(nameQuery.toLowerCase()));
      return found ? found.id : null;
    };

    // 1. Map Babajide Sanwo-Olu (Lagos)
    const sanwoOluId = findOfficialId('Sanwo-Olu');
    if (sanwoOluId) {
      promises.push(
        {
          id: 'prom-sanwo-1',
          official_id: sanwoOluId,
          politician_id: null,
          title: 'Lagos Rail Mass Transit (Blue Line)',
          detail: 'Deliver the first phase of the Lagos Blue Line Rail from Mile 2 to Marina.',
          category: 'Infrastructure',
          status: 'fulfilled',
          progress_percent: 100
        },
        {
          id: 'prom-sanwo-2',
          official_id: sanwoOluId,
          politician_id: null,
          title: 'Red Line Rail Project',
          detail: 'Construct and commission the 37km Red Line rail corridor from Agbado to Oyingbo.',
          category: 'Infrastructure',
          status: 'fulfilled',
          progress_percent: 100
        },
        {
          id: 'prom-sanwo-3',
          official_id: sanwoOluId,
          politician_id: null,
          title: 'Lekki Regional Road',
          detail: 'Construct the Lekki Regional Road to de-congest the Lekki-Epe expressway gridlock.',
          category: 'Infrastructure',
          status: 'in_progress',
          progress_percent: 75
        }
      );
      projects.push(
        {
          id: 'proj-sanwo-1',
          official_id: sanwoOluId,
          title: 'Lagos Blue Line Rail (Phase 1)',
          description: '13km first phase of the Lagos Blue Line Rail transit system from Mile 2 to Marina, carrying over 150,000 passengers daily.',
          status: 'completed',
          budget: 'approx. $1.2B',
          date_delivered: 'September 2023'
        },
        {
          id: 'proj-sanwo-2',
          official_id: sanwoOluId,
          title: 'Lagos Red Line Rail (Phase 1)',
          description: 'The 37km Red Line rail project linking Agbado in Ogun State to Oyingbo in Lagos, featuring 8 stations.',
          status: 'completed',
          budget: 'N/A',
          date_delivered: 'February 2024'
        }
      );
    }

    // 2. Map Seyi Makinde (Oyo)
    const makindeId = findOfficialId('Makinde');
    if (makindeId) {
      promises.push(
        {
          id: 'prom-makinde-1',
          official_id: makindeId,
          politician_id: null,
          title: 'Moniya-Iseyin Road Reconstruction',
          detail: 'Reconstruct the 76km Moniya-to-Iseyin road to boost agricultural transit.',
          category: 'Agriculture',
          status: 'fulfilled',
          progress_percent: 100
        },
        {
          id: 'prom-makinde-2',
          official_id: makindeId,
          politician_id: null,
          title: 'Ibadan Airport Upgrade',
          detail: 'Upgrade the Ibadan Airport to international standards to attract investors.',
          category: 'Infrastructure',
          status: 'in_progress',
          progress_percent: 40
        }
      );
      projects.push(
        {
          id: 'proj-makinde-1',
          official_id: makindeId,
          title: 'Moniya-Iseyin Road Reconstruction',
          description: 'Full reconstruction and asphalt overlay of the 76km Moniya-Iseyin road.',
          status: 'completed',
          budget: 'N9.9 Billion',
          date_delivered: 'June 2021'
        },
        {
          id: 'proj-makinde-2',
          official_id: makindeId,
          title: 'Sole Ownership of LAUTECH',
          description: 'Successful acquisition of sole ownership of the Ladoke Akintola University of Technology by Oyo State.',
          status: 'completed',
          budget: 'N/A',
          date_delivered: 'November 2020'
        }
      );
    }

    // 3. Map Dapo Abiodun (Ogun)
    const abiodunId = findOfficialId('Abiodun');
    if (abiodunId) {
      promises.push(
        {
          id: 'prom-abiodun-1',
          official_id: abiodunId,
          politician_id: null,
          title: 'Gateway Agro-Cargo International Airport',
          detail: 'Construct and deliver the Gateway Agro-Cargo Airport to boost agricultural export.',
          category: 'Infrastructure',
          status: 'fulfilled',
          progress_percent: 100
        }
      );
      projects.push(
        {
          id: 'proj-abiodun-1',
          official_id: abiodunId,
          title: 'Gateway Agro-Cargo Airport',
          description: 'Development and test flight operations of the Agro-Cargo International Airport in Iperu.',
          status: 'completed',
          budget: 'N/A',
          date_delivered: 'February 2023'
        }
      );
    }

    // 4. Map Alex Otti (Abia)
    const ottiId = findOfficialId('Otti');
    if (ottiId) {
      promises.push(
        {
          id: 'prom-otti-1',
          official_id: ottiId,
          politician_id: null,
          title: 'Aba Infrastructure Rehabilitation',
          detail: 'Reconstruct major roads in Aba including Port Harcourt Road and Osisioma flyover area.',
          category: 'Infrastructure',
          status: 'in_progress',
          progress_percent: 80
        }
      );
      projects.push(
        {
          id: 'proj-otti-1',
          official_id: ottiId,
          title: 'Port Harcourt Road Aba Rehabilitation',
          description: 'Reconstruction and expansion of the strategic Port Harcourt Road in Aba to ease commerce.',
          status: 'ongoing',
          budget: 'N/A',
          date_delivered: 'Ongoing'
        }
      );
    }

    // 5. Map Presidential Aspirants (Politicians)
    const peterObiId = findPoliticianId('Obi');
    if (peterObiId) {
      promises.push(
        {
          id: 'prom-obi-1',
          official_id: null,
          politician_id: peterObiId,
          title: 'Shift from Consumption to Production',
          detail: 'Reorganize the economy to focus on manufacturing, agricultural exports, and small businesses.',
          category: 'Economy',
          status: 'pending',
          progress_percent: 0
        }
      );
    }

    const atikuId = findPoliticianId('Atiku');
    if (atikuId) {
      promises.push(
        {
          id: 'prom-atiku-1',
          official_id: null,
          politician_id: atikuId,
          title: 'Privatization of Refineries',
          detail: 'Privatize state-owned refineries to boost local production and reduce subsidy burdens.',
          category: 'Economy',
          status: 'pending',
          progress_percent: 0
        }
      );
    }

    // Insert all promises
    for (const p of promises) {
      await sql.query(`
        INSERT INTO official_promises (id, official_id, politician_id, promise_title, promise_detail, promise_category, status, progress_percent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          promise_title = EXCLUDED.promise_title,
          promise_detail = EXCLUDED.promise_detail,
          promise_category = EXCLUDED.promise_category,
          status = EXCLUDED.status,
          progress_percent = EXCLUDED.progress_percent
      `, [p.id, p.official_id, p.politician_id, p.title, p.detail, p.category, p.status, p.progress_percent]);
    }

    // Insert all projects
    for (const proj of projects) {
      await sql.query(`
        INSERT INTO official_projects (id, official_id, title, description, status, budget, date_delivered)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          budget = EXCLUDED.budget,
          date_delivered = EXCLUDED.date_delivered
      `, [proj.id, proj.official_id, proj.title, proj.description, proj.status, proj.budget, proj.date_delivered]);
    }

    console.log(`✅ Successfully seeded ${promises.length} promises and ${projects.length} projects for key governors and aspirants.`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
