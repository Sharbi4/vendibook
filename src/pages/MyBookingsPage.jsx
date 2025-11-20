import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { apiClient } from '../api/client';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/layout/PageShell';
import ListSkeleton from '../components/ListSkeleton';
import { formatPrice } from '../data/listings';

/**
 * MyBookingsPage - Display renter's bookings
 */
export function MyBookingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [currentUser, setCurrentUser] = useState(null);

  const statuses = ['ALL', 'PENDING', 'APPROVED', 'DECLINED', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const userRes = await apiClient.get('/auth/me');
        setCurrentUser(userRes.data);

        // Get bookings
        const params = new URLSearchParams();
        if (selectedStatus !== 'ALL') {
          params.append('status', selectedStatus);
        }

        const bookingsRes = await apiClient.get('/bookings?' + params.toString());
        setBookings(bookingsRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        // Use mock data on error
        setCurrentUser({ id: 'user-1', name: 'Guest User', email: 'guest@example.com' });
        const mockBookings = [
          {
            id: 'booking-1',
            listingId: 'listing-1',
            listing: { id: 'listing-1', title: 'Beautiful Beachfront Villa', price: 250, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'] },
            hostId: 'host-1',
            host: { id: 'host-1', name: 'John Doe' },
            checkInDate: new Date(Date.now() + 86400000 * 5),
            checkOutDate: new Date(Date.now() + 86400000 * 10),
            guestCount: 4,
            totalPrice: 1250,
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 86400000 * 2)
          },
          {
            id: 'booking-2',
            listingId: 'listing-2',
            listing: { id: 'listing-2', title: 'Cozy Downtown Apartment', price: 120, images: ['https://images.unsplash.com/photo-1512917774080-9b116b3247b3?w=500'] },
            hostId: 'host-2',
            host: { id: 'host-2', name: 'Jane Smith' },
            checkInDate: new Date(Date.now() + 86400000 * 15),
            checkOutDate: new Date(Date.now() + 86400000 * 20),
            guestCount: 2,
            totalPrice: 600,
            status: 'PENDING',
            createdAt: new Date()
          }
        ];
        setBookings(selectedStatus === 'ALL' ? mockBookings : mockBookings.filter(b => b.status === selectedStatus));
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
    setSearchParams({ status: status !== 'ALL' ? status : '' });
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
    <PageShell
      title="My Bookings"
      subtitle="Track your rental and purchase requests"
      maxWidth="max-w-6xl"
      action={{ label: 'Browse Listings', onClick: () => navigate('/listings') }}
    >
      {/* Status Filter */}
      <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter bookings by status">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              selectedStatus === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={selectedStatus === status}
            aria-label={`Show ${status.toLowerCase()} bookings`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <ListSkeleton count={3} />
      ) : bookings.length > 0 ? (
        <ul className="space-y-4" aria-label="Bookings list">
          {bookings.map(booking => (
            <li
              key={booking.id}
              className="border rounded-lg p-6 bg-white hover:shadow-md transition cursor-pointer focus-within:ring-2 focus-within:ring-blue-500/40"
              onClick={() => navigate(`/bookings/${booking.id}`)}
              tabIndex={0}
              aria-label={`Booking ${booking.id} for ${booking.listing?.title || 'listing'}`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {booking.listing?.imageUrl && (
                  <div className="md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={booking.listing.imageUrl} alt={booking.listing.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.listing?.title || 'Unknown Listing'}</h3>
                      {booking.listing?.hostName && <p className="text-sm text-gray-600 mt-1">{booking.listing.hostName}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>{booking.status}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    {booking.startDate && (
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(booking.startDate)}</span></div>
                    )}
                    {booking.endDate && (
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(booking.endDate)}</span></div>
                    )}
                    {booking.eventDate && (
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{formatDate(booking.eventDate)}</span></div>
                    )}
                    {booking.guestCount && (
                      <div className="flex items-center gap-2"><span>👥 {booking.guestCount} guests</span></div>
                    )}
                  </div>
                  {booking.price && <p className="font-semibold text-gray-900">{formatPrice(booking.price, booking.priceUnit)}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No Bookings Yet"
          description="You haven't made any booking requests yet. Browse listings to get started!"
          action={{ label: 'Browse Listings', onClick: () => navigate('/listings') }}
        />
      )}
    </PageShell>
  );
}
