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
}

export interface PlayingStateProps {
  currentSong: string;
  albumArt: string | null;
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
  alt?: string;
}

export interface SearchLinksProps {
  songQuery: string;
}

