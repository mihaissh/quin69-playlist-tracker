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

async function queryItunes(searchTerm: string, signal?: AbortSignal): Promise<string | null> {
  if (!searchTerm.trim()) return null;

  const url = `${API_ENDPOINTS.ITUNES_SEARCH}?${new URLSearchParams({
    term: searchTerm.trim(),
    media: 'music',
    entity: 'song',
    limit: '1',
  })}`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data: ITunesSearchResult = await res.json();
    if (data?.results && data.results.length > 0 && data.results[0].artworkUrl100) {
      return data.results[0].artworkUrl100.replace(
        ITUNES_IMAGE_SIZES.DEFAULT,
        ITUNES_IMAGE_SIZES.HIGH_QUALITY
      );
    }
  } catch {
    // Return null on abort or network error
  }

  return null;
}

async function fetchAlbumArtFromItunes(
  artist: string,
  track: string,
  signal?: AbortSignal
): Promise<string | null> {
  const isUnknownArtist = !artist || artist.toLowerCase() === 'unknown artist';

  // 1. Primary search: "Artist Track" or just "Track"
  const primaryTerm = !isUnknownArtist ? `${artist} ${track}` : track;
  let art = await queryItunes(primaryTerm, signal);
  if (art) return art;

  // 2. Fallback: Search with track title only if artist was present
  if (!isUnknownArtist) {
    art = await queryItunes(track, signal);
    if (art) return art;

    // 3. Fallback: Try with main artist (split by feat/ft/&/x)
    const mainArtist = artist.split(/\s*(?:feat\.?|ft\.?|&|x|vs\.?)\s*/i)[0].trim();
    if (mainArtist && mainArtist !== artist) {
      art = await queryItunes(`${mainArtist} ${track}`, signal);
      if (art) return art;
    }
  }

  return null;
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

      const artworkUrl = await fetchAlbumArtFromItunes(parsed.artist, parsed.title, signal);

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

