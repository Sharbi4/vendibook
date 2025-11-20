import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/layout/PageShell';
import ListSkeleton from '../components/ListSkeleton';

/**
 * NotificationsPage - Full notifications center
 */
export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get(
          `/notifications?unreadOnly=${filterUnread}`
        );
        setNotifications(res.data || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        // Use mock data on error
        const mockNotifications = [
          {
            id: 'notif-1',
            type: 'booking_request',
            title: 'New Booking Request',
            message: 'Alice Johnson wants to book your Beachfront Villa for Aug 5-10',
            link: '/host/bookings?status=PENDING',
            read: false,
            createdAt: new Date(Date.now() - 300000)
          },
          {
            id: 'notif-2',
            type: 'booking_approved',
            title: 'Booking Approved',
            message: 'Your booking for Cozy Downtown Apartment has been approved',
            link: '/bookings',
            read: false,
            createdAt: new Date(Date.now() - 600000)
          },
          {
            id: 'notif-3',
            type: 'message',
            title: 'New Message',
            message: 'John Doe sent you a message about the listing',
            link: '/messages',
            read: true,
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            id: 'notif-4',
            type: 'review',
            title: 'New Review',
            message: 'Alice Johnson left you a 5-star review for Beachfront Villa',
            link: '/host/dashboard',
            read: true,
            createdAt: new Date(Date.now() - 7200000)
          }
        ];
        const filtered = filterUnread ? mockNotifications.filter(n => !n.read) : mockNotifications;
        setNotifications(filtered);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [filterUnread, navigate]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiClient.post('/notifications/read', {
        notificationIds: [notificationId]
      });

      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read', {
        markAllAsRead: true
      });

      setNotifications(notifications.map(n => ({
        ...n,
        read: true,
        readAt: new Date()
      })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNavigate = (notification) => {
    if (notification.relatedId) {
      if (notification.type.includes('BOOKING')) {
        navigate(`/bookings/${notification.relatedId}`);
      } else if (notification.type === 'MESSAGE_RECEIVED') {
        navigate(`/messages/${notification.relatedId}`);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      BOOKING_REQUEST: '📅',
      BOOKING_APPROVED: '✅',
      BOOKING_DECLINED: '❌',
      MESSAGE_RECEIVED: '💬',
      REVIEW_RECEIVED: '⭐',
      LISTING_PUBLISHED: '📢',
      LISTING_FLAGGED: '🚩'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      BOOKING_REQUEST: 'border-l-4 border-yellow-500',
      BOOKING_APPROVED: 'border-l-4 border-green-500',
      BOOKING_DECLINED: 'border-l-4 border-red-500',
      MESSAGE_RECEIVED: 'border-l-4 border-blue-500',
      REVIEW_RECEIVED: 'border-l-4 border-purple-500',
      LISTING_PUBLISHED: 'border-l-4 border-indigo-500',
      LISTING_FLAGGED: 'border-l-4 border-red-500'
    };
    return colors[type] || 'border-l-4 border-gray-500';
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <PageShell
      title="Notifications"
      subtitle="Stay updated on bookings, messages, and more"
      action={notifications.some(n => !n.read) ? { label: 'Mark all as read', onClick: handleMarkAllAsRead } : undefined}
      maxWidth="max-w-2xl"
    >
      <section className="space-y-6">
        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-4 py-2 rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              !filterUnread
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={!filterUnread}
          >
            All
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`px-4 py-2 rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              filterUnread
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={filterUnread}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <ListSkeleton rows={5} />
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(notification => (
              <button
                type="button"
                key={notification.id}
                onClick={() => {
                  handleNavigate(notification);
                  if (!notification.read) handleMarkAsRead(notification.id);
                }}
                className={`w-full text-left p-4 bg-white border rounded-lg hover:shadow-md transition relative ${
                  !notification.read ? 'bg-blue-50' : ''
                } ${getNotificationColor(notification.type)}`}
                aria-label={`Notification: ${notification.title}`}
              >
                <div className="flex gap-4 items-start">
                  <span className="text-2xl" aria-hidden="true">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1" aria-label="Unread notification indicator"></span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Notifications"
            description="You're all caught up! Come back later for updates on your bookings and messages."
            action={{
              label: 'Browse Listings',
              onClick: () => navigate('/listings')
            }}
          />
        )}
      </section>
    </PageShell>
  );
}
