const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Creating official_manifestos table if not exists...');

  await sql`
    CREATE TABLE IF NOT EXISTS official_manifestos (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      politician_id   UUID REFERENCES politicians(id) ON DELETE SET NULL,
      official_id     UUID REFERENCES officials(id) ON DELETE SET NULL,
      title           TEXT NOT NULL,
      summary         TEXT,
      cost_feasibility JSONB,
      sdg_alignment   JSONB,
      milestones      JSONB,
      raw_text        TEXT,
      source_url      TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('official_manifestos table ready.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
