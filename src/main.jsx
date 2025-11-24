import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.jsx';
import AppStatusProvider from './providers/AppStatusProvider.jsx';
import AuthProvider from './providers/AuthProvider.jsx';
import { useAppStatus } from './hooks/useAppStatus.js';

function AppWithStatus() {
  const { isGlobalLoading } = useAppStatus();

  return (
    <>
      <GlobalLoadingOverlay active={isGlobalLoading} />
      <App />
    </>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <GlobalErrorBoundary>
            <AppStatusProvider>
              <AuthProvider>
                <AppWithStatus />
              </AuthProvider>
            </AppStatusProvider>
          </GlobalErrorBoundary>
        </BrowserRouter>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
  }
}
