const BASE = 'https://api.cloudflare.ravensburgerplay.com/hydraproxy/api/v2';
const UPSTREAM_HEADERS = {
  'Content-Type': 'application/json',
  'Referer': 'https://tcg.ravensburgerplay.com/',
  'User-Agent': 'Mozilla/5.0 (compatible; lorcana-found/1.0)',
};

export async function handler(event) {
  const id = event.queryStringParameters?.id;

  try {
    let url;

    if (id) {
      // Single event detail
      url = `${BASE}/events/${id}/`;
    } else {
      // Event list — forward all query params, ensure multi-value display_statuses works
      const params = new URLSearchParams();
      const mv = event.multiValueQueryStringParameters ?? {};

      for (const [key, values] of Object.entries(mv)) {
        for (const val of values) {
          params.append(key, val);
        }
      }

      if (!params.has('game_slug')) params.set('game_slug', 'disney-lorcana');
      url = `${BASE}/events/?${params}`;
    }

    const res = await fetch(url, { headers: UPSTREAM_HEADERS });
    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': id ? 'public, max-age=600' : 'public, max-age=180',
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
