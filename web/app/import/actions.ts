'use server';

import { scrapeUrl } from '@/lib/scrape';
import { parseEventFromMarkdown, type ParsedEvent } from '@/lib/parse-event';
import { saveEvent as dbSaveEvent } from '@/lib/db';

export async function importEvent(
  url: string
): Promise<ParsedEvent | { error: string }> {
  if (!url || !url.startsWith('http')) {
    return { error: 'Please provide a valid URL starting with http:// or https://' };
  }

  try {
    const markdown = await scrapeUrl(url);
    const parsed = await parseEventFromMarkdown(markdown, url);
    return parsed;
  } catch (err) {
    console.error('[importEvent]', err);
    return { error: String(err) };
  }
}

export async function saveEventAction(
  data: ParsedEvent,
  userId: string
): Promise<{ id: string } | { error: string }> {
  try {
    const result = await dbSaveEvent(data, 'manual');
    return result;
  } catch (err) {
    console.error('[saveEventAction]', err);
    return { error: String(err) };
  }
}
