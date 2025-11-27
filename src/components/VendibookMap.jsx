import { memo, useEffect, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { resolveMapboxToken } from '../lib/mapboxClient';

const DEFAULT_CENTER = { lat: 33.4484, lng: -112.074 }; // Phoenix, AZ

function normalizeCoordinate(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (value === '' || value == null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function VendibookMap({
  center,
  zoom = 12,
  markers = [],
  activeMarkerId,
  onMarkerClick,
  className = '',
  children
}) {
  let token = null;
  try {
    token = resolveMapboxToken();
  } catch (error) {
    console.warn(error.message);
  }

  if (!token) {
    return (
      <div className={`flex h-full min-h-[320px] w-full items-center justify-center rounded-2xl border border-neutralMid bg-neutralLight p-6 text-center text-sm text-charcoal ${className}`}>
        Map preview unavailable. Add VITE_MAPBOX_PUBLIC_TOKEN to continue.
      </div>
    );
  }

  const resolvedCenter = {
    lat: normalizeCoordinate(center?.lat) ?? DEFAULT_CENTER.lat,
    lng: normalizeCoordinate(center?.lng) ?? DEFAULT_CENTER.lng
  };

  const [viewState, setViewState] = useState({
    latitude: resolvedCenter.lat,
    longitude: resolvedCenter.lng,
    zoom
  });

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude: resolvedCenter.lat,
      longitude: resolvedCenter.lng,
      zoom
    }));
  }, [resolvedCenter.lat, resolvedCenter.lng, zoom]);

  const mapMarkers = useMemo(
    () =>
      markers
        // TODO: ensure listings include latitude/longitude from address geocoding in backend.
        .filter((marker) => Number.isFinite(normalizeCoordinate(marker.lat)) && Number.isFinite(normalizeCoordinate(marker.lng)))
        .map((marker) => ({
          ...marker,
          lat: normalizeCoordinate(marker.lat),
          lng: normalizeCoordinate(marker.lng)
        })),
    [markers]
  );

  return (
    <div className={`w-full overflow-hidden rounded-2xl bg-white shadow-brand-soft ${className}`}>
      <Map
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        style={{ width: '100%', height: '100%', minHeight: '320px' }}
      >
        <NavigationControl position="top-left" showCompass={false} />
        {mapMarkers.map((marker) => {
          const isActive = activeMarkerId === marker.id;
          return (
            <Marker key={marker.id} latitude={marker.lat} longitude={marker.lng} anchor="bottom">
              <button
                type="button"
                onClick={() => onMarkerClick?.(marker.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow ${isActive ? 'border-orange bg-orange/10 text-orange' : 'border-orange/60 bg-white text-charcoal'}`}
              >
                {marker.price ? `$${marker.price}` : marker.title}
              </button>
            </Marker>
          );
        })}
        {children}
      </Map>
    </div>
  );
}

export default memo(VendibookMap);
