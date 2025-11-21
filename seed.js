import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

(async () => {
  try {
    const { sql, bootstrapListingsTable } = await import('./src/api/db.js');
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
