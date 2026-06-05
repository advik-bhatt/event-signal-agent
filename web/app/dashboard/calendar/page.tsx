'use client';

import { useState, useEffect } from 'react';
import type { ParsedEvent } from '@/lib/parse-event';
import { gcalLink } from '@/lib/gcal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent extends ParsedEvent {
  id: string;
  status?: string;
}

// ─── Seed data (fallback when DB empty or not configured) ─────────────────────

const SEED_EVENTS: CalendarEvent[] = [
  {
    id: 'seed-1',
    name: 'Lovable NY',
    description: 'Join Lovable for an evening of AI-powered product building, demos, and networking with NYC\'s top founders and developers. See what\'s possible when you build with AI as your co-pilot.',
    start_at: '2026-06-06T19:00:00-04:00',
    end_at: '2026-06-06T22:00:00-04:00',
    venue: 'TBA, NYC',
    venue_address: 'New York, NY',
    organizer: 'Lovable',
    sponsors: [{ name: 'Lovable', url: 'https://lovable.dev' }],
    tags: ['ai', 'dev-tools', 'networking', 'startup'],
    url: 'https://lovable.dev/events',
    cover_image_url: null,
    ai_score: 88,
    ai_reasoning: 'Directly relevant — AI dev tools event with top-tier NYC startup crowd. High networking value for anyone building or investing in AI products.',
    status: 'saved',
  },
  {
    id: 'seed-2',
    name: 'NYC AI & Founders Dinner',
    description: 'An intimate curated dinner for founders, operators, and investors working at the frontier of AI. 30 seats only — application required.',
    start_at: '2026-06-09T18:30:00-04:00',
    end_at: '2026-06-09T21:30:00-04:00',
    venue: 'Gramercy Tavern',
    venue_address: '42 E 20th St, New York, NY 10003',
    organizer: 'Sequoia Arc',
    sponsors: [{ name: 'Sequoia Capital', url: 'https://sequoiacap.com' }],
    tags: ['ai', 'founders', 'networking', 'dinner'],
    url: 'https://example.com/nyc-ai-dinner',
    cover_image_url: null,
    ai_score: 82,
    ai_reasoning: 'High-value intimate networking event for AI founders. Application-only format signals quality attendees.',
    status: 'saved',
  },
  {
    id: 'seed-3',
    name: 'Dev Tools Summit 2026',
    description: 'Full-day conference featuring talks from the teams behind Cursor, Linear, Vercel, Neon, and more. Deep dives into developer experience, AI coding assistants, and the future of software tooling.',
    start_at: '2026-06-11T09:00:00-04:00',
    end_at: '2026-06-11T18:00:00-04:00',
    venue: 'Spring Studios',
    venue_address: '6 St Johns Ln, New York, NY 10013',
    organizer: 'DevEx NYC',
    sponsors: [
      { name: 'Vercel', url: 'https://vercel.com' },
      { name: 'Neon', url: 'https://neon.tech' },
      { name: 'Linear', url: 'https://linear.app' },
    ],
    tags: ['dev-tools', 'conference', 'ai', 'engineering'],
    url: 'https://example.com/devtools-summit',
    cover_image_url: null,
    ai_score: 91,
    ai_reasoning: 'Extremely relevant — full day of dev tools content with top-tier speakers. Vercel/Neon/Linear sponsorship signals excellent technical audience.',
    status: 'saved',
  },
  {
    id: 'seed-4',
    name: 'NYC Tech Mixer',
    description: 'Monthly casual networking for NYC startup ecosystem. Great for meeting co-founders, early employees, and seed investors. No agenda — just good conversation.',
    start_at: '2026-06-12T18:00:00-04:00',
    end_at: '2026-06-12T20:30:00-04:00',
    venue: 'WeWork Bryant Park',
    venue_address: '25 W 39th St, New York, NY 10018',
    organizer: 'NYC Tech Events',
    sponsors: [],
    tags: ['networking', 'startup', 'founders'],
    url: 'https://example.com/startup-grind-nyc',
    cover_image_url: null,
    ai_score: 63,
    ai_reasoning: 'Solid general startup networking event. Good for building broad relationships but less focused on AI/dev tools specifically.',
    status: 'saved',
  },
];

// ─── Color helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#2d6a2d';
  if (score >= 60) return '#5a7a5a';
  if (score >= 40) return '#b8860b';
  if (score >= 20) return '#cc6600';
  return '#8b2020';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'rgba(45,106,45,0.12)';
  if (score >= 60) return 'rgba(90,122,90,0.12)';
  if (score >= 40) return 'rgba(184,134,11,0.12)';
  if (score >= 20) return 'rgba(204,102,0,0.12)';
  return 'rgba(139,32,32,0.12)';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Must go';
  if (score >= 60) return 'Worth it';
  if (score >= 40) return 'Maybe';
  if (score >= 20) return 'Skip?';
  return 'Pass';
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const m = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const s = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${m} – ${s}`;
}

function formatTime(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return ''; }
}

function formatFullDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

// Returns event top offset % and height % within the time grid (8am – midnight = 16 hours)
const GRID_START_HOUR = 8;
const GRID_END_HOUR = 24;
const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR;

function eventPosition(event: CalendarEvent): { top: number; height: number } | null {
  if (!event.start_at) return null;
  const start = new Date(event.start_at);
  const startHour = start.getHours() + start.getMinutes() / 60;
  if (startHour < GRID_START_HOUR || startHour >= GRID_END_HOUR) return null;

  const endDate = event.end_at ? new Date(event.end_at) : new Date(start.getTime() + 90 * 60 * 1000);
  const endHour = Math.min(endDate.getHours() + endDate.getMinutes() / 60, GRID_END_HOUR);

  const top = ((startHour - GRID_START_HOUR) / GRID_HOURS) * 100;
  const height = Math.max(((endHour - startHour) / GRID_HOURS) * 100, 2);
  return { top, height };
}

// ─── iCal download helper ─────────────────────────────────────────────────────

function generateIcs(event: CalendarEvent): void {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const start = event.start_at ? fmt(new Date(event.start_at)) : fmt(new Date());
  const end = event.end_at
    ? fmt(new Date(event.end_at))
    : fmt(new Date(new Date(event.start_at || Date.now()).getTime() + 2 * 3600 * 1000));

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Breathe//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@breathe.app`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.name.replace(/,/g, '\\,')}`,
    event.venue ? `LOCATION:${event.venue.replace(/,/g, '\\,')}` : '',
    event.description ? `DESCRIPTION:${event.description.slice(0, 500).replace(/\n/g, '\\n').replace(/,/g, '\\,')}` : '',
    event.url ? `URL:${event.url}` : '',
    `X-APPLE-CALENDAR-COLOR:${scoreColor(event.ai_score)}`,
    event.tags.length ? `CATEGORIES:${event.tags.join(',')}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.name.replace(/\s+/g, '-').toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Time labels ──────────────────────────────────────────────────────────────

const TIME_LABELS: string[] = [];
for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) {
  if (h === 24) { TIME_LABELS.push('12am'); break; }
  if (h === 12) { TIME_LABELS.push('12pm'); continue; }
  TIME_LABELS.push(h < 12 ? `${h}am` : `${h - 12}pm`);
}

// ─── EventDetailPanel ─────────────────────────────────────────────────────────

function EventDetailPanel({
  event,
  onClose,
  onMarkAttending,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onMarkAttending: (id: string) => void;
}) {
  const [attending, setAttending] = useState(event.status === 'attending');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-paper border-l border-muted-light/50 shadow-2xl flex flex-col overflow-y-auto animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-muted-light/40">
          <div className="flex-1 pr-4">
            <h2 className="font-serif text-2xl text-charcoal leading-tight mb-2">
              {event.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: scoreColor(event.ai_score) }}
              >
                {event.ai_score}/100
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ color: scoreColor(event.ai_score), backgroundColor: scoreBg(event.ai_score) }}
              >
                {scoreLabel(event.ai_score)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted-light/30 transition-colors text-muted shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Date & time */}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 text-muted shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-charcoal">
                {formatFullDate(event.start_at)}
              </div>
              <div className="text-sm text-muted mt-0.5">
                {formatTime(event.start_at)}
                {event.end_at && ` – ${formatTime(event.end_at)}`}
              </div>
            </div>
          </div>

          {/* Venue */}
          {(event.venue || event.venue_address) && (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5 text-muted shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                {event.venue && <div className="text-sm font-medium text-charcoal">{event.venue}</div>}
                {event.venue_address && <div className="text-sm text-muted mt-0.5">{event.venue_address}</div>}
              </div>
            </div>
          )}

          {/* Organizer */}
          {event.organizer && (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5 text-muted shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
              </div>
              <div className="text-sm text-charcoal">{event.organizer}</div>
            </div>
          )}

          {/* AI reasoning */}
          {event.ai_reasoning && (
            <div
              className="px-4 py-3 rounded-xl text-sm leading-relaxed"
              style={{ backgroundColor: scoreBg(event.ai_score), color: '#1a1814' }}
            >
              <span className="font-semibold" style={{ color: scoreColor(event.ai_score) }}>
                Why this score:{' '}
              </span>
              {event.ai_reasoning}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">About</h3>
              <p className="text-sm text-charcoal/80 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Sponsors */}
          {event.sponsors.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Sponsors</h3>
              <div className="flex flex-wrap gap-2">
                {event.sponsors.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-muted-light/60 rounded-lg text-xs font-medium text-charcoal">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-sage">
                        {s.name}
                      </a>
                    ) : s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-sage/8 border border-sage/15 rounded-full text-xs text-sage-dark">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="p-6 border-t border-muted-light/40 space-y-3">
          {/* Mark attending */}
          <button
            onClick={() => {
              setAttending(true);
              onMarkAttending(event.id);
            }}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
              attending
                ? 'bg-sage/20 text-sage-dark border border-sage/30 cursor-default'
                : 'bg-sage text-white hover:bg-sage-dark'
            }`}
            disabled={attending}
          >
            {attending ? '✓ Attending' : 'Mark attending'}
          </button>

          {/* GCal */}
          <a
            href={gcalLink(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 text-center bg-white border border-muted-light/60 text-charcoal rounded-xl font-medium text-sm hover:bg-paper hover:border-sage/40 transition-all"
          >
            Add to Google Calendar
          </a>

          {/* iCal */}
          <button
            onClick={() => generateIcs(event)}
            className="w-full py-3 bg-white border border-muted-light/60 text-charcoal rounded-xl font-medium text-sm hover:bg-paper hover:border-sage/40 transition-all"
          >
            Add to Apple Calendar (.ics)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Calendar Page ────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(SEED_EVENTS);
  const [attendingIds, setAttendingIds] = useState<Set<string>>(new Set());

  // In a real app we'd fetch from DB here; for now always use seed data
  useEffect(() => {
    setEvents(SEED_EVENTS);
  }, []);

  const days =
    viewMode === 'week'
      ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      : [selectedDay];

  function eventsForDay(day: Date): CalendarEvent[] {
    return events.filter((e) => {
      if (!e.start_at) return false;
      return isSameDay(new Date(e.start_at), day);
    });
  }

  function prevPeriod() {
    if (viewMode === 'week') {
      setWeekStart((d) => addDays(d, -7));
    } else {
      setSelectedDay((d) => addDays(d, -1));
    }
  }

  function nextPeriod() {
    if (viewMode === 'week') {
      setWeekStart((d) => addDays(d, 7));
    } else {
      setSelectedDay((d) => addDays(d, 1));
    }
  }

  function goToToday() {
    const today = new Date();
    setWeekStart(getMondayOf(today));
    setSelectedDay(today);
  }

  const headerLabel = viewMode === 'week'
    ? formatWeekRange(weekStart)
    : formatFullDate(selectedDay.toISOString());

  const today = new Date();

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Nav */}
      <header className="border-b border-muted-light/40 px-6 py-4 flex items-center justify-between shrink-0">
        <a href="/" className="font-serif text-xl text-charcoal tracking-tight hover:opacity-70 transition-opacity">
          breathe
        </a>
        <nav className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-muted hover:text-charcoal transition-colors">
            Dashboard
          </a>
          <a
            href="/import"
            className="px-4 py-2 bg-sage text-white rounded-lg text-sm font-medium hover:bg-sage-dark transition-colors"
          >
            + Import event
          </a>
        </nav>
      </header>

      {/* Calendar toolbar */}
      <div className="border-b border-muted-light/40 px-6 py-3 flex items-center justify-between shrink-0">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevPeriod}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted-light/30 transition-colors text-muted hover:text-charcoal"
          >
            ‹
          </button>
          <button
            onClick={nextPeriod}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted-light/30 transition-colors text-muted hover:text-charcoal"
          >
            ›
          </button>
          <h2 className="font-serif text-lg text-charcoal">{headerLabel}</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs border border-muted-light/60 rounded-md hover:bg-muted-light/20 transition-colors text-muted hover:text-charcoal"
          >
            Today
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted-light/20 rounded-lg p-1">
          {(['week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode);
                if (mode === 'day') setSelectedDay(new Date());
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                viewMode === mode
                  ? 'bg-white shadow-sm text-charcoal'
                  : 'text-muted hover:text-charcoal'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Time gutter */}
        <div className="w-16 shrink-0 border-r border-muted-light/30 pt-10">
          {TIME_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-right pr-3 text-xs text-muted leading-none"
              style={{ height: `${100 / GRID_HOURS}%`, minHeight: '48px' }}
            >
              {i < GRID_HOURS ? label : ''}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className={`flex-1 flex overflow-x-auto overflow-y-auto`}>
          {/* Day header row */}
          <div className="flex flex-col flex-1">
            {/* Header */}
            <div className={`flex shrink-0 border-b border-muted-light/30`}>
              {days.map((day, i) => {
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={i}
                    className={`flex-1 text-center py-2 cursor-pointer hover:bg-muted-light/10 transition-colors ${
                      viewMode === 'day' ? 'border-0' : ''
                    }`}
                    onClick={() => {
                      setSelectedDay(day);
                      if (viewMode === 'week') setViewMode('day');
                    }}
                  >
                    <div className="text-xs text-muted uppercase tracking-wider">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div
                      className={`font-serif text-lg leading-none mt-1 mx-auto w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                        isToday ? 'bg-sage text-white' : 'text-charcoal hover:bg-muted-light/30'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-muted mt-1 h-4">
                      {eventsForDay(day).length > 0 && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid body */}
            <div className="flex flex-1 relative overflow-y-auto">
              {days.map((day, colIdx) => {
                const dayEvents = eventsForDay(day);
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={colIdx}
                    className={`flex-1 relative border-r border-muted-light/20 last:border-r-0 ${
                      isToday ? 'bg-sage/2' : ''
                    }`}
                    style={{ minHeight: `${GRID_HOURS * 48}px` }}
                  >
                    {/* Hour lines */}
                    {Array.from({ length: GRID_HOURS }).map((_, h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-muted-light/20"
                        style={{ top: `${(h / GRID_HOURS) * 100}%`, height: `${100 / GRID_HOURS}%` }}
                      />
                    ))}

                    {/* Today indicator */}
                    {isToday && (() => {
                      const now = new Date();
                      const nowHour = now.getHours() + now.getMinutes() / 60;
                      if (nowHour >= GRID_START_HOUR && nowHour < GRID_END_HOUR) {
                        const top = ((nowHour - GRID_START_HOUR) / GRID_HOURS) * 100;
                        return (
                          <div
                            className="absolute left-0 right-0 z-10 pointer-events-none"
                            style={{ top: `${top}%` }}
                          >
                            <div className="w-2 h-2 rounded-full bg-sage absolute -left-1 -translate-y-1/2" />
                            <div className="border-t-2 border-sage" />
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Events */}
                    {dayEvents.map((event) => {
                      const pos = eventPosition(event);
                      if (!pos) return null;
                      const color = scoreColor(event.ai_score);
                      const bg = scoreBg(event.ai_score);
                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="absolute left-1 right-1 rounded-lg px-2 py-1 text-left overflow-hidden hover:opacity-90 transition-opacity shadow-sm border cursor-pointer z-20"
                          style={{
                            top: `${pos.top}%`,
                            height: `${pos.height}%`,
                            backgroundColor: bg,
                            borderColor: color + '40',
                          }}
                        >
                          <div className="text-xs font-semibold leading-tight truncate" style={{ color }}>
                            {event.name}
                          </div>
                          {pos.height > 5 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs font-bold px-1.5 py-0 rounded-full text-white text-[10px]"
                                style={{ backgroundColor: color }}>
                                {event.ai_score}
                              </span>
                              {formatTime(event.start_at) && (
                                <span className="text-[10px] text-charcoal/50 truncate">
                                  {formatTime(event.start_at)}
                                </span>
                              )}
                            </div>
                          )}
                          {pos.height > 8 && event.venue && (
                            <div className="text-[10px] text-charcoal/50 truncate mt-0.5">
                              {event.venue}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-muted text-lg font-serif">No events yet</p>
            <p className="text-sm text-muted/70 mt-1">Import an event to get started</p>
          </div>
        </div>
      )}

      {/* Score legend */}
      <div className="border-t border-muted-light/30 px-6 py-3 flex items-center gap-6 shrink-0 bg-paper">
        <span className="text-xs text-muted uppercase tracking-wider">Relevance:</span>
        {[
          { label: 'Must go (80+)', color: '#2d6a2d' },
          { label: 'Worth it (60+)', color: '#5a7a5a' },
          { label: 'Maybe (40+)', color: '#b8860b' },
          { label: 'Skip? (20+)', color: '#cc6600' },
          { label: 'Pass (<20)', color: '#8b2020' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selectedEvent && (
        <EventDetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onMarkAttending={(id) => {
            setAttendingIds((s) => new Set([...s, id]));
            setEvents((prev) =>
              prev.map((e) => e.id === id ? { ...e, status: 'attending' } : e)
            );
          }}
        />
      )}
    </div>
  );
}
