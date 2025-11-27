const MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

function getToken() {
  const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
  if (!token) {
    throw new Error('Missing Mapbox token. Set VITE_MAPBOX_PUBLIC_TOKEN in your environment.');
  }
  return token;
}

function normalizeFeature(feature) {
  if (!feature) return null;
  const [lng, lat] = Array.isArray(feature.center) ? feature.center : [null, null];
  const context = feature.context || [];

  const findContextValue = (prefix) => {
    const entry = context.find((item) => item.id?.startsWith(prefix));
    return entry?.text || entry?.properties?.short_code || null;
  };

  const city = feature.place_type?.includes('place') ? feature.text : findContextValue('place');
  const state = findContextValue('region') || feature.short_code || null;
  const country = findContextValue('country') || null;
  const regionAbbr = feature.context?.find((item) => item.id?.includes('region'))?.short_code?.split('-')[1];
  const fallbackState = regionAbbr ? regionAbbr.toUpperCase() : state;

  return {
    id: feature.id,
    placeName: feature.place_name,
    label: `${feature.text}${fallbackState ? `, ${fallbackState}` : ''}`,
    city: city || feature.text || null,
    state: fallbackState || null,
    country,
    lat: typeof lat === 'number' ? lat : lat != null ? Number(lat) : null,
    lng: typeof lng === 'number' ? lng : lng != null ? Number(lng) : null
  };
}

async function fetchMapbox(url, { signal } = {}) {
  const token = getToken();
  const requestUrl = new URL(url);
  requestUrl.searchParams.set('access_token', token);

  const response = await fetch(requestUrl.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Mapbox request failed (${response.status})`);
  }
  return response.json();
}

export async function geocodePlace(query, { proximity, limit = 5, signal, types } = {}) {
  if (!query || !query.trim()) {
    return [];
  }

  const url = new URL(`${MAPBOX_BASE_URL}/${encodeURIComponent(query)}.json`);
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 10)));
  url.searchParams.set('types', types || 'place,postcode,address,region,district,neighborhood');
  if (proximity && typeof proximity.lng === 'number' && typeof proximity.lat === 'number') {
    url.searchParams.set('proximity', `${proximity.lng},${proximity.lat}`);
  }

  try {
    const data = await fetchMapbox(url, { signal });
    return Array.isArray(data?.features)
      ? data.features.map(normalizeFeature).filter(Boolean)
      : [];
  } catch (error) {
    console.error('Mapbox geocodePlace error:', error);
    throw error;
  }
}

export async function reverseGeocode(lat, lng, { signal } = {}) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  const url = new URL(`${MAPBOX_BASE_URL}/${lng},${lat}.json`);
  url.searchParams.set('limit', '1');

  try {
    const data = await fetchMapbox(url, { signal });
    return normalizeFeature(data?.features?.[0]) || null;
  } catch (error) {
    console.error('Mapbox reverseGeocode error:', error);
    throw error;
  }
}

export function resolveMapboxToken() {
  return getToken();
}
