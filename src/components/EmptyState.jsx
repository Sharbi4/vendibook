/**
 * EmptyState Component
 *
 * Reusable empty state UI for when no results or items exist.
 * Used in ListingsPage and HostDashboard.
 *
 * @param {React.ReactNode} icon - Icon element
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {React.ReactNode} action - Action button/element
 */
function EmptyState({ icon, title, description, action }) {
  return (
    <div className="brand-card text-center px-10 py-20 shadow-brand-soft">
      {icon && (
        <div className="mb-4 flex justify-center text-charcoal/50">
          {icon}
        </div>
      )}

      {title && (
        <h2 className="text-2xl font-semibold text-charcoal">
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-3 text-base text-charcoal/70">
          {description}
        </p>
      )}

      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  );
}

export default EmptyState;
