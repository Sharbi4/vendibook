import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import PropTypes from 'prop-types';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.jsx';
import AppStatusProvider from './providers/AppStatusProvider.jsx';
import AuthProvider from './providers/AuthProvider.jsx';
import { useAppStatus } from './hooks/useAppStatus.js';
import './config/clerkConfig';
import { clerkFrontendApi, clerkPublishableKey } from './config/clerkConfig.js';

// Wrapper component that connects GlobalLoadingOverlay to AppStatusProvider
function AppWithStatus() {
  const { isGlobalLoading } = useAppStatus();
  
  return (
    <>
      <GlobalLoadingOverlay active={isGlobalLoading} />
      <App />
    </>
  );
}

export function Root() {
  return (
    <GlobalErrorBoundary>
      <AppStatusProvider>
        <AuthProvider>
          <AppWithStatus />
        </AuthProvider>
      </AppStatusProvider>
    </GlobalErrorBoundary>
  );
}

function ClerkProviderWithRouter({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      frontendApi={clerkFrontendApi}
      routerPush={navigate}
      routerReplace={(to) => navigate(to, { replace: true })}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}

ClerkProviderWithRouter.propTypes = {
  children: PropTypes.node,
};

function MissingClerkConfig() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-center text-slate-800">
      <div className="max-w-xl space-y-4 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-semibold">Clerk configuration missing</h1>
        <p className="text-sm text-slate-600">
          Add <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> (and optionally
          <code className="font-mono"> VITE_CLERK_FRONTEND_API</code>) to your environment variables. Update
          your <code className="font-mono">.env.local</code> for local development and Vercel project settings
          for deployment, then redeploy.
        </p>
      </div>
    </div>
  );
}

// Add error logging
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          {clerkPublishableKey ? (
            <ClerkProviderWithRouter>
              <Root />
            </ClerkProviderWithRouter>
          ) : (
            <MissingClerkConfig />
          )}
        </BrowserRouter>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }
}
