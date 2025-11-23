import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetails from './pages/ListingDetails';
import BecomeHostLanding from './pages/BecomeHostLanding';
import HostOnboardingWizard from './pages/HostOnboardingWizard';
import HostDashboard from './pages/HostDashboard';
import { MessagesInboxPage } from './pages/MessagesInboxPage';
import { MessageDetailPage } from './pages/MessageDetailPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { HostBookingsPage } from './pages/HostBookingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { AdminDashboard } from './pages/AdminDashboard';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        {/* Host Pages */}
        <Route path="/become-host" element={<BecomeHostLanding />} />
        <Route
          path="/host/create-listing"
          element={
            <ProtectedRoute>
              <HostOnboardingWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/onboarding"
          element={
            <ProtectedRoute>
              <HostOnboardingWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/bookings"
          element={
            <ProtectedRoute>
              <HostBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        
        {/* Renter Pages */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Messaging */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesInboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:threadId"
          element={
            <ProtectedRoute>
              <MessageDetailPage />
            </ProtectedRoute>
          }
        />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
