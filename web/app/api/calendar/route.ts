import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/db';

// ─── iCal formatting helpers ─────────────────────────────────────────────────

function fmtDt(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  } catch {
    return null;
  }
}

function escapeIcal(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldLine(line: string): string {
  // RFC 5545: fold lines longer than 75 octets
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (i === 0) {
      chunks.push(line.slice(0, 75));
      i = 75;
    } else {
      chunks.push(' ' + line.slice(i, i + 74));
      i += 74;
    }
  }
  return chunks.join('\r\n');
}

function scoreColor(score: number): string {
  if (score >= 80) return '#2D6A2D';
  if (score >= 60) return '#5A7A5A';
  if (score >= 40) return '#B8860B';
  if (score >= 20) return '#CC6600';
  return '#8B2020';
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  const events = await getEvents(200);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Breathe//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Breathe Events',
    'X-WR-TIMEZONE:America/New_York',
  ];

  for (const ev of events) {
    const dtstart = fmtDt(ev.start_at);
    const dtend = ev.end_at
      ? fmtDt(ev.end_at)
      : dtstart
        ? fmtDt(new Date(new Date(ev.start_at!).getTime() + 2 * 3600 * 1000).toISOString())
        : null;

    if (!dtstart) continue;

    lines.push('BEGIN:VEVENT');
    lines.push(foldLine(`UID:${ev.id}@breathe.app`));
    lines.push(foldLine(`DTSTART:${dtstart}`));
    if (dtend) lines.push(foldLine(`DTEND:${dtend}`));
    lines.push(foldLine(`SUMMARY:${escapeIcal(ev.name)}`));

    if (ev.venue || ev.venue_address) {
      const loc = [ev.venue, ev.venue_address].filter(Boolean).join(', ');
      lines.push(foldLine(`LOCATION:${escapeIcal(loc)}`));
    }

    if (ev.description) {
      lines.push(foldLine(`DESCRIPTION:${escapeIcal(ev.description.slice(0, 1000))}`));
    }

    if (ev.url) {
      lines.push(foldLine(`URL:${ev.url}`));
    }

    if (ev.organizer) {
      lines.push(foldLine(`ORGANIZER;CN=${escapeIcal(ev.organizer)}:mailto:no-reply@breathe.app`));
    }

    if (ev.tags && ev.tags.length > 0) {
      lines.push(foldLine(`CATEGORIES:${ev.tags.map(escapeIcal).join(',')}`));
    }

    lines.push(foldLine(`X-APPLE-CALENDAR-COLOR:${scoreColor(ev.ai_score)}`));
    lines.push(foldLine(`X-MICROSOFT-CDO-IMPORTANCE:${ev.ai_score >= 80 ? 2 : ev.ai_score >= 60 ? 1 : 0}`));
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  const ical = lines.join('\r\n');

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="breathe-events.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
