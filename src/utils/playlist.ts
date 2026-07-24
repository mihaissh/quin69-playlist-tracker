/**
 * Playlist parsing utilities
 */

import type { PlaylistData, SongWithTimestamp, QueueSong } from '@/types/playlist';
import { MAX_HISTORY_SONGS, PLAYLIST_FILTERS, SPEAKER_EMOJI_LENGTH } from '@/constants';

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
      line.includes(PLAYLIST_FILTERS.SPEAKER_EMOJI) && 
      !line.toUpperCase().includes(PLAYLIST_FILTERS.EXCLUDE_VIBE) && 
      !line.toLowerCase().includes(PLAYLIST_FILTERS.EXCLUDE_OFFLINE) &&
      !line.includes(PLAYLIST_FILTERS.EXCLUDE_CLEARING)
    )
    .map(line => {
      // Extract timestamp from [YYYY-MM-DD HH:MM:SS] format
      const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      const timestamp = timestampMatch ? timestampMatch[1] : '';
      
      // Extract song title after 🔊
      const emojiIndex = line.indexOf(PLAYLIST_FILTERS.SPEAKER_EMOJI);
      const songTitle = line.substring(emojiIndex + SPEAKER_EMOJI_LENGTH).trim();
      
      return { title: songTitle, timestamp };
    });

  if (allSongsWithTimestamps.length === 0) {
    // No valid songs found
    return { currentSongTitle: null, historyTitles: [], historySongs: [], upcomingSongs: [], isOffline };
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

  return { currentSongTitle, historyTitles, historySongs, upcomingSongs: [], isOffline };
}

/**
 * Parse channel log lines for upcoming Channel Point song requests
 */
export function parseUpcomingRequests(
  channelLines: string[], 
  currentSongTitle: string | null, 
  historyTitles: string[]
): QueueSong[] {
  const playedSet = new Set<string>();
  if (currentSongTitle) playedSet.add(currentSongTitle.toLowerCase().trim());
  historyTitles.forEach(t => playedSet.add(t.toLowerCase().trim()));

  const upcoming: QueueSong[] = [];
  const seenUpcoming = new Set<string>();

  for (const line of channelLines) {
    if (line.includes(' - ') && !line.includes('sheepfarmer:') && !line.includes('streamelements:') && !line.includes('fossabot:')) {
      const match = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+#\w+\s+([^:]+):\s+(.+)$/);
      if (match) {
        const [, timestamp, requester, title] = match;
        const cleanTitle = title.replace(/\s+/g, ' ').trim();
        
        // Filter out non-music messages
        if (
          cleanTitle.length <= 120 && 
          !cleanTitle.toLowerCase().includes('http') && 
          !cleanTitle.toLowerCase().includes('playing')
        ) {
          const norm = cleanTitle.toLowerCase();
          if (!playedSet.has(norm) && !seenUpcoming.has(norm)) {
            upcoming.push({ title: cleanTitle, requester, timestamp });
            seenUpcoming.add(norm);
          }
        }
      }
    }
  }

  // Reverse so oldest pending request is first in queue
  return upcoming.reverse().slice(0, 10);
}
