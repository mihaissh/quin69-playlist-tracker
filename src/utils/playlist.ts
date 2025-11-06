/**
 * Playlist parsing utilities
 */

import type { PlaylistData, SongWithTimestamp } from '@/types/playlist';
import { MAX_HISTORY_SONGS } from '@/constants';

/**
 * Parse chat log lines into playlist data
 * @param lines - Array of chat log lines
 * @param streamIsLive - Whether the stream is currently live
 * @returns Parsed playlist data
 */
export function parsePlaylist(lines: string[], streamIsLive: boolean): PlaylistData {
  let currentSongTitle: string | null = null;
  let historyTitles: string[] = [];
  let historySongs: SongWithTimestamp[] = [];
  
  // Use actual Twitch stream status
  const isOffline = !streamIsLive;

  // Get all songs with 🔊 (speaker emoji) and extract timestamps
  // With ?reverse, newest messages are first
  // Format: [2025-11-02 16:09:47] #quin69 sheepfarmer: 🔊 Song Title
  const allSongsWithTimestamps = lines
    .filter(line => 
      line.includes('🔊') && 
      !line.includes('VIBE') && 
      !line.toLowerCase().includes('offline') &&
      !line.includes('Clearing the spotify')
    )
    .map(line => {
      // Extract timestamp from [YYYY-MM-DD HH:MM:SS] format
      const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      const timestamp = timestampMatch ? timestampMatch[1] : '';
      
      // Extract song title after 🔊
      const songTitle = line.substring(line.indexOf('🔊') + 2).trim();
      
      return { title: songTitle, timestamp };
    });

  if (allSongsWithTimestamps.length === 0) {
    // No valid songs found
    return { currentSongTitle: null, historyTitles: [], historySongs: [], isOffline };
  }

  // The FIRST song (most recent message) is the current song
  currentSongTitle = allSongsWithTimestamps[0].title;

  // All songs after the first (older messages) are history
  // Remove duplicates but keep order
  const seen = new Set<string>();
  seen.add(currentSongTitle); // Don't include current in history
  
  for (let i = 1; i < allSongsWithTimestamps.length; i++) {
    const song = allSongsWithTimestamps[i];
    if (!seen.has(song.title)) {
      historyTitles.push(song.title);
      historySongs.push(song);
      seen.add(song.title);
    }
  }

  // Limit history to most recent unique songs
  historyTitles = historyTitles.slice(0, MAX_HISTORY_SONGS);
  historySongs = historySongs.slice(0, MAX_HISTORY_SONGS);

  return { currentSongTitle, historyTitles, historySongs, isOffline };
}

