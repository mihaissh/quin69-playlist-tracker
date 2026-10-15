/**
 * Playlist and history-related type definitions
 */

export interface SongWithTimestamp {
  title: string;
  timestamp: string; // ISO format: "YYYY-MM-DD HH:MM:SS"
  requestedBy?: string;
}

export interface RecentlyPlayedProps {
  /** Stored history, already filtered by the search term */
  songs: SongWithTimestamp[];
  searchTerm: string;
}

/** How long the current song has really been playing (epoch ms values) */
export interface SongTiming {
  /** When sheepfarmer first announced the song */
  startedAt: number;
  /** Total time spent paused (⏸ ... ▶️) since then */
  pausedMs: number;
  /** Set while Spotify is paused right now */
  pausedSince: number | null;
}

/**
 * Main playlist data structure used in the app
 */
export interface PlaylistData {
  currentSongTitle: string | null;
  historyTitles: string[];
  historySongs: SongWithTimestamp[];
  isOffline: boolean;
  /** Playback clock for the current song (null when offline / unknown) */
  currentSongTiming?: SongTiming | null;
}

