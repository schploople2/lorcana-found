const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'lorcana-found/1.0 (lorcana event finder)';

function extractCity(address) {
  return address?.city || address?.town || address?.village || address?.municipality || '';
}

export async function handler(event) {
  const q = event.queryStringParameters?.q;
  if (!q || q.trim().length < 2) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' };
  }
  try {
    const url = `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    const raw = await res.json();
    const results = raw.map(item => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name,
      city: extractCity(item.address),
      state: item.address?.state ?? '',
      country: item.address?.country ?? '',
    }));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
      body: JSON.stringify(results),
    };
  } catch {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Geocoding failed' }) };
  }
}
