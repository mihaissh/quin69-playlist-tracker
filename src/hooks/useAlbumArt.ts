/**
 * Custom hook for fetching album artwork from iTunes
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { parseSongInfo } from '@/utils/songParser';
import { API_ENDPOINTS, ITUNES_IMAGE_SIZES } from '@/constants';
import { logger } from '@/utils/logger';

interface UseAlbumArtReturn {
  albumArt: string | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

/**
 * Fetch album artwork from iTunes Search API
 * Free API, no authentication required, works great for static sites
 */
import { fetchItunesJsonp } from '@/utils/itunesJsonp';

async function fetchAlbumArtFromItunes(artist: string, track: string): Promise<string | null> {
  try {
    const searchTerm = artist ? `${artist} ${track}` : track;
    return await fetchItunesJsonp(searchTerm);
  } catch (error) {
    logger.error('Error fetching from iTunes API:', error);
    return null;
  }
}

/**
 * Hook to manage album artwork fetching
 * Handles abort controllers and cleanup automatically
 */
export function useAlbumArt(): UseAlbumArtReturn {
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const albumArtAbortControllerRef = useRef<AbortController | null>(null);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) {
      setAlbumArt(null);
      return;
    }

    // Cancel previous fetch if still in progress
    if (albumArtAbortControllerRef.current) {
      albumArtAbortControllerRef.current.abort();
    }

    albumArtAbortControllerRef.current = new AbortController();
    const signal = albumArtAbortControllerRef.current.signal;

    try {
      const parsed = parseSongInfo(songTitle);
      
      if (!parsed.title) {
        setAlbumArt(null);
        return;
      }

      if (signal.aborted) return;

      // Fetch album artwork from iTunes
      const artworkUrl = await fetchAlbumArtFromItunes(parsed.artist, parsed.title);

      if (signal.aborted) return;

      setAlbumArt(artworkUrl);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      logger.error('Error fetching album art:', error);
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

