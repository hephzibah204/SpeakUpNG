/**
 * Seed script: Populates official_dna_scores for 8 major Nigerian officials.
 * Dynamically resolves official IDs by full_name using ILIKE.
 *
 *   npx tsx scripts/seed-dna-scores.ts
 */
import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

interface DnaScoreInput {
  name: string; // used for ILIKE lookup
  leadership: number;
  integrity: number;
  transparency: number;
  accountability: number;
  accessibility: number;
  youth_support: number;
  economic_performance: number;
  education_performance: number;
  healthcare_performance: number;
  innovation: number;
  national_acceptance: number;
  legislative_productivity: number;
}

function computeOverall(s: DnaScoreInput): number {
  const dims = [
    s.leadership, s.integrity, s.transparency, s.accountability,
    s.accessibility, s.youth_support, s.economic_performance,
    s.education_performance, s.healthcare_performance, s.innovation,
    s.national_acceptance, s.legislative_productivity,
  ];
  return Math.round(dims.reduce((a, b) => a + b, 0) / dims.length);
}

const scores: DnaScoreInput[] = [
  {
    name: 'Bola Ahmed Tinubu',
    leadership: 68,
    integrity: 42,
    transparency: 38,
    accountability: 40,
    accessibility: 55,
    youth_support: 52,
    economic_performance: 45,
    education_performance: 60,
    healthcare_performance: 40,
    innovation: 62,
    national_acceptance: 50,
    legislative_productivity: 55,
  },
  {
    name: 'Babajide Sanwo-Olu',
    leadership: 72,
    integrity: 58,
    transparency: 60,
    accountability: 62,
    accessibility: 65,
    youth_support: 68,
    economic_performance: 70,
    education_performance: 65,
    healthcare_performance: 63,
    innovation: 75,
    national_acceptance: 70,
    legislative_productivity: 40,
  },
  {
    name: 'Seyi Makinde',
    leadership: 78,
    integrity: 72,
    transparency: 70,
    accountability: 74,
    accessibility: 72,
    youth_support: 75,
    economic_performance: 76,
    education_performance: 80,
    healthcare_performance: 74,
    innovation: 72,
    national_acceptance: 73,
    legislative_productivity: 42,
  },
  {
    name: 'Alex Otti',
    leadership: 80,
    integrity: 78,
    transparency: 82,
    accountability: 80,
    accessibility: 76,
    youth_support: 80,
    economic_performance: 75,
    education_performance: 78,
    healthcare_performance: 74,
    innovation: 82,
    national_acceptance: 72,
    legislative_productivity: 45,
  },
  {
    name: 'Peter Mbah',
    leadership: 65,
    integrity: 58,
    transparency: 55,
    accountability: 58,
    accessibility: 60,
    youth_support: 62,
    economic_performance: 63,
    education_performance: 60,
    healthcare_performance: 58,
    innovation: 65,
    national_acceptance: 60,
    legislative_productivity: 40,
  },
  {
    name: 'Umo Eno',
    leadership: 63,
    integrity: 60,
    transparency: 58,
    accountability: 60,
    accessibility: 62,
    youth_support: 60,
    economic_performance: 58,
    education_performance: 62,
    healthcare_performance: 60,
    innovation: 60,
    national_acceptance: 58,
    legislative_productivity: 38,
  },
  {
    name: 'Siminalayi Fubara',
    leadership: 70,
    integrity: 65,
    transparency: 62,
    accountability: 65,
    accessibility: 68,
    youth_support: 70,
    economic_performance: 65,
    education_performance: 63,
    healthcare_performance: 62,
    innovation: 68,
    national_acceptance: 65,
    legislative_productivity: 40,
  },
  {
    name: 'Babagana Zulum',
    leadership: 85,
    integrity: 80,
    transparency: 75,
    accountability: 78,
    accessibility: 88,
    youth_support: 78,
    economic_performance: 72,
    education_performance: 76,
    healthcare_performance: 78,
    innovation: 74,
    national_acceptance: 82,
    legislative_productivity: 48,
  },
];

async function main() {
  console.log('Seeding Political DNA Scores for 8 officials...');
  let seeded = 0;
  let skipped = 0;

  for (const score of scores) {
    // Dynamically resolve official ID by full_name
    const result = await sql.query<{ id: string }>(
      `SELECT id FROM officials WHERE full_name ILIKE $1 LIMIT 1`,
      [`%${score.name}%`]
    );

    if (result.rows.length === 0) {
      console.warn(`  ⚠️  Official not found: "${score.name}" — skipping.`);
      skipped++;
      continue;
    }

    const officialId = result.rows[0].id;
    const rowId = `dna-${officialId}`;
    const overall = computeOverall(score);

    await sql.query(
      `INSERT INTO official_dna_scores (
        id, official_id, leadership, integrity, transparency, accountability,
        accessibility, youth_support, economic_performance, education_performance,
        healthcare_performance, innovation, national_acceptance, legislative_productivity,
        overall_score, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
      ON CONFLICT (id) DO UPDATE SET
        official_id = EXCLUDED.official_id,
        leadership = EXCLUDED.leadership,
        integrity = EXCLUDED.integrity,
        transparency = EXCLUDED.transparency,
        accountability = EXCLUDED.accountability,
        accessibility = EXCLUDED.accessibility,
        youth_support = EXCLUDED.youth_support,
        economic_performance = EXCLUDED.economic_performance,
        education_performance = EXCLUDED.education_performance,
        healthcare_performance = EXCLUDED.healthcare_performance,
        innovation = EXCLUDED.innovation,
        national_acceptance = EXCLUDED.national_acceptance,
        legislative_productivity = EXCLUDED.legislative_productivity,
        overall_score = EXCLUDED.overall_score,
        updated_at = NOW()`,
      [
        rowId, officialId,
        score.leadership, score.integrity, score.transparency, score.accountability,
        score.accessibility, score.youth_support, score.economic_performance,
        score.education_performance, score.healthcare_performance, score.innovation,
        score.national_acceptance, score.legislative_productivity, overall,
      ]
    );

    console.log(`  ✅ ${score.name} (${officialId}) — overall: ${overall}`);
    seeded++;
  }

  console.log(`\nDone. Seeded: ${seeded}, Skipped: ${skipped}`);
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
