import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Lock, Ban } from 'lucide-react';
import { apiClient } from '../api/client';
import AppLayout from '../layouts/AppLayout.jsx';
import { MessageThread } from '../components/MessageBubble';
import { useMessagingPermissions } from '../hooks/useMessagingPermissions';

export function MessagesInboxPage() {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { getThreadMessagingStatus } = useMessagingPermissions();
  const [threads, setThreads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [composerValue, setComposerValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        setIsLoadingThreads(true);
        const userRes = await apiClient.get('/auth/me');
        setCurrentUser(userRes.data);
        // TODO: connect to /api/messages/me once backend is finalized
        const threadsRes = await apiClient.get('/messages/threads');
        setThreads(threadsRes.data || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setCurrentUser({ id: 'user-1', name: 'You', email: 'user@example.com' });
        setThreads([
          {
            id: 'thread-1',
            participants: [{ id: 'user-1', name: 'You' }, { id: 'host-1', name: 'John Doe', role: 'Host' }],
            lastMessage: { text: 'Thanks for booking! See you soon.', timestamp: new Date(Date.now() - 3600000) },
            role: 'Host',
            listingTitle: 'Downtown taco truck',
            unreadCount: 0
          },
          {
            id: 'thread-2',
            participants: [{ id: 'user-1', name: 'You' }, { id: 'host-2', name: 'Jane Smith', role: 'Event Pro' }],
            lastMessage: { text: 'Do you have any questions about the listing?', timestamp: new Date(Date.now() - 7200000) },
            role: 'Event Pro',
            listingTitle: 'Corporate catering · Scottsdale',
            unreadCount: 2
          }
        ]);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoadingThreads(false);
      }
    };

    loadThreads();
  }, [navigate]);

  useEffect(() => {
    if (threadId) {
      setSelectedThreadId(threadId);
    }
  }, [threadId]);

  useEffect(() => {
    if (!threadId && threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threadId, threads, selectedThreadId]);

  useEffect(() => {
    const controller = new AbortController();
    const loadThread = async () => {
      if (!selectedThreadId) {
        setMessages([]);
        return;
      }
      try {
        setIsLoadingMessages(true);
        const res = await apiClient.get(`/messages/${selectedThreadId}`, { signal: controller.signal });
        setMessages(res.data?.messages || []);
      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error('Failed to load thread messages:', error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadThread();
    return () => controller.abort();
  }, [selectedThreadId]);

  const selectedThread = useMemo(() => threads.find((thread) => thread.id === selectedThreadId), [threads, selectedThreadId]);
  const otherParticipant = selectedThread?.participants?.find((p) => p.id !== currentUser?.id);
  
  // Check messaging permissions for the selected thread
  const messagingStatus = useMemo(() => {
    return getThreadMessagingStatus(selectedThread);
  }, [selectedThread, getThreadMessagingStatus]);
  
  const canSendMessage = messagingStatus.allowed;

  const handleSelectThread = (id) => {
    setSelectedThreadId(id);
    navigate(`/messages/${id}`);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!composerValue.trim() || !selectedThreadId || !currentUser) return;
    
    // Enforce messaging permissions
    if (!canSendMessage) {
      alert(messagingStatus.reason || 'Messaging is not available for this conversation.');
      return;
    }

    try {
      setIsSending(true);
      const recipient = selectedThread?.participants?.find((p) => p.id !== currentUser.id);
      const response = await apiClient.post('/messages', {
        threadId: selectedThreadId,
        recipientId: recipient?.id,
        content: composerValue.trim()
      });
      setMessages((prev) => [...prev, response.data]);
      setComposerValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Unable to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const renderThreadPreview = () => {
    if (isLoadingThreads) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      );
    }

    if (!threads.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
          <p className="font-semibold">No messages yet</p>
          <p className="mt-1 text-sm">Once you start booking, your conversations will appear here.</p>
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="mt-4 inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Browse listings
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {threads.map((thread) => {
          const counterpart = thread.participants?.find((person) => person.id !== currentUser?.id);
          const preview = thread.previewMessage || thread.lastMessage?.text || 'No messages yet';
          const timestamp = thread.lastMessage?.timestamp || thread.lastUpdated || Date.now();
          const isActive = thread.id === selectedThreadId;
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => handleSelectThread(thread.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                isActive ? 'border-orange-500 bg-orange-50/80 shadow-sm' : 'border-slate-200 bg-white hover:border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{counterpart?.name || 'Conversation'}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{thread.role || counterpart?.role || 'Thread'}</p>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{preview}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</p>
            </button>
          );
        })}
      </div>
    );
  };

  const renderConversation = () => {
    if (!selectedThreadId || !selectedThread) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center text-slate-500">
          <p className="text-lg font-semibold">No conversation selected</p>
          <p className="mt-2 text-sm">Choose a thread to view messages.</p>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">{otherParticipant?.name || 'Conversation'}</p>
          <p className="text-xs text-slate-500">{selectedThread.listingTitle || selectedThread.subject || 'Direct message'}</p>
          {!canSendMessage && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
              <Lock className="h-3 w-3" />
              <span>Thread locked</span>
            </div>
          )}
        </div>
        <MessageThread messages={messages} currentUserId={currentUser?.id} isLoading={isLoadingMessages} />
        
        {/* Messaging form - shows locked state when messaging is disabled */}
        {canSendMessage ? (
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4">
            <div className="flex gap-3">
              <textarea
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                rows={2}
                placeholder="Type your message…"
                className="min-h-[56px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
              <button
                type="submit"
                disabled={isSending || !composerValue.trim()}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                  isSending || !composerValue.trim() ? 'bg-slate-300' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {isSending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3 text-slate-500">
              <Ban className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">Messaging closed</p>
                <p className="text-xs text-slate-500">{messagingStatus.reason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout contentClassName="py-10">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Messages</p>
          <h1 className="text-3xl font-bold text-slate-900">Inbox</h1>
          <p className="text-sm text-slate-500">Coordinate rentals, sales, and event pros from one place.</p>
        </div>
        <button
          type="button"
          onClick={() => console.log('Start new message')}
          className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          New message
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Threads</p>
          {renderThreadPreview()}
        </div>
        {renderConversation()}
      </div>
    </AppLayout>
  );
}
