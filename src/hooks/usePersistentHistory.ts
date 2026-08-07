'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { SongWithTimestamp } from '@/types/playlist';
import {
  loadStoredHistory,
  saveStoredHistory,
  mergeSongHistory,
  getHistorySignature,
} from '@/utils/songHistoryStorage';

interface UsePersistentHistoryProps {
  incomingHistory: SongWithTimestamp[];
}

interface UsePersistentHistoryReturn {
  filteredSongs: SongWithTimestamp[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalStoredCount: number;
}

export function usePersistentHistory({
  incomingHistory,
}: UsePersistentHistoryProps): UsePersistentHistoryReturn {
  const [historySongs, setHistorySongs] = useState<SongWithTimestamp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const incomingSignatureRef = useRef('');

  useEffect(() => {
    setHistorySongs(loadStoredHistory());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || incomingHistory.length === 0) return;

    const signature = getHistorySignature(incomingHistory);
    if (signature === incomingSignatureRef.current) return;

    incomingSignatureRef.current = signature;

    setHistorySongs(prev => {
      const merged = mergeSongHistory(prev, incomingHistory);
      saveStoredHistory(merged);
      return merged;
    });
  }, [incomingHistory, isInitialized]);

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

  return {
    filteredSongs,
    searchTerm,
    setSearchTerm,
    totalStoredCount: historySongs.length,
  };
}
