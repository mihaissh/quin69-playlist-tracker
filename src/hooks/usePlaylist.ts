/**
 * Custom hook for fetching and managing playlist data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlaylistData } from '@/types/playlist';
import { UPDATE_INTERVAL_MS, API_ENDPOINTS } from '@/constants';
import { parsePlaylist } from '@/utils/playlist';
import { logger } from '@/utils/logger';

interface UsePlaylistProps {
  checkStreamStatus: (signal?: AbortSignal) => Promise<boolean>;
  fetchAlbumArt: (songTitle: string) => Promise<void>;
}

interface UsePlaylistReturn {
  playlist: PlaylistData;
  loading: boolean;
  error: boolean;
  initialLoadComplete: boolean;
}

/**
 * Hook to manage playlist fetching and updates
 */
export function usePlaylist({
  checkStreamStatus,
  fetchAlbumArt,
}: UsePlaylistProps): UsePlaylistReturn {
  const [playlist, setPlaylist] = useState<PlaylistData>({
    currentSongTitle: null,
    historyTitles: [],
    historySongs: [],
    isOffline: false,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(false);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const initialLoadCompleteRef = useRef(false);
  const previousSongTitleRef = useRef<string | null>(null);

  const updatePlaylist = useCallback(async () => {
    // Cancel previous fetch if still in progress
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }
    
    fetchAbortControllerRef.current = new AbortController();
    const signal = fetchAbortControllerRef.current.signal;
    
    try {
      setError(false);
      
      // Check if stream is live on Twitch
      const streamIsLive = await checkStreamStatus(signal);
      
      // Fetch WITH reverse to get newest messages first with cache-busting timestamp
      const logUrl = `${API_ENDPOINTS.PLAYLIST_LOG}&_t=${Date.now()}`;
      const response = await fetch(logUrl, {
        signal,
        cache: 'no-store',
      });
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedData = parsePlaylist(lines, streamIsLive);
      
      // Fetch album art if song changed
      if (parsedData.currentSongTitle && parsedData.currentSongTitle !== previousSongTitleRef.current) {
        const currentSong = parsedData.currentSongTitle;
        queueMicrotask(() => {
          fetchAlbumArt(currentSong);
        });
        previousSongTitleRef.current = currentSong;
      }
      
      setPlaylist(parsedData);
      
      // Mark initial load as complete after first successful fetch
      if (!initialLoadCompleteRef.current) {
        initialLoadCompleteRef.current = true;
        setInitialLoadComplete(true);
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      logger.error('Error fetching playlist:', err);
      setError(true);
      
      if (!initialLoadCompleteRef.current) {
        initialLoadCompleteRef.current = true;
        setInitialLoadComplete(true);
      }
      setLoading(false);
    }
  }, [fetchAlbumArt, checkStreamStatus]);

  useEffect(() => {
    updatePlaylist();
    const interval = setInterval(updatePlaylist, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updatePlaylist]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    playlist,
    loading,
    error,
    initialLoadComplete,
  };
}

