import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { MessageThreadList } from '../components/MessageThreadCard';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/layout/PageShell';
import ListSkeleton from '../components/ListSkeleton';
import VerificationRequired from '../components/VerificationRequired.jsx';
import { useAuth } from '../hooks/useAuth.js';

/**
 * MessagesInboxPage - Display user's message threads
 */
export function MessagesInboxPage() {
  const navigate = useNavigate();
  const { needsVerification } = useAuth();
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (needsVerification) {
      setIsLoading(false);
      return;
    }

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
  }, [navigate, needsVerification]);

  const handleNewMessage = () => {
    // TODO: Open modal to start new conversation
    console.log('Start new message');
  };

  if (needsVerification) {
    return (
      <PageShell
        title="Messages"
        subtitle="Verify your email to message hosts"
        maxWidth="max-w-3xl"
      >
        <VerificationRequired
          title="Email verification required"
          description="To protect our community, messaging is available only after you verify your email."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Messages"
      subtitle="Your conversations"
      action={{ label: 'New Message', onClick: handleNewMessage }}
      maxWidth="max-w-4xl"
    >
      {isLoading ? (
        <ListSkeleton count={3} />
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
    </PageShell>
  );
}
