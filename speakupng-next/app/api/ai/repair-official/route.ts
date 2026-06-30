import { NextResponse } from 'next/server';
import { queryFirst, queryRun } from '@/lib/db';

const WIKI_UA = 'evote.ng/1.0 (civic-accountability@evote.ng)';

async function wikiSummary(name: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g, '_'))}`;
  const res = await fetch(url, { headers: { 'User-Agent': WIKI_UA, Accept: 'application/json' }, signal: AbortSignal.timeout(18000) });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type === 'disambiguation') return null;
  return data as Record<string, any>;
}

async function wikiFullExtractAndImage(title: string, maxChars = 4500) {
  const qs = new URLSearchParams({
    action: 'query',
    format: 'json',
    redirects: '1',
    prop: 'extracts|pageimages',
    explaintext: '1',
    exsectionformat: 'plain',
    exchars: String(maxChars),
    piprop: 'thumbnail',
    pithumbsize: '900',
    titles: title,
    origin: '*',
  });
  const url = `https://en.wikipedia.org/w/api.php?${qs}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': WIKI_UA }, signal: AbortSignal.timeout(22000) });
    if (!res.ok) return null;
    const data = await res.json();
    const pages: Record<string, any> = data?.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      if (!page || page.missing === '') continue;
      return {
        extract: String(page.extract ?? ''),
        thumb: String(page?.thumbnail?.source ?? ''),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function cleanText(t: string, max: number): string {
  return t.replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function POST(request: Request) {
  try {
    const { official_id, name, min_bio_chars = 180, min_profile_bio_chars = 450 } = await request.json();

    if (!official_id || !name?.trim()) {
      return NextResponse.json({ error: 'official_id and name are required' }, { status: 400 });
    }

    const record = await queryFirst<any>(
      'SELECT id, full_name, bio, profile_bio, photo_url FROM officials WHERE id = ?',
      [official_id]
    );
    if (!record) {
      return NextResponse.json({ error: 'Official not found' }, { status: 404 });
    }

    const curBio = String(record.bio ?? '').trim();
    const curProfileBio = String(record.profile_bio ?? '').trim();
    const curPhoto = String(record.photo_url ?? '').trim();

    const needsBio = curBio.length < min_bio_chars;
    const needsProfileBio = curProfileBio.length < min_profile_bio_chars;
    const needsPhoto = !curPhoto;

    if (!needsBio && !needsProfileBio && !needsPhoto) {
      return NextResponse.json({ ok: true, updated: false, message: 'Already healthy' });
    }

    // Fetch Wikipedia summary (REST API — fast, returns thumbnail)
    const summary = await wikiSummary(String(name).trim());
    if (!summary) {
      return NextResponse.json({ ok: true, updated: false, message: 'No Wikipedia summary found' });
    }

    const wikiTitle = String(summary.title ?? name);
    const shortExtract = String(summary.extract ?? '').trim();

    // Fetch full extract + larger image if needed
    let longExtract = '';
    let thumbUrl = String(summary?.thumbnail?.source ?? '').trim();

    if (needsProfileBio || (needsPhoto && !thumbUrl)) {
      const full = await wikiFullExtractAndImage(wikiTitle, 4500);
      if (full) {
        longExtract = full.extract.trim();
        if (!thumbUrl && full.thumb) thumbUrl = full.thumb;
      }
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (needsBio && shortExtract) {
      updates.push('bio = ?');
      params.push(cleanText(shortExtract, 1200));
    }

    if (needsProfileBio) {
      const candidate = longExtract || shortExtract;
      if (candidate) {
        updates.push('profile_bio = ?');
        params.push(cleanText(candidate, 4500));
        updates.push('profile_generated = true');
        updates.push('profile_updated_at = NOW()');
      }
    }

    if (needsPhoto && thumbUrl) {
      updates.push('photo_url = ?');
      params.push(thumbUrl);
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, updated: false, message: 'No usable data found' });
    }

    params.push(official_id);
    await queryRun(`UPDATE officials SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({
      ok: true,
      updated: true,
      fields_updated: updates
        .filter(u => u.includes('='))
        .map(u => u.split(' = ')[0]),
    });
  } catch (error: any) {
    console.error('repair-official error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
