/**
 * Storage and export utilities for persistent song history
 */

import type { SongWithTimestamp } from '@/types/playlist';
import { MAX_PERSISTED_SONGS, SONG_HISTORY_STORAGE_KEY } from '@/constants';
import { logger } from '@/utils/logger';

function isValidStoredSong(item: unknown): item is SongWithTimestamp {
  if (typeof item !== 'object' || item === null) return false;

  const song = item as SongWithTimestamp;
  return typeof song.title === 'string' && song.title.trim().length > 0;
}

function normalizeStoredSongs(items: unknown[]): SongWithTimestamp[] {
  return items.filter(isValidStoredSong).map(song => ({
    title: song.title.trim(),
    timestamp: typeof song.timestamp === 'string' ? song.timestamp : '',
    ...(typeof song.requestedBy === 'string' && song.requestedBy.trim()
      ? { requestedBy: song.requestedBy.trim() }
      : {}),
  }));
}

/**
 * Load stored song history from localStorage
 */
export function loadStoredHistory(): SongWithTimestamp[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(SONG_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return normalizeStoredSongs(parsed);
  } catch (error) {
    logger.error('Failed to load song history from localStorage:', error);
  }

  return [];
}

/**
 * Save song history to localStorage
 */
export function saveStoredHistory(songs: SongWithTimestamp[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const capped = songs.slice(0, MAX_PERSISTED_SONGS);
    localStorage.setItem(SONG_HISTORY_STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (error) {
    logger.error('Failed to save song history to localStorage:', error);
    return false;
  }
}

/**
 * Clear stored song history from localStorage
 */
export function clearStoredHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SONG_HISTORY_STORAGE_KEY);
  } catch (error) {
    logger.error('Failed to clear song history from localStorage:', error);
  }
}

/**
 * Build a stable signature for comparing incoming history snapshots.
 */
export function getHistorySignature(songs: SongWithTimestamp[]): string {
  return songs
    .map(song => `${song.title}\0${song.timestamp ?? ''}\0${song.requestedBy ?? ''}`)
    .join('\n');
}

/**
 * Merge existing history with newly incoming songs while maintaining deduplication and reverse chronological order.
 */
export function mergeSongHistory(
  existing: SongWithTimestamp[],
  incoming: SongWithTimestamp[]
): SongWithTimestamp[] {
  const map = new Map<string, SongWithTimestamp>();

  const getUniqueKey = (song: SongWithTimestamp): string => {
    const normTitle = song.title.trim().toLowerCase();
    const timestamp = song.timestamp ? song.timestamp.trim() : '';
    return timestamp ? `${normTitle}__${timestamp}` : normTitle;
  };

  for (const song of incoming) {
    if (song?.title) {
      map.set(getUniqueKey(song), { ...song });
    }
  }

  for (const song of existing) {
    if (!song?.title) continue;

    const key = getUniqueKey(song);
    const inMap = map.get(key);

    if (!inMap) {
      map.set(key, { ...song });
    } else if (!inMap.requestedBy && song.requestedBy) {
      inMap.requestedBy = song.requestedBy;
    }
  }

  const merged = Array.from(map.values());

  merged.sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return b.timestamp.localeCompare(a.timestamp);
  });

  return merged.slice(0, MAX_PERSISTED_SONGS);
}
