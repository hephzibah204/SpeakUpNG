import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding expanded campaign promises and delivered projects...');
  try {
    // 1. Expanded Promises (official_promises)
    const promises = [
      // Bola Ahmed Tinubu (626f6c61-2d61-486d-6564-2d74696e7562)
      {
        id: 'prom-tinubu-3',
        official_id: '626f6c61-2d61-486d-6564-2d74696e7562',
        promise_title: 'Student Loan Scheme',
        promise_detail: 'Provide interest-free loans to Nigerian students in tertiary institutions to ensure access to education.',
        promise_category: 'Education',
        promise_date: '2023-05-29',
        status: 'fulfilled',
        progress_percent: 100,
        evidence_url: 'https://nelfund.gov.ng'
      },
      {
        id: 'prom-tinubu-4',
        official_id: '626f6c61-2d61-486d-6564-2d74696e7562',
        promise_title: 'Lagos-Calabar Coastal Highway',
        promise_detail: 'Construct a 700km highway linking Lagos to Calabar to boost coastal trade and tourism.',
        promise_category: 'Infrastructure',
        promise_date: '2023-05-29',
        status: 'in_progress',
        progress_percent: 15,
        evidence_url: 'https://works.gov.ng'
      },
      {
        id: 'prom-tinubu-5',
        official_id: '626f6c61-2d61-486d-6564-2d74696e7562',
        promise_title: 'Judicial Salary Review',
        promise_detail: 'Increase the salaries and allowances of judicial officers to curb corruption and improve justice delivery.',
        promise_category: 'Governance',
        promise_date: '2023-05-29',
        status: 'fulfilled',
        progress_percent: 100,
        evidence_url: 'https://justice.gov.ng'
      },
      // Babajide Sanwo-Olu (62616261-6a69-4465-2d73-616e776f2d6f)
      {
        id: 'prom-sanwo-3',
        official_id: '62616261-6a69-4465-2d73-616e776f2d6f',
        promise_title: 'Red Line Rail Project',
        promise_detail: 'Construct and deliver the 37km Red Line rail corridor from Agbado to Oyingbo.',
        promise_category: 'Infrastructure',
        promise_date: '2023-05-29',
        status: 'fulfilled',
        progress_percent: 100,
        evidence_url: 'https://lamata-ng.com'
      },
      {
        id: 'prom-sanwo-4',
        official_id: '62616261-6a69-4465-2d73-616e776f2d6f',
        promise_title: 'Lekki Regional Road',
        promise_detail: 'Construct the Lekki Regional Road to de-congest the Lekki-Epe expressway gridlock.',
        promise_category: 'Infrastructure',
        promise_date: '2023-05-29',
        status: 'in_progress',
        progress_percent: 75,
        evidence_url: 'https://lagosstate.gov.ng'
      },
      // Seyi Makinde (73657969-2d6d-416b-696e-646500000000)
      {
        id: 'prom-makinde-1',
        official_id: '73657969-2d6d-416b-696e-646500000000',
        promise_title: 'Moniya-Iseyin Road Reconstruction',
        promise_detail: 'Reconstruct the 76km Moniya-to-Iseyin road to boost agricultural transit to Ibadan.',
        promise_category: 'Agriculture',
        promise_date: '2019-05-29',
        status: 'fulfilled',
        progress_percent: 100,
        evidence_url: 'https://oyostate.gov.ng'
      },
      {
        id: 'prom-makinde-2',
        official_id: '73657969-2d6d-416b-696e-646500000000',
        promise_title: 'Ibadan Airport Upgrade',
        promise_detail: 'Upgrade the Ibadan Airport to international standards to attract investors and cargo flights.',
        promise_category: 'Infrastructure',
        promise_date: '2023-05-29',
        status: 'in_progress',
        progress_percent: 40,
        evidence_url: 'https://oyostate.gov.ng'
      }
    ];

    // 2. Expanded Projects Delivered (official_projects)
    const projects = [
      // Sanwo-Olu Projects
      {
        id: 'proj-sanwo-1',
        official_id: '62616261-6a69-4465-2d73-616e776f2d6f',
        title: 'Lagos Blue Line Rail (Phase 1)',
        description: 'Construction and commissioning of the 13km first phase of the Lagos Blue Line Rail transit system from Mile 2 to Marina, carrying over 150,000 passengers daily.',
        status: 'completed',
        budget: 'approx. $1.2B',
        date_delivered: 'September 2023',
        evidence_url: 'https://lagosstate.gov.ng'
      },
      {
        id: 'proj-sanwo-2',
        official_id: '62616261-6a69-4465-2d73-616e776f2d6f',
        title: 'Lagos Red Line Rail (Phase 1)',
        description: 'The 37km Red Line rail project linking Agbado in Ogun State to Oyingbo in Lagos, featuring 8 stations and grade separators.',
        status: 'completed',
        budget: 'N/A',
        date_delivered: 'February 2024',
        evidence_url: 'https://lagosstate.gov.ng'
      },
      {
        id: 'proj-sanwo-3',
        official_id: '62616261-6a69-4465-2d73-616e776f2d6f',
        title: 'Lekki-Epe Expressway Reconstruction (Phase 1)',
        description: 'Reconstruction of the 18.75km stretch from Eleko Junction to Epe T-Junction into a 6-lane rigid pavement concrete road.',
        status: 'completed',
        budget: 'N/A',
        date_delivered: 'January 2022',
        evidence_url: 'https://lagosstate.gov.ng'
      },
      {
        id: 'proj-sanwo-4',
        official_id: '62616261-6a69-4465-2d73-616e776f2d6f',
        title: 'Lagos BRT Fleet Expansion',
        description: 'Procurement and deployment of 100 high-capacity buses to boost public transit on major BRT corridors.',
        status: 'completed',
        budget: 'N/A',
        date_delivered: 'August 2023',
        evidence_url: 'https://lagosstate.gov.ng'
      },
      // Tinubu Projects
      {
        id: 'proj-tinubu-1',
        official_id: '626f6c61-2d61-486d-6564-2d74696e7562',
        title: 'NELFUND Student Loan Scheme',
        description: 'Establishment and operationalization of the Nigerian Education Loan Fund (NELFUND) to provide interest-free loans to tertiary students.',
        status: 'completed',
        budget: 'N/A',
        date_delivered: 'July 2024',
        evidence_url: 'https://nelfund.gov.ng'
      },
      {
        id: 'proj-tinubu-2',
        official_id: '626f6c61-2d61-486d-6564-2d74696e7562',
        title: 'Abuja Metro Rail Commercial Operations',
        description: 'Rehabilitation and commissioning of the Abuja Light Rail (Metro) network for free public service and subsequent commercial operations.',
        status: 'completed',
        budget: 'N/A',
        date_delivered: 'May 2024',
        evidence_url: 'https://fct.gov.ng'
      },
      {
        id: 'proj-tinubu-3',
        official_id: '626f6c61-2d61-486d-6564-2d74696e7562',
        title: 'Lagos-Calabar Coastal Highway (Section 1)',
        description: 'Design and initial construction phases of Section 1 of the Lagos-Calabar coastal highway project.',
        status: 'ongoing',
        budget: 'N1.06 Trillion',
        date_delivered: 'Ongoing',
        evidence_url: 'https://works.gov.ng'
      },
      // Seyi Makinde Projects
      {
        id: 'proj-makinde-1',
        official_id: '73657969-2d6d-416b-696e-646500000000',
        title: 'Moniya-Iseyin Road Reconstruction',
        description: 'Full reconstruction and asphalt overlay of the 76km Moniya-Iseyin road, connecting Oyo State agricultural hubs.',
        status: 'completed',
        budget: 'N9.9 Billion',
        date_delivered: 'June 2021',
        evidence_url: 'https://oyostate.gov.ng'
      },
      {
        id: 'proj-makinde-2',
        official_id: '73657969-2d6d-416b-696e-646500000000',
        title: 'Sole Ownership of LAUTECH',
        description: 'Successful negotiation and acquisition of sole ownership of the Ladoke Akintola University of Technology (LAUTECH) by Oyo State from Osun State.',
        status: 'completed',
        budget: 'N/A',
        date_delivered: 'November 2020',
        evidence_url: 'https://lautech.edu.ng'
      }
    ];

    // Seed Promises
    for (const prom of promises) {
      await sql.query(`
        INSERT INTO official_promises (id, official_id, promise_title, promise_detail, promise_category, promise_date, status, progress_percent, evidence_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          promise_title = EXCLUDED.promise_title,
          promise_detail = EXCLUDED.promise_detail,
          promise_category = EXCLUDED.promise_category,
          promise_date = EXCLUDED.promise_date,
          status = EXCLUDED.status,
          progress_percent = EXCLUDED.progress_percent,
          evidence_url = EXCLUDED.evidence_url
      `, [prom.id, prom.official_id, prom.promise_title, prom.promise_detail, prom.promise_category, prom.promise_date, prom.status, prom.progress_percent, prom.evidence_url]);
    }

    // Seed Projects
    for (const proj of projects) {
      await sql.query(`
        INSERT INTO official_projects (id, official_id, title, description, status, budget, date_delivered, evidence_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          budget = EXCLUDED.budget,
          date_delivered = EXCLUDED.date_delivered,
          evidence_url = EXCLUDED.evidence_url
      `, [proj.id, proj.official_id, proj.title, proj.description, proj.status, proj.budget, proj.date_delivered, proj.evidence_url]);
    }

    console.log('✅ Expanded promises and projects seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
