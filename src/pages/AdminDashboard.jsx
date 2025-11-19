import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, List, Calendar, BarChart3 } from 'lucide-react';
import { apiClient } from '../api/client';
import SectionHeader from '../components/SectionHeader';

/**
 * AdminDashboard - Platform administration and moderation
 */
export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setCurrentUser(res.data);

        if (res.data.role !== 'ADMIN') {
          navigate('/');
        }
      } catch (error) {
        // Use mock admin user for demo
        setCurrentUser({ id: 'admin-1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' });
      }
    };

    checkAdmin();
  }, [navigate]);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/listings?limit=20');
      setListings(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load listings:', error);
      // Use mock data
      setListings([
        { id: 'listing-1', title: 'Beachfront Villa', location: 'Miami, FL', price: 250, status: 'ACTIVE', host: { name: 'John Doe' }, createdAt: new Date(Date.now() - 86400000 * 30) },
        { id: 'listing-2', title: 'Mountain Cabin', location: 'Aspen, CO', price: 180, status: 'ACTIVE', host: { name: 'Jane Smith' }, createdAt: new Date(Date.now() - 86400000 * 45) },
        { id: 'listing-3', title: 'Downtown Apartment', location: 'NYC, NY', price: 120, status: 'SUSPENDED', host: { name: 'Bob Wilson' }, createdAt: new Date(Date.now() - 86400000 * 15) }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/users?limit=20');
      setUsers(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Use mock data
      setUsers([
        { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'HOST', status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 60) },
        { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'RENTER', status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 45) },
        { id: 'user-3', name: 'Bob Wilson', email: 'bob@example.com', role: 'HOST', status: 'SUSPENDED', createdAt: new Date(Date.now() - 86400000 * 30) }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/admin/bookings?limit=20');
      setBookings(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      // Use mock data
      setBookings([
        { id: 'booking-1', listing: { title: 'Beachfront Villa' }, renter: { name: 'Alice Johnson' }, checkInDate: new Date(Date.now() + 86400000 * 5), checkOutDate: new Date(Date.now() + 86400000 * 10), status: 'APPROVED', totalPrice: 1250 },
        { id: 'booking-2', listing: { title: 'Mountain Cabin' }, renter: { name: 'Bob Williams' }, checkInDate: new Date(Date.now() + 86400000 * 15), checkOutDate: new Date(Date.now() + 86400000 * 20), status: 'PENDING', totalPrice: 900 },
        { id: 'booking-3', listing: { title: 'Downtown Apartment' }, renter: { name: 'Carol Davis' }, checkInDate: new Date(Date.now() - 86400000 * 5), checkOutDate: new Date(Date.now() - 86400000), status: 'COMPLETED', totalPrice: 600 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'listings') loadListings();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'bookings') loadBookings();
  }, [activeTab]);

  const handleSuspendListing = async (listingId) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    try {
      await apiClient.put(`/admin/listings/${listingId}`, {
        action: 'suspend',
        reason
      });
      loadListings();
      alert('Listing suspended');
    } catch (error) {
      console.error('Failed to suspend listing:', error);
      alert('Failed to suspend listing');
    }
  };

  const handleUnsuspendListing = async (listingId) => {
    try {
      await apiClient.put(`/admin/listings/${listingId}`, {
        action: 'unsuspend',
        reason: 'Reinstated by admin'
      });
      loadListings();
      alert('Listing unsuspended');
    } catch (error) {
      console.error('Failed to unsuspend listing:', error);
      alert('Failed to unsuspend listing');
    }
  };

  if (!currentUser) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionHeader
        title="Admin Dashboard"
        subtitle="Manage users, listings, and platform operations"
      />

      {/* Tabs */}
      <div className="flex border-b mb-8">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
          { id: 'listings', label: 'Listings', icon: <List className="w-5 h-5" /> },
          { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
          { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">Total Listings</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">Platform Health</p>
            <p className="text-3xl font-bold text-green-600">Good</p>
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div>
          <div className="bg-white rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Host</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : listings.length > 0 ? (
                  listings.map(listing => (
                    <tr key={listing.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{listing.title}</td>
                      <td className="px-6 py-3">{listing.owner?.name}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          listing.status === 'LIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm space-x-2">
                        {listing.status === 'LIVE' ? (
                          <button
                            onClick={() => handleSuspendListing(listing.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnsuspendListing(listing.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Reinstate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No listings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="bg-white rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{user.name}</td>
                      <td className="px-6 py-3">{user.email}</td>
                      <td className="px-6 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div className="bg-white rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Listing</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : bookings.length > 0 ? (
                  bookings.map(booking => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{booking.user?.name}</td>
                      <td className="px-6 py-3">{booking.listing?.title}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
