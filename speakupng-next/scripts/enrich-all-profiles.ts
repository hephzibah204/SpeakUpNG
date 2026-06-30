/**
 * enrich-all-profiles.ts
 *
 * Fetches Wikipedia biographies for every official and politician in the
 * Neon database that is missing a profile_bio, then uses AI to write a
 * polished 2-3 paragraph biography and saves it.
 *
 * Usage:
 *   npx tsx scripts/enrich-all-profiles.ts
 *   npx tsx scripts/enrich-all-profiles.ts --force        # regenerate all, even if bio exists
 *   npx tsx scripts/enrich-all-profiles.ts --politicians  # politicians only
 *   npx tsx scripts/enrich-all-profiles.ts --officials    # officials only
 *
 * Requires .env.local with:
 *   POSTGRES_URL=...
 *   OPENROUTER_API_KEY=...  (or GEMINI_API_KEY)
 */

import { createPool } from '@vercel/postgres';
import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ── DB ───────────────────────────────────────────────────────────────────────
const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function q(sql: string, params: unknown[] = []) {
  let i = 1;
  const pg = sql.replace(/\?/g, () => `$${i++}`);
  const res = await pool.query(pg, params as any[]);
  return res.rows;
}

// ── AI ───────────────────────────────────────────────────────────────────────
const openrouterProvider = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

function getModel() {
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  if (hasGemini) return google('gemini-1.5-flash');
  return openrouterProvider(process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini');
}

async function aiGenerate(prompt: string, systemInstruction: string) {
  const model = getModel();
  try {
    const res = await generateText({ model, prompt, system: systemInstruction, temperature: 0.4, maxOutputTokens: 600 });
    return res.text;
  } catch {
    // fallback to OpenRouter if primary fails
    const fallback = openrouterProvider(process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini');
    const res = await generateText({ model: fallback, prompt, system: systemInstruction, temperature: 0.4, maxOutputTokens: 600 });
    return res.text;
  }
}

// ── Wikipedia ────────────────────────────────────────────────────────────────
const WIKI_HEADERS = { 'User-Agent': 'evote.ng/1.0 (civic-accountability@evote.ng)' };

async function wikiSummary(title: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, { headers: WIKI_HEADERS });
    if (!res.ok) return null;
    const data: any = await res.json();
    return data.type === 'disambiguation' ? null : data.extract ?? null;
  } catch { return null; }
}

async function wikiSearch(query: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encoded}&limit=3&namespace=0&format=json&origin=*`, { headers: WIKI_HEADERS });
    if (!res.ok) return null;
    const [, titles]: [string, string[]] = await res.json();
    return titles?.[0] ?? null;
  } catch { return null; }
}

async function wikiIntro(title: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encoded}&format=json&origin=*`;
    const res = await fetch(url, { headers: WIKI_HEADERS });
    if (!res.ok) return null;
    const data: any = await res.json();
    const pages = data?.query?.pages ?? {};
    const page: any = Object.values(pages)[0];
    return page?.extract ?? null;
  } catch { return null; }
}

async function getBio(name: string, wikiTitle: string | null, roleContext: string) {
  const searches = [
    wikiTitle,
    `${name} Nigeria ${roleContext}`,
    name,
  ].filter(Boolean) as string[];

  for (const q of searches) {
    const title = q === wikiTitle ? q : await wikiSearch(q);
    if (!title) continue;
    const intro = await wikiIntro(title) || await wikiSummary(title);
    if (intro && intro.length > 100) {
      return { extract: intro, wikiTitle: title, wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}` };
    }
    await sleep(400);
  }
  return null;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Enrichment ───────────────────────────────────────────────────────────────
async function enrichRecord(
  record: any,
  table: 'officials' | 'politicians',
  idx: number,
  total: number
) {
  const name = record.full_name;
  const role = record.role || record.aspiration_title || 'Government Official';
  const tier = record.tier || '';
  const state = record.state || '';
  const party = record.party || '';

  process.stdout.write(`[${idx + 1}/${total}] ${name.padEnd(40)} `);

  const wikiBio = await getBio(name, record.wiki_title, role);
  let wikiContent = '';
  let wikiTitle = record.wiki_title || '';
  let wikiUrl = record.wiki_url || '';

  if (wikiBio) {
    wikiContent = wikiBio.extract.slice(0, 3000);
    wikiTitle = wikiBio.wikiTitle;
    wikiUrl = wikiBio.wikiUrl;
    process.stdout.write('📖 Wikipedia found → ');
  } else {
    process.stdout.write('⚠️  No Wikipedia  → ');
  }

  const context = [
    wikiContent ? `Wikipedia:\n${wikiContent}` : '',
    record.bio ? `Existing bio:\n${record.bio}` : '',
  ].filter(Boolean).join('\n\n');

  const prompt = `You are writing a factual, professional biography for a Nigerian civic accountability platform (evote.ng).

Person: ${name}
Role: ${role}${tier ? ` (${tier.replace(/_/g, ' ')})` : ''}${state ? `, ${state} State` : ''}${party ? `, ${party}` : ''}

${context || `Generate a professional biography for ${name}, ${role} in Nigeria.`}

Instructions:
- Write 2–3 paragraphs (200–350 words total)
- Cover: background, education, career, current role, accomplishments
- Factual and neutral — no praise or partisan language
- Third-person, present tense for current role, past tense for history
- No fabricated dates or events not supported by source
- Output only the biography text, no headings, no markdown.`;

  try {
    const bio = await aiGenerate(prompt, 'You are a professional Nigerian political journalist writing factual, neutral biographies for a civic accountability platform.');

    if (!bio || bio.trim().length < 50) {
      console.log('✗ AI returned empty bio');
      return false;
    }

    const updates = ['profile_bio = ?', 'profile_generated = true', 'profile_updated_at = NOW()'];
    const params: unknown[] = [bio.trim()];
    if (wikiTitle && wikiTitle !== record.wiki_title) { updates.push('wiki_title = ?'); params.push(wikiTitle); }
    if (wikiUrl && wikiUrl !== record.wiki_url) { updates.push('wiki_url = ?'); params.push(wikiUrl); }
    params.push(record.id);

    await q(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`, params);
    console.log('✅ Done');
    return true;
  } catch (err: any) {
    console.log(`✗ Error: ${err.message}`);
    return false;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const officialsOnly = args.includes('--officials');
  const politiciansOnly = args.includes('--politicians');

  console.log('=== evote.ng Profile Bio Enrichment ===');
  console.log(`Force mode: ${force ? 'yes (regenerate all)' : 'no (skip existing bios)'}\n`);

  const missing = force ? '' : "WHERE (profile_bio IS NULL OR profile_bio = '')";

  let officials: any[] = [];
  let politicians: any[] = [];

  if (!politiciansOnly) {
    officials = await q(`SELECT id, full_name, role, tier, state, bio, wiki_title, wiki_url FROM officials ${missing} ORDER BY full_name`);
    console.log(`Officials to enrich: ${officials.length}`);
  }
  if (!officialsOnly) {
    politicians = await q(`SELECT id, full_name, aspiration_title, party, bio, wiki_title, wiki_url FROM politicians ${missing} ORDER BY full_name`);
    console.log(`Politicians to enrich: ${politicians.length}`);
  }

  let enriched = 0;
  let failed = 0;
  const total = officials.length + politicians.length;

  if (total === 0) {
    console.log('\n✅ All profiles already have biographies!');
    process.exit(0);
  }

  console.log('\n--- Enriching Officials ---');
  for (let i = 0; i < officials.length; i++) {
    const ok = await enrichRecord(officials[i], 'officials', i, officials.length);
    ok ? enriched++ : failed++;
    await sleep(1000); // polite delay between API calls
  }

  console.log('\n--- Enriching Politicians ---');
  for (let i = 0; i < politicians.length; i++) {
    const ok = await enrichRecord(politicians[i], 'politicians', i, politicians.length);
    ok ? enriched++ : failed++;
    await sleep(1000);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total processed: ${total}`);
  console.log(`✅ Enriched: ${enriched}`);
  console.log(`✗  Failed:   ${failed}`);

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
