const BASE_LIST   = 'https://api.cloudflare.ravensburgerplay.com/hydraproxy/api/v2';
const BASE_DETAIL = 'https://api.ravensburgerplay.com/api/v2';
const UPSTREAM_HEADERS = {
  'Content-Type': 'application/json',
  'Referer': 'https://tcg.ravensburgerplay.com/',
  'User-Agent': 'Mozilla/5.0 (compatible; lorcana-found/1.0)',
};

export async function handler(event) {
  // Parse path: /api/events, /api/events/518090, /api/events/518090/registrations
  const pathParts = (event.path || '').split('/').filter(Boolean);
  const id = pathParts.length >= 3 ? pathParts[2] : null;
  const sub = pathParts.length >= 4 ? pathParts[3] : null;

  try {
    let url;

    if (id && sub === 'registrations') {
      const params = new URLSearchParams(event.queryStringParameters ?? {});
      if (!params.has('ordering')) params.set('ordering', 'final_place_in_standings');
      params.set('page_size', '200');
      url = `${BASE_DETAIL}/events/${id}/registrations/?${params}`;
    } else if (id) {
      url = `${BASE_DETAIL}/events/${id}/`;
    } else {
      const params = new URLSearchParams();
      const mv = event.multiValueQueryStringParameters ?? {};
      for (const [key, values] of Object.entries(mv)) {
        for (const val of values) {
          params.append(key, val);
        }
      }
      if (!params.has('game_slug')) params.set('game_slug', 'disney-lorcana');
      url = `${BASE_LIST}/events/?${params}`;
    }

    const res = await fetch(url, { headers: UPSTREAM_HEADERS });
    const data = await res.json();

    const cacheSeconds = (id && sub === 'registrations') ? 60
      : id ? 600
      : 180;

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheSeconds}`,
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Upstream request failed' }),
    };
  }
}
