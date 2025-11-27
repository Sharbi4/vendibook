import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import ListingCreationWizard from '../components/listings/ListingCreationWizard';

function HostEditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [listing, setListing] = useState(null);

  useEffect(() => {
    if (!id) {
      setStatus('error');
      setErrorMessage('Listing ID is required.');
      return;
    }

    let isActive = true;

    async function loadListing() {
      setStatus('loading');
      setErrorMessage('');

      try {
        const response = await fetch(`/api/listings?id=${encodeURIComponent(id)}`);
        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.data) {
          throw new Error(result?.error || 'Failed to load listing');
        }

        if (isActive) {
          setListing(result.data);
          setStatus('success');
        }
      } catch (error) {
        console.error('Failed to load listing for edit', error);
        if (isActive) {
          setStatus('error');
          setErrorMessage(error.message || 'Unable to load listing');
        }
      }
    }

    loadListing();

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleClose = () => {
    navigate('/host/listings');
  };

  return (
    <PageShell
      title="Edit listing"
      subtitle="Update pricing, details, and scheduling"
      maxWidth="max-w-6xl"
      action={{ label: 'Back to listings', onClick: handleClose }}
    >
      {status === 'loading' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-1/3 rounded bg-slate-200 animate-pulse" />
          <div className="mt-4 h-6 w-2/3 rounded bg-slate-200 animate-pulse" />
          <div className="mt-8 h-64 rounded-3xl bg-slate-100 animate-pulse" />
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700">
          {errorMessage}
        </div>
      )}

      {status === 'success' && listing && (
        <ListingCreationWizard
          mode="edit"
          listingId={listing.id}
          initialData={listing}
          onClose={handleClose}
        />
      )}
    </PageShell>
  );
}

export default HostEditListing;
