import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding projects delivered...');
  try {
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
      }
    ];

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

    console.log('✅ Projects seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
  } finally {
    await sql.end();
  }
}

main();
