import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetails from './pages/ListingDetails';
import BecomeHostLanding from './pages/BecomeHostLanding';
import HostOnboardingWizard from './pages/HostOnboardingWizard';
import HostListings from './pages/HostListings';
import HostEditListing from './pages/HostEditListing';
import HostDashboardPage from './pages/HostDashboardPage';
import { MessagesInboxPage } from './pages/MessagesInboxPage';
import { MessageDetailPage } from './pages/MessageDetailPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { HostBookingsPage } from './pages/HostBookingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { AdminDashboard } from './pages/AdminDashboard';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Host Pages */}
        <Route path="/become-host" element={<BecomeHostLanding />} />
        <Route path="/host/onboarding" element={<HostOnboardingWizard />} />
        <Route path="/host/listings" element={<HostListings />} />
        <Route path="/host/listings/:id/edit" element={<HostEditListing />} />
        <Route path="/host/dashboard" element={<HostDashboardPage />} />
        <Route path="/host/bookings" element={<HostBookingsPage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        
        {/* Renter Pages */}
        <Route path="/bookings" element={<MyBookingsPage />} />
        
        {/* Messaging */}
        <Route path="/messages" element={<MessagesInboxPage />} />
        <Route path="/messages/:threadId" element={<MessageDetailPage />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
