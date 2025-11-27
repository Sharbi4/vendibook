const EARTH_RADIUS_MI = 3958.8;

export function haversineDistance(pointA, pointB) {
  if (!pointA || !pointB) return null;
  const lat1 = pointA.lat;
  const lon1 = pointA.lng;
  const lat2 = pointB.lat;
  const lon2 = pointB.lng;

  if (![lat1, lon1, lat2, lon2].every((value) => typeof value === 'number' && Number.isFinite(value))) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MI * c;
}
