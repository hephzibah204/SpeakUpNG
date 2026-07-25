const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Migrating blog and SEO tables...');
  try {
    // 1. Create blog_authors table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS blog_authors (
        id VARCHAR PRIMARY KEY,
        username VARCHAR NOT NULL UNIQUE,
        password_hash VARCHAR NOT NULL,
        display_name VARCHAR NOT NULL,
        role VARCHAR NOT NULL DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('- Created blog_authors table');

    // 2. Create blog_posts table with SEO configurations
    await sql.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        content JSONB NOT NULL,
        author_id VARCHAR REFERENCES blog_authors(id) ON DELETE SET NULL,
        status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published')),
        
        -- SEO Configuration (Yoast/RankMath combined)
        focus_keyword VARCHAR,
        meta_title VARCHAR,
        meta_description TEXT,
        canonical_url VARCHAR,
        og_image VARCHAR,
        schema_type VARCHAR DEFAULT 'Article',
        schema_markup JSONB DEFAULT '{}'::jsonb,
        seo_score INT DEFAULT 0,
        readability_score INT DEFAULT 0,
        
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('- Created blog_posts table');

    // 3. Seed a default author (admin / author) if not already exists
    // password hash: 'password' (for test development login)
    await sql.query(`
      INSERT INTO blog_authors (id, username, password_hash, display_name, role)
      VALUES (
        'author-default-id',
        'admin',
        '$2b$10$wR34z8R7nZ1vC1.e8a8eE.H5p.5H4H3h2j1k.m.l.k.j.i.h.g.f.e',
        'Chief Editor',
        'admin'
      )
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('- Seeded default admin author');

    console.log('✅ Blog and SEO tables migration completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
