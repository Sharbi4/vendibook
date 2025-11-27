import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * StepNavigation Component
 *
 * Navigation buttons for multi-step forms.
 * Handles prev/next with completion validation.
 *
 * @param {number} currentStep - Current step number
 * @param {number} totalSteps - Total number of steps
 * @param {boolean} isStepValid - Whether current step can advance
 * @param {Function} onNext - Called when next button clicked
 * @param {Function} onPrev - Called when prev button clicked
 * @param {Function} onComplete - Called when completing final step
 * @param {boolean} isSubmitting - Show loading state
 */
function StepNavigation({
  currentStep,
  totalSteps,
  isStepValid,
  onNext,
  onPrev,
  onComplete,
  isSubmitting
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="mt-8 flex items-center justify-between border-t border-charcoal/10 pt-8">
      <div className="text-sm font-semibold text-charcoal/70">
        Step {currentStep} of {totalSteps}
      </div>

      <div className="flex gap-3">
        {!isFirstStep && (
          <button
            onClick={onPrev}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-charcoal/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={onComplete}
            disabled={!isStepValid || isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!isStepValid}
            className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default StepNavigation;
