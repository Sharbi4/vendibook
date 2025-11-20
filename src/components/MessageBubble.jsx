import React from 'react';
import { formatDistanceToNow } from 'date-fns';

/**
 * MessageBubble - Display a single message
 */
export function MessageBubble({ message, isOwn, senderName }) {
  const contentText = message.content || message.text || '';
  const timestamp = message.createdAt || message.timestamp || Date.now();
  const displaySender = senderName || message.senderName || message.sender?.name;
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}
        aria-label={`Message ${isOwn ? 'you sent' : `from ${displaySender || 'participant'}`}`}
      >
        {!isOwn && displaySender && <p className="text-xs font-semibold mb-1">{displaySender}</p>}
        <p className="break-words text-sm">{contentText}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`} aria-label="Sent time">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

/**
 * MessageThread - Display all messages in a thread
 */
export function MessageThread({ messages = [], currentUserId, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 animate-pulse overflow-y-auto p-4" aria-label="Loading messages">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded w-3/4" />
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500" aria-label="Empty conversation">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-label="Conversation messages">
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
          senderName={message.sender?.name || message.senderName}
        />
      ))}
    </div>
  );
}
