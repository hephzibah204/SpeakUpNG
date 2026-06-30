const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Creating politician_rating_agg view in Neon Postgres...');

  try {
    await sql.query(`
      CREATE OR REPLACE VIEW politician_rating_agg AS
      SELECT
        politician_id,
        COUNT(*) as rating_count,
        ROUND(AVG(overall)::numeric, 2) as rating_avg,
        ROUND(AVG(accountability)::numeric, 2) as accountability_avg,
        ROUND(AVG(service)::numeric, 2) as service_avg,
        ROUND(AVG(transparency)::numeric, 2) as transparency_avg,
        ROUND(AVG(responsiveness)::numeric, 2) as responsiveness_avg,
        ROUND(AVG(power)::numeric, 2) as power_avg,
        ROUND(AVG(security)::numeric, 2) as security_avg,
        ROUND(AVG(economic_stability)::numeric, 2) as economic_stability_avg,
        ROUND(AVG(education)::numeric, 2) as education_avg,
        ROUND(AVG(healthcare)::numeric, 2) as healthcare_avg
      FROM politician_ratings
      GROUP BY politician_id;
    `);

    console.log('✅ politician_rating_agg view created successfully!');
  } catch (err) {
    console.error('❌ View creation failed:', err);
  }
}

main();
