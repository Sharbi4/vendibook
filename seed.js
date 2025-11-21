import 'dotenv/config';
import { sql, bootstrapListingsTable } from './src/api/db.js';

(async () => {
  try {
    await bootstrapListingsTable();
    await sql`INSERT INTO listings (title, description, city, state, price, listing_type)
              VALUES ('Sample Listing', 'Demo data for testing', 'Tucson', 'AZ', 250, 'food-truck');`;
    console.log('Inserted sample listing');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding listings table:', err);
    process.exit(1);
  }
})();
