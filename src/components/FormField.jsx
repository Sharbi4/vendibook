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
  const baseInputStyle = {
    width: '100%',
    padding: '12px',
    border: error ? '1px solid #D84D42' : '1px solid #EBEBEB',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit'
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#343434'
        }}>
          {label}
          {required && <span style={{ color: '#D84D42' }}> *</span>}
        </label>
      )}

      {type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={baseInputStyle}
        />
      )}

      {type === 'email' && (
        <input
          type="email"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={baseInputStyle}
        />
      )}

      {type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={baseInputStyle}
        />
      )}

      {type === 'textarea' && (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            ...baseInputStyle,
            minHeight: '120px',
            resize: 'vertical'
          }}
        />
      )}

      {type === 'select' && (
        <select
          value={value}
          onChange={onChange}
          style={baseInputStyle}
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
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '15px'
        }}>
          <input
            type="checkbox"
            checked={value}
            onChange={onChange}
            style={{ cursor: 'pointer' }}
          />
          <span>{placeholder}</span>
        </label>
      )}

      {children}

      {error && (
        <p style={{
          color: '#D84D42',
          fontSize: '13px',
          marginTop: '6px',
          marginBottom: '0'
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
