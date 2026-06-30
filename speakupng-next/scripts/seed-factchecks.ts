import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding mock fact-check data...');
  try {
    const claims = [
      {
        id: 'fc-1',
        claim: 'The federal government spent N3.2 trillion on educational infrastructure in the 2024 budget.',
        status: 'misleading',
        evidence_url: 'https://budgetoffice.gov.ng',
        expert_notes: 'While N3.2 trillion was allocated to the overall education sector, the capital budget for infrastructure projects was only N480 billion. The remaining amount was designated for recurrent expenditure (salaries, overheads).'
      },
      {
        id: 'fc-2',
        claim: 'Lagos State completed the Red Line rail project entirely without foreign debt financing.',
        status: 'false',
        evidence_url: 'https://dmo.gov.ng',
        expert_notes: 'Public debt records show that the Lagos State Government utilized concessionary funding support of over $200 million via bilateral and multilateral foreign credit channels for the Red Line rail construction.'
      },
      {
        id: 'fc-3',
        claim: 'Abia State government has cleared all outstanding pension arrears accumulated over 9 years.',
        status: 'mostly_true',
        evidence_url: 'https://abiastate.gov.ng',
        expert_notes: 'Independent verification confirms that the state disbursed over N9 billion to clear the core pension backlog. However, some minor local government pension cases are still undergoing auditing and remain unpaid.'
      },
      {
        id: 'fc-4',
        claim: 'INEC introduced complete online voting for the upcoming 2027 General Elections.',
        status: 'false',
        evidence_url: 'https://inecnigeria.org',
        expert_notes: 'INEC has denied this claim. The Electoral Act 2022 only allows electronic transmission of results and verification using BVAS, but actual ballot casting remains strictly manual.'
      }
    ];

    for (const c of claims) {
      await sql.query(`
        INSERT INTO fact_checks (id, claim, status, evidence_url, expert_notes, community_upvotes, community_downvotes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          claim = EXCLUDED.claim,
          status = EXCLUDED.status,
          evidence_url = EXCLUDED.evidence_url,
          expert_notes = EXCLUDED.expert_notes
      `, [c.id, c.claim, c.status, c.evidence_url, c.expert_notes, 12, 2]);
    }

    console.log('✅ Fact-checks seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
