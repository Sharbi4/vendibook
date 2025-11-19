import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

/**
 * MessageThreadCard - Display a message thread in list
 */
export function MessageThreadCard({ thread, currentUserId }) {
  const otherParticipant = thread.participants.find(p => p.id !== currentUserId);
  const unreadBadge = thread.unreadCount > 0;

  return (
    <Link
      to={`/messages/${thread.id}`}
      className={`
        block p-4 border-b hover:bg-gray-50 transition-colors
        ${unreadBadge ? 'bg-blue-50' : ''}
      `}
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
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full ml-3 mt-1"></span>
        )}
      </div>
      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
        {thread.previewMessage || 'No messages yet'}
      </p>
      <p className="text-xs text-gray-500">
        {formatDistanceToNow(new Date(thread.lastUpdated), { addSuffix: true })}
      </p>
    </Link>
  );
}

/**
 * MessageThreadList - Display all message threads
 */
export function MessageThreadList({ threads, currentUserId, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
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
    <div className="border rounded-lg divide-y bg-white">
      {threads.map(thread => (
        <MessageThreadCard
          key={thread.id}
          thread={thread}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
