import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { MessageThreadList } from '../components/MessageThreadCard';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';

/**
 * MessagesInboxPage - Display user's message threads
 */
export function MessagesInboxPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const userRes = await apiClient.get('/auth/me');
        setCurrentUser(userRes.data);

        // Get message threads
        const threadsRes = await apiClient.get('/messages/threads');
        setThreads(threadsRes.data || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Use mock data on error
        setCurrentUser({ id: 'user-1', name: 'You', email: 'user@example.com' });
        setThreads([
          {
            id: 'thread-1',
            participants: [{ id: 'user-1', name: 'You' }, { id: 'host-1', name: 'John Doe' }],
            lastMessage: { text: 'Thanks for booking! See you soon.', timestamp: new Date(Date.now() - 3600000) },
            unreadCount: 0
          },
          {
            id: 'thread-2',
            participants: [{ id: 'user-1', name: 'You' }, { id: 'host-2', name: 'Jane Smith' }],
            lastMessage: { text: 'Do you have any questions about the listing?', timestamp: new Date(Date.now() - 7200000) },
            unreadCount: 2
          }
        ]);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleNewMessage = () => {
    // TODO: Open modal to start new conversation
    console.log('Start new message');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <SectionHeader title="Messages" subtitle="Your conversations" />
        <button
          onClick={handleNewMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          New Message
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : threads.length > 0 ? (
        <MessageThreadList
          threads={threads}
          currentUserId={currentUser?.id}
          isLoading={isLoading}
        />
      ) : (
        <EmptyState
          title="No Messages"
          description="You haven't started any conversations yet. Browse listings and message hosts to get started!"
          action={{
            label: 'Browse Listings',
            onClick: () => navigate('/listings')
          }}
        />
      )}
    </div>
  );
}
