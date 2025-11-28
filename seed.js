import 'dotenv/config';
import { sql, bootstrapListingsTable } from './src/api/db.js';

const DEMO_MARKER = '[Demo Neon Tucson]';

const demoListings = [
  {
    title: 'Sonoran Sunrise Kitchen',
    description: `${DEMO_MARKER} Fully equipped 18ft food truck with dual fryers, flat-top, and cold prep ideal for breakfast burritos or Sonoran dogs.`,
    price: 285,
    default_start_time: '08:00',
    default_end_time: '20:00',
    display_zone_label: 'Central Tucson + 20 mi',
    service_radius_miles: 20,
    full_street_address: '245 S Avenida del Convento, Tucson, AZ',
    postal_code: '85745',
    latitude: 32.2191,
    longitude: -110.9893
  },
  {
    title: 'Barrio Tacos Express',
    description: `${DEMO_MARKER} Turnkey taco trailer with steam tables, 3-compartment sink, and branding wrap for neighborhood pop-ups.`,
    price: 240,
    default_start_time: '09:00',
    default_end_time: '22:00',
    display_zone_label: 'Barrio Viejo + 15 mi',
    service_radius_miles: 15,
    full_street_address: '500 S Meyer Ave, Tucson, AZ',
    postal_code: '85701',
    latitude: 32.2134,
    longitude: -110.9751
  },
  {
    title: 'Desert Bloom Vegan Trailer',
    description: `${DEMO_MARKER} 16ft vegan-friendly buildout with refrigerated prep, smoothie station, and chalkboard menu wall.`,
    price: 260,
    default_start_time: '07:00',
    default_end_time: '19:00',
    display_zone_label: 'University + Downtown corridor',
    service_radius_miles: 18,
    full_street_address: '1203 E University Blvd, Tucson, AZ',
    postal_code: '85719',
    latitude: 32.2328,
    longitude: -110.9516
  },
  {
    title: 'Santa Cruz BBQ Rig',
    description: `${DEMO_MARKER} Offset smoker trailer with 40lb hopper, handwashing station, and refrigerated storage for catering.`,
    price: 310,
    default_start_time: '06:00',
    default_end_time: '23:00',
    display_zone_label: 'South Tucson + 25 mi',
    service_radius_miles: 25,
    full_street_address: '1634 S 6th Ave, Tucson, AZ',
    postal_code: '85713',
    latitude: 32.2002,
    longitude: -110.9699
  },
  {
    title: 'Catalina Coffee Camper',
    description: `${DEMO_MARKER} Vintage camper conversion with dual espresso heads, nitro tap, and undercounter ice maker.`,
    price: 225,
    default_start_time: '05:30',
    default_end_time: '14:00',
    display_zone_label: 'Catalina Foothills circuit',
    service_radius_miles: 22,
    full_street_address: '2905 E Skyline Dr, Tucson, AZ',
    postal_code: '85718',
    latitude: 32.3256,
    longitude: -110.9253
  }
];

const sharedDefaults = {
  city: 'Tucson',
  state: 'AZ',
  listing_type: 'RENT',
  booking_mode: 'daily-with-time',
  service_zone_type: 'radius'
};

(async () => {
  try {
    await bootstrapListingsTable();

    const markerPattern = `%${DEMO_MARKER}%`;
    await sql`DELETE FROM listings WHERE description ILIKE ${markerPattern};`;

    for (const listing of demoListings) {
      const payload = { ...sharedDefaults, ...listing };
      await sql`
        INSERT INTO listings (
          title,
          description,
          city,
          state,
          price,
          listing_type,
          booking_mode,
          default_start_time,
          default_end_time,
          display_city,
          display_state,
          display_zone_label,
          service_zone_type,
          service_radius_miles,
          full_street_address,
          postal_code,
          latitude,
          longitude
        ) VALUES (
          ${payload.title},
          ${payload.description},
          ${payload.city},
          ${payload.state},
          ${payload.price},
          ${payload.listing_type},
          ${payload.booking_mode},
          ${payload.default_start_time},
          ${payload.default_end_time},
          ${payload.city},
          ${payload.state},
          ${payload.display_zone_label},
          ${payload.service_zone_type},
          ${payload.service_radius_miles},
          ${payload.full_street_address},
          ${payload.postal_code},
          ${payload.latitude},
          ${payload.longitude}
        );
      `;
    }

    console.log(`Inserted ${demoListings.length} Tucson demo listings`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding listings table:', err);
    process.exit(1);
  }
})();
