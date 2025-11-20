import React from 'react';

export default function ListSkeleton({ rows = 5, height = 'h-20', className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`rounded-lg bg-gray-200 ${height}`}></div>
      ))}
    </div>
  );
}
