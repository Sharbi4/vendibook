import 'dotenv/config';

import {
  bootstrapListingsTable,
  bootstrapUsersTable,
  bootstrapUserVerificationsTable,
  bootstrapUserSettingsTable,
  bootstrapUserSocialLinksTable,
  bootstrapUserPayoutAccountsTable,
  bootstrapUserMetricsTable
} from './src/api/db.js';

const bootstraps = [
  { fn: bootstrapListingsTable, label: 'Listings table ensured' },
  { fn: bootstrapUsersTable, label: 'Users table ensured' },
  { fn: bootstrapUserVerificationsTable, label: 'User verifications table ensured' },
  { fn: bootstrapUserSettingsTable, label: 'User settings table ensured' },
  { fn: bootstrapUserSocialLinksTable, label: 'User social links table ensured' },
  { fn: bootstrapUserPayoutAccountsTable, label: 'User payout accounts table ensured' },
  { fn: bootstrapUserMetricsTable, label: 'User metrics table ensured' }
];

(async () => {
  try {
    for (const { fn, label } of bootstraps) {
      await fn();
      console.log(label);
    }
    console.log('All Vendibook tables ensured successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to bootstrap tables:', error);
    process.exit(1);
  }
})();
