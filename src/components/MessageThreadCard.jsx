import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import ListSkeleton from './ListSkeleton';

/**
 * MessageThreadCard - Display a message thread in list
 */
export function MessageThreadCard({ thread, currentUserId }) {
  const otherParticipant = thread.participants?.find(p => p.id !== currentUserId);
  const unreadBadge = thread.unreadCount > 0;

  // Derive preview + timestamp gracefully supporting multiple shapes
  const previewText = thread.previewMessage || thread.lastMessage?.text || 'No messages yet';
  const lastUpdated = thread.lastUpdated || thread.lastMessage?.timestamp || Date.now();

  return (
    <li>
      <Link
        to={`/messages/${thread.id}`}
        className={`block p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${unreadBadge ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
        aria-label={`Open conversation with ${otherParticipant?.name || 'participant'}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {otherParticipant?.name || 'Unknown'}
            </h3>
            {thread.subject && (
              <p className="text-sm text-gray-600 mt-1">{thread.subject}</p>
            )}
          </div>
          {unreadBadge && (
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full ml-3 mt-1" aria-label="Unread messages" />
          )}
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
          {previewText}
        </p>
        <p className="text-xs text-gray-500" aria-label="Last updated time">
          {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
        </p>
      </Link>
    </li>
  );
}

/**
 * MessageThreadList - Display all message threads
 */
export function MessageThreadList({ threads, currentUserId, isLoading = false }) {
  if (isLoading) {
    return <ListSkeleton count={3} className="mb-6" />;
  }

  if (!threads || threads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No messages yet</p>
        <p className="text-sm text-gray-400">Start a conversation by messaging a host</p>
      </div>
    );
  }

  return (
    <ul className="border rounded-lg bg-white divide-y" aria-label="Message threads list">
      {threads.map(thread => (
        <MessageThreadCard
          key={thread.id}
          thread={thread}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}
