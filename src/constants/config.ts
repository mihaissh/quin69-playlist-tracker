/**
 * Application configuration constants
 */

/**
 * Playlist update interval (15 seconds)
 * Balanced for responsiveness while being respectful to the API
 */
export const UPDATE_INTERVAL_MS = 15000;
export const MAX_HISTORY_SONGS = 50;
export const MAX_PERSISTED_SONGS = 2000;
export const SONG_HISTORY_STORAGE_KEY = 'quin69_playlist_history';
// v2: re-check old pauses now that money tips are detected too
export const DONATION_HISTORY_STORAGE_KEY = 'quin69_donation_history_v2';
export const HISTORY_TAB_STORAGE_KEY = 'quin69_history_tab';
export const COPY_FEEDBACK_DURATION_MS = 2000;
export const ALBUM_ART_DEFER_DELAY_MS = 0;

export const ITUNES_IMAGE_SIZES = {
  DEFAULT: '100x100bb',
  HIGH_QUALITY: '600x600bb',
} as const;

export const ASSETS = {
  BASE_PATH: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
  PROFILE_IMAGE: 'quin69.png',
  BEDGE_EMOTE: 'Bedge-2x.webp',
  /** Shown on the back of the album artwork */
  SOMBRERO_FROG: 'sombrero-frog.gif',
} as const;

