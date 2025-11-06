/**
 * Custom hook for fetching album artwork from Spotify
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
 * Fetch album artwork from Spotify using their Web API
 * Uses Next.js API route in development, or configured serverless function URL in production
 */
async function fetchAlbumArtFromSpotify(artist: string, track: string): Promise<string | null> {
  // Use API route in development, or configured serverless function URL in production
  const apiUrl = process.env.NEXT_PUBLIC_SPOTIFY_API_URL || '/api/spotify/artwork';
  
  try {
    const url = `${apiUrl}?${new URLSearchParams({
      artist,
      track,
    })}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Spotify API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    return data.artworkUrl || null;
  } catch (error) {
    // Only log if it's not a network error (which is expected in static export)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      // This is expected in production with static export
      return null;
    }
    console.error('Error fetching from Spotify API:', error);
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

      // Only use Spotify API
      let artworkUrl: string | null = null;
      
      // Try Spotify if we have artist info
      if (artist) {
        artworkUrl = await fetchAlbumArtFromSpotify(artist, track);
        if (artworkUrl) {
          console.log('✅ Album art fetched from Spotify');
        } else {
          console.warn('⚠️ Spotify API did not return artwork for:', songTitle);
        }
      } else {
        console.warn('⚠️ Cannot fetch artwork: missing artist information');
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

