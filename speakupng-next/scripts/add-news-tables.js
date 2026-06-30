const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Creating news schema tables in Neon Postgres...');

  try {
    // 1. Create news_sources table
    console.log('Creating news_sources...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS news_sources (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        home_url VARCHAR NOT NULL,
        feed_url VARCHAR NOT NULL UNIQUE,
        ingest_type VARCHAR NOT NULL DEFAULT 'rss',
        credibility_tier VARCHAR NOT NULL DEFAULT 'tier2' CHECK(credibility_tier IN ('tier1', 'tier2', 'blocked')),
        is_active INTEGER NOT NULL DEFAULT 1,
        allow_full_text INTEGER NOT NULL DEFAULT 0,
        allow_images INTEGER NOT NULL DEFAULT 1,
        max_fetch_kb INTEGER NOT NULL DEFAULT 512,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_news_sources_feed ON news_sources(feed_url);
    `);

    // 2. Create news_items table
    console.log('Creating news_items...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS news_items (
        id VARCHAR PRIMARY KEY,
        source_id VARCHAR NOT NULL REFERENCES news_sources(id) ON DELETE RESTRICT,
        title VARCHAR NOT NULL,
        url VARCHAR NOT NULL UNIQUE,
        published_at TIMESTAMP WITH TIME ZONE,
        content_hash VARCHAR NOT NULL,
        raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        summary TEXT,
        sentiment_score REAL,
        topic VARCHAR,
        categories JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_politics INTEGER NOT NULL DEFAULT 0,
        matched_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
        image_url VARCHAR,
        site_name VARCHAR,
        author VARCHAR,
        content_text TEXT,
        content_html TEXT,
        content_extracted_at TIMESTAMP WITH TIME ZONE,
        moderation_status VARCHAR NOT NULL DEFAULT 'pending' CHECK(moderation_status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_news_items_published ON news_items(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_news_items_status ON news_items(moderation_status, published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_news_items_source ON news_items(source_id, published_at DESC);
    `);

    // 3. Create news_profile_matches table
    console.log('Creating news_profile_matches...');
    await sql.query(`
      CREATE TABLE IF NOT EXISTS news_profile_matches (
        id VARCHAR PRIMARY KEY,
        profile_type VARCHAR NOT NULL CHECK(profile_type IN ('official', 'politician')),
        profile_id VARCHAR NOT NULL,
        news_item_id VARCHAR NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
        confidence REAL NOT NULL DEFAULT 0,
        method VARCHAR NOT NULL DEFAULT 'keyword',
        matched_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profile_type, profile_id, news_item_id)
      );
      CREATE INDEX IF NOT EXISTS idx_news_profile_matches_profile ON news_profile_matches(profile_type, profile_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_news_profile_matches_item ON news_profile_matches(news_item_id);
    `);

    console.log('✅ News schema tables created successfully!');
  } catch (err) {
    console.error('❌ Schema setup failed:', err);
  }
}

main();
