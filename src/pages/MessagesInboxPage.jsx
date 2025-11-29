import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Lock, 
  Ban, 
  Search, 
  MessageSquare, 
  Send, 
  MoreVertical, 
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Clock,
  Image,
  Paperclip,
  Smile,
  ChevronLeft,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
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
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl bg-slate-50 p-4">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!threads.length) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5124]/10">
            <MessageSquare className="h-7 w-7 text-[#FF5124]" />
          </div>
          <p className="text-base font-semibold text-slate-800">No messages yet</p>
          <p className="mt-1 text-sm text-slate-600">Once you start booking, your conversations will appear here.</p>
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF5124] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F]"
          >
            Browse listings
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {threads.map((thread) => {
          const counterpart = thread.participants?.find((person) => person.id !== currentUser?.id);
          const preview = thread.previewMessage || thread.lastMessage?.text || 'No messages yet';
          const timestamp = thread.lastMessage?.timestamp || thread.lastUpdated || Date.now();
          const isActive = thread.id === selectedThreadId;
          const hasUnread = thread.unreadCount > 0;
          
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => handleSelectThread(thread.id)}
              className={`w-full rounded-xl p-3 text-left transition-all ${
                isActive 
                  ? 'bg-[#FF5124]/10 border border-[#FF5124]/20' 
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-semibold text-slate-600 ${isActive ? 'ring-2 ring-[#FF5124] ring-offset-2' : ''}`}>
                    {counterpart?.avatar ? (
                      <img src={counterpart.avatar} alt={counterpart.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      counterpart?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-[#FF5124]' : 'text-slate-900'}`}>
                      {counterpart?.name || 'Conversation'}
                    </p>
                    <span className="flex-shrink-0 text-xs text-slate-400">
                      {formatDistanceToNow(new Date(timestamp), { addSuffix: false })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 truncate">
                    {thread.listingTitle || thread.role || counterpart?.role}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${hasUnread ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                      {preview}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5124] text-[10px] font-bold text-white">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderConversation = () => {
    if (!selectedThreadId || !selectedThread) {
      return (
        <div className="flex h-full flex-col items-center justify-center bg-slate-50 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <MessageSquare className="h-10 w-10 text-slate-300" />
          </div>
          <p className="text-xl font-semibold text-slate-700">Select a conversation</p>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Choose a thread from the list to view messages and continue the conversation.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Conversation Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile back button */}
            <button
              type="button"
              onClick={() => setSelectedThreadId(null)}
              className="lg:hidden rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Avatar */}
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-base font-semibold text-slate-600">
                {otherParticipant?.avatar ? (
                  <img src={otherParticipant.avatar} alt={otherParticipant.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            
            <div>
              <p className="text-sm font-semibold text-slate-900">{otherParticipant?.name || 'Conversation'}</p>
              <p className="text-xs text-slate-500">{selectedThread.listingTitle || selectedThread.subject || 'Direct message'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!canSendMessage && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                <Lock className="h-3 w-3" />
                <span>Locked</span>
              </div>
            )}
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
          <MessageThread messages={messages} currentUserId={currentUser?.id} isLoading={isLoadingMessages} />
        </div>
        
        {/* Composer */}
        {canSendMessage ? (
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={composerValue}
                  onChange={(event) => setComposerValue(event.target.value)}
                  rows={1}
                  placeholder="Type a message..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-900 transition-all focus:border-[#FF5124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSending || !composerValue.trim()}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  isSending || !composerValue.trim()
                    ? 'bg-slate-200 text-slate-400'
                    : 'bg-[#FF5124] text-white shadow-lg shadow-[#FF5124]/25 hover:bg-[#E5481F] hover:shadow-xl'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <Ban className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-800">Messaging closed</p>
                <p className="text-xs text-amber-600">{messagingStatus.reason}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <AppLayout contentClassName="py-0">
      {/* Full-height messaging layout */}
      <div className="flex h-[calc(100vh-80px)] bg-slate-50">
        {/* Left Sidebar - Thread List */}
        <div className={`flex flex-col border-r border-slate-200 bg-white ${selectedThreadId ? 'hidden lg:flex' : 'flex'} w-full lg:w-[380px] flex-shrink-0`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Messages</h1>
              <p className="text-sm text-slate-500">
                {threads.length} conversation{threads.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => console.log('Start new message')}
              className="rounded-full bg-[#FF5124] p-2.5 text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F] hover:shadow-xl"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-[#FF5124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto p-3">
            {renderThreadPreview()}
          </div>
        </div>

        {/* Right Panel - Conversation */}
        <div className={`flex flex-1 flex-col bg-white ${!selectedThreadId ? 'hidden lg:flex' : 'flex'}`}>
          {renderConversation()}
        </div>
      </div>
    </AppLayout>
  );
}
