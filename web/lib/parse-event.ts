export interface ParsedEvent {
  name: string;
  description: string;
  start_at: string | null;  // ISO 8601
  end_at: string | null;
  venue: string | null;
  venue_address: string | null;
  organizer: string | null;
  sponsors: Array<{ name: string; url?: string; description?: string }>;
  tags: string[];
  url: string;
  cover_image_url: string | null;
  ai_score: number;  // 0-100
  ai_reasoning: string;
}

const SYSTEM_PROMPT = `You are an event data extractor. Given markdown content from an event page, extract all available information and return a single JSON object.

Always return valid JSON matching this TypeScript interface:
{
  name: string,
  description: string,
  start_at: string | null,   // ISO 8601 with timezone if available, else null
  end_at: string | null,     // ISO 8601 with timezone if available, else null
  venue: string | null,      // venue/location name
  venue_address: string | null, // full address
  organizer: string | null,
  sponsors: Array<{ name: string, url?: string, description?: string }>,
  tags: string[],            // e.g. ["ai","startup","networking","dev-tools"]
  url: string,               // the source URL passed to you
  cover_image_url: string | null,
  ai_score: number,          // 0-100: relevance to "NYC tech professional interested in AI, startups, dev tools, networking"
  ai_reasoning: string       // 1-2 sentences explaining the score
}

Scoring guide:
- 80-100: Directly relevant (AI/ML event, startup/founder event, dev tools, technical networking)
- 60-79: Somewhat relevant (general tech, adjacent domain)
- 40-59: Neutral (general business, tangential)
- 20-39: Low relevance (non-tech, consumer)
- 0-19: Not relevant

Extract sponsor names from any "Presented by", "Sponsored by", "Partners", logos, or similar sections.
Return ONLY the JSON object — no markdown, no explanation.`;

export async function parseEventFromMarkdown(
  markdown: string,
  sourceUrl: string
): Promise<ParsedEvent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('[parse-event] ANTHROPIC_API_KEY not set — returning minimal parsed event');
    return {
      name: 'Unknown Event',
      description: markdown.slice(0, 500),
      start_at: null,
      end_at: null,
      venue: null,
      venue_address: null,
      organizer: null,
      sponsors: [],
      tags: [],
      url: sourceUrl,
      cover_image_url: null,
      ai_score: 50,
      ai_reasoning: 'Could not score — API key not configured.',
    };
  }

  const userMessage = `Extract event data from this page content. The source URL is: ${sourceUrl}

---
${markdown.slice(0, 12000)}
---

Return only the JSON object.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text ?? '';

  // Strip any markdown code fences if the model wrapped it
  const jsonText = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  try {
    const parsed = JSON.parse(jsonText) as ParsedEvent;
    // Ensure required fields have fallbacks
    return {
      name: parsed.name || 'Unknown Event',
      description: parsed.description || '',
      start_at: parsed.start_at || null,
      end_at: parsed.end_at || null,
      venue: parsed.venue || null,
      venue_address: parsed.venue_address || null,
      organizer: parsed.organizer || null,
      sponsors: Array.isArray(parsed.sponsors) ? parsed.sponsors : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      url: parsed.url || sourceUrl,
      cover_image_url: parsed.cover_image_url || null,
      ai_score: typeof parsed.ai_score === 'number' ? Math.min(100, Math.max(0, parsed.ai_score)) : 50,
      ai_reasoning: parsed.ai_reasoning || '',
    };
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonText.slice(0, 200)}`);
  }
}
