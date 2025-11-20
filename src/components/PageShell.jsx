import React from 'react';

function renderAction(action) {
  if (!action) return null;

  if (React.isValidElement(action)) {
    return <div className="flex flex-wrap gap-3">{action}</div>;
  }

  const {
    label,
    onClick,
    href,
    icon: Icon,
    variant = 'primary',
    disabled
  } = action;

  const baseClasses =
    'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-blue-700 hover:bg-blue-50 focus:ring-blue-500 disabled:text-blue-300 disabled:hover:bg-transparent disabled:cursor-not-allowed'
  };

  const Component = href ? 'a' : 'button';

  return (
    <div className="flex flex-wrap gap-3">
      <Component
        type={href ? undefined : 'button'}
        href={href}
        onClick={disabled ? undefined : onClick}
        className={`${baseClasses} ${variants[variant] || variants.primary}`}
        aria-disabled={disabled || undefined}
        disabled={href ? undefined : disabled}
      >
        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
        {label}
      </Component>
    </div>
  );
}

function PageShell({ title, subtitle, action, children }) {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-base text-gray-600">{subtitle}</p>
          )}
        </div>
        {renderAction(action)}
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export default PageShell;
