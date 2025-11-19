import React from 'react';
import { formatDistanceToNow } from 'date-fns';

/**
 * MessageBubble - Display a single message
 */
export function MessageBubble({ message, isOwn, senderName }) {
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-xs px-4 py-2 rounded-lg
          ${isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }
        `}
      >
        {!isOwn && <p className="text-xs font-semibold mb-1">{senderName}</p>}
        <p className="break-words text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
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
      <div className="flex-1 space-y-4 animate-pulse overflow-y-auto p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded w-3/4"></div>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
          senderName={message.sender?.name}
        />
      ))}
    </div>
  );
}
