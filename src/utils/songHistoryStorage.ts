/**
 * Storage and export utilities for persistent song history
 */

import type { SongWithTimestamp } from '@/types/playlist';

const STORAGE_KEY = 'quin69_playlist_history';
const MAX_PERSISTED_SONGS = 2000; // Upper threshold to protect localStorage size

/**
 * Load stored song history from localStorage
 */
export function loadStoredHistory(): SongWithTimestamp[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load song history from localStorage:', error);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (error) {
    console.error('Failed to save song history to localStorage:', error);
    return false;
  }
}

/**
 * Clear stored song history from localStorage
 */
export function clearStoredHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear song history from localStorage:', error);
  }
}

/**
 * Merge existing history with newly incoming songs while maintaining deduplication and reverse chronological order.
 */
export function mergeSongHistory(
  existing: SongWithTimestamp[],
  incoming: SongWithTimestamp[]
): SongWithTimestamp[] {
  const map = new Map<string, SongWithTimestamp>();

  // Helper key generator for deduplication
  const getUniqueKey = (song: SongWithTimestamp): string => {
    const normTitle = song.title.trim().toLowerCase();
    const timestamp = song.timestamp ? song.timestamp.trim() : '';
    return timestamp ? `${normTitle}__${timestamp}` : normTitle;
  };

  // Process incoming songs first (more recent)
  for (const song of incoming) {
    if (song && song.title) {
      const key = getUniqueKey(song);
      map.set(key, { ...song });
    }
  }

  // Process existing stored songs
  for (const song of existing) {
    if (song && song.title) {
      const key = getUniqueKey(song);
      const inMap = map.get(key);
      if (!inMap) {
        map.set(key, { ...song });
      } else if (!inMap.requestedBy && song.requestedBy) {
        inMap.requestedBy = song.requestedBy;
      }
    }
  }

  const merged = Array.from(map.values());

  // Sort reverse chronologically by timestamp if available
  merged.sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return b.timestamp.localeCompare(a.timestamp);
  });

  return merged.slice(0, MAX_PERSISTED_SONGS);
}

/**
 * Format song history to JSON string
 */
export function exportHistoryAsJSON(songs: SongWithTimestamp[]): string {
  return JSON.stringify(songs, null, 2);
}

/**
 * Format song history to CSV string
 */
export function exportHistoryAsCSV(songs: SongWithTimestamp[]): string {
  const headers = ['Timestamp', 'Song Title', 'Requested By'];
  const rows = songs.map(song => {
    const timestamp = `"${(song.timestamp || '').replace(/"/g, '""')}"`;
    const title = `"${(song.title || '').replace(/"/g, '""')}"`;
    const requestedBy = `"${(song.requestedBy || '').replace(/"/g, '""')}"`;
    return [timestamp, title, requestedBy].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
