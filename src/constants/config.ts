/**
 * Application configuration constants
 */

/**
 * Playlist update interval (30 seconds)
 */
export const UPDATE_INTERVAL_MS = 30000;

/**
 * Number of clicks required to trigger the easter egg
 */
export const EASTER_EGG_CLICKS = 5;

/**
 * Duration of the easter egg animation (3 seconds)
 */
export const EASTER_EGG_DURATION_MS = 3000;

/**
 * Maximum number of songs to show in history
 */
export const MAX_HISTORY_SONGS = 50;

/**
 * Easter egg cooldown period (5 minutes)
 */
export const EASTER_EGG_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * UI Size constants
 */
export const UI_SIZES = {
  ARTWORK_SIZE: "w-40 sm:w-[30%]",
  LABEL_SIZE: "text-[11px] sm:text-[10px]"
} as const;

/**
 * Asset paths
 */
export const ASSETS = {
  BASE_PATH: process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : '',
  PROFILE_IMAGE: 'quin69.png',
  BEDGE_EMOTE: 'Bedge-2x.webp',
  EASTER_EGG_GIF: 'ABOBA.gif',
  SPINNER_SVG: 'SvgSpinnersBouncingBall.svg'
} as const;

