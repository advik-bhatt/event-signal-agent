import type { ParsedEvent } from './parse-event';

// Lazy-initialise the Neon client only when DATABASE_URL is available
let _sql: ReturnType<typeof import('@neondatabase/serverless').neon> | null = null;

function getSql() {
  if (_sql) return _sql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }

  try {
    // Dynamic require so the module doesn't crash when the package isn't installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require('@neondatabase/serverless') as typeof import('@neondatabase/serverless');
    _sql = neon(url);
    return _sql;
  } catch {
    console.warn('[db] @neondatabase/serverless not available');
    return null;
  }
}

export { getSql as sql };

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DbEvent {
  id: string;
  source: string;
  external_id: string | null;
  name: string;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  venue: string | null;
  venue_address: string | null;
  lat: number | null;
  lng: number | null;
  url: string | null;
  cover_image_url: string | null;
  organizer: string | null;
  sponsors: Array<{ name: string; url?: string; description?: string }>;
  tags: string[];
  ai_score: number;
  ai_reasoning: string | null;
  created_at: string;
}

export interface DbUserEvent {
  id: string;
  user_id: string;
  event_id: string;
  workspace_id: string | null;
  status: string;
  personal_score: number | null;
  created_at: string;
}

export interface DbWorkspace {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

export async function getEvents(limit = 50): Promise<DbEvent[]> {
  const db = getSql();
  if (!db) {
    console.warn('[db] DATABASE_URL not set — returning empty events');
    return [];
  }

  try {
    const rows = await db`
      SELECT * FROM events
      ORDER BY start_at ASC NULLS LAST
      LIMIT ${limit}
    `;
    return rows as unknown as DbEvent[];
  } catch (err) {
    console.error('[db] getEvents error:', err);
    return [];
  }
}

export async function saveEvent(
  data: ParsedEvent,
  source = 'manual'
): Promise<{ id: string } | { error: string }> {
  const db = getSql();
  if (!db) {
    return { error: 'Database not configured' };
  }

  try {
    const rows = await db`
      INSERT INTO events (
        source, name, description, start_at, end_at,
        venue, venue_address, url, cover_image_url,
        organizer, sponsors, tags, ai_score, ai_reasoning
      ) VALUES (
        ${source},
        ${data.name},
        ${data.description || null},
        ${data.start_at || null},
        ${data.end_at || null},
        ${data.venue || null},
        ${data.venue_address || null},
        ${data.url || null},
        ${data.cover_image_url || null},
        ${data.organizer || null},
        ${JSON.stringify(data.sponsors || [])}::jsonb,
        ${data.tags || []}::text[],
        ${data.ai_score ?? 50},
        ${data.ai_reasoning || null}
      )
      ON CONFLICT (source, external_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        start_at = EXCLUDED.start_at,
        end_at = EXCLUDED.end_at,
        venue = EXCLUDED.venue,
        venue_address = EXCLUDED.venue_address,
        url = EXCLUDED.url,
        cover_image_url = EXCLUDED.cover_image_url,
        organizer = EXCLUDED.organizer,
        sponsors = EXCLUDED.sponsors,
        tags = EXCLUDED.tags,
        ai_score = EXCLUDED.ai_score,
        ai_reasoning = EXCLUDED.ai_reasoning
      RETURNING id
    `;

    const id = (rows as Array<{ id: string }>)[0]?.id;
    if (!id) return { error: 'Insert returned no id' };
    return { id };
  } catch (err) {
    console.error('[db] saveEvent error:', err);
    return { error: String(err) };
  }
}

export async function getUserEvents(userId: string): Promise<(DbEvent & { status: string })[]> {
  const db = getSql();
  if (!db) {
    console.warn('[db] DATABASE_URL not set — returning empty user events');
    return [];
  }

  try {
    const rows = await db`
      SELECT e.*, ue.status
      FROM events e
      JOIN user_events ue ON ue.event_id = e.id
      WHERE ue.user_id = ${userId}
      ORDER BY e.start_at ASC NULLS LAST
    `;
    return rows as unknown as (DbEvent & { status: string })[];
  } catch (err) {
    console.error('[db] getUserEvents error:', err);
    return [];
  }
}

export async function saveUserEvent(
  userId: string,
  eventId: string,
  status = 'saved'
): Promise<{ id: string } | { error: string }> {
  const db = getSql();
  if (!db) return { error: 'Database not configured' };

  try {
    const rows = await db`
      INSERT INTO user_events (user_id, event_id, status)
      VALUES (${userId}, ${eventId}, ${status})
      ON CONFLICT (user_id, event_id) DO UPDATE SET status = EXCLUDED.status
      RETURNING id
    `;
    const id = (rows as Array<{ id: string }>)[0]?.id;
    if (!id) return { error: 'Insert returned no id' };
    return { id };
  } catch (err) {
    console.error('[db] saveUserEvent error:', err);
    return { error: String(err) };
  }
}

export async function createWorkspace(
  name: string,
  createdBy: string
): Promise<DbWorkspace | { error: string }> {
  const db = getSql();
  if (!db) return { error: 'Database not configured' };

  try {
    const rows = await db`
      INSERT INTO workspaces (name, created_by)
      VALUES (${name}, ${createdBy})
      RETURNING *
    `;
    return (rows as unknown as DbWorkspace[])[0];
  } catch (err) {
    console.error('[db] createWorkspace error:', err);
    return { error: String(err) };
  }
}

export async function getWorkspaceByInviteCode(
  code: string
): Promise<DbWorkspace | null> {
  const db = getSql();
  if (!db) return null;

  try {
    const rows = await db`
      SELECT * FROM workspaces WHERE invite_code = ${code} LIMIT 1
    `;
    return ((rows as unknown as DbWorkspace[])[0]) ?? null;
  } catch (err) {
    console.error('[db] getWorkspaceByInviteCode error:', err);
    return null;
  }
}

export async function joinWorkspace(
  workspaceId: string,
  userId: string
): Promise<{ success: boolean } | { error: string }> {
  const db = getSql();
  if (!db) return { error: 'Database not configured' };

  try {
    await db`
      INSERT INTO workspace_members (workspace_id, user_id)
      VALUES (${workspaceId}, ${userId})
      ON CONFLICT (workspace_id, user_id) DO NOTHING
    `;
    return { success: true };
  } catch (err) {
    console.error('[db] joinWorkspace error:', err);
    return { error: String(err) };
  }
}
