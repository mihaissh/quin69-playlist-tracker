import type { ActiveDonation } from './donation';
import type { SongTiming } from './playlist';

export interface SongInfo {
  artist: string;
  title: string;
  requestedBy?: string;
}

export interface OfflineMessage {
  title: string;
  subtitle: string;
}

export interface NowPlayingProps {
  isLoading: boolean;
  isOffline: boolean;
  currentSong: string | null;
  albumArt: string | null;
  /** True once `albumArt` has been looked up (and preloaded) for `currentSong` */
  albumArtReady?: boolean;
  /** Playback clock of the current song */
  songTiming?: SongTiming | null;
  /** Track length from iTunes */
  durationMs?: number | null;
  /** When set, Spotify is paused for a bits TTS / AI song donation */
  donation?: ActiveDonation | null;
}

export interface PlayingStateProps {
  currentSong: string;
  albumArt: string | null;
  /** Playback clock for the progress bar */
  timing?: SongTiming | null;
  /** Track length from iTunes */
  durationMs?: number | null;
}

export interface InfoFieldProps {
  label: string;
  value: string;
  labelColor?: string;
  valueColor?: string;
  textSize?: string;
}

export interface AlbumArtworkProps {
  src: string | null;
  /** Used to generate a unique placeholder when there is no artwork */
  seed?: string;
  alt?: string;
  size?: number | null;
}

export interface SearchLinksProps {
  songQuery: string;
}

