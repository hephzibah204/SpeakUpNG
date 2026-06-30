import { NextResponse } from 'next/server';

const WIKI_UA = 'evote.ng/1.0 (civic-accountability@evote.ng)';
const SOURCES = [
  { key: 'manifesto.ng', url: (q: string) => `https://manifesto.ng/?s=${q}` },
  { key: 'promisetracker.ng', url: (q: string) => `https://promisetracker.ng/?s=${q}` },
  { key: 'followthepromises.org', url: (q: string) => `https://followthepromises.org/?s=${q}` },
  { key: 'tracka.ng', url: (q: string) => `https://tracka.ng/?s=${q}` },
  { key: 'orderpaper.ng', url: (q: string) => `https://orderpaper.ng/?s=${q}` },
  { key: 'dataphyte.com', url: (q: string) => `https://www.dataphyte.com/?s=${q}` },
];

async function fetchText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': WIKI_UA },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    return html
      .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 4000);
  } catch {
    return '';
  }
}

async function fetchWikipedia(name: string): Promise<string> {
  try {
    const q = encodeURIComponent(name);
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${q}&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': WIKI_UA }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return '';
    const data = await res.json();
    const pages: Record<string, any> = data?.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      if (page?.extract) return String(page.extract).slice(0, 3000);
    }
    return '';
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const { name, role, state, website } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const personName = String(name).trim();
    const q = encodeURIComponent(`${personName} Nigeria`);
    const contexts: { source: string; text: string }[] = [];

    // Fetch Wikipedia and external sources concurrently
    const fetches: Promise<void>[] = [];

    fetches.push(
      fetchWikipedia(personName).then(text => {
        if (text) contexts.push({ source: 'Wikipedia', text });
      })
    );

    for (const src of SOURCES) {
      fetches.push(
        fetchText(src.url(q)).then(text => {
          if (text && text.length > 100) contexts.push({ source: src.key, text: text.slice(0, 2500) });
        })
      );
    }

    if (website && /^https?:\/\//i.test(String(website))) {
      fetches.push(
        fetchText(String(website)).then(text => {
          if (text) contexts.push({ source: 'Official Website', text: text.slice(0, 3000) });
        })
      );
    }

    await Promise.allSettled(fetches);

    return NextResponse.json({
      name: personName,
      role: role ?? '',
      state: state ?? '',
      contexts,
      sources_fetched: contexts.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
