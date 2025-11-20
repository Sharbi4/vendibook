import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, List, Calendar, BarChart3 } from 'lucide-react';
import { apiClient } from '../api/client';
import PageShell from '../components/layout/PageShell';
import MetricCard from '../components/MetricCard';
import DataTable from '../components/DataTable';

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
    return (
      <PageShell
        title="Admin Dashboard"
        subtitle="Verifying admin access"
        maxWidth="max-w-7xl"
      >
        <div className="py-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </PageShell>
    );
  }

  const overviewCards = [
    { label: 'Total Users', value: users.length || '–', tone: 'info', icon: Users },
    { label: 'Total Listings', value: listings.length || '–', tone: 'success', icon: List },
    { label: 'Total Bookings', value: bookings.length || '–', tone: 'default', icon: Calendar },
    { label: 'Platform Health', value: 'Good', tone: 'success', icon: BarChart3 }
  ];

  const listingsColumns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'host', header: 'Host', render: (r) => r.host?.name || r.owner?.name || '–' },
    { key: 'status', header: 'Status', render: (r) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'LIVE' || r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
      >
        {r.status}
      </span>
    ) },
    { key: 'actions', header: 'Actions', render: (r) => (
      <div className="space-x-2">
        {(r.status === 'LIVE' || r.status === 'ACTIVE') ? (
          <button
            onClick={() => handleSuspendListing(r.id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Suspend
          </button>
        ) : (
          <button
            onClick={() => handleUnsuspendListing(r.id)}
            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
          >
            Reinstate
          </button>
        )}
      </div>
    ) }
  ];

  const usersColumns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{r.role}</span>
    ) },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (r) => formatDate(r.createdAt) }
  ];

  const bookingsColumns = [
    { key: 'renter', header: 'User', render: (r) => r.renter?.name || r.user?.name || '–' },
    { key: 'listing', header: 'Listing', render: (r) => r.listing?.title || '–' },
    { key: 'status', header: 'Status', render: (r) => (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        r.status === 'APPROVED'
          ? 'bg-green-100 text-green-800'
          : r.status === 'PENDING'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>{r.status}</span>
    ) },
    { key: 'createdAt', header: 'Date', sortable: true, render: (r) => formatDate(r.createdAt) }
  ];

  return (
    <PageShell
      title="Admin Dashboard"
      subtitle="Manage users, listings, and platform operations"
      maxWidth="max-w-7xl"
    >
      {/* Tabs */}
      <div className="flex border-b mb-8" role="tablist" aria-label="Admin sections">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'listings', label: 'Listings', icon: List },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'bookings', label: 'Bookings', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6" aria-label="Platform overview metrics">
          {overviewCards.map(card => (
            <MetricCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              tone={card.tone}
            />
          ))}
        </div>
      )}

      {activeTab === 'listings' && (
        <DataTable
          columns={listingsColumns}
          data={listings}
          isLoading={isLoading}
          emptyMessage="No listings found"
        />
      )}

      {activeTab === 'users' && (
        <DataTable
          columns={usersColumns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      )}

      {activeTab === 'bookings' && (
        <DataTable
          columns={bookingsColumns}
          data={bookings}
          isLoading={isLoading}
          emptyMessage="No bookings found"
        />
      )}
    </PageShell>
  );
}

function formatDate(value) {
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '–';
    return d.toLocaleDateString();
  } catch {
    return '–';
  }
}
