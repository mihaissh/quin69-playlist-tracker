import { SpotifyIcon, YouTubeIcon } from './icons';
import { LoadingSpinner } from './Spinner';
import type {
  NowPlayingProps,
  PlayingStateProps,
  SongInfo,
  OfflineMessage,
  InfoFieldProps,
  AlbumArtworkProps,
  PlayButtonProps,
  SearchLinksProps,
} from '@/types/music';
import type { IconProps } from '@/types/common';
import { OFFLINE_MESSAGES, EMPTY_STATE_MESSAGES, ASSETS } from '@/constants';

// ==================== Constants ====================

// ==================== Utility Functions ====================

const parseSongInfo = (songString: string): SongInfo => {
  const parts = songString.split(' - ');
  
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    };
  }
  
  return {
    artist: 'Unknown Artist',
    title: songString
  };
};

const getTextSizeClass = (text1: string, text2: string): string => {
  const maxLength = Math.max(text1.length, text2.length);
  
  if (maxLength > 50) return 'text-xs sm:text-xs';
  if (maxLength > 30) return 'text-sm sm:text-sm';
  return 'text-base sm:text-base';
};

const getRotatingMessage = (messages: readonly OfflineMessage[]): OfflineMessage => {
  const messageIndex = Math.floor(Date.now() / 60000) % messages.length;
  return messages[messageIndex];
};

const getAssetPath = (filename: string): string => {
  return `${ASSETS.BASE_PATH}/${filename}`;
};

// ==================== UI Components ====================

const MusicIcon = ({ className = "w-3 h-3" }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const PlayIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const NoMusicIcon = () => (
  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={1.5} 
      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
    />
  </svg>
);

// ==================== Sub Components ====================

const CardHeader = () => (
  <div className="px-3 py-2 border-b border-emerald-500/20 bg-emerald-500/5">
    <h3 className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
      <MusicIcon />
      Now Playing
    </h3>
  </div>
);

const LoadingState = () => (
  <LoadingSpinner text={EMPTY_STATE_MESSAGES.LOADING} />
);

const NoSongState = () => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
      <NoMusicIcon />
    </div>
    <p className="text-zinc-600 text-sm">{EMPTY_STATE_MESSAGES.NO_SONG_PLAYING}</p>
  </div>
);

const InfoField = ({ 
  label, 
  value, 
  labelColor = "text-emerald-400",
  textSize = "text-base"
}: InfoFieldProps) => (
  <div>
    <span className={`${labelColor} text-[10px] font-medium uppercase tracking-wide block mb-1`}>
      {label}
    </span>
    <p className={`${textSize} font-bold text-white leading-tight`}>
      {value}
    </p>
  </div>
);

const AlbumArtwork = ({ 
  src, 
  alt = "Album Art" 
}: AlbumArtworkProps) => {
  if (src) {
    return (
      <div className="w-52 h-52 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover" 
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    );
  }

  return (
    <div className="w-52 h-52 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
      <MusicIcon className="w-24 h-24 text-zinc-600" />
    </div>
  );
};

const EasterEggDisplay = () => (
  <div className="w-52 h-52 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-900/50">
    <img
      src={getAssetPath(ASSETS.EASTER_EGG_GIF)}
      alt="Easter Egg"
      className="w-full h-full object-contain animate-fade-in-out"
      loading="lazy"
      decoding="async"
    />
  </div>
);

const PlayButton = ({ 
  onClick, 
  disabled, 
  message 
}: PlayButtonProps) => (
  <div className="hidden sm:flex items-center justify-start gap-3">
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Play button easter egg"
      className={`
        w-10 h-10 rounded-full bg-emerald-500/10 
        flex items-center justify-center relative flex-shrink-0 transition-all
        ${disabled 
          ? 'opacity-50 cursor-default' 
          : 'animate-pulse-ring cursor-pointer hover:scale-105'
        }
      `}
    >
      {!disabled && (
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow" />
      )}
      <PlayIcon className={`w-5 h-5 text-emerald-500 relative z-10 ${!disabled && 'animate-pulse-slow'}`} />
    </button>
    
    {message && (
      <div 
        key={message}
        className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shadow-lg animate-slide-in-fade"
      >
        <p className="text-xs font-medium text-emerald-400 whitespace-nowrap">
          {message}
        </p>
      </div>
    )}
  </div>
);

const SearchLinks = ({ songQuery }: SearchLinksProps) => (
  <div className="flex items-center justify-center sm:justify-start gap-2">
    <a
      href={`https://open.spotify.com/search/${encodeURIComponent(songQuery)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-all text-xs font-medium text-emerald-400 hover:text-emerald-300"
    >
      <SpotifyIcon className="w-4 h-4" />
      Spotify
    </a>
    <a
      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all text-xs font-medium text-red-400 hover:text-red-300"
    >
      <YouTubeIcon className="w-4 h-4" />
      YouTube
    </a>
  </div>
);

const OfflineState = () => {
  const message = getRotatingMessage(OFFLINE_MESSAGES);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0 mx-auto sm:mx-0">
        <div className="w-52 h-52 rounded-lg overflow-hidden shadow-lg">
          <img
            src={getAssetPath(ASSETS.BEDGE_EMOTE)}
            alt="Bedge"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="space-y-2 text-center sm:text-left">
          <InfoField 
            label="Status" 
            value={message.title} 
            labelColor="text-red-400"
          />
          <div>
            <span className="text-red-400 text-[10px] font-medium uppercase tracking-wide block mb-1">
              Activity
            </span>
            <p className="text-base font-semibold text-zinc-500 leading-tight">
              {message.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayingState = ({ 
  currentSong, 
  albumArt, 
  showEasterEgg, 
  onPlayButtonClick, 
  clickMessage 
}: PlayingStateProps) => {
  const songInfo = parseSongInfo(currentSong);
  const textSizeClass = getTextSizeClass(songInfo.artist, songInfo.title);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Album Artwork or Easter Egg - Matches info container height */}
      <div className="flex-shrink-0 mx-auto sm:mx-0 h-auto sm:h-auto">
        {showEasterEgg ? (
          <EasterEggDisplay />
        ) : (
          <AlbumArtwork src={albumArt} />
        )}
      </div>
      
      {/* Right Side: Song Info and Controls */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Play Button - Hidden on mobile */}
        <div className="hidden sm:block mb-2">
          <PlayButton 
            onClick={onPlayButtonClick}
            disabled={showEasterEgg}
            message={clickMessage}
          />
        </div>
        
        {/* Song Info */}
        <div className="space-y-3 text-center sm:text-left mb-4">
          <InfoField 
            label="Artist" 
            value={songInfo.artist}
            textSize={textSizeClass}
          />
          <InfoField 
            label="Song" 
            value={songInfo.title}
            textSize={textSizeClass}
          />
        </div>
        
        {/* Search Links - At bottom */}
        <div className="mt-auto">
          <SearchLinks songQuery={currentSong} />
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================

export function NowPlaying({
  isLoading,
  isOffline,
  currentSong,
  albumArt,
  showEasterEgg,
  onPlayButtonClick,
  clickMessage,
}: NowPlayingProps) {
  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isOffline) return <OfflineState />;
    if (currentSong) {
      return (
        <PlayingState
          currentSong={currentSong}
          albumArt={albumArt}
          showEasterEgg={showEasterEgg}
          onPlayButtonClick={onPlayButtonClick}
          clickMessage={clickMessage}
        />
      );
    }
    return <NoSongState />;
  };

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-emerald-500/30 overflow-hidden">
      <CardHeader />
      <div className="p-3">
        {renderContent()}
      </div>
    </div>
  );
}
