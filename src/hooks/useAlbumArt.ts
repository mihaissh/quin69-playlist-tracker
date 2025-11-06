/**
 * Custom hook for fetching album artwork from Spotify
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAlbumArtReturn {
  albumArt: string | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

/**
 * Hook to manage album artwork fetching
 * Handles abort controllers and cleanup automatically
 */
export function useAlbumArt(): UseAlbumArtReturn {
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const albumArtAbortControllerRef = useRef<AbortController | null>(null);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) return;
    
    // Note: Album artwork fetching is disabled for static export builds
    // API routes are not supported with output: 'export' (GitHub Pages)
    // This feature would require a serverless function or different deployment approach
    setAlbumArt(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (albumArtAbortControllerRef.current) {
        albumArtAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    albumArt,
    fetchAlbumArt,
  };
}

