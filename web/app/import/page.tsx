'use client';

import { useState, useTransition, useRef } from 'react';
import { importEvent, saveEventAction } from './actions';
import type { ParsedEvent } from '@/lib/parse-event';

// ─── Helpers ────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#2d6a2d';
  if (score >= 60) return '#5a7a5a';
  if (score >= 40) return '#b8860b';
  if (score >= 20) return '#cc6600';
  return '#8b2020';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Highly relevant';
  if (score >= 60) return 'Relevant';
  if (score >= 40) return 'Neutral';
  if (score >= 20) return 'Low relevance';
  return 'Not relevant';
}

function formatDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImportPage() {
  const [url, setUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [event, setEvent] = useState<ParsedEvent | null>(null);

  // Editable form state (mirrors ParsedEvent)
  const [form, setForm] = useState<ParsedEvent | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaveMsg(null);
    setEvent(null);
    setForm(null);

    startTransition(async () => {
      const result = await importEvent(url.trim());
      if ('error' in result) {
        setError(result.error);
      } else {
        setEvent(result);
        setForm(result);
      }
    });
  }

  function updateForm(patch: Partial<ParsedEvent>) {
    setForm((prev) => prev ? { ...prev, ...patch } : prev);
  }

  function handleSave() {
    if (!form) return;
    setSaveMsg(null);
    setError(null);

    startSaving(async () => {
      const result = await saveEventAction(form, 'dev-user');
      if ('error' in result) {
        if (result.error === 'Database not configured') {
          setSaveMsg('Database not configured — event data shown above but not persisted.');
        } else {
          setError(result.error);
        }
      } else {
        // Redirect to calendar
        window.location.href = '/dashboard/calendar';
      }
    });
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="border-b border-muted-light/40 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-serif text-xl text-charcoal tracking-tight hover:opacity-70 transition-opacity">
          breathe
        </a>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-muted hover:text-charcoal transition-colors">
            Dashboard
          </a>
          <a href="/dashboard/calendar" className="text-sm text-muted hover:text-charcoal transition-colors">
            Calendar
          </a>
        </div>
      </header>

      {/* Hero + import form */}
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-10">
        <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-3 tracking-tight">
          Add an event
        </h1>
        <p className="text-muted text-lg mb-10 leading-relaxed">
          Paste any Luma, Partiful, Eventbrite, or Meetup link and we&apos;ll extract the details and score it for you.
        </p>

        <form onSubmit={handleImport} className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://lu.ma/your-event"
            required
            className="flex-1 px-4 py-3 bg-white border border-muted-light/60 rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
          />
          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="px-6 py-3 bg-sage text-white rounded-xl font-medium text-sm hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isPending ? 'Importing…' : 'Import'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {isPending && (
          <div className="mt-8 flex items-center gap-3 text-muted text-sm">
            <div className="w-4 h-4 border-2 border-sage/40 border-t-sage rounded-full animate-spin" />
            Scraping page and extracting event data…
          </div>
        )}
      </section>

      {/* Parsed event form */}
      {form && event && (
        <section className="max-w-2xl mx-auto px-6 pb-20">
          <div className="border-t border-muted-light/40 pt-10">
            <div className="flex items-start justify-between mb-8">
              <h2 className="font-serif text-2xl text-charcoal">Event details</h2>
              {/* AI Score badge */}
              <div className="flex flex-col items-end gap-1">
                <span
                  className="px-3 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: scoreColor(form.ai_score) }}
                >
                  {form.ai_score}/100
                </span>
                <span className="text-xs text-muted">{scoreLabel(form.ai_score)}</span>
              </div>
            </div>

            {/* AI reasoning */}
            {form.ai_reasoning && (
              <div className="mb-6 px-4 py-3 bg-sage/5 border border-sage/20 rounded-xl text-sm text-charcoal/70 leading-relaxed">
                <span className="font-medium text-charcoal/90">AI note: </span>
                {form.ai_reasoning}
              </div>
            )}

            <form ref={formRef} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                  Event name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                    Start
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(form.start_at)}
                    onChange={(e) => updateForm({ start_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                    End
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(form.end_at)}
                    onChange={(e) => updateForm({ end_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                  />
                </div>
              </div>

              {/* Venue */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={form.venue ?? ''}
                    onChange={(e) => updateForm({ venue: e.target.value || null })}
                    placeholder="Venue name"
                    className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.venue_address ?? ''}
                    onChange={(e) => updateForm({ venue_address: e.target.value || null })}
                    placeholder="Full address"
                    className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                  />
                </div>
              </div>

              {/* Organizer */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                  Organizer
                </label>
                <input
                  type="text"
                  value={form.organizer ?? ''}
                  onChange={(e) => updateForm({ organizer: e.target.value || null })}
                  placeholder="Organizer name"
                  className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm resize-none leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-sage/10 border border-sage/20 rounded-full text-xs text-sage-dark font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => updateForm({ tags: form.tags.filter((_, j) => j !== i) })}
                        className="ml-0.5 text-sage/60 hover:text-sage-dark transition-colors text-xs leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tag and press Enter"
                  className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.currentTarget.value || '').trim();
                      if (val && !form.tags.includes(val)) {
                        updateForm({ tags: [...form.tags, val] });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>

              {/* Sponsors */}
              {form.sponsors.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                    Sponsors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.sponsors.map((sponsor, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber/10 border border-amber/20 rounded-full text-xs text-charcoal font-medium"
                      >
                        {sponsor.url ? (
                          <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {sponsor.name}
                          </a>
                        ) : (
                          sponsor.name
                        )}
                        <button
                          type="button"
                          onClick={() => updateForm({ sponsors: form.sponsors.filter((_, j) => j !== i) })}
                          className="ml-0.5 text-charcoal/40 hover:text-charcoal transition-colors text-xs leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                  Event URL
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => updateForm({ url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-muted-light/60 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage/60 transition text-sm"
                />
              </div>

              {/* Save message */}
              {saveMsg && (
                <div className="px-4 py-3 bg-amber/10 border border-amber/30 rounded-lg text-sm text-charcoal/80">
                  {saveMsg}
                </div>
              )}

              {/* Save button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3.5 bg-sage text-white rounded-xl font-medium text-sm hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving…' : 'Save to Breathe'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
