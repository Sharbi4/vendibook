import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetails from './pages/ListingDetails';
import RentPage from './pages/RentPage';
import ForSalePage from './pages/ForSalePage';
import EventProPage from './pages/EventProPage';
import RenterDashboardPage from './pages/RenterDashboardPage';
import BecomeHostLanding from './pages/BecomeHostLanding';
import HostOnboardingWizard from './pages/HostOnboardingWizard';
import HostListings from './pages/HostListings';
import HostEditListing from './pages/HostEditListing';
import HostDashboardPage from './pages/HostDashboardPage';
import { MessagesInboxPage } from './pages/MessagesInboxPage';
import MessagesInfoPage from './pages/MessagesInfoPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { HostBookingsPage } from './pages/HostBookingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostPage from './pages/BlogPostPage';
import AboutPage from './pages/AboutPage';
import WishlistPage from './pages/WishlistPage';
import RequireAuth from './auth/RequireAuth.jsx';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import HowItWorksSellerPage from './pages/HowItWorksSellerPage';
import HowItWorksHostPage from './pages/HowItWorksHostPage';
import HowItWorksRenterPage from './pages/HowItWorksRenterPage';
import HowItWorksMarketPage from './pages/HowItWorksMarketPage';
import HowItWorksBuyerPage from './pages/HowItWorksBuyerPage';
import CreateListingPage from './pages/CreateListingPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  return (
    <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/rent" element={<RentPage />} />
        <Route path="/for-sale" element={<ForSalePage />} />
        <Route path="/event-pro" element={<EventProPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route
          path="/profile"
          element={(
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          )}
        />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        
        {/* How It Works Pages */}
        <Route path="/how-it-works/sellers" element={<HowItWorksSellerPage />} />
        <Route path="/how-it-works/hosts" element={<HowItWorksHostPage />} />
        <Route path="/how-it-works/renters" element={<HowItWorksRenterPage />} />
        <Route path="/how-it-works/markets" element={<HowItWorksMarketPage />} />
        <Route path="/how-it-works/buyers" element={<HowItWorksBuyerPage />} />
        
        {/* Host Pages */}
        <Route path="/become-host" element={<BecomeHostLanding />} />
        <Route path="/host/onboarding" element={<HostOnboardingWizard />} />
        <Route path="/host/listings" element={<HostListings />} />
        <Route
          path="/host/listings/create"
          element={(
            <RequireAuth>
              <CreateListingPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/host/listings/:id/edit"
          element={(
            <RequireAuth>
              <HostEditListing />
            </RequireAuth>
          )}
        />
        <Route path="/host/dashboard" element={<HostDashboardPage />} />
        <Route
          path="/host/bookings"
          element={(
            <RequireAuth>
              <HostBookingsPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/analytics"
          element={(
            <RequireAuth>
              <AnalyticsDashboardPage />
            </RequireAuth>
          )}
        />
        
        {/* Renter Pages */}
        <Route
          path="/dashboard"
          element={(
            <RequireAuth>
              <RenterDashboardPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/bookings"
          element={(
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/wishlist"
          element={(
            <RequireAuth>
              <WishlistPage />
            </RequireAuth>
          )}
        />
        
        {/* Messaging */}
        <Route path="/messages/info" element={<MessagesInfoPage />} />
        <Route
          path="/messages"
          element={(
            <RequireAuth>
              <MessagesInboxPage />
            </RequireAuth>
          )}
        />
        <Route
          path="/messages/:threadId"
          element={(
            <RequireAuth>
              <MessagesInboxPage />
            </RequireAuth>
          )}
        />
        
        {/* Notifications */}
        <Route
          path="/notifications"
          element={(
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          )}
        />
        
        {/* Admin */}
        <Route
          path="/admin"
          element={(
            <RequireAuth>
              <AdminDashboardPage />
            </RequireAuth>
          )}
        />
      </Routes>
  );
}

export default App;
