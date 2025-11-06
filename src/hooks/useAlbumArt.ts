/**
 * Custom hook for fetching album artwork from iTunes
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAlbumArtReturn {
  albumArt: string | null;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

/**
 * Parse song title to extract artist and track name
 */
function parseSongInfo(songTitle: string): { artist: string; track: string } {
  const parts = songTitle.split(' - ');
  
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      track: parts.slice(1).join(' - ').trim(),
    };
  }
  
  return {
    artist: '',
    track: songTitle.trim(),
  };
}

/**
 * Fetch album artwork from iTunes Search API
 * Free API, no authentication required, works great for static sites
 */
async function fetchAlbumArtFromItunes(artist: string, track: string): Promise<string | null> {
  try {
    const searchTerm = artist ? `${artist} ${track}` : track;
    const url = `https://itunes.apple.com/search?${new URLSearchParams({
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
      // iTunes returns artwork at 100x100 by default, we can get larger versions
      // by replacing the size in the URL
      const artworkUrl = data.results[0].artworkUrl100;
      if (artworkUrl) {
        // Get the highest quality artwork (600x600)
        return artworkUrl.replace('100x100bb', '600x600bb');
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching from iTunes API:', error);
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
      const { artist, track } = parseSongInfo(songTitle);
      
      if (!track) {
        setAlbumArt(null);
        return;
      }

      if (signal.aborted) return;

      // Fetch album artwork from iTunes
      const artworkUrl = await fetchAlbumArtFromItunes(artist, track);
      
      if (artworkUrl) {
        console.log('✅ Album art fetched from iTunes');
      } else {
        console.warn('⚠️ No album art found for:', songTitle);
      }

      if (signal.aborted) return;

      if (artworkUrl) {
        setAlbumArt(artworkUrl);
      } else {
        console.warn('⚠️ No album art found for:', songTitle);
        setAlbumArt(null);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      console.error('❌ Error fetching album art:', error);
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

