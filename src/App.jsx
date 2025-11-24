import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetails from './pages/ListingDetails';
import BecomeHostLanding from './pages/BecomeHostLanding';
import HostOnboardingWizard from './pages/HostOnboardingWizard';
import CreateListingPage from './pages/CreateListingPage.jsx';
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
<<<<<<< HEAD
import RequireAuth from './components/RequireAuth.jsx';
import VerificationBanner from './components/VerificationBanner.jsx';
import SiteHeader from './components/layout/SiteHeader.jsx';
import SigninPage from './pages/SigninPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
=======
>>>>>>> parent of aea4d91 (feat: implement authentication system)

function App() {
  return (
    <>
      <SiteHeader />
      <VerificationBanner />
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route
          path="/listing/:id/book"
          element={
            <RequireAuth>
              <ListingDetails bookingIntent="book" />
            </RequireAuth>
          }
        />
        <Route path="/community" element={<CommunityPage />} />
<<<<<<< HEAD
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        
        {/* Host Pages */}
        <Route path="/become-host" element={<BecomeHostLanding />} />
        <Route
          path="/host/create-listing"
          element={
            <RequireAuth>
              <CreateListingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/create-listing"
          element={
            <RequireAuth>
              <CreateListingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/host/onboarding"
          element={
            <RequireAuth>
              <HostOnboardingWizard />
            </RequireAuth>
          }
        />
        <Route
          path="/host/dashboard"
          element={
            <RequireAuth>
              <HostDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/host/bookings"
          element={
            <RequireAuth>
              <HostBookingsPage />
            </RequireAuth>
          }
        />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        
        {/* Renter Pages */}
        <Route
          path="/bookings"
          element={
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          }
        />
        
        {/* Messaging */}
        <Route
          path="/messages"
          element={
            <RequireAuth>
              <MessagesInboxPage />
            </RequireAuth>
          }
        />
        <Route
          path="/messages/:threadId"
          element={
            <RequireAuth>
              <MessageDetailPage />
            </RequireAuth>
          }
        />
=======
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Host Pages */}
        <Route path="/become-host" element={<BecomeHostLanding />} />
        <Route path="/host/onboarding" element={<HostOnboardingWizard />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/host/bookings" element={<HostBookingsPage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        
        {/* Renter Pages */}
        <Route path="/bookings" element={<MyBookingsPage />} />
        
        {/* Messaging */}
        <Route path="/messages" element={<MessagesInboxPage />} />
        <Route path="/messages/:threadId" element={<MessageDetailPage />} />
>>>>>>> parent of aea4d91 (feat: implement authentication system)
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
<<<<<<< HEAD

        {/* Auth */}
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
=======
>>>>>>> parent of aea4d91 (feat: implement authentication system)
      </Routes>
    </>
  );
}

export default App;
