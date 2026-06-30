import { NextResponse } from 'next/server';
import { queryFirst, queryRun } from '@/lib/db';
import { generateContent } from '@/lib/ai';
import { getWikiBio, fetchWikiIntro } from '@/lib/wikipedia';

export async function POST(request: Request) {
  try {
    const { official_id, politician_id, force = false } = await request.json();
    const id = official_id || politician_id;
    const table = official_id ? 'officials' : 'politicians';

    if (!id) {
      return NextResponse.json({ error: 'official_id or politician_id required' }, { status: 400 });
    }

    const record = await queryFirst<any>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!record) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Skip if already has a verified bio and not forced
    if (record.profile_bio && record.profile_verified && !force) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'Already has a verified bio' });
    }

    const name = record.full_name;
    const role = record.role || (table === 'politicians' ? (record.aspiration_title || 'Politician') : 'Government Official');
    const tier = record.tier || '';
    const state = record.state || record.state_of_origin || '';
    const party = record.party || '';

    // ── Step 1: Fetch Wikipedia content ──────────────────────────────────
    const wikiBio = await getWikiBio(name, record.wiki_title, `Nigeria ${role}`);
    let wikiContent = '';
    let wikiTitle = record.wiki_title || '';
    let wikiUrl = record.wiki_url || '';

    if (wikiBio) {
      wikiTitle = wikiBio.wikiTitle;
      wikiUrl = wikiBio.wikiUrl;
      // Try for longer intro text
      const fullIntro = await fetchWikiIntro(wikiTitle);
      wikiContent = fullIntro || wikiBio.extract;
    }

    // ── Step 2: Build prompt ──────────────────────────────────────────────
    const context = [
      wikiContent ? `Wikipedia extract:\n${wikiContent.slice(0, 3000)}` : '',
      record.bio ? `Existing bio:\n${record.bio}` : '',
      record.education_summary ? `Education: ${record.education_summary}` : '',
    ].filter(Boolean).join('\n\n');

    if (!context && !name) {
      return NextResponse.json({ ok: false, error: 'Insufficient source material for biography generation' });
    }

    const prompt = `You are writing a factual, professional biography for a Nigerian civic accountability platform (evote.ng).

Person: ${name}
Role: ${role}${tier ? ` (${tier.replace(/_/g, ' ')})` : ''}${state ? `, ${state} State` : ''}${party ? `, ${party}` : ''}

${context || `Generate a biography for ${name} based on their role as ${role} in Nigeria.`}

Instructions:
- Write 2–3 concise paragraphs (200–350 words total)
- Cover: background/origins, education, career trajectory, current role, and notable accomplishments
- Be factual and neutral — no praise or partisan language
- Write in third-person, present tense for current role, past tense for history
- If source material is limited, focus on known facts about the role and institution
- Do NOT include fabricated specific dates, statistics, or events not supported by the source
- End with the person's current responsibilities or mandate

Output only the biography text, no headings, no markdown.`;

    const bio = await generateContent({
      prompt,
      systemInstruction: 'You are a professional Nigerian political journalist writing factual, neutral biographies for a civic accountability platform.',
      temperature: 0.4,
      maxTokens: 600,
    });

    if (!bio || bio.trim().length < 50) {
      return NextResponse.json({ ok: false, error: 'AI returned empty or too-short biography' });
    }

    // ── Step 3: Save to DB ────────────────────────────────────────────────
    const updates: string[] = ['profile_bio = ?', 'profile_generated = true', 'profile_verified = false', 'profile_updated_at = NOW()'];
    const params: unknown[] = [bio.trim()];

    if (wikiTitle && wikiTitle !== record.wiki_title) {
      updates.push('wiki_title = ?');
      params.push(wikiTitle);
    }
    if (wikiUrl && wikiUrl !== record.wiki_url) {
      updates.push('wiki_url = ?');
      params.push(wikiUrl);
    }
    params.push(id);

    await queryRun(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({
      ok: true,
      bio: bio.trim(),
      source: wikiContent ? 'wikipedia + ai' : 'ai_only',
      wiki_title: wikiTitle || null,
      wiki_url: wikiUrl || null,
    });
  } catch (error: any) {
    console.error('generate-profile error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
