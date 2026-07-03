import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function executeLocal(queryString: string, params: any[] = []) {
  let i = 1;
  const query = queryString.replace(/\?/g, () => `$${i++}`);
  await sql.query(query, params);
}

const zones = [
  { name: 'South West', apc: 55, ndc: 35, pdp: 10, weight: 0.19 },
  { name: 'South East', apc: 10, ndc: 80, pdp: 10, weight: 0.14 },
  { name: 'South South', apc: 20, ndc: 55, pdp: 25, weight: 0.15 },
  { name: 'North West', apc: 50, ndc: 35, pdp: 15, weight: 0.24 },
  { name: 'North East', apc: 45, ndc: 20, pdp: 35, weight: 0.14 },
  { name: 'North Central', apc: 40, ndc: 35, pdp: 25, weight: 0.14 }
];

async function main() {
  console.log('Seeding prediction baselines...');
  try {
    await executeLocal(`
      CREATE TABLE IF NOT EXISTS prediction_baselines (
        zone_name VARCHAR PRIMARY KEY,
        apc_base REAL NOT NULL,
        ndc_base REAL NOT NULL,
        pdp_base REAL NOT NULL,
        electoral_weight REAL NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    let count = 0;
    for (const z of zones) {
      await executeLocal(`
        INSERT INTO prediction_baselines (
          zone_name, apc_base, ndc_base, pdp_base, electoral_weight
        ) VALUES (
          ?, ?, ?, ?, ?
        )
        ON CONFLICT (zone_name) DO UPDATE SET
          apc_base = EXCLUDED.apc_base,
          ndc_base = EXCLUDED.ndc_base,
          pdp_base = EXCLUDED.pdp_base,
          electoral_weight = EXCLUDED.electoral_weight,
          updated_at = CURRENT_TIMESTAMP
      `, [
        z.name, z.apc, z.ndc, z.pdp, z.weight
      ]);
      count++;
    }

    console.log(`✅ Seeded ${count} prediction baselines successfully into Neon Postgres.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sql.end();
  }
}

main();
