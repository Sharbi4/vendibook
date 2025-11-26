import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import ListingCreationWizard from '../components/listings/ListingCreationWizard';

function HostOnboardingWizard() {
  const navigate = useNavigate();

  return (
    <PageShell
      title="Create a new listing"
      subtitle="A modern, multi-step wizard for rentals and Event Pros"
      maxWidth="max-w-6xl"
      action={{ label: 'Back to dashboard', onClick: () => navigate('/host/dashboard') }}
    >
      <ListingCreationWizard onClose={() => navigate('/host/dashboard')} />
    </PageShell>
  );
}

export default HostOnboardingWizard;
