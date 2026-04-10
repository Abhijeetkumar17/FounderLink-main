import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="animate-pulse space-y-4 w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="rounded-xl bg-gray-200 h-12 w-12 flex-shrink-0 animate-pulse"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded-full w-5/6 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
