import { Router } from 'express';

const router = Router();
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'lorcana-found/1.0 (lorcana event finder; contact via github)';

interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
}

function extractCity(address: Record<string, string>): string {
  return address.city || address.town || address.village || address.municipality || '';
}

// GET /api/geocode/search?q=...
router.get('/search', async (req, res) => {
  const q = req.query.q as string;
  if (!q || q.trim().length < 2) return res.json([]);

  try {
    const url = `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
    const response = await fetch(url, { headers: { 'User-Agent': UA } });
    const raw = await response.json() as Array<Record<string, unknown>>;
    const results: GeoResult[] = raw.map((item) => {
      const addr = (item.address ?? {}) as Record<string, string>;
      return {
        lat: parseFloat(item.lat as string),
        lon: parseFloat(item.lon as string),
        displayName: item.display_name as string,
        city: extractCity(addr),
        state: addr.state ?? '',
        country: addr.country ?? '',
      };
    });
    res.json(results);
  } catch (err) {
    console.error('[geocode] search error:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// GET /api/geocode/reverse?lat=...&lon=...
router.get('/reverse', async (req, res) => {
  const { lat, lon } = req.query as { lat: string; lon: string };
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  try {
    const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const response = await fetch(url, { headers: { 'User-Agent': UA } });
    const item = await response.json() as Record<string, unknown>;
    const addr = (item.address ?? {}) as Record<string, string>;
    const result: GeoResult = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      displayName: item.display_name as string,
      city: extractCity(addr),
      state: addr.state ?? '',
      country: addr.country ?? '',
    };
    res.json(result);
  } catch (err) {
    console.error('[geocode] reverse error:', err);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

export default router;
