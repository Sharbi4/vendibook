import { Activity, BarChart3, Building2, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAdminSummary } from '../hooks/useAdminSummary.js';

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const METRIC_CONFIG = [
  {
    key: 'totalActiveListings',
    label: 'Total active listings',
    icon: Building2,
    formatter: (value) => formatter.format(value)
  },
  {
    key: 'bookingsLast30Days',
    label: 'Bookings · 30 days',
    icon: Activity,
    formatter: (value) => formatter.format(value)
  },
  {
    key: 'grossBookingValueLast30Days',
    label: 'Gross booking value · 30 days',
    icon: BarChart3,
    formatter: (value) => currencyFormatter.format(value)
  },
  {
    key: 'activeVendors',
    label: 'Active hosts & event pros',
    icon: Users,
    formatter: (value) => formatter.format(value)
  }
];

function MetricCard({ label, icon: Icon, value, isLoading }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
        <span>{label}</span>
        <div className="rounded-full bg-orange-50 p-2 text-orange-500">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {isLoading ? (
        <div className="mt-6 h-8 w-24 animate-pulse rounded-full bg-slate-100" />
      ) : (
        <p className="mt-6 text-3xl font-bold text-slate-900">{value ?? '—'}</p>
      )}
    </div>
  );
}

function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminSummary(30);
  const metrics = METRIC_CONFIG.map((metric) => ({
    ...metric,
    displayValue: data?.totals ? metric.formatter(data.totals[metric.key] ?? 0) : null
  }));
  const generatedAt = data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : null;

  // TODO: Gate this page once admin authentication/authorization is available.

  return (
    <AppLayout fullWidth contentClassName="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">
              <ShieldCheck className="h-4 w-4" />
              Admin overview
            </p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">Admin overview</h1>
            <p className="mt-2 text-base text-slate-600">
              High level metrics across rentals, event pros, vendor markets, and sales.
            </p>
            {generatedAt && (
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">Snapshot updated {generatedAt}</p>
            )}
          </div>
          <div className="flex items-center gap-3 self-start md:self-end">
            {error && <span className="rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600">{error}</span>}
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.key}
              label={metric.label}
              icon={metric.icon}
              value={metric.displayValue}
              isLoading={isLoading && !data}
            />
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

export default AdminDashboardPage;
