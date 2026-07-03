import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function executeLocal(queryString: string, params: any[] = []) {
  let i = 1;
  const query = queryString.replace(/\?/g, () => `$${i++}`);
  await sql.query(query, params);
}

const FALLBACK_NEWS = [
  {
    title: 'INEC Releases Final 2027 Election Timetable, Presidential Poll Set for February',
    url: 'https://www.premiumtimesng.com/1',
    published_at: '2026-06-28T09:00:00Z',
    summary: 'The Independent National Electoral Commission unveiled a comprehensive 2027 election timetable, setting the presidential poll for the third Saturday of February 2027. The commission also announced voter registration would resume in October 2026.',
    topic: 'elections',
    category: 'Election',
    site_name: 'Premium Times',
    read_time: 4,
  },
  {
    title: 'Tinubu Signs ₦54.9 Trillion 2026 Supplementary Budget, Eyes Infrastructure Boost',
    url: 'https://www.punchng.com/2',
    published_at: '2026-06-27T10:30:00Z',
    summary: 'President Bola Tinubu signed the ₦54.9 trillion supplementary appropriation bill into law, with the bulk of new allocations directed at roads, rail infrastructure, and power sector reform. Critics warned the deficit financing risks worsening inflation.',
    topic: 'economy',
    category: 'Economy',
    site_name: 'Punch',
    read_time: 5,
  },
  {
    title: 'APC Governors Back Tinubu for 2027 Re-election at Emergency Caucus Meeting',
    url: 'https://www.thecable.ng/3',
    published_at: '2026-06-26T08:00:00Z',
    summary: 'All nineteen APC governors passed a resolution endorsing President Tinubu for a second term at a closed-door meeting in Abuja. The governors dismissed reports of internal dissent as media fabrication.',
    topic: 'politics',
    category: 'Election',
    site_name: 'The Cable',
    read_time: 3,
  },
  {
    title: 'Bandits Attack Three Communities in Zamfara, 40 Killed — Army Launches Airstrikes',
    url: 'https://www.channels.com.ng/4',
    published_at: '2026-06-25T07:15:00Z',
    summary: 'Armed bandits razed three farming villages in Zamfara State overnight, killing at least 40 people and displacing thousands. The Nigerian Army responded with airstrikes on suspected bandit camps across the Dansadau forest corridor.',
    topic: 'security',
    category: 'Security',
    site_name: 'Channels TV',
    read_time: 4,
  },
  {
    title: 'Naira Gains 12% Against Dollar After CBN\'s New FX Intervention Window',
    url: 'https://www.businessday.ng/5',
    published_at: '2026-06-24T11:00:00Z',
    summary: 'The naira appreciated sharply to ₦1,390 per dollar after the Central Bank of Nigeria launched a targeted foreign exchange window for manufacturers and importers of essential commodities. Analysts cautioned the gains may be temporary.',
    topic: 'economy',
    category: 'Economy',
    site_name: 'BusinessDay',
    read_time: 4,
  },
  {
    title: 'Peter Obi Meets with Labour Party Governors to Build 2027 Coalition Framework',
    url: 'https://www.guardian.ng/6',
    published_at: '2026-06-23T09:30:00Z',
    summary: 'Labour Party\'s 2023 presidential candidate Peter Obi convened a strategic meeting with LP lawmakers and emerging party leaders to chart a 2027 electoral roadmap. Sources say cross-party defections to LP are expected before year-end.',
    topic: 'politics',
    category: 'Election',
    site_name: 'The Guardian',
    read_time: 5,
  },
  {
    title: 'Senate Passes Petroleum Industry Amendment Act to Boost Local Refining',
    url: 'https://www.vanguardngr.com/7',
    published_at: '2026-06-22T14:00:00Z',
    summary: 'The Nigerian Senate amended the Petroleum Industry Act to provide additional tax incentives for local refinery operators and mandate a domestic supply obligation on crude oil producers. The bill now heads to the House of Representatives.',
    topic: 'policy',
    category: 'Governance',
    site_name: 'Vanguard',
    read_time: 3,
  }
];

async function main() {
  console.log('Seeding news_items from fallback array...');
  try {
    const sourceId = 'src_fallback_01';
    await executeLocal(`
      INSERT INTO news_sources (id, name, home_url, feed_url, ingest_type, credibility_tier)
      VALUES (?, 'SpeakUpNG News Hub', 'https://speakup.ng', 'https://speakup.ng/rss', 'rss', 'tier1')
      ON CONFLICT (feed_url) DO NOTHING
    `, [sourceId]);

    const res = await sql.query("SELECT id FROM news_sources WHERE feed_url = 'https://speakup.ng/rss'");
    const actualSourceId = res.rows[0]?.id || sourceId;

    await executeLocal("DELETE FROM news_items WHERE url LIKE 'https://%/%'");

    let count = 0;
    for (const item of FALLBACK_NEWS) {
      const id = 'ni_' + randomUUID();
      const categoriesJson = JSON.stringify([item.category]);
      const rawJson = JSON.stringify(item);
      const isPolitics = item.topic === 'politics' || item.topic === 'elections' ? 1 : 0;
      
      await executeLocal(`
        INSERT INTO news_items (
          id, source_id, title, url, published_at, content_hash, raw_json, summary, 
          topic, categories, is_politics, site_name, moderation_status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved'
        )
        ON CONFLICT (url) DO NOTHING
      `, [
        id, actualSourceId, item.title, item.url, item.published_at, id, rawJson, 
        item.summary, item.topic, categoriesJson, isPolitics, item.site_name
      ]);
      count++;
    }

    console.log(`✅ Seeded ${count} news items successfully into Neon Postgres.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sql.end();
  }
}

main();
