'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-800/50 rounded-xl border border-red-500/30 p-6 text-center">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-4">
          We encountered an error while loading the playlist tracker.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-700/50 hover:bg-zinc-700/70 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
          >
            Reload Page
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-zinc-500 cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs text-red-400 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

