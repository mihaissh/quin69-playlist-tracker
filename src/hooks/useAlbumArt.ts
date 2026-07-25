import { useState, useCallback, useRef, useEffect } from 'react';
import { parseSongInfo } from '@/utils/songParser';
import { API_ENDPOINTS, ITUNES_IMAGE_SIZES } from '@/constants';

interface UseAlbumArtReturn {
  albumArt: string | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

interface ITunesSearchResult {
  results?: Array<{
    artworkUrl100?: string;
  }>;
}

function fetchItunesJsonp(url: string, timeoutMs = 8000): Promise<ITunesSearchResult | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const callbackName = `itunesCallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const script = document.createElement('script');

    let timer: NodeJS.Timeout | number | null = null;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>)[callbackName]) {
        delete (window as unknown as Record<string, unknown>)[callbackName];
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as unknown as Record<string, unknown>)[callbackName] = (data: ITunesSearchResult) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
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
    
    const data = await fetchItunesJsonp(url);
    
    if (data?.results && data.results.length > 0) {
      const artworkUrl = data.results[0].artworkUrl100;
      if (artworkUrl) {
        return artworkUrl.replace(ITUNES_IMAGE_SIZES.DEFAULT, ITUNES_IMAGE_SIZES.HIGH_QUALITY);
      }
    }

    return null;
  } catch {
    // Silently return null on network or CORS restrictions to fall back to default icon
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
    } catch {
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
