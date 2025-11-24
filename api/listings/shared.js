import { sql, bootstrapListingsTable } from '../../src/api/db.js';

let hostColumnPromise;

export function ensureListingsBootstrap() {
  return bootstrapListingsTable();
}

export async function resolveHostColumnName() {
  if (!hostColumnPromise) {
    hostColumnPromise = (async () => {
      const preferredColumns = ['host_id', 'host_user_id', 'owner_id', 'user_id'];
      const rows = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'listings';
      `;

      const column = preferredColumns.find((name) => rows.some((row) => row.column_name === name)) || null;
      return column;
    })().catch((error) => {
      hostColumnPromise = undefined;
      console.error('Failed to resolve host_id column for listings:', error);
      throw error;
    });
  }

  return hostColumnPromise;
}

export function attachHostId(listing, hostColumnName) {
  if (!listing) {
    return listing;
  }

  const hostId =
    listing.host_id ??
    listing.hostId ??
    (hostColumnName ? listing[hostColumnName] : undefined) ??
    listing.host_user_id ??
    listing.owner_id ??
    listing.user_id ??
    listing.ownerId ??
    listing.userId ??
    null;

  return {
    ...listing,
    host_id: hostId ?? null,
  };
}

export function toPublicListing(listing, hostColumnName) {
  const listingWithHost = attachHostId(listing, hostColumnName);
  if (!listingWithHost) {
    return listingWithHost;
  }

  const {
    full_street_address,
    postal_code,
    latitude,
    longitude,
    display_city,
    display_state,
    display_zone_label,
    service_zone_type,
    service_radius_miles,
    city,
    state,
    ...rest
  } = listingWithHost;

  const safeCity = display_city || city || null;
  const safeState = display_state || state || null;

  return {
    ...rest,
    city: safeCity,
    state: safeState,
    service_zone: {
      type: service_zone_type || 'radius',
      radius_miles:
        typeof service_radius_miles === 'number'
          ? service_radius_miles
          : service_radius_miles != null
            ? Number(service_radius_miles)
            : 15,
      label: display_zone_label || null,
    }
  };
}
