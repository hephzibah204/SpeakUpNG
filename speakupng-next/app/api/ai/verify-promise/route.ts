import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { generateContent } from '@/lib/ai';

const WIKI_UA = 'evote.ng/1.0 (civic-accountability@evote.ng)';

async function fetchWikipedia(name: string): Promise<string> {
  try {
    const q = encodeURIComponent(name);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${q}&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': WIKI_UA }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return '';
    const data = await res.json();
    const pages: Record<string, any> = data?.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      if (page?.extract) return String(page.extract).slice(0, 2000);
    }
    return '';
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const { promise_id, official_name, promise_title } = await request.json();

    if (!promise_id || !official_name || !promise_title) {
      return NextResponse.json(
        { error: 'promise_id, official_name, and promise_title are required' },
        { status: 400 }
      );
    }

    const contexts: string[] = [];

    // Source 1: Search approved news items for mentions of this official
    const newsItems = await queryAll<any>(
      `SELECT title, summary, url, published_at
       FROM news_items
       WHERE moderation_status = 'approved'
         AND (title ILIKE ? OR summary ILIKE ?)
       ORDER BY published_at DESC
       LIMIT 15`,
      [`%${official_name}%`, `%${official_name}%`]
    );

    if (newsItems.length > 0) {
      let ctx = `=== APPROVED NEWS ITEMS MENTIONING ${official_name} ===\n`;
      for (const item of newsItems) {
        ctx += `- ${item.title ?? ''}`;
        if (item.summary) ctx += `: ${item.summary}`;
        if (item.url) ctx += ` (${item.url})`;
        if (item.published_at) ctx += ` [${String(item.published_at).slice(0, 10)}]`;
        ctx += '\n';
      }
      contexts.push(ctx);
    }

    // Source 2: Wikipedia background
    const wiki = await fetchWikipedia(official_name);
    if (wiki) {
      contexts.push(`=== WIKIPEDIA: ${official_name} ===\n${wiki}`);
    }

    const contextText =
      contexts.join('\n\n') ||
      `No web context found for ${official_name}. Use your training knowledge about Nigerian governance.`;

    const prompt = `You are a Nigerian civic-tech auditor. Evaluate the progress of this promise:
Official: ${official_name}
Promise: ${promise_title}

Here is relevant context from news and public sources:
${contextText}

Return a JSON object with:
- suggested_status: one of [pending, in_progress, fulfilled, broken, disputed]
- suggested_progress_percent: number 0–100
- ai_summary: 2–3 sentences explaining the progress found
- evidence_url: the most relevant news link found, or null

Return ONLY the JSON object, no markdown fences.`;

    const raw = await generateContent({
      prompt,
      systemInstruction: 'Return only strict JSON. No markdown. No extra text.',
      temperature: 0.2,
      maxTokens: 400,
    });

    let parsed: any = null;
    try {
      const cleaned = (raw ?? '').replace(/^```json\s*|```\s*$/gi, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 });
    }

    return NextResponse.json({ ok: true, verification: parsed });
  } catch (error: any) {
    console.error('verify-promise error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
