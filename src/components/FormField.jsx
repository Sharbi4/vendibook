/**
 * FormField Component
 *
 * Reusable form field with consistent styling.
 * Supports text input, textarea, select, and checkbox variants.
 *
 * @param {string} label - Field label
 * @param {boolean} required - Show required asterisk
 * @param {string} type - 'text' | 'textarea' | 'select' | 'checkbox'
 * @param {string} value - Current value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {Array} options - For select type: array of { value, label }
 * @param {string} error - Error message to display
 */
function FormField({
  label,
  required = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  options = [],
  error,
  children
}) {
  const baseInputClass = `brand-input ${error ? 'border-orange ring-2 ring-orange/30' : 'border border-[rgba(52,52,52,0.15)]'}`;

  return (
    <div className="mb-6">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-charcoal">
          {label}
          {required && <span className="text-orange"> *</span>}
        </label>
      )}

      {type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClass} text-base font-medium text-charcoal placeholder:text-charcoal/55`}
        />
      )}

      {type === 'email' && (
        <input
          type="email"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClass} text-base font-medium text-charcoal placeholder:text-charcoal/55`}
        />
      )}

      {type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClass} text-base font-medium text-charcoal placeholder:text-charcoal/55`}
        />
      )}

      {type === 'textarea' && (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClass} min-h-[120px] resize-y text-base font-medium text-charcoal placeholder:text-charcoal/55`}
        />
      )}

      {type === 'select' && (
        <select
          value={value}
          onChange={onChange}
          className={`${baseInputClass} text-base font-medium text-charcoal`}
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {type === 'checkbox' && (
        <label className="flex cursor-pointer items-center gap-3 text-base font-medium text-charcoal">
          <input
            type="checkbox"
            checked={value}
            onChange={onChange}
            className="h-5 w-5 rounded border-[rgba(52,52,52,0.3)] text-orange focus:ring-orange/40"
          />
          <span>{placeholder}</span>
        </label>
      )}

      {children}

      {error && (
        <p className="mt-2 text-sm font-semibold text-orange">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
