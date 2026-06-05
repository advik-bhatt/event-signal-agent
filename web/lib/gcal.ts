import type { ParsedEvent } from './parse-event';

export function gcalLink(event: ParsedEvent): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  const params = new URLSearchParams();
  params.set('text', event.name);

  if (event.start_at) {
    const start = new Date(event.start_at);
    const end = event.end_at
      ? new Date(event.end_at)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    // GCal format: YYYYMMDDTHHMMSSZ
    const fmt = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

    params.set('dates', `${fmt(start)}/${fmt(end)}`);
  }

  if (event.venue || event.venue_address) {
    params.set(
      'location',
      [event.venue, event.venue_address].filter(Boolean).join(', ')
    );
  }

  if (event.description) {
    params.set('details', event.description.slice(0, 1500));
  }

  if (event.url) {
    params.set('sprop', `website:${event.url}`);
  }

  return `${base}&${params.toString()}`;
}
