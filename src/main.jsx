import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.jsx';
import AppStatusProvider from './providers/AppStatusProvider.jsx';
import AuthProvider from './providers/AuthProvider.jsx';

// Simple top-level loading state placeholder; replace with real auth/app initialization later.
export function Root() {
  return (
    <GlobalErrorBoundary>
      <AppStatusProvider>
        <AuthProvider>
          <GlobalLoadingOverlay active={false} />
          <App />
        </AuthProvider>
      </AppStatusProvider>
    </GlobalErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
