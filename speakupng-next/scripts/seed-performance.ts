import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function getOfficialId(name: string): Promise<string | null> {
  const res = await sql.query('SELECT id FROM officials WHERE full_name ILIKE $1 LIMIT 1', [`%${name}%`]);
  return res.rows.length > 0 ? res.rows[0].id : null;
}

async function main() {
  console.log('Seeding government performance scores...');
  try {
    const tinubuId = await getOfficialId('Tinubu');
    const sanwoOluId = await getOfficialId('Sanwo-Olu');
    const makindeId = await getOfficialId('Seyi Makinde');
    const ottiId = await getOfficialId('Alex Otti');

    console.log(`Resolved IDs - Tinubu: ${tinubuId}, Sanwo-Olu: ${sanwoOluId}, Makinde: ${makindeId}, Otti: ${ottiId}`);

    const records = [];

    if (tinubuId) {
      records.push({
        id: randomUUID(),
        official_id: tinubuId,
        education_score: 55,
        healthcare_score: 52,
        roads_score: 65,
        agriculture_score: 50,
        jobs_score: 48,
        security_score: 54,
        infrastructure_score: 70,
        digital_economy_score: 68,
        overall_score: 58,
        tier: 'federal',
        year: 2024
      });
    }

    if (sanwoOluId) {
      records.push({
        id: randomUUID(),
        official_id: sanwoOluId,
        education_score: 70,
        healthcare_score: 72,
        roads_score: 78,
        agriculture_score: 58,
        jobs_score: 62,
        security_score: 55,
        infrastructure_score: 84,
        digital_economy_score: 76,
        overall_score: 70,
        tier: 'state',
        year: 2024
      });
    }

    if (makindeId) {
      records.push({
        id: randomUUID(),
        official_id: makindeId,
        education_score: 78,
        healthcare_score: 70,
        roads_score: 82,
        agriculture_score: 75,
        jobs_score: 68,
        security_score: 64,
        infrastructure_score: 80,
        digital_economy_score: 72,
        overall_score: 74,
        tier: 'state',
        year: 2024
      });
    }

    if (ottiId) {
      records.push({
        id: randomUUID(),
        official_id: ottiId,
        education_score: 72,
        healthcare_score: 75,
        roads_score: 85,
        agriculture_score: 60,
        jobs_score: 70,
        security_score: 72,
        infrastructure_score: 80,
        digital_economy_score: 65,
        overall_score: 73,
        tier: 'state',
        year: 2024
      });
    }

    for (const r of records) {
      await sql.query(`
        INSERT INTO government_performance (id, official_id, education_score, healthcare_score, roads_score, agriculture_score, jobs_score, security_score, infrastructure_score, digital_economy_score, overall_score, tier, year)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          education_score = EXCLUDED.education_score,
          healthcare_score = EXCLUDED.healthcare_score,
          roads_score = EXCLUDED.roads_score,
          agriculture_score = EXCLUDED.agriculture_score,
          jobs_score = EXCLUDED.jobs_score,
          security_score = EXCLUDED.security_score,
          infrastructure_score = EXCLUDED.infrastructure_score,
          digital_economy_score = EXCLUDED.digital_economy_score,
          overall_score = EXCLUDED.overall_score
      `, [r.id, r.official_id, r.education_score, r.healthcare_score, r.roads_score, r.agriculture_score, r.jobs_score, r.security_score, r.infrastructure_score, r.digital_economy_score, r.overall_score, r.tier, r.year]);
    }

    console.log('✅ Performance data seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
