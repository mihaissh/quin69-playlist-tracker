/**
 * Playlist parsing constants
 */

export const PLAYLIST_FILTERS = {
  SPEAKER_EMOJI: '🔊',
  EXCLUDE_VIBE: 'VIBE',
  EXCLUDE_OFFLINE: 'offline',
  EXCLUDE_CLEARING: 'Clearing the spotify',
  EXCLUDE_SKIPPED: 'was skipped',
  EXCLUDE_POINTS: 'points deducted',
} as const;

export const STREAM_STATUS_INDICATORS = {
  OFFLINE: 'offline',
  ERROR: 'error',
} as const;

export const SPEAKER_EMOJI_LENGTH = 2; // '🔊' + space


/** sheepfarmer posts these when Spotify is paused / resumed for a TTS or AI song */
export const PLAYBACK_MARKERS = {
  PAUSE: '⏸',
  RESUME: '▶',
} as const;

export const DONATION_CONFIG = {
  /** How far before the ⏸ to look for the bits cheer (observed: 2-9s) */
  LOOKBACK_MS: 30_000,
  /** How far after the ⏸ to look (log clock skew) */
  LOOKAHEAD_MS: 5_000,
  /**
   * Money tips don't show up in chat, but the donor usually pastes their token a
   * few seconds before the ⏸ (observed: 3-5s). Only that close a message counts.
   */
  TIP_WINDOW_MS: 15_000,
  /** Ignore a ⏸ older than this (bot may have missed ▶️) */
  MAX_PAUSE_MS: 10 * 60_000,
  /** How many of the latest pauses to look up on page load */
  BACKFILL_PAUSES: 12,
  /** A pause younger than this with no cheer found is retried (log ingestion lag) */
  RETRY_EMPTY_MS: 2 * 60_000,
  /** How many resolved pauses to keep in localStorage */
  MAX_STORED_PAUSES: 500,
} as const;
