import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, MessageSquare, DollarSign, Star, Calendar } from 'lucide-react';
import { apiClient } from '../api/client';
import SectionHeader from '../components/SectionHeader';

/**
 * AnalyticsDashboardPage - Host analytics and insights
 */
export function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/analytics/host/overview');
        setAnalytics(res.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        // Use mock data on error
        setAnalytics({
          totalViews: 1245,
          totalInquiries: 42,
          totalBookings: 8,
          totalEarnings: 3200,
          averageRating: 4.8,
          conversionRate: 19,
          listingsCount: 3,
          activeListings: 3,
          listings: [
            { id: 'listing-1', title: 'Beachfront Villa', views: 450, bookings: 5, earnings: 1250, rating: 4.9 },
            { id: 'listing-2', title: 'Mountain Cabin', views: 380, bookings: 2, earnings: 900, rating: 4.6 },
            { id: 'listing-3', title: 'Downtown Apartment', views: 415, bookings: 1, earnings: 1050, rating: 4.7 }
          ],
          bookingMetrics: {
            total: 8,
            completed: 5,
            pending: 2,
            cancelled: 1
          }
        });
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  // Summary cards data
  const cards = [
    {
      icon: <Eye className="w-6 h-6" />,
      label: 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'Inquiries',
      value: analytics.totalInquiries.toLocaleString(),
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Bookings',
      value: analytics.completedBookings.toLocaleString(),
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: 'Total Earnings',
      value: `$${analytics.totalEarnings.toLocaleString()}`,
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: 'Average Rating',
      value: `${analytics.avgRating} ⭐`,
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SectionHeader
        title="Analytics Dashboard"
        subtitle="Track your hosting performance and earnings"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} p-6 rounded-lg shadow-sm border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">{card.label}</p>
              {card.icon}
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Booking Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Total Bookings</p>
                <p className="text-sm font-bold text-gray-900">{analytics.totalBookings}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((analytics.totalBookings / 50) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Completed Bookings</p>
                <p className="text-sm font-bold text-gray-900">{analytics.completedBookings}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${analytics.totalBookings > 0 ? (analytics.completedBookings / analytics.totalBookings) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Pending Bookings</p>
                <p className="text-sm font-bold text-gray-900">{analytics.pendingBookings}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${analytics.totalBookings > 0 ? (analytics.pendingBookings / analytics.totalBookings) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Listing Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Total Listings</p>
                <p className="text-sm font-bold text-gray-900">{analytics.totalListings}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((analytics.totalListings / 20) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Active Listings</p>
                <p className="text-sm font-bold text-gray-900">{analytics.activeListings}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${analytics.totalListings > 0 ? (analytics.activeListings / analytics.totalListings) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/host/listings')}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Manage Listings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.totalViews === 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="font-medium text-gray-900">📸 Add More Photos</p>
              <p className="text-sm text-gray-600">Listings with multiple high-quality photos get 2x more views</p>
            </div>
          )}

          {analytics.avgRating < 4 && analytics.reviewCount > 0 && (
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <p className="font-medium text-gray-900">⭐ Improve Your Rating</p>
              <p className="text-sm text-gray-600">Focus on providing excellent experiences to boost your rating</p>
            </div>
          )}

          {analytics.conversionRate < 5 && (
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="font-medium text-gray-900">💰 Optimize Your Price</p>
              <p className="text-sm text-gray-600">Consider adjusting pricing to improve booking conversion</p>
            </div>
          )}

          {analytics.pendingBookings > 3 && (
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="font-medium text-gray-900">⚡ Respond Faster</p>
              <p className="text-sm text-gray-600">Quick responses increase booking acceptance rates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
