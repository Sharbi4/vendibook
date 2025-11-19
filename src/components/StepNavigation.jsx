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
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '32px',
      borderTop: '1px solid #EBEBEB',
      marginTop: '32px'
    }}>
      {/* Progress Indicator */}
      <div style={{ fontSize: '14px', color: '#717171' }}>
        Step {currentStep} of {totalSteps}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {!isFirstStep && (
          <button
            onClick={onPrev}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              border: '1px solid #EBEBEB',
              borderRadius: '8px',
              background: 'white',
              color: '#343434',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
            Previous
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={onComplete}
            disabled={!isStepValid || isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#FF5124',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: (!isStepValid || isSubmitting) ? 'not-allowed' : 'pointer',
              opacity: (!isStepValid || isSubmitting) ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!isStepValid}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#FF5124',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: !isStepValid ? 'not-allowed' : 'pointer',
              opacity: !isStepValid ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            Next
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>
    </div>
  );
}

export default StepNavigation;
