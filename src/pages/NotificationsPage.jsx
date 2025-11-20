import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/PageShell';

/**
 * NotificationsPage - Full notifications center
 */
export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
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

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      await apiClient.post('/notifications/read', {
        markAllAsRead: true
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date()
        }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNavigate = (notification) => {
    if (notification.relatedId) {
      const normalizedType = (notification.type || '').toUpperCase();

      if (normalizedType.includes('BOOKING')) {
        navigate(`/bookings/${notification.relatedId}`);
      } else if (normalizedType === 'MESSAGE_RECEIVED') {
        navigate(`/messages/${notification.relatedId}`);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const normalizedType = (type || '').toUpperCase();
    const icons = {
      BOOKING_REQUEST: '📅',
      BOOKING_APPROVED: '✅',
      BOOKING_DECLINED: '❌',
      MESSAGE_RECEIVED: '💬',
      REVIEW_RECEIVED: '⭐',
      LISTING_PUBLISHED: '📢',
      LISTING_FLAGGED: '🚩'
    };
    return icons[normalizedType] || '🔔';
  };

  const getNotificationColor = (type) => {
    const normalizedType = (type || '').toUpperCase();
    const colors = {
      BOOKING_REQUEST: 'border-l-4 border-yellow-500',
      BOOKING_APPROVED: 'border-l-4 border-green-500',
      BOOKING_DECLINED: 'border-l-4 border-red-500',
      MESSAGE_RECEIVED: 'border-l-4 border-blue-500',
      REVIEW_RECEIVED: 'border-l-4 border-purple-500',
      LISTING_PUBLISHED: 'border-l-4 border-indigo-500',
      LISTING_FLAGGED: 'border-l-4 border-red-500'
    };
    return colors[normalizedType] || 'border-l-4 border-gray-500';
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

  const hasUnread = notifications.some(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PageShell
      title="Notifications"
      subtitle="Stay updated on bookings, messages, and more"
      action={{
        label: hasUnread ? 'Mark all as read' : 'All caught up',
        onClick: hasUnread ? handleMarkAllAsRead : undefined,
        disabled: isLoading || isMarkingAll || !hasUnread,
        variant: hasUnread ? 'primary' : 'secondary'
      }}
    >
      <section className="grid gap-6">
        <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:items-center sm:p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-700">Inbox health</p>
            <h2 className="text-2xl font-semibold text-gray-900">
              {hasUnread ? `${unreadCount} unread updates` : 'You are all caught up'}
            </h2>
            <p className="text-sm text-gray-600">
              Manage booking changes, messages, and reviews without missing a beat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            <button
              onClick={() => setFilterUnread(false)}
              aria-pressed={!filterUnread}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                !filterUnread
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUnread(true)}
              aria-pressed={filterUnread}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                filterUnread
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-400'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">Recent activity</p>
                <p className="text-xs text-gray-500">Tap a card to open the related booking, message, or listing.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {notifications.length} total
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  type="button"
                  className={`w-full text-left transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !notification.read ? 'bg-blue-50/50' : 'bg-white'
                  } ${getNotificationColor(notification.type)}`}
                  onClick={() => {
                    handleNavigate(notification);
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-4 px-4 py-4 sm:px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <span className="text-xs font-medium text-gray-500">{formatTime(notification.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {notification.link && (
                        <p className="text-xs font-semibold text-blue-600">View details →</p>
                      )}
                    </div>
                    {!notification.read && (
                      <span className="mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                    )}
                  </div>
                </button>
              ))}
            </div>
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
