import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.jsx';
import AppStatusProvider from './providers/AppStatusProvider.jsx';
import AuthProvider from './providers/AuthProvider.jsx';
import { useAppStatus } from './hooks/useAppStatus.js';

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

  <React.StrictMode>
// Add error logging
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }
}
