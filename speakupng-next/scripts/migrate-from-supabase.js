const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
process.env.POSTGRES_URL = process.env.evote_POSTGRES_URL || process.env.POSTGRES_URL;
process.env.POSTGRES_URL_NON_POOLING = process.env.evote_POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING;
const { sql } = require('@vercel/postgres');

const SUPABASE_URL = 'https://dyrsygrjsxqfszglqrez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wKGjAwnpc2sOwjSAf6Zl6Q_bi3PegsD';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper: paginate through ALL rows from a Supabase table (bypasses the 1000-row limit)
async function fetchAll(table, selectCols = '*', orderCol = 'id') {
  const PAGE = 1000;
  let allRows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(selectCols)
      .order(orderCol, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    console.log(`  ... fetched ${allRows.length} rows from ${table} so far`);
    if (data.length < PAGE) break; // last page
    from += PAGE;
  }
  return allRows;
}

async function migrateData() {
  console.log('Starting FULL data migration from Supabase to Neon Postgres...\n');

  try {
    // 0. Clear existing data
    console.log('Clearing existing data...');
    await sql`TRUNCATE TABLE public_ratings, politician_ratings, official_promises, news_profile_matches, news_items, news_sources, poll_votes, polls, politicians, officials, states CASCADE;`;

    // 1. States
    console.log('\n📍 Fetching ALL states...');
    const states = await fetchAll('states');
    console.log(`Found ${states.length} states, inserting...`);
    for (const s of states) {
      await sql`
        INSERT INTO states (id, name, code, region, created_at)
        VALUES (${s.id}, ${s.name}, ${s.code}, ${s.region}, ${s.created_at || new Date().toISOString()})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log(`✅ ${states.length} states inserted`);

    // 2. Officials (paginated — could be 3000+)
    console.log('\n👔 Fetching ALL officials...');
    const officials = await fetchAll('officials');
    console.log(`Found ${officials.length} officials, inserting...`);
    let officialCount = 0;
    for (const o of officials) {
      await sql`
        INSERT INTO officials (id, full_name, common_name, role, tier, state, website, photo_url, status, created_at, rating_avg, rating_count)
        VALUES (
          ${o.id}, ${o.full_name}, ${o.common_name}, ${o.role}, ${o.tier}, 
          ${o.state || null}, ${o.website}, ${o.photo_url}, ${o.status}, 
          ${o.created_at || new Date().toISOString()}, ${o.rating_avg || 0}, ${o.rating_count || 0}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      officialCount++;
      if (officialCount % 500 === 0) console.log(`  ... inserted ${officialCount}/${officials.length} officials`);
    }
    console.log(`✅ ${officialCount} officials inserted`);

    // 3. Politicians
    console.log('\n🎤 Fetching ALL politicians...');
    const politicians = await fetchAll('politicians');
    console.log(`Found ${politicians.length} politicians, inserting...`);
    for (const p of politicians) {
      await sql`
        INSERT INTO politicians (id, full_name, common_name, party, aspiration_title, photo_url, is_active, priority, created_at)
        VALUES (
          ${p.id}, ${p.full_name}, ${p.common_name}, ${p.party}, ${p.aspiration_title}, 
          ${p.photo_url}, ${p.is_active ? 1 : 0}, ${p.priority || 0}, ${p.created_at || new Date().toISOString()}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log(`✅ ${politicians.length} politicians inserted`);

    // 4. Polls
    console.log('\n📊 Fetching ALL polls...');
    const polls = await fetchAll('polls');
    console.log(`Found ${polls.length} polls, inserting...`);
    for (const poll of polls) {
      const optionsJson = JSON.stringify(Array.isArray(poll.options) ? poll.options : []);
      await sql`
        INSERT INTO polls (id, question, options, total_votes, status, closes_at, created_at)
        VALUES (
          ${poll.id}, ${poll.title || poll.question || ''}, ${optionsJson}::jsonb, 
          ${poll.total_votes || 0}, ${poll.is_active ? 'active' : 'closed'}, ${poll.expires_at || poll.closes_at || null}, 
          ${poll.created_at || new Date().toISOString()}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    console.log(`✅ ${polls.length} polls inserted`);

    // 5. Public Ratings (reviews) — paginated, could be thousands
    console.log('\n⭐ Fetching ALL public_ratings (reviews)...');
    const ratings = await fetchAll('public_ratings');
    console.log(`Found ${ratings.length} ratings, inserting...`);
    let ratingCount = 0;
    for (const r of ratings) {
      await sql`
        INSERT INTO public_ratings (id, official_id, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, reviewer_state, review_text, device_hash, created_at)
        VALUES (
          ${r.id}, ${r.official_id}, ${r.overall}, 
          ${r.accountability || null}, ${r.service || null}, ${r.transparency || null}, 
          ${r.responsiveness || null}, ${r.power || null}, ${r.security || null}, 
          ${r.economic_stability || null}, ${r.education || null}, ${r.healthcare || null},
          ${r.reviewer_state || null}, ${r.review_text || null}, ${r.device_hash || null},
          ${r.created_at || new Date().toISOString()}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      ratingCount++;
      if (ratingCount % 500 === 0) console.log(`  ... inserted ${ratingCount}/${ratings.length} ratings`);
    }
    console.log(`✅ ${ratingCount} ratings inserted`);

    // 6. Poll Votes
    console.log('\n🗳️ Fetching ALL poll_votes...');
    try {
      const votes = await fetchAll('poll_votes');
      console.log(`Found ${votes.length} poll votes, inserting...`);
      let voteCount = 0;
      for (const v of votes) {
        await sql`
          INSERT INTO poll_votes (id, poll_id, anon_id, option_index, created_at)
          VALUES (${v.id}, ${v.poll_id}, ${v.anon_id}, ${v.option_index}, ${v.created_at || new Date().toISOString()})
          ON CONFLICT (id) DO NOTHING;
        `;
        voteCount++;
        if (voteCount % 500 === 0) console.log(`  ... inserted ${voteCount}/${votes.length} votes`);
      }
      console.log(`✅ ${voteCount} poll votes inserted`);
    } catch (e) {
      console.warn('⚠️ Could not migrate poll_votes:', e.message);
    }

    // 7. Politician Ratings
    console.log('\n⭐ Fetching ALL politician_ratings...');
    try {
      const polRatings = await fetchAll('politician_ratings');
      console.log(`Found ${polRatings.length} politician ratings, inserting...`);
      let polRatingCount = 0;
      for (const pr of polRatings) {
        await sql`
          INSERT INTO politician_ratings (id, politician_id, device_hash, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, review_text, created_at)
          VALUES (
            ${pr.id}, ${pr.politician_id}, ${pr.device_hash}, ${pr.overall},
            ${pr.accountability || null}, ${pr.service || null}, ${pr.transparency || null},
            ${pr.responsiveness || null}, ${pr.power || null}, ${pr.security || null},
            ${pr.economic_stability || null}, ${pr.education || null}, ${pr.healthcare || null},
            ${pr.review_text || null}, ${pr.created_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        polRatingCount++;
      }
      console.log(`✅ ${polRatingCount} politician ratings inserted`);
    } catch (e) {
      console.warn('⚠️ Could not migrate politician_ratings:', e.message);
    }

    // 8. Official Promises / Mandates
    console.log('\n📜 Fetching ALL official_promises (Mandates)...');
    try {
      const promises = await fetchAll('official_promises');
      console.log(`Found ${promises.length} promises, inserting...`);
      let promiseCount = 0;
      for (const p of promises) {
        await sql`
          INSERT INTO official_promises (id, official_id, politician_id, promise_title, promise_detail, promise_category, promise_date, promise_source, status, progress_percent, evidence_url, verified_by, last_updated)
          VALUES (
            ${p.id}, ${p.official_id || null}, ${p.politician_id || null}, ${p.promise_title},
            ${p.promise_detail || null}, ${p.promise_category || null}, ${p.promise_date || null},
            ${p.promise_source || null}, ${p.status || 'pending'}, ${p.progress_percent || 0},
            ${p.evidence_url || null}, ${p.verified_by || null}, ${p.last_updated || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        promiseCount++;
      }
      console.log(`✅ ${promiseCount} promises/mandates inserted`);
    } catch (e) {
      console.warn('⚠️ Could not migrate official_promises:', e.message);
    }

    // 9. News Sources
    console.log('\n📰 Fetching ALL news_sources...');
    try {
      const sources = await fetchAll('news_sources');
      console.log(`Found ${sources.length} news sources, inserting...`);
      for (const src of sources) {
        await sql`
          INSERT INTO news_sources (id, name, home_url, feed_url, ingest_type, credibility_tier, is_active, allow_full_text, allow_images, max_fetch_kb, created_at, updated_at)
          VALUES (
            ${src.id}, ${src.name}, ${src.home_url}, ${src.feed_url},
            ${src.ingest_type || 'rss'}, ${src.credibility_tier || 'tier2'}, ${src.is_active ? 1 : 0},
            ${src.allow_full_text ? 1 : 0}, ${src.allow_images ? 1 : 0}, ${src.max_fetch_kb || 512},
            ${src.created_at || new Date().toISOString()}, ${src.updated_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      console.log(`✅ ${sources.length} news sources inserted`);
    } catch (e) {
      console.warn('⚠️ Could not migrate news_sources:', e.message);
    }

    // 10. News Items
    console.log('\n📰 Fetching ALL news_items...');
    try {
      const items = await fetchAll('news_items');
      console.log(`Found ${items.length} news items, inserting...`);
      let itemCnt = 0;
      for (const item of items) {
        await sql`
          INSERT INTO news_items (id, source_id, title, url, published_at, content_hash, raw_json, summary, sentiment_score, topic, categories, is_politics, matched_profiles, image_url, site_name, author, content_text, content_html, content_extracted_at, moderation_status, created_at, updated_at)
          VALUES (
            ${item.id}, ${item.source_id}, ${item.title}, ${item.url}, ${item.published_at || null},
            ${item.content_hash}, ${item.raw_json ? JSON.stringify(item.raw_json) : '{}'}, ${item.summary || null},
            ${item.sentiment_score || null}, ${item.topic || null}, ${item.categories ? JSON.stringify(item.categories) : '[]'},
            ${item.is_politics || 0}, ${item.matched_profiles ? JSON.stringify(item.matched_profiles) : '[]'},
            ${item.image_url || null}, ${item.site_name || null}, ${item.author || null},
            ${item.content_text || null}, ${item.content_html || null}, ${item.content_extracted_at || null},
            ${item.moderation_status || 'pending'}, ${item.created_at || new Date().toISOString()}, ${item.updated_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        itemCnt++;
        if (itemCnt % 500 === 0) console.log(`  ... inserted ${itemCnt}/${items.length} news items`);
      }
      console.log(`✅ ${itemCnt} news items inserted`);
    } catch (e) {
      console.warn('⚠️ Could not migrate news_items:', e.message);
    }

    // 11. News Profile Matches
    console.log('\n🔗 Fetching ALL news_profile_matches...');
    try {
      const matches = await fetchAll('news_profile_matches');
      console.log(`Found ${matches.length} news matches, inserting...`);
      let matchCnt = 0;
      for (const m of matches) {
        await sql`
          INSERT INTO news_profile_matches (id, profile_type, profile_id, news_item_id, confidence, method, matched_terms, created_at)
          VALUES (
            ${m.id}, ${m.profile_type}, ${m.profile_id}, ${m.news_item_id},
            ${m.confidence || 0}, ${m.method || 'keyword'}, ${m.matched_terms ? JSON.stringify(m.matched_terms) : '[]'},
            ${m.created_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        matchCnt++;
      }
      console.log(`✅ ${matchCnt} news matches inserted`);
    } catch (e) {
      console.warn('⚠️ Could not migrate news_profile_matches:', e.message);
    }

    console.log('\n🎉 FULL Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrateData();
