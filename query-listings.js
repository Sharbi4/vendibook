import 'dotenv/config';
import { sql } from './src/api/db.js';

try {
  const rows = await sql`SELECT id, title, listing_type, created_at FROM listings ORDER BY created_at DESC LIMIT 10`;
  console.log(rows);
} catch (e) {
  console.error('Query failed:', e);
  process.exit(1);
}
