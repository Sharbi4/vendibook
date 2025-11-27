import React from 'react';
import SectionHeader from '../SectionHeader';
import AppHeader from '../AppHeader';

/*
  PageShell - Consistent page layout wrapper providing:
  - Background + vertical rhythm
  - Max width container
  - Page header (title / subtitle / optional action)
  - Standardized main content spacing
*/
export default function PageShell({
  title,
  subtitle,
  action, // { label, onClick, icon? }
  maxWidth = 'max-w-7xl',
  children,
  className = ''
}) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <AppHeader />
      <header className="bg-white border-b border-gray-200">
        <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4`}>
          <SectionHeader title={title} subtitle={subtitle} />
          {action && (
            <button
              onClick={action.onClick}
              className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition"
              aria-label={action.label}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </button>
          )}
        </div>
      </header>
      <main className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {children}
      </main>
    </div>
  );
}
