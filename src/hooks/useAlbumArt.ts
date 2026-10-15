import { useState, useCallback, useRef, useEffect } from 'react';
import { parseSongInfo } from '@/utils/songParser';
import { API_ENDPOINTS, ITUNES_IMAGE_SIZES } from '@/constants';

interface UseAlbumArtReturn {
  albumArt: string | null;
  /** The song title `albumArt` belongs to (null until the first lookup finishes) */
  albumArtSong: string | null;
  /** Track length from iTunes (null when unknown or the match is unreliable) */
  durationMs: number | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

interface ITunesSearchResult {
  results?: Array<{
    artworkUrl100?: string;
    trackTimeMillis?: number;
  }>;
}

interface ItunesMatch {
  art: string;
  durationMs: number | null;
}

async function queryItunes(searchTerm: string, signal?: AbortSignal): Promise<ItunesMatch | null> {
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
    const first = data?.results?.[0];
    if (first?.artworkUrl100) {
      return {
        art: first.artworkUrl100.replace(ITUNES_IMAGE_SIZES.DEFAULT, ITUNES_IMAGE_SIZES.HIGH_QUALITY),
        durationMs: typeof first.trackTimeMillis === 'number' ? first.trackTimeMillis : null,
      };
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
): Promise<ItunesMatch | null> {
  const isUnknownArtist = !artist || artist.toLowerCase() === 'unknown artist';

  // 1. Primary search: "Artist Track" or just "Track"
  const primaryTerm = !isUnknownArtist ? `${artist} ${track}` : track;
  let art = await queryItunes(primaryTerm, signal);
  if (art) return art;

  // 2. Fallback: Search with track title only if artist was present
  if (!isUnknownArtist) {
    art = await queryItunes(track, signal);
    // Title-only matches are often a different recording: keep the art, not the length
    if (art) return { ...art, durationMs: null };

    // 3. Fallback: Try with main artist (split by feat/ft/&/x)
    const mainArtist = artist.split(/\s*(?:feat\.?|ft\.?|&|x|vs\.?)\s*/i)[0].trim();
    if (mainArtist && mainArtist !== artist) {
      art = await queryItunes(`${mainArtist} ${track}`, signal);
      if (art) return art;
    }
  }

  return null;
}

/**
 * Resolves once the image is downloaded (or failed / timed out), so the
 * Now Playing card can fade in with the artwork already there instead of popping in.
 */
function preloadImage(url: string, timeoutMs = 3000): Promise<void> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') return resolve();
    const img = new window.Image();
    const timer = setTimeout(resolve, timeoutMs);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });
}

export function useAlbumArt(): UseAlbumArtReturn {
  const [art, setArt] = useState<{ url: string | null; song: string | null; durationMs: number | null }>({
    url: null,
    song: null,
    durationMs: null,
  });
  const setAlbumArt = useCallback(
    (match: ItunesMatch | null, song: string) =>
      setArt({ url: match?.art ?? null, song, durationMs: match?.durationMs ?? null }),
    []
  );
  const albumArtAbortControllerRef = useRef<AbortController | null>(null);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) {
      setArt({ url: null, song: null, durationMs: null });
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
        setAlbumArt(null, songTitle);
        return;
      }

      if (signal.aborted) return;

      const match = await fetchAlbumArtFromItunes(parsed.artist, parsed.title, signal);

      if (signal.aborted) return;

      if (match) await preloadImage(match.art);

      if (signal.aborted) return;

      setAlbumArt(match, songTitle);
    } catch {
      if (!signal.aborted) setAlbumArt(null, songTitle);
    }
  }, [setAlbumArt]);

  useEffect(() => {
    return () => {
      if (albumArtAbortControllerRef.current) {
        albumArtAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    albumArt: art.url,
    albumArtSong: art.song,
    durationMs: art.durationMs,
    fetchAlbumArt,
  };
}

