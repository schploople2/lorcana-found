const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'lorcana-found/1.0 (lorcana event finder)';

function extractCity(address) {
  return address?.city || address?.town || address?.village || address?.municipality || '';
}

export async function handler(event) {
  const { lat, lon } = event.queryStringParameters ?? {};
  if (!lat || !lon) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'lat and lon required' }) };
  }
  try {
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
        city: item.address?.city || item.address?.town || item.address?.village || '',
        state: item.address?.state ?? '',
        country: item.address?.country ?? '',
      }),
    };
  } catch {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Reverse geocoding failed' }) };
  }
}
