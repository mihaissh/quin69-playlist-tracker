/**
 * Playlist parsing utilities
 */

import type { PlaylistData, SongTiming, SongWithTimestamp } from '@/types/playlist';
import { MAX_HISTORY_SONGS, PLAYBACK_MARKERS, PLAYLIST_FILTERS, SPEAKER_EMOJI_LENGTH } from '@/constants';
import { parseSongInfo } from '@/utils/songParser';

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
      !line.includes(PLAYLIST_FILTERS.EXCLUDE_CLEARING) &&
      !line.includes(PLAYLIST_FILTERS.EXCLUDE_SKIPPED) &&
      !line.includes(PLAYLIST_FILTERS.EXCLUDE_POINTS)
    )
    .map(line => {
      // Extract timestamp from [YYYY-MM-DD HH:MM:SS] format
      const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      const timestamp = timestampMatch ? timestampMatch[1] : '';
      
      // Extract song title after 🔊
      const emojiIndex = line.indexOf(PLAYLIST_FILTERS.SPEAKER_EMOJI);
      const songTitle = line.substring(emojiIndex + SPEAKER_EMOJI_LENGTH).trim();
      const parsedInfo = parseSongInfo(songTitle);
      
      return { 
        title: songTitle, 
        timestamp,
        ...(parsedInfo.requestedBy ? { requestedBy: parsedInfo.requestedBy } : {})
      };
    });

  if (allSongsWithTimestamps.length === 0) {
    // No valid songs found
    return { currentSongTitle: null, historyTitles: [], historySongs: [], isOffline };
  }

  // If live, the first song (most recent message) is the current song
  // If offline, no song is currently playing, so all songs go to history
  const startIndex = streamIsLive ? 1 : 0;
  if (streamIsLive) {
    currentSongTitle = allSongsWithTimestamps[0].title;
  }

  // Remove duplicates but keep order
  const seen = new Set<string>();
  if (currentSongTitle) {
    seen.add(currentSongTitle);
  }
  
  for (let i = startIndex; i < allSongsWithTimestamps.length; i++) {
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


/** "YYYY-MM-DD HH:MM:SS" (UTC) -> epoch ms */
function logTimeToMs(timestamp: string): number {
  return new Date(timestamp.replace(' ', 'T') + 'Z').getTime();
}

/**
 * Works out how long the current song has actually been playing, from
 * sheepfarmer's lines (newest first):
 *  - start = the earliest "🔊 <title>" in the current run (the bot re-posts the
 *    same song after a pause or a !song, so repeated lines are merged)
 *  - every ⏸ ... ▶️ gap after the start is subtracted
 *  - if the latest event is ⏸, the clock is frozen (`pausedSince`)
 */
export function getSongTiming(lines: string[], currentTitle: string | null): SongTiming | null {
  if (!currentTitle) return null;

  type Event = { kind: 'song' | 'pause' | 'resume'; ms: number; title?: string };
  const events: Event[] = [];

  for (const line of lines) {
    const tsMatch = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
    if (!tsMatch) continue;
    const colon = line.indexOf(': ', line.indexOf('#'));
    if (colon === -1) continue;
    const message = line.substring(colon + 2).trim();
    const ms = logTimeToMs(tsMatch[1]);

    if (message.startsWith(PLAYLIST_FILTERS.SPEAKER_EMOJI)) {
      const title = message.substring(SPEAKER_EMOJI_LENGTH).trim();
      if (title !== currentTitle) break; // reached the previous song
      events.push({ kind: 'song', ms, title });
    } else if (message.startsWith(PLAYBACK_MARKERS.PAUSE)) {
      events.push({ kind: 'pause', ms });
    } else if (message.startsWith(PLAYBACK_MARKERS.RESUME)) {
      events.push({ kind: 'resume', ms });
    }
  }

  // Oldest first, starting at the first time this song was announced
  events.reverse();
  const firstSong = events.findIndex(e => e.kind === 'song');
  if (firstSong === -1) return null;
  const run = events.slice(firstSong);

  let pausedMs = 0;
  let pausedSince: number | null = null;
  for (const e of run) {
    if (e.kind === 'pause' && pausedSince === null) {
      pausedSince = e.ms;
    } else if ((e.kind === 'resume' || e.kind === 'song') && pausedSince !== null) {
      pausedMs += Math.max(0, e.ms - pausedSince);
      pausedSince = null;
    }
  }

  return { startedAt: run[0].ms, pausedMs, pausedSince };
}
