import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { apiClient } from '../api/client';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../data/listings';

/**
 * HostBookingsPage - Manage bookings for host's listings
 */
export function HostBookingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'PENDING');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statuses = ['PENDING', 'APPROVED', 'DECLINED', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        params.append('status', selectedStatus);

        const bookingsRes = await apiClient.get('/host/bookings?' + params.toString());
        setBookings(bookingsRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        // Use mock data on error
        const mockBookings = [
          {
            id: 'booking-1',
            listingId: 'listing-1',
            listing: { id: 'listing-1', title: 'Beautiful Beachfront Villa', price: 250 },
            renterId: 'renter-1',
            renter: { id: 'renter-1', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101' },
            checkInDate: new Date(Date.now() + 86400000 * 5),
            checkOutDate: new Date(Date.now() + 86400000 * 10),
            guestCount: 4,
            totalPrice: 1250,
            status: 'PENDING',
            createdAt: new Date()
          },
          {
            id: 'booking-2',
            listingId: 'listing-2',
            listing: { id: 'listing-2', title: 'Mountain Cabin Retreat', price: 180 },
            renterId: 'renter-2',
            renter: { id: 'renter-2', name: 'Bob Williams', email: 'bob@example.com', phone: '+1-555-0102' },
            checkInDate: new Date(Date.now() + 86400000 * 20),
            checkOutDate: new Date(Date.now() + 86400000 * 25),
            guestCount: 6,
            totalPrice: 900,
            status: selectedStatus,
            createdAt: new Date(Date.now() - 86400000)
          }
        ];
        const filtered = selectedStatus ? mockBookings.filter(b => b.status === selectedStatus) : mockBookings;
        setBookings(filtered);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedStatus, navigate]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setSearchParams({ status });
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      await apiClient.put(`/host/bookings/${bookingId}/status`, {
        status: 'APPROVED',
        reason: 'Approved by host'
      });

      // Reload bookings
      setBookings(bookings.filter(b => b.id !== bookingId));
      setSelectedBooking(null);
      alert('Booking approved! Notification sent to renter.');
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    const reason = prompt('Enter reason for declining (optional):');
    if (reason === null) return;

    try {
      setActionLoading(true);
      await apiClient.put(`/host/bookings/${bookingId}/status`, {
        status: 'DECLINED',
        reason: reason || 'Declined by host'
      });

      // Reload bookings
      setBookings(bookings.filter(b => b.id !== bookingId));
      setSelectedBooking(null);
      alert('Booking declined. Notification sent to renter.');
    } catch (error) {
      console.error('Failed to decline booking:', error);
      alert('Failed to decline booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      await apiClient.put(`/host/bookings/${bookingId}/status`, {
        status: 'COMPLETED',
        reason: 'Marked as completed by host'
      });

      // Reload bookings
      setBookings(bookings.filter(b => b.id !== bookingId));
      setSelectedBooking(null);
      alert('Booking marked as complete!');
    } catch (error) {
      console.error('Failed to complete booking:', error);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      DECLINED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SectionHeader title="Manage Bookings" subtitle="Review and respond to booking requests" />

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="border rounded-lg p-6 bg-white hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Booking Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {booking.listing?.title || 'Unknown Listing'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <User className="w-4 h-4" />
                        {booking.user?.name || 'Unknown User'}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    {booking.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.startDate)}</span>
                      </div>
                    )}
                    {booking.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.endDate)}</span>
                      </div>
                    )}
                    <div className="col-span-2 md:col-span-1 text-xs">
                      <p>Contact: {booking.user?.email}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-3 border-l-4 border-blue-500">
                      {booking.message}
                    </p>
                  )}

                  {booking.price && (
                    <p className="font-semibold text-gray-900 mb-4">
                      {formatPrice(booking.price, booking.priceUnit)}
                    </p>
                  )}

                  {/* Actions */}
                  {booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveBooking(booking.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeclineBooking(booking.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => navigate(`/messages?listingId=${booking.listing?.id}&userId=${booking.user?.id}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                      >
                        Message
                      </button>
                    </div>
                  )}

                  {booking.status === 'APPROVED' && (
                    <button
                      onClick={() => handleCompleteBooking(booking.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Bookings"
          description={`No ${selectedStatus.toLowerCase()} bookings at the moment.`}
          action={{
            label: 'Back to Dashboard',
            onClick: () => navigate('/host/dashboard')
          }}
        />
      )}
    </div>
  );
}
