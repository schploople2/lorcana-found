import { Router } from 'express';

const router = Router();
const BASE_URL        = 'https://api.cloudflare.ravensburgerplay.com/hydraproxy/api/v2';
const BASE_URL_DETAIL = 'https://api.ravensburgerplay.com/api/v2';
const UPSTREAM_HEADERS = {
  'Content-Type': 'application/json',
  'Referer': 'https://tcg.ravensburgerplay.com/',
  'User-Agent': 'Mozilla/5.0 (compatible; lorcana-found/1.0)',
};

interface CacheEntry { data: unknown; expires: number }
const cache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

async function proxyGet(url: string, ttlMs = 5 * 60 * 1000): Promise<unknown> {
  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, { headers: UPSTREAM_HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Upstream ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  setCached(url, data, ttlMs);
  return data;
}

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const q = req.query as Record<string, string | string[]>;
    const params = new URLSearchParams({ game_slug: 'disney-lorcana' });

    const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

    params.set('page', str(q.page) ?? '1');
    params.set('page_size', str(q.page_size) ?? '100');

    if (str(q.latitude))    params.set('latitude',    str(q.latitude)!);
    if (str(q.longitude))   params.set('longitude',   str(q.longitude)!);
    if (str(q.num_miles))   params.set('num_miles',   str(q.num_miles)!);
    if (str(q.start_date_after))  params.set('start_date_after',  str(q.start_date_after)!);
    if (str(q.start_date_before)) params.set('start_date_before', str(q.start_date_before)!);
    if (str(q.template_id)) params.set('event_configuration_template_id', str(q.template_id)!);
    if (str(q.search))      params.set('search', str(q.search)!);

    const statuses = Array.isArray(q.display_statuses)
      ? q.display_statuses
      : q.display_statuses ? [q.display_statuses] : ['upcoming', 'inProgress'];
    statuses.forEach(s => params.append('display_statuses', s));

    const url = `${BASE_URL}/events/?${params}`;
    const data = await proxyGet(url, 3 * 60 * 1000);
    res.json(data);
  } catch (err) {
    console.error('[events] list error:', err);
    res.status(502).json({ error: 'Failed to fetch events from upstream' });
  }
});

// GET /api/events/quick-filters
router.get('/quick-filters', async (_req, res) => {
  try {
    const url = `${BASE_URL}/events/quick-filters/?game_slug=disney-lorcana`;
    const data = await proxyGet(url, 30 * 60 * 1000);
    res.json(data);
  } catch (err) {
    console.error('[events] quick-filters error:', err);
    res.status(502).json({ error: 'Failed to fetch filters' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const url = `${BASE_URL_DETAIL}/events/${req.params.id}/`;
    const data = await proxyGet(url, 10 * 60 * 1000);
    res.json(data);
  } catch (err) {
    console.error('[events] detail error:', err);
    res.status(502).json({ error: 'Failed to fetch event' });
  }
});

export default router;
