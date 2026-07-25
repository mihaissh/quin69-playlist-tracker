import { useState, useCallback, useRef, useEffect } from 'react';
import { parseSongInfo } from '@/utils/songParser';
import { fetchItunesJsonp } from '@/utils/itunesJsonp';

interface UseAlbumArtReturn {
  albumArt: string | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

export function useAlbumArt(): UseAlbumArtReturn {
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) {
      setAlbumArt(null);
      return;
    }

    try {
      const parsed = parseSongInfo(songTitle);
      
      if (!parsed.title) {
        setAlbumArt(null);
        return;
      }

      const searchTerm = parsed.artist ? `${parsed.artist} ${parsed.title}` : parsed.title;
      const artworkUrl = await fetchItunesJsonp(searchTerm);

      if (isMountedRef.current) {
        setAlbumArt(artworkUrl);
      }
    } catch {
      if (isMountedRef.current) {
        setAlbumArt(null);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    albumArt,
    fetchAlbumArt,
  };
}
