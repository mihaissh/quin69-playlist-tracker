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
  const previousSongTitleRef = useRef<string | null>(null);

  const updatePlaylist = useCallback(async () => {
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }
    
    fetchAbortControllerRef.current = new AbortController();
    const signal = fetchAbortControllerRef.current.signal;
    
    try {
      setError(false);
      
      const streamIsLive = await checkStreamStatus(signal);
      
      if (!streamIsLive) {
        setPlaylist({
          currentSongTitle: null,
          historyTitles: [],
          historySongs: [],
          isOffline: true,
        });
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.PLAYLIST_LOG, {
        signal,
        cache: 'no-cache',
      });
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedData = parsePlaylist(lines, streamIsLive);
      
      if (parsedData.currentSongTitle && parsedData.currentSongTitle !== previousSongTitleRef.current) {
        const currentSong = parsedData.currentSongTitle;
        queueMicrotask(() => {
          fetchAlbumArt(currentSong);
        });
        previousSongTitleRef.current = currentSong;
      }
      
      setPlaylist(parsedData);
      
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      logger.error('Error fetching playlist:', err);
      setError(true);
      
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      setLoading(false);
    }
  }, [fetchAlbumArt, checkStreamStatus, initialLoadComplete]);

  useEffect(() => {
    updatePlaylist();
    const interval = setInterval(updatePlaylist, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updatePlaylist]);

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
