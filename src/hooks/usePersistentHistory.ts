'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { SongWithTimestamp } from '@/types/playlist';
import {
  loadStoredHistory,
  saveStoredHistory,
  clearStoredHistory,
  mergeSongHistory,
  exportHistoryAsJSON,
  exportHistoryAsCSV,
  downloadFile,
} from '@/utils/songHistoryStorage';

interface UsePersistentHistoryProps {
  incomingHistory: SongWithTimestamp[];
}

interface UsePersistentHistoryReturn {
  historySongs: SongWithTimestamp[];
  filteredSongs: SongWithTimestamp[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalStoredCount: number;
  clearHistory: () => void;
  exportJSON: () => void;
  exportCSV: () => void;
  copyJSONToClipboard: () => Promise<boolean>;
}

export function usePersistentHistory({
  incomingHistory,
}: UsePersistentHistoryProps): UsePersistentHistoryReturn {
  const [historySongs, setHistorySongs] = useState<SongWithTimestamp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load stored history on initial mount
  useEffect(() => {
    const loaded = loadStoredHistory();
    setHistorySongs(loaded);
    setIsInitialized(true);
  }, []);

  // Merge incoming stream songs with persistent local storage
  useEffect(() => {
    if (!isInitialized) return;
    if (!incomingHistory || incomingHistory.length === 0) return;

    setHistorySongs(prev => {
      const merged = mergeSongHistory(prev, incomingHistory);
      saveStoredHistory(merged);
      return merged;
    });
  }, [incomingHistory, isInitialized]);

  // Filter songs based on search term
  const filteredSongs = useMemo(() => {
    if (!searchTerm.trim()) return historySongs;
    const query = searchTerm.toLowerCase().trim();

    return historySongs.filter(song => {
      const titleMatch = song.title.toLowerCase().includes(query);
      const requesterMatch = song.requestedBy?.toLowerCase().includes(query);
      const timestampMatch = song.timestamp?.toLowerCase().includes(query);
      return titleMatch || requesterMatch || timestampMatch;
    });
  }, [historySongs, searchTerm]);

  const clearHistoryHandler = useCallback(() => {
    clearStoredHistory();
    setHistorySongs([]);
    setSearchTerm('');
  }, []);

  const exportJSON = useCallback(() => {
    const jsonString = exportHistoryAsJSON(historySongs);
    downloadFile(
      jsonString,
      `quin69-playlist-history-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  }, [historySongs]);

  const exportCSV = useCallback(() => {
    const csvString = exportHistoryAsCSV(historySongs);
    downloadFile(
      csvString,
      `quin69-playlist-history-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv'
    );
  }, [historySongs]);

  const copyJSONToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      const jsonString = exportHistoryAsJSON(historySongs);
      await navigator.clipboard.writeText(jsonString);
      return true;
    } catch {
      return false;
    }
  }, [historySongs]);

  return {
    historySongs,
    filteredSongs,
    searchTerm,
    setSearchTerm,
    totalStoredCount: historySongs.length,
    clearHistory: clearHistoryHandler,
    exportJSON,
    exportCSV,
    copyJSONToClipboard,
  };
}
