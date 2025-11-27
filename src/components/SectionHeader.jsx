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
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-charcoal">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-charcoal/70">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
