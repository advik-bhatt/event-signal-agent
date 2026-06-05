/**
 * scrape.ts — fetch page content as markdown
 * Uses Firecrawl API if FIRECRAWL_API_KEY is set, otherwise falls back to plain fetch.
 */

export async function scrapeUrl(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (apiKey) {
    return scrapeWithFirecrawl(url, apiKey);
  }

  console.warn('[scrape] FIRECRAWL_API_KEY not set — falling back to plain fetch');
  return scrapeWithFetch(url);
}

async function scrapeWithFirecrawl(url: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Firecrawl error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Firecrawl returns { success: true, data: { markdown: "..." } }
  const markdown = data?.data?.markdown || data?.markdown || '';

  if (!markdown) {
    throw new Error('Firecrawl returned empty markdown — the page may be JS-rendered or blocked');
  }

  return markdown;
}

async function scrapeWithFetch(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Breathe-Bot/1.0; +https://breathe.app)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch error ${response.status} for ${url}`);
  }

  const html = await response.text();

  // Minimal HTML → text conversion (strips tags, decodes entities)
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return text.slice(0, 15000);
}
