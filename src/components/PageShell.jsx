import React from 'react';

function PageShell({ title, subtitle, action, children }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-base text-gray-600">{subtitle}</p>
          )}
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {action.label}
          </button>
        )}
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export default PageShell;
