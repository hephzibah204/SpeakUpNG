/**
 * Seed script: fact_checks
 * Run: npx tsx scripts/seed-factcheck.ts
 */
import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

const OFFICIAL_IDS: Record<string, string> = {
  'Bola Ahmed Tinubu':  'c0d95e87-57b4-4d56-8c6b-f41bb38928e9',
  'Babajide Sanwo-Olu': '91a40557-3204-4178-8fc0-85e21aa0d79a',
  'Seyi Makinde':       'a91742ff-e76c-4148-91cd-13bf67ce6460',
  'Alex Otti':          'ab20ade6-e6bb-4b1a-9f5c-943ff5323110',
  'Peter Mbah':         'ba443380-23e8-4201-87cd-c0b492afe2e3',
  'Babagana Zulum':     '53820cfd-9ef9-43fa-aa86-e8f2b999ba63',
};

const CLAIMS = [
  {
    claim: 'President Tinubu removed fuel subsidies on his first day in office, costing Nigerians an extra ₦500+ per litre at the pump within weeks.',
    official_name: 'Bola Ahmed Tinubu',
    status: 'true',
    expert_notes: 'Confirmed by NNPC and multiple media reports. Petrol prices rose from ~₦185 to over ₦600 per litre within months of the May 29, 2023 announcement.',
    evidence_url: 'https://www.bbc.com/pidgin/articles/c9ll6vg09j0o',
    community_upvotes: 342,
    community_downvotes: 18,
  },
  {
    claim: 'Governor Sanwo-Olu commissioned both the Blue Line and Red Line rail systems in Lagos, making Lagos the only sub-Saharan city with two operational metro lines.',
    official_name: 'Babajide Sanwo-Olu',
    status: 'mostly_true',
    expert_notes: 'The Blue Line Phase 1 launched Sept 2023 and Red Line in Feb 2024. The "only sub-Saharan city" claim is disputed — Addis Ababa also operates a light rail.',
    evidence_url: 'https://lagosstate.gov.ng/rail',
    community_upvotes: 218,
    community_downvotes: 34,
  },
  {
    claim: 'Seyi Makinde abolished school fees in all public primary and secondary schools in Oyo State in 2019.',
    official_name: 'Seyi Makinde',
    status: 'true',
    expert_notes: 'Executive Order signed in July 2019 abolished tuition fees and levies in all state-owned schools. Confirmed by Oyo State Ministry of Education.',
    evidence_url: 'https://oyostate.gov.ng/education',
    community_upvotes: 195,
    community_downvotes: 12,
  },
  {
    claim: 'Nigeria\'s foreign reserves hit $40 billion under Tinubu\'s first year, the highest in 5 years.',
    official_name: 'Bola Ahmed Tinubu',
    status: 'misleading',
    expert_notes: 'Gross reserves touched ~$37B in early 2024 but declined again. The CBN figures include encumbered assets; net usable reserves were considerably lower.',
    evidence_url: 'https://www.cbn.gov.ng/rates/extreserves.asp',
    community_upvotes: 87,
    community_downvotes: 143,
  },
  {
    claim: 'Governor Alex Otti cleared over ₦40 billion in Abia State employee salary arrears within his first six months in office.',
    official_name: 'Alex Otti',
    status: 'mostly_true',
    expert_notes: 'Otti\'s administration confirmed clearing significant salary backlogs. The exact figure ranges from ₦28–₦43B across sources; the broader claim is substantiated.',
    evidence_url: 'https://abiastate.gov.ng',
    community_upvotes: 156,
    community_downvotes: 22,
  },
  {
    claim: 'Governor Zulum personally led convoys distributing food relief to IDPs in Borno, sometimes under Boko Haram gunfire.',
    official_name: 'Babagana Zulum',
    status: 'true',
    expert_notes: 'Multiple verified reports and video evidence confirm Zulum\'s convoy was attacked near Baga in 2020 while on a humanitarian mission.',
    evidence_url: 'https://punchng.com/zulum-convoy-attacked-baga',
    community_upvotes: 401,
    community_downvotes: 9,
  },
  {
    claim: 'The Nigerian government paid all 2024 WAEC fees for over 1.6 million public school candidates from the federal budget.',
    official_name: 'Bola Ahmed Tinubu',
    status: 'unverified',
    expert_notes: 'Some states funded WAEC fees for their students independently. No confirmed federal directive covering all 1.6 million candidates has been officially published.',
    evidence_url: null as unknown as string,
    community_upvotes: 63,
    community_downvotes: 41,
  },
  {
    claim: 'Governor Peter Mbah attracted $14.2 billion in FDI commitments to Enugu State within his first year.',
    official_name: 'Peter Mbah',
    status: 'misleading',
    expert_notes: 'MoUs and Letters of Intent were signed, but the $14.2B figure reflects pledged investment, not actual disbursed FDI. Economists caution against treating MoUs as landed investment.',
    evidence_url: 'https://enugustate.gov.ng',
    community_upvotes: 74,
    community_downvotes: 112,
  },
];

async function main() {
  console.log('Seeding fact_checks...');
  try {
    for (const c of CLAIMS) {
      const id = randomUUID();
      const official_id = c.official_name ? OFFICIAL_IDS[c.official_name] || null : null;

      await sql.query(`
        INSERT INTO fact_checks (
          id, claim, submitted_by, official_id, evidence_url,
          status, expert_notes, community_upvotes, community_downvotes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING
      `, [
        id, c.claim, 'evote-editorial', official_id,
        c.evidence_url || null, c.status,
        c.expert_notes || null,
        c.community_upvotes, c.community_downvotes,
      ]);

      console.log(`  ✓ [${c.status.toUpperCase()}] ${c.claim.slice(0, 60)}...`);
    }

    console.log('✅ fact_checks seeded successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
