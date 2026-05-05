const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'lorcana-found/1.0 (lorcana event finder)';

function extractCity(address) {
  return address?.city || address?.town || address?.village || address?.municipality || '';
}

export async function handler(event) {
  const { type, q, lat, lon } = event.queryStringParameters ?? {};

  try {
    if (type === 'search') {
      if (!q || q.trim().length < 2) {
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' };
      }
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
    }

    if (type === 'reverse') {
      if (!lat || !lon) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'lat and lon required' }) };
      }
      const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      const item = await res.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          displayName: item.display_name,
          city: extractCity(item.address),
          state: item.address?.state ?? '',
          country: item.address?.country ?? '',
        }),
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'type must be search or reverse' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Geocoding failed' }),
    };
  }
}
