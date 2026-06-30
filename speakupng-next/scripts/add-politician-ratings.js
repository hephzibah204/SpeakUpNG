const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Upgrading database schema for politician ratings...');

  try {
    // 1. Create politician_ratings table
    console.log('Creating table politician_ratings...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS politician_ratings (
        id VARCHAR PRIMARY KEY,
        politician_id VARCHAR NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
        device_hash VARCHAR NOT NULL,
        overall REAL NOT NULL CHECK(overall >= 0 AND overall <= 5),
        accountability INTEGER CHECK(accountability BETWEEN 1 AND 5),
        service INTEGER CHECK(service BETWEEN 1 AND 5),
        transparency INTEGER CHECK(transparency BETWEEN 1 AND 5),
        responsiveness INTEGER CHECK(responsiveness BETWEEN 1 AND 5),
        power INTEGER CHECK(power BETWEEN 1 AND 5),
        security INTEGER CHECK(security BETWEEN 1 AND 5),
        economic_stability INTEGER CHECK(economic_stability BETWEEN 1 AND 5),
        education INTEGER CHECK(education BETWEEN 1 AND 5),
        healthcare INTEGER CHECK(healthcare BETWEEN 1 AND 5),
        review_text TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Add columns to politicians table if they do not exist
    console.log('Adding rating columns to politicians table...');
    await sql.query(`
      ALTER TABLE politicians ADD COLUMN IF NOT EXISTS rating_avg REAL NOT NULL DEFAULT 0;
      ALTER TABLE politicians ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;
    `);

    // 3. Create or replace triggers/functions to auto-aggregate politician ratings
    console.log('Creating update_politician_ratings trigger function...');
    await sql.query(`
      CREATE OR REPLACE FUNCTION update_politician_ratings()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE politicians SET
            rating_count = (SELECT COUNT(*) FROM politician_ratings WHERE politician_id = NEW.politician_id),
            rating_avg = COALESCE(ROUND((SELECT AVG(overall) FROM politician_ratings WHERE politician_id = NEW.politician_id)::numeric, 2), 0),
            updated_at = NOW()
          WHERE id = NEW.politician_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE politicians SET
            rating_count = (SELECT COUNT(*) FROM politician_ratings WHERE politician_id = OLD.politician_id),
            rating_avg = COALESCE(ROUND((SELECT AVG(overall) FROM politician_ratings WHERE politician_id = OLD.politician_id)::numeric, 2), 0),
            updated_at = NOW()
          WHERE id = OLD.politician_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('Applying triggers to politician_ratings table...');
    await sql.query(`
      DROP TRIGGER IF EXISTS trg_politician_ratings_insert ON politician_ratings;
      CREATE TRIGGER trg_politician_ratings_insert AFTER INSERT ON politician_ratings FOR EACH ROW EXECUTE FUNCTION update_politician_ratings();

      DROP TRIGGER IF EXISTS trg_politician_ratings_delete ON politician_ratings;
      CREATE TRIGGER trg_politician_ratings_delete AFTER DELETE ON politician_ratings FOR EACH ROW EXECUTE FUNCTION update_politician_ratings();
    `);

    console.log('✅ Database schema upgraded successfully!');
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
  }
}

main();
