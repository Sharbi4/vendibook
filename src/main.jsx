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
import { clerkConfig } from './config/clerkConfig.js';

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
      publishableKey={clerkConfig.publishableKey}
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

<<<<<<< HEAD
if (!clerkConfig.publishableKey) {
=======
if (!clerkPublishableKey) {
>>>>>>> parent of 2eb759a (Merge pull request #13 from Sharbi4/codex/implement-environment-variable-handling-for-clerk)
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required for Clerk to function. Add it to your environment config.');
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
          <ClerkProviderWithRouter>
            <Root />
          </ClerkProviderWithRouter>
        </BrowserRouter>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }
}
