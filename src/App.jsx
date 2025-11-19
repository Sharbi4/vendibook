import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import BecomeHostLanding from './pages/BecomeHostLanding';
import HostOnboardingWizard from './pages/HostOnboardingWizard';
import HostDashboard from './pages/HostDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/become-host" element={<BecomeHostLanding />} />
        <Route path="/host/onboarding" element={<HostOnboardingWizard />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
