import { useLocation, useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import ListingCreationWizard from '../components/listings/ListingCreationWizard';
import IdentityVerificationGate from '../components/IdentityVerificationGate';

function HostOnboardingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultListingType = queryParams.get('type') || '';

  return (
    <PageShell
      title="Create a new listing"
      subtitle="A modern, multi-step wizard for rentals and Event Pros"
      maxWidth="max-w-6xl"
      action={{ label: 'Back to dashboard', onClick: () => navigate('/host/dashboard') }}
    >
      <IdentityVerificationGate requireVerification={true}>
        <ListingCreationWizard
          onClose={() => navigate('/host/dashboard')}
          defaultListingType={defaultListingType}
        />
      </IdentityVerificationGate>
    </PageShell>
  );
}

export default HostOnboardingWizard;
