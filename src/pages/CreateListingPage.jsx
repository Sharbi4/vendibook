import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CreateListingWizard from '../components/CreateListingWizard';
import IdentityVerificationGate from '../components/IdentityVerificationGate';

/**
 * Create Listing Page
 * Wrapper for the multi-step listing creation wizard
 */
export default function CreateListingPage() {
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate('/host/listings');
  };

  const handleSuccess = (listingId) => {
    navigate(`/host/listings/${listingId}?created=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={handleExit}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <h1 className="text-lg font-bold text-slate-900">Create Listing</h1>

          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IdentityVerificationGate requireVerification={true}>
          <CreateListingWizard onSuccess={handleSuccess} />
        </IdentityVerificationGate>
      </main>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Leave this page?</h3>
            <p className="mt-2 text-slate-600">
              Your progress will be lost if you exit without saving.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-50"
              >
                Stay
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
