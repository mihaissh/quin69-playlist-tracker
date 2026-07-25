import { useState, useCallback, useRef, useEffect } from 'react';
import { parseSongInfo } from '@/utils/songParser';
import { API_ENDPOINTS, ITUNES_IMAGE_SIZES } from '@/constants';
import { logger } from '@/utils/logger';

interface UseAlbumArtReturn {
  albumArt: string | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

async function fetchAlbumArtFromItunes(artist: string, track: string): Promise<string | null> {
  try {
    const searchTerm = artist ? `${artist} ${track}` : track;
    const url = `${API_ENDPOINTS.ITUNES_SEARCH}?${new URLSearchParams({
      term: searchTerm,
      media: 'music',
      entity: 'song',
      limit: '1',
    })}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const artworkUrl = data.results[0].artworkUrl100;
      if (artworkUrl) {
        return artworkUrl.replace(ITUNES_IMAGE_SIZES.DEFAULT, ITUNES_IMAGE_SIZES.HIGH_QUALITY);
      }
    }

    return null;
  } catch (error) {
    logger.error('Error fetching from iTunes API:', error);
    return null;
  }
}

export function useAlbumArt(): UseAlbumArtReturn {
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const albumArtAbortControllerRef = useRef<AbortController | null>(null);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) {
      setAlbumArt(null);
      return;
    }

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

      const artworkUrl = await fetchAlbumArtFromItunes(parsed.artist, parsed.title);

      if (signal.aborted) return;

      setAlbumArt(artworkUrl);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      logger.error('Error fetching album art:', error);
      setAlbumArt(null);
    }
  }, []);

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
