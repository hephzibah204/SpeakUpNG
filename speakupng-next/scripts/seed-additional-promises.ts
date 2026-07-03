import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

interface SeedPromise {
  officialName: string;
  title: string;
  detail: string;
  category: string;
  status: 'pending' | 'in_progress' | 'fulfilled' | 'broken' | 'disputed';
  progress_percent: number;
}

interface SeedProject {
  officialName: string;
  title: string;
  description: string;
  status: 'completed' | 'ongoing' | 'abandoned';
  budget: string;
  date_delivered: string | null;
}

const PROMISES_DATA: SeedPromise[] = [
  // Bola Ahmed Tinubu
  {
    officialName: 'Bola Ahmed Tinubu',
    title: 'Student Loan Scheme Implementation',
    detail: 'To launch and operationalize interest-free student loans for tertiary education access.',
    category: 'Education',
    status: 'fulfilled',
    progress_percent: 100
  },
  {
    officialName: 'Bola Ahmed Tinubu',
    title: 'Naira Stabilization & FX Unification',
    detail: 'To unify foreign exchange windows and achieve stable market-driven FX rates.',
    category: 'Economy',
    status: 'in_progress',
    progress_percent: 45
  },
  // Dapo Abiodun
  {
    officialName: 'Dapo Abiodun',
    title: 'Agro-Cargo International Airport',
    detail: 'To build and commission a cargo airport in Ogun State to boost agricultural exports.',
    category: 'Agriculture',
    status: 'fulfilled',
    progress_percent: 100
  },
  {
    officialName: 'Dapo Abiodun',
    title: 'Ogun Light Rail Project',
    detail: 'To link Ogun border towns to the Lagos rail mass transit grid.',
    category: 'Infrastructure',
    status: 'in_progress',
    progress_percent: 30
  },
  // Babajide Sanwo-Olu
  {
    officialName: 'Babajide Sanwo-Olu',
    title: 'Lagos Red Line Rail Delivery',
    detail: 'To deliver the 37km Agbado-Oyingbo rail corridor.',
    category: 'Infrastructure',
    status: 'fulfilled',
    progress_percent: 100
  },
  {
    officialName: 'Babajide Sanwo-Olu',
    title: 'Fourth Mainland Bridge Commencement',
    detail: 'To begin the construction of the 38km Fourth Mainland Bridge.',
    category: 'Infrastructure',
    status: 'in_progress',
    progress_percent: 20
  },
  // Nyesom Wike
  {
    officialName: 'Nyesom Wike',
    title: 'Abuja Metro Line Reactivation',
    detail: 'To rehabilitate and launch commercial operations of the Abuja Light Rail.',
    category: 'Infrastructure',
    status: 'fulfilled',
    progress_percent: 100
  },
  {
    officialName: 'Nyesom Wike',
    title: 'Inner-City Abuja Road Upgrades',
    detail: 'To resurface and rehabilitate over 120km of roads in Garki, Wuse, and Maitama.',
    category: 'Infrastructure',
    status: 'fulfilled',
    progress_percent: 100
  },
  // Seyi Makinde
  {
    officialName: 'Seyi Makinde',
    title: 'LAUTECH Sole Ownership Acquisition',
    detail: 'To resolve ownership dispute with Osun State and assume sole control of LAUTECH.',
    category: 'Education',
    status: 'fulfilled',
    progress_percent: 100
  },
  {
    officialName: 'Seyi Makinde',
    title: 'Ibadan Circular Road Completion',
    detail: 'To construct and deliver the Ibadan Circular Road to bypass municipal logistics.',
    category: 'Infrastructure',
    status: 'in_progress',
    progress_percent: 60
  },
  // Alex Otti
  {
    officialName: 'Alex Otti',
    title: 'Aba Infrastructure Clean Up',
    detail: 'To rehabilitate Port Harcourt Road and other arterial links in Aba.',
    category: 'Infrastructure',
    status: 'in_progress',
    progress_percent: 80
  },
  {
    officialName: 'Alex Otti',
    title: 'Abia State Civil Service Reform',
    detail: 'To digitize state worker databases and eliminate ghost workers.',
    category: 'Governance',
    status: 'fulfilled',
    progress_percent: 100
  },
  // Adebayo Adelabu
  {
    officialName: 'Adebayo Adelabu',
    title: 'National Grid Decentralization',
    detail: 'To implement regional grid structures to prevent system-wide collapses.',
    category: 'Infrastructure',
    status: 'in_progress',
    progress_percent: 40
  },
  {
    officialName: 'Adebayo Adelabu',
    title: 'Power Sector Restructuring',
    detail: 'To execute the Electricity Act 2023, devolving powers to states for generation.',
    category: 'Governance',
    status: 'in_progress',
    progress_percent: 70
  },
  // George Akume
  {
    officialName: 'George Akume',
    title: 'Minimum Wage Tripartite Agreements',
    detail: 'To coordinate negotiations for a new national minimum wage for workers.',
    category: 'Governance',
    status: 'fulfilled',
    progress_percent: 100
  },
  // Tunji Alausa
  {
    officialName: 'Tunji Alausa',
    title: 'Primary Healthcare Center Revitalization',
    detail: 'To upgrade 10,000 PHCs nationwide with solar grids and standard care kits.',
    category: 'Healthcare',
    status: 'in_progress',
    progress_percent: 50
  },
  // Bala Mohammed
  {
    officialName: 'Bala Mohammed',
    title: 'Bauchi Urban Renewal Road Corridor',
    detail: 'To dualize major township roads in Bauchi and Azare.',
    category: 'Infrastructure',
    status: 'fulfilled',
    progress_percent: 100
  },
  // Abba Kabir Yusuf
  {
    officialName: 'Abba Kabir Yusuf',
    title: 'Kano Free Maternity & Pediatrics Healthcare',
    detail: 'To provide fully subsidized child delivery and child healthcare across Kano state.',
    category: 'Healthcare',
    status: 'fulfilled',
    progress_percent: 100
  },
  // Ademola Adeleke
  {
    officialName: 'Ademola Adeleke',
    title: 'Osun State Multi-Billion Infrastructure Plan',
    detail: 'To construct flyovers, renovate primary schools, and install solar streetlights across Osun.',
    category: 'Infrastructure',
    status: 'in_progress',
    progress_percent: 65
  }
];

const PROJECTS_DATA: SeedProject[] = [
  // Bola Ahmed Tinubu
  {
    officialName: 'Bola Ahmed Tinubu',
    title: 'NELFUND Student Loan Portal',
    description: 'Launch of the student loan portal with interest-free tuition funding for public university students.',
    status: 'completed',
    budget: 'N50 Billion',
    date_delivered: '2024-05-24'
  },
  {
    officialName: 'Bola Ahmed Tinubu',
    title: 'Lagos-Calabar Coastal Highway (Section 1)',
    description: 'Design and construction of Section 1 of the coastal highway corridor linking Lagos to Niger Delta.',
    status: 'ongoing',
    budget: 'N1.06 Trillion',
    date_delivered: null
  },
  // Dapo Abiodun
  {
    officialName: 'Dapo Abiodun',
    title: 'Gateway Agro-Cargo International Airport Runway',
    description: 'Construction of the 3.8km runway and cargo terminal in Iperu.',
    status: 'completed',
    budget: 'N/A',
    date_delivered: '2023-02-23'
  },
  // Babajide Sanwo-Olu
  {
    officialName: 'Babajide Sanwo-Olu',
    title: 'Lagos Blue Rail Transit Phase 1',
    description: '13km passenger rail service linking Mile 2 to Marina with electric power systems.',
    status: 'completed',
    budget: 'approx. $1.2B',
    date_delivered: '2023-09-04'
  },
  // Nyesom Wike
  {
    officialName: 'Nyesom Wike',
    title: 'Abuja Light Rail Commercial Revival',
    description: 'Rehabilitation of train cars and stations to restore regular metro loops in Abuja.',
    status: 'completed',
    budget: 'approx. $15M',
    date_delivered: '2024-05-29'
  },
  // Seyi Makinde
  {
    officialName: 'Seyi Makinde',
    title: 'Moniya-Iseyin Highway Reconstruction',
    description: 'Full asphalt overlay of the 76km major agricultural artery road.',
    status: 'completed',
    budget: 'N9.9 Billion',
    date_delivered: '2021-06-03'
  },
  // Alex Otti
  {
    officialName: 'Alex Otti',
    title: 'Port Harcourt Road Aba Rehabilitation',
    description: 'Reconstruction and modernization of the 6.8km main commercial corridor in Aba.',
    status: 'ongoing',
    budget: 'N24.2 Billion',
    date_delivered: null
  },
  // Bala Mohammed
  {
    officialName: 'Bala Mohammed',
    title: 'Bauchi State Government House Expansion',
    description: 'Construction of a modern office block and conference hall in the capital.',
    status: 'completed',
    budget: 'N6.2 Billion',
    date_delivered: '2023-11-12'
  },
  // Abba Kabir Yusuf
  {
    officialName: 'Abba Kabir Yusuf',
    title: 'Kano Township Flyovers Reconstruction',
    description: 'Renovation of major structural bridges and flyovers in Kano metropolitan centers.',
    status: 'completed',
    budget: 'N8.5 Billion',
    date_delivered: '2024-04-10'
  },
  // Ademola Adeleke
  {
    officialName: 'Ademola Adeleke',
    title: 'Osun State Primary Health Center Solar Upgrades',
    description: 'Installation of 24/7 solar power grids in 332 ward-level health centers.',
    status: 'completed',
    budget: 'N3.8 Billion',
    date_delivered: '2024-02-15'
  }
];

async function main() {
  console.log('Seeding robust, real campaign promises and projects for key officials...');
  try {
    // Fetch all officials
    const res = await sql.query('SELECT id, full_name FROM officials');
    const officialsMap: Record<string, string> = {};
    for (const row of res.rows) {
      officialsMap[row.full_name.toLowerCase().trim()] = row.id;
    }

    let promiseCount = 0;
    let projectCount = 0;

    for (const p of PROMISES_DATA) {
      const officialId = officialsMap[p.officialName.toLowerCase().trim()];
      if (!officialId) {
        console.warn(`⚠️ Warning: Official "${p.officialName}" not found in database. Skipping promise: "${p.title}"`);
        continue;
      }

      const id = `prom-seed-${officialId}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 100);
      await sql.query(`
        INSERT INTO official_promises (id, official_id, promise_title, promise_detail, promise_category, status, progress_percent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          promise_title = EXCLUDED.promise_title,
          promise_detail = EXCLUDED.promise_detail,
          promise_category = EXCLUDED.promise_category,
          status = EXCLUDED.status,
          progress_percent = EXCLUDED.progress_percent
      `, [id, officialId, p.title, p.detail, p.category, p.status, p.progress_percent]);
      promiseCount++;
    }

    for (const pr of PROJECTS_DATA) {
      const officialId = officialsMap[pr.officialName.toLowerCase().trim()];
      if (!officialId) {
        console.warn(`⚠️ Warning: Official "${pr.officialName}" not found in database. Skipping project: "${pr.title}"`);
        continue;
      }

      const id = `proj-seed-${officialId}-${pr.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 100);
      await sql.query(`
        INSERT INTO official_projects (id, official_id, title, description, status, budget, date_delivered)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          budget = EXCLUDED.budget,
          date_delivered = EXCLUDED.date_delivered
      `, [id, officialId, pr.title, pr.description, pr.status, pr.budget, pr.date_delivered]);
      projectCount++;
    }

    console.log(`✅ Seeding complete. Successfully seeded ${promiseCount} promises and ${projectCount} projects!`);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await sql.end();
  }
}

main();
