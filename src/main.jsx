import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.jsx';
import AppStatusProvider from './providers/AppStatusProvider.jsx';
import AuthProvider from './providers/AuthProvider.jsx';
import { useAppStatus } from './hooks/useAppStatus.js';
import { clerkPublishableKey, clerkFrontendApi } from './config/clerkConfig';

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

const AppTree = (
  <React.StrictMode>
    <GlobalErrorBoundary>
      <AppStatusProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppWithStatus />
          </BrowserRouter>
        </AuthProvider>
      </AppStatusProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    if (clerkPublishableKey) {
      root.render(
        <ClerkProvider publishableKey={clerkPublishableKey} frontendApi={clerkFrontendApi}>
          {AppTree}
        </ClerkProvider>
      );
    } else {
      root.render(AppTree);
    }
  } catch (error) {
    console.error('Failed to render app:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }
}
