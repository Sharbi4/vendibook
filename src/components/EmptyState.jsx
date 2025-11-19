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
    <div style={{
      textAlign: 'center',
      padding: '80px 40px',
      background: '#FAFAFA',
      borderRadius: '16px'
    }}>
      {icon && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          opacity: 0.5
        }}>
          {icon}
        </div>
      )}

      {title && (
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#343434'
        }}>
          {title}
        </h2>
      )}

      {description && (
        <p style={{
          fontSize: '16px',
          color: '#717171',
          marginBottom: '24px'
        }}>
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
