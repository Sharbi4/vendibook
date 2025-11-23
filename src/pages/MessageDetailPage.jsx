import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { MessageThread } from '../components/MessageBubble';
import PageShell from '../components/layout/PageShell';
import VerificationRequired from '../components/VerificationRequired.jsx';
import { useAuth } from '../hooks/useAuth.js';

/**
 * MessageDetailPage - Display and manage a specific message thread
 */
export function MessageDetailPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { needsVerification } = useAuth();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messageEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (needsVerification) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Get current user
        const userRes = await apiClient.get('/auth/me');
        setCurrentUser(userRes.data);

        // Get thread
        const threadRes = await apiClient.get(`/messages/${threadId}`);
        setThread(threadRes.data);
        setMessages(threadRes.data.messages || []);
      } catch (error) {
        console.error('Failed to load thread:', error);
        // Use mock data on error
        setCurrentUser({ id: 'user-1', name: 'You', email: 'user@example.com' });
        const mockThread = {
          id: threadId,
          participants: [
            { id: 'user-1', name: 'You', email: 'user@example.com' },
            { id: 'host-1', name: 'John Doe', email: 'john@example.com' }
          ],
          messages: [
            { id: 'msg-1', senderId: 'host-1', senderName: 'John Doe', text: 'Hi! I saw your interest in my Beachfront Villa. Do you have any questions?', timestamp: new Date(Date.now() - 3600000) },
            { id: 'msg-2', senderId: 'user-1', senderName: 'You', text: 'Hi John! Yes, I have a few questions. Is the villa available for Aug 5-10?', timestamp: new Date(Date.now() - 1800000) },
            { id: 'msg-3', senderId: 'host-1', senderName: 'John Doe', text: 'Yes, those dates are available! The villa sleeps 8 guests and has a private beach access.', timestamp: new Date(Date.now() - 600000) },
            { id: 'msg-4', senderId: 'user-1', senderName: 'You', text: 'Perfect! That sounds amazing. I\'ll book it now.', timestamp: new Date(Date.now() - 300000) }
          ]
        };
        setThread(mockThread);
        setMessages(mockThread.messages);
        if (error.response?.status === 401) {
          navigate('/');
        } else if (error.response?.status === 404) {
          navigate('/messages');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(async () => {
      try {
        const threadRes = await apiClient.get(`/messages/${threadId}`);
        setMessages(threadRes.data.messages || []);
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [threadId, navigate, needsVerification]);

  useEffect(() => {
    // Auto-scroll to bottom
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setIsSending(true);

      const otherParticipant = thread.participantIds.find(
        id => id !== currentUser.id
      );

      const response = await apiClient.post('/messages', {
        threadId,
        recipientId: otherParticipant,
        content: newMessage
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const otherParticipant = thread?.participants?.find(p => currentUser && p.id !== currentUser.id);

  if (needsVerification) {
    return (
      <PageShell
        title="Messages"
        subtitle="Email verification required"
        maxWidth="max-w-3xl"
        action={{ label: 'Back to inbox', onClick: () => navigate('/messages') }}
      >
        <VerificationRequired
          title="Verify your email to continue"
          description="Messaging hosts keeps everyone accountable. Verify your email to unlock the inbox."
        />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell title="Loading conversation" subtitle="Fetching messages" maxWidth="max-w-4xl">
        <div className="flex items-center justify-center py-24" aria-label="Loading thread">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </PageShell>
    );
  }

  if (!thread || !currentUser) {
    return (
      <PageShell title="Conversation" subtitle="Not found" maxWidth="max-w-4xl">
        <div className="flex items-center justify-center py-24" aria-label="Thread not found">
          <p className="text-gray-500">Thread not found</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={otherParticipant?.name || 'Conversation'}
      subtitle={thread.subject || 'Direct messages'}
      action={{ label: 'Close', onClick: () => navigate('/messages') }}
      maxWidth="max-w-4xl"
      className="!min-h-screen"
    >
      <div className="flex flex-col h-[70vh] bg-white border rounded-lg overflow-hidden">
        <MessageThread
          messages={messages}
          currentUserId={currentUser.id}
          isLoading={isLoading}
        />
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2" aria-label="Send a message form">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              disabled={isSending}
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className={`px-6 py-2 bg-blue-500 text-white rounded-lg font-medium transition ${isSending || !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              aria-disabled={isSending || !newMessage.trim()}
              aria-label="Send message"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
        <div ref={messageEndRef} />
      </div>
    </PageShell>
  );
}
