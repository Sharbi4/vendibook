export async function geocodeAddress(address) {
  const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
  if (!token) {
    throw new Error('Missing Mapbox public token. Set VITE_MAPBOX_PUBLIC_TOKEN.');
  }
  if (!address) {
    return null;
  }

  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`);
  url.searchParams.set('access_token', token);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Mapbox geocoding failed');
  }
  const data = await response.json();
  const center = data?.features?.[0]?.center;
  if (!Array.isArray(center) || center.length < 2) {
    return null;
  }
  return { lng: center[0], lat: center[1] };
}
