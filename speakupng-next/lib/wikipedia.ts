export interface WikiSummary {
  title: string;
  description?: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
}

/** Fetch a page summary from Wikipedia REST API by exact title. */
export async function fetchWikiSummary(title: string): Promise<WikiSummary | null> {
  const encoded = encodeURIComponent(title.replace(/ /g, '_'));
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { 'User-Agent': 'evote.ng/1.0 (civic-accountability@evote.ng)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.extract || data.type === 'disambiguation') return null;
    return data as WikiSummary;
  } catch {
    return null;
  }
}

/** Search Wikipedia and return the best matching article title. */
export async function searchWiki(query: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encoded}&limit=3&namespace=0&format=json&origin=*`,
      { headers: { 'User-Agent': 'evote.ng/1.0 (civic-accountability@evote.ng)' } }
    );
    if (!res.ok) return null;
    const [, titles] = await res.json() as [string, string[]];
    return titles?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Try to get a Wikipedia extract for a person.
 * 1. If wiki_title is provided, use it directly.
 * 2. Otherwise search by name + optional context (e.g. "Nigeria").
 * Returns { extract, wikiTitle, wikiUrl } or null.
 */
export async function getWikiBio(
  name: string,
  wikiTitle?: string | null,
  context = 'Nigeria politics'
): Promise<{ extract: string; wikiTitle: string; wikiUrl: string } | null> {
  // Attempt 1: exact wiki_title from DB
  if (wikiTitle) {
    const summary = await fetchWikiSummary(wikiTitle);
    if (summary?.extract) {
      return {
        extract: summary.extract,
        wikiTitle: summary.title,
        wikiUrl: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title)}`,
      };
    }
  }

  // Attempt 2: search by name + context
  const searchTitle = await searchWiki(`${name} ${context}`);
  if (searchTitle) {
    const summary = await fetchWikiSummary(searchTitle);
    if (summary?.extract) {
      return {
        extract: summary.extract,
        wikiTitle: summary.title,
        wikiUrl: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title)}`,
      };
    }
  }

  // Attempt 3: search by name only
  const nameOnly = await searchWiki(name);
  if (nameOnly) {
    const summary = await fetchWikiSummary(nameOnly);
    if (summary?.extract) {
      return {
        extract: summary.extract,
        wikiTitle: summary.title,
        wikiUrl: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title)}`,
      };
    }
  }

  return null;
}

/** Fetch full intro section (longer than REST summary) via MediaWiki API. */
export async function fetchWikiIntro(title: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encoded}&format=json&origin=*`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'evote.ng/1.0 (civic-accountability@evote.ng)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    if (!page || page.missing !== undefined) return null;
    return page.extract ?? null;
  } catch {
    return null;
  }
}
