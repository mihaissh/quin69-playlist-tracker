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
    
    // Cancel previous album art fetch if still in progress
    if (albumArtAbortControllerRef.current) {
      albumArtAbortControllerRef.current.abort();
    }
    
    albumArtAbortControllerRef.current = new AbortController();
    
    try {
      // Use Spotify API to find album artwork
      const response = await fetch(
        `/api/spotify/artwork?q=${encodeURIComponent(songTitle)}`,
        {
          signal: albumArtAbortControllerRef.current.signal,
          cache: 'force-cache', // Aggressively cache album art
        }
      );
      
      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.artworkUrl) {
        setAlbumArt(data.artworkUrl);
      } else {
        setAlbumArt(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      console.error('Error fetching album art:', err);
      setAlbumArt(null);
    }
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

