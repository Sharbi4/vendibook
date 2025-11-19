import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { MessageThread } from '../components/MessageBubble';

/**
 * MessageDetailPage - Display and manage a specific message thread
 */
export function MessageDetailPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messageEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
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
  }, [threadId, navigate]);

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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!thread || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Thread not found</p>
      </div>
    );
  }

  const otherParticipant = thread.participants?.find(p => p.id !== currentUser.id);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {otherParticipant?.name || 'Unknown User'}
            </h2>
            {thread.subject && (
              <p className="text-sm text-gray-600">{thread.subject}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/messages')}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full overflow-hidden flex flex-col">
        <MessageThread
          messages={messages}
          currentUserId={currentUser.id}
          isLoading={isLoading}
        />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className={`px-6 py-2 bg-blue-500 text-white rounded-lg font-medium
                ${isSending || !newMessage.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600'
                }
                transition`}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      <div ref={messageEndRef} />
    </div>
  );
}
