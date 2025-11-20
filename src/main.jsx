import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.jsx';

// Simple top-level loading state placeholder; replace with real auth/app initialization later.
export function Root() {
  const [booting, setBooting] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setBooting(false), 300); // simulate quick boot
    return () => clearTimeout(t);
  }, []);
  return (
    <GlobalErrorBoundary>
      <GlobalLoadingOverlay active={booting} message="Booting application" />
      {!booting && <App />}
    </GlobalErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
