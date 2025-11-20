import React from 'react';

// WizardLayout: two-column responsive layout with progress bar for multi-step flows.
// Props:
// - currentStep, totalSteps (numbers)
// - children (main form content)
// - preview (node shown in right column on large screens, below on mobile)
// - footer (navigation controls)
export default function WizardLayout({
  currentStep,
  totalSteps,
  children,
  preview,
  footer
}) {
  const progress = Math.min(currentStep / totalSteps, 1) * 100;
  return (
    <div className="space-y-10">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-200 rounded overflow-hidden" aria-label="Progress bar">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
        <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-12 items-start">
        <div>{children}</div>
        <div className="lg:block hidden sticky top-24">{preview}</div>
        {/* Mobile preview */}
        <div className="lg:hidden space-y-4">{preview}</div>
      </div>
      {footer && <div>{footer}</div>}
    </div>
  );
}