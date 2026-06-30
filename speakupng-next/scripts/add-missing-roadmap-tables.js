const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Adding missing roadmap datasets/tables...');
  try {
    // 1. Political Parties Table
    console.log('Creating political_parties...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS political_parties (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL UNIQUE,
        acronym VARCHAR NOT NULL UNIQUE,
        logo_url TEXT,
        headquarters VARCHAR,
        manifesto_summary TEXT,
        founded_year INTEGER,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Bills Table
    console.log('Creating bills...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        sponsor_id VARCHAR REFERENCES officials(id) ON DELETE SET NULL,
        status VARCHAR NOT NULL DEFAULT 'first_reading' CHECK (status IN ('first_reading', 'second_reading', 'committee', 'passed_house', 'passed_senate', 'assented', 'vetoed')),
        category VARCHAR,
        full_text TEXT,
        date_introduced VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_bills_sponsor ON bills(sponsor_id);
    `);

    // 3. Budget Allocations Table
    console.log('Creating budget_allocations...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS budget_allocations (
        id VARCHAR PRIMARY KEY,
        year INTEGER NOT NULL,
        entity_type VARCHAR NOT NULL CHECK (entity_type IN ('federal', 'state')),
        entity_name VARCHAR NOT NULL, -- e.g., 'Federal', 'Lagos State'
        sector VARCHAR NOT NULL, -- e.g., 'Education', 'Health', 'Infrastructure'
        amount_allocated NUMERIC NOT NULL,
        amount_released NUMERIC,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Civic Learning Modules & Quizzes
    console.log('Creating civic_learning_modules & civic_quizzes...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS civic_learning_modules (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        content_markdown TEXT NOT NULL,
        category VARCHAR NOT NULL,
        xp_reward INTEGER DEFAULT 50,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS civic_quizzes (
        id VARCHAR PRIMARY KEY,
        module_id VARCHAR REFERENCES civic_learning_modules(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL DEFAULT '[]'::jsonb,
        correct_option_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_quizzes_module ON civic_quizzes(module_id);
    `);

    // 5. Polling Units Table
    console.log('Creating polling_units...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS polling_units (
        id VARCHAR PRIMARY KEY,
        state_name VARCHAR NOT NULL,
        lga_name VARCHAR NOT NULL,
        ward_name VARCHAR,
        pu_name VARCHAR NOT NULL,
        pu_code VARCHAR NOT NULL UNIQUE,
        latitude NUMERIC,
        longitude NUMERIC,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_pu_location ON polling_units(state_name, lga_name);
    `);

    console.log('✅ All missing roadmap tables created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

main();
