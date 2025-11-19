/**
 * SectionHeader Component
 *
 * Reusable header for form sections.
 * Reduces code duplication across HostOnboardingWizard.
 *
 * @param {string} title - Section title (e.g., "What would you like to list?")
 * @param {string} description - Section description/help text
 */
function SectionHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#343434'
      }}>
        {title}
      </h2>
      {description && (
        <p style={{
          fontSize: '16px',
          color: '#717171',
          marginBottom: '0'
        }}>
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
