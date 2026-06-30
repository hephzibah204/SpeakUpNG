import { NextResponse } from 'next/server';
import { queryAll, queryFirst, queryRun } from '@/lib/db';
import { generateContent } from '@/lib/ai';
import { getWikiBio, fetchWikiIntro } from '@/lib/wikipedia';

const CONCURRENCY = 3; // process N profiles at a time to avoid rate limits
const DELAY_MS = 800; // polite delay between Wikipedia fetches

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enrichOne(record: any, table: 'officials' | 'politicians') {
  const name = record.full_name;
  const role = record.role || (table === 'politicians' ? (record.aspiration_title || 'Politician') : 'Government Official');
  const tier = record.tier || '';
  const state = record.state || record.state_of_origin || '';
  const party = record.party || '';

  // Fetch Wikipedia
  const wikiBio = await getWikiBio(name, record.wiki_title, `Nigeria ${role}`);
  let wikiContent = '';
  let wikiTitle = record.wiki_title || '';
  let wikiUrl = record.wiki_url || '';

  if (wikiBio) {
    wikiTitle = wikiBio.wikiTitle;
    wikiUrl = wikiBio.wikiUrl;
    const fullIntro = await fetchWikiIntro(wikiTitle);
    wikiContent = fullIntro || wikiBio.extract;
  }

  await sleep(DELAY_MS);

  const context = [
    wikiContent ? `Wikipedia extract:\n${wikiContent.slice(0, 3000)}` : '',
    record.bio ? `Existing bio:\n${record.bio}` : '',
    record.education_summary ? `Education: ${record.education_summary}` : '',
  ].filter(Boolean).join('\n\n');

  const prompt = `You are writing a factual, professional biography for a Nigerian civic accountability platform (evote.ng).

Person: ${name}
Role: ${role}${tier ? ` (${tier.replace(/_/g, ' ')})` : ''}${state ? `, ${state} State` : ''}${party ? `, ${party}` : ''}

${context || `Generate a professional biography for ${name}, ${role} in Nigeria.`}

Instructions:
- Write 2–3 concise paragraphs (200–350 words total)
- Cover: background/origins, education, career trajectory, current role, and notable accomplishments
- Be factual and neutral — no praise or partisan language
- Write in third-person, present tense for current role, past tense for history
- Do NOT include fabricated specific dates, statistics, or events not in the source material
- If source material is limited, describe known facts about the role and institution

Output only the biography text, no headings, no markdown.`;

  const bio = await generateContent({
    prompt,
    systemInstruction: 'You are a professional Nigerian political journalist writing factual, neutral biographies for a civic accountability platform.',
    temperature: 0.4,
    maxTokens: 600,
  });

  if (!bio || bio.trim().length < 50) {
    return { success: false, reason: 'empty_bio' };
  }

  const updates: string[] = ['profile_bio = ?', 'profile_generated = true', 'profile_updated_at = NOW()'];
  const params: unknown[] = [bio.trim()];

  if (wikiTitle && wikiTitle !== record.wiki_title) { updates.push('wiki_title = ?'); params.push(wikiTitle); }
  if (wikiUrl && wikiUrl !== record.wiki_url) { updates.push('wiki_url = ?'); params.push(wikiUrl); }
  params.push(record.id);

  await queryRun(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`, params);

  return {
    success: true,
    name,
    source: wikiContent ? 'wikipedia + ai' : 'ai_only',
    wiki_title: wikiTitle || null,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const force: boolean = body.force ?? false; // if true, regenerate even profiles with bios

    // Load all profiles missing bios (or all if forced)
    const whereClause = force ? '' : "WHERE (profile_bio IS NULL OR profile_bio = '')";

    const officials = await queryAll<any>(`SELECT id, full_name, role, tier, state, bio, wiki_title, wiki_url, profile_bio, profile_verified FROM officials ${whereClause} ORDER BY full_name`);
    const politicians = await queryAll<any>(`SELECT id, full_name, aspiration_title, party, bio, wiki_title, wiki_url, profile_bio, profile_verified FROM politicians ${whereClause} ORDER BY full_name`);

    const results: any[] = [];
    const errors: any[] = [];

    // Process officials
    for (let i = 0; i < officials.length; i += CONCURRENCY) {
      const batch = officials.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(r => enrichOne(r, 'officials').catch(e => ({ success: false, name: r.full_name, reason: e.message })))
      );
      batchResults.forEach(r => (r.success ? results : errors).push(r));
      if (i + CONCURRENCY < officials.length) await sleep(1200);
    }

    // Process politicians
    for (let i = 0; i < politicians.length; i += CONCURRENCY) {
      const batch = politicians.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(r => enrichOne(r, 'politicians').catch(e => ({ success: false, name: r.full_name, reason: e.message })))
      );
      batchResults.forEach(r => (r.success ? results : errors).push(r));
      if (i + CONCURRENCY < politicians.length) await sleep(1200);
    }

    return NextResponse.json({
      ok: true,
      total: officials.length + politicians.length,
      enriched: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error: any) {
    console.error('enrich-all error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
