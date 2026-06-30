import { createPool } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function q(sql: string, params: unknown[] = []) {
  let i = 1;
  const pg = sql.replace(/\?/g, () => `$${i++}`);
  const res = await pool.query(pg, params as any[]);
  return res.rows;
}

// Simple slugify helper
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('=== Starting NGElections Scraper & Enricher ===');
  
  // 1. Get sitemap and extract person slugs
  console.log('Fetching sitemap...');
  let sitemapContent = '';
  try {
    const res = await fetch('https://ngelections.com/sitemap-0.xml');
    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
    sitemapContent = await res.text();
  } catch (err) {
    console.error('Error fetching sitemap, falling back to local file if available...', err);
    const fs = require('fs');
    const localPath = 'C:/Users/hephz/.gemini/antigravity/brain/f0559625-17a7-417e-ac88-8504339ad6a3/.system_generated/steps/41/content.md';
    if (fs.existsSync(localPath)) {
      sitemapContent = fs.readFileSync(localPath, 'utf8');
    } else {
      console.error('No sitemap source found. Exiting.');
      process.exit(1);
    }
  }

  const urls: string[] = [];
  const regex = /<loc>(https:\/\/ngelections\.com\/person\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(sitemapContent)) !== null) {
    urls.push(match[1]);
  }
  
  console.log(`Found ${urls.length} person URLs in sitemap.`);
  
  const slugToUrl = new Map<string, string>();
  for (const url of urls) {
    const parts = url.split('/person/');
    if (parts.length > 1) {
      const slug = parts[1].replace(/\//g, '');
      slugToUrl.set(slug, url);
    }
  }
  
  // 2. Load existing officials and politicians
  console.log('Loading officials and politicians from DB...');
  const officials = await q('SELECT id, full_name, common_name, wiki_title FROM officials');
  const politicians = await q('SELECT id, full_name, common_name, party FROM politicians');
  
  console.log(`Loaded ${officials.length} officials and ${politicians.length} politicians.`);
  
  // 3. Match them to slugs
  const matches: Array<{ dbId: string; type: 'official' | 'politician'; dbName: string; matchedSlug: string }> = [];
  
  const tryMatch = (dbId: string, type: 'official' | 'politician', dbName: string, commonName: string | null) => {
    const slug1 = slugify(dbName);
    if (slugToUrl.has(slug1)) {
      matches.push({ dbId, type, dbName, matchedSlug: slug1 });
      return true;
    }
    
    if (commonName) {
      const slug2 = slugify(commonName);
      if (slugToUrl.has(slug2)) {
        matches.push({ dbId, type, dbName, matchedSlug: slug2 });
        return true;
      }
    }
    
    // Try fuzzy match
    for (const slug of slugToUrl.keys()) {
      if (slug.length > 5 && (slug1.includes(slug) || slug.includes(slug1))) {
        matches.push({ dbId, type, dbName, matchedSlug: slug });
        return true;
      }
    }
    
    return false;
  };
  
  for (const pol of politicians) {
    tryMatch(pol.id, 'politician', pol.full_name, pol.common_name);
  }
  
  for (const off of officials) {
    tryMatch(off.id, 'official', off.full_name, off.common_name);
  }
  
  console.log(`Matched ${matches.length} records to NGElections profiles.`);
  
  // 4. Run on all matches
  console.log(`\n--- Processing ${matches.length} matched profiles ---`);
  
  let successCount = 0;
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    console.log(`[${i + 1}/${matches.length}] Fetching ${m.dbName} (${m.type}) via slug: ${m.matchedSlug}...`);
    
    const pageDataUrl = `https://ngelections.com/page-data/person/${m.matchedSlug}/page-data.json`;
    try {
      const res = await fetch(pageDataUrl);
      if (!res.ok) {
        console.error(`  ✗ Failed to fetch page-data: ${res.status}`);
        continue;
      }
      
      const data: any = await res.json();
      const person = data?.result?.pageContext?.person;
      if (!person) {
        console.error(`  ✗ No person data found in JSON`);
        continue;
      }
      
      const bioText = person.bio || null;
      const photoUrl = person.image || null;
      const state = person.stateOfOrigin || null;
      const eduSummary = person.education || null;
      
      // Update main table
      if (m.type === 'official') {
        await q(
          `UPDATE officials 
           SET bio = COALESCE(bio, $1), 
               photo_url = COALESCE(photo_url, $2),
               state = COALESCE(state, $3),
               education_summary = COALESCE(education_summary, $4),
               updated_at = NOW()
           WHERE id = $5`,
          [bioText, photoUrl, state, eduSummary, m.dbId]
        );
      } else {
        await q(
          `UPDATE politicians 
           SET bio = COALESCE(bio, $1), 
               photo_url = COALESCE(photo_url, $2)
           WHERE id = $3`,
          [bioText, photoUrl, m.dbId]
        );
      }
      
      // Insert education (for officials)
      if (m.type === 'official' && (person.education || person.qualification)) {
        const eduId = randomUUID();
        const inst = person.education || person.qualification || 'Unknown';
        const deg = person.qualification || person.education || 'Unknown';
        await q(
          `INSERT INTO official_education (id, official_id, institution, degree, field, year)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [eduId, m.dbId, inst, deg, null, 0]
        );
      }
      
      // Insert career history & historical election results
      if (person.candidacies && person.candidacies.length > 0) {
        for (const cand of person.candidacies) {
          const year = cand.election?.year ? parseInt(cand.election.year) : null;
          
          // 1. Career history (officials)
          if (m.type === 'official') {
            const careerId = randomUUID();
            await q(
              `INSERT INTO official_career_history (id, official_id, role_title, organisation, start_year, end_year, is_current, category)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT DO NOTHING`,
              [
                careerId,
                m.dbId,
                `Candidate for ${cand.position || 'Office'}`,
                cand.party || 'Unknown',
                year,
                year,
                year === 2027,
                'political'
              ]
            );
          }
          
          // 2. Historical election results
          if (year && year <= 2023) {
            const electionId = randomUUID();
            const electionType = cand.election?.type?.toLowerCase() || 'other';
            const votes = cand.voteCount ? BigInt(cand.voteCount) : BigInt(0);
            const isWinner = cand.result === 'Won';
            
            await q(
              `INSERT INTO historical_elections (id, election_year, election_type, candidate_name, party, votes, is_winner, turnout_percent, source_url)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT DO NOTHING`,
              [
                electionId,
                year,
                electionType,
                person.name,
                cand.party || 'Unknown',
                votes,
                isWinner,
                cand.votePercent || null,
                `https://ngelections.com/person/${m.matchedSlug}/`
              ]
            );
          }
        }
      }
      
      successCount++;
    } catch (err) {
      console.error(`  ✗ Error processing ${m.dbName}:`, err);
    }
    
    await sleep(150); // polite delay
  }
  
  console.log(`\n=== Enrichment Completed: Successfully processed ${successCount}/${matches.length} profiles ===`);
  await pool.end();
}

main().catch(console.error);
