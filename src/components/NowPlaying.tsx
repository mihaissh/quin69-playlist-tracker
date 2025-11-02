import { SpotifyIcon, YouTubeIcon } from './icons';

interface NowPlayingProps {
  isLoading: boolean;
  isOffline: boolean;
  currentSong: string | null;
  albumArt: string | null;
  showEasterEgg: boolean;
  onPlayButtonClick: () => void;
}

export function NowPlaying({
  isLoading,
  isOffline,
  currentSong,
  albumArt,
  showEasterEgg,
  onPlayButtonClick,
}: NowPlayingProps) {
  return (
    <div className="bg-zinc-800/50 rounded-xl border border-emerald-500/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-emerald-500/20 bg-emerald-500/5">
        <h3 className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          Now Playing
        </h3>
      </div>
      <div className="p-3">
        {isLoading ? (
          <LoadingState />
        ) : isOffline ? (
          <OfflineState />
        ) : currentSong ? (
          <PlayingState
            currentSong={currentSong}
            albumArt={albumArt}
            showEasterEgg={showEasterEgg}
            onPlayButtonClick={onPlayButtonClick}
          />
        ) : (
          <NoSongState />
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-zinc-500 text-xs uppercase tracking-wider">Loading</span>
    </div>
  );
}

function OfflineState() {
  // Funny rotating offline messages about Quin
  const offlineMessages = [
    {
      title: "Quin is offline right now",
      subtitle: "Probably checking Mathil's builds"
    },
    {
      title: "Stream is offline",
      subtitle: "Reinventing the meta with some potent build"
    },
    {
      title: "Quin69 is not live",
      subtitle: "Currently theorycrafting the next 0.01% build"
    },
    {
      title: "Stream unavailable",
      subtitle: "Eating all the burgers in New Zealand"
    },
    {
      title: "Not streaming right now",
      subtitle: "Searching for some bespoke builds"
    },
    {
      title: "Stream is offline",
      subtitle: "Hunting benny vaders in chat"
    }
  ];

  // Pick a message based on the current minute (changes every minute but stable during render)
  const messageIndex = Math.floor(Date.now() / 60000) % offlineMessages.length;
  const randomMessage = offlineMessages[messageIndex];

  return (
    <div>
      {/* Match the same layout as PlayingState */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3 relative">
        {/* Bedge Emote - Same position as album artwork */}
        <div className="w-32 sm:w-[30%] aspect-square rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={`${process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : ''}/Bedge-2x.webp`}
            alt="Bedge"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right side: Offline Messages - Same position as song info */}
        <div className="flex-1 flex flex-col justify-center gap-2.5 sm:gap-2.5 min-w-0 w-full sm:w-auto">
          {/* Offline Messages replacing Artist/Song */}
          <div className="flex-1 space-y-1 text-center sm:text-left w-full">
            <div>
              <span className="text-red-400 text-[10px] font-medium uppercase tracking-wide">Status</span>
              <p className="text-sm sm:text-base font-bold text-zinc-400 leading-tight mt-0.5">
                {randomMessage.title}
              </p>
            </div>
            <div>
              <span className="text-red-400 text-[10px] font-medium uppercase tracking-wide">Activity</span>
              <p className="text-sm sm:text-base font-semibold text-zinc-500 leading-tight mt-0.5">
                {randomMessage.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoSongState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
        <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      <p className="text-zinc-600 text-sm">No song playing</p>
    </div>
  );
}

interface PlayingStateProps {
  currentSong: string;
  albumArt: string | null;
  showEasterEgg: boolean;
  onPlayButtonClick: () => void;
}

function PlayingState({ currentSong, albumArt, showEasterEgg, onPlayButtonClick }: PlayingStateProps) {
  // Parse song title - usually format is "Artist - Song Title"
  const parts = currentSong.split(' - ');
  const artist = parts.length > 1 ? parts[0].trim() : 'Unknown Artist';
  const songTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : currentSong;
  const titleLength = Math.max(artist.length, songTitle.length);
  const textSize = titleLength > 50 ? 'text-xs sm:text-xs' : titleLength > 30 ? 'text-sm sm:text-sm' : 'text-sm sm:text-base';

  return (
    <div>
      {/* Album Art and Info Layout - Responsive */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3 relative">
        {/* Album Artwork - Responsive width with rounded corners */}
        {albumArt && !showEasterEgg ? (
          <div className="w-32 sm:w-[30%] aspect-square rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={albumArt}
              alt="Album Art"
              className="w-full h-full object-cover"
            />
          </div>
        ) : !showEasterEgg && (
          <div className="w-32 sm:w-[30%] aspect-square rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
        
        {/* Easter Egg */}
        {showEasterEgg && (
          <div className="w-32 sm:w-[30%] aspect-square rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-900/50">
            <img
              src={`${process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : ''}/ABOBA.gif`}
              alt="Easter Egg"
              className="w-full h-full object-contain animate-fade-in-out"
            />
          </div>
        )}
        
        {/* Right side: Controls - Responsive layout */}
        <div className="flex-1 flex flex-col justify-center gap-2.5 sm:gap-2.5 min-w-0 w-full sm:w-auto">
          {/* Play Button */}
          {!showEasterEgg && (
            <div className="flex items-center justify-center sm:justify-start">
              <button
                onClick={onPlayButtonClick}
                className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-emerald-500/10 flex items-center justify-center relative animate-pulse-ring cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                <svg className="w-5 h-5 text-emerald-500 relative z-10 animate-pulse-slow" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          )}
          
          {/* Song Name */}
          <div className="flex-1 space-y-1 text-center sm:text-left w-full">
            <div>
              <span className="text-emerald-400 text-[10px] font-medium uppercase tracking-wide">Artist</span>
              <p className={`${textSize} font-bold text-white leading-tight mt-0.5`}>
                {artist}
              </p>
            </div>
            <div>
              <span className="text-emerald-400 text-[10px] font-medium uppercase tracking-wide">Song</span>
              <p className={`${textSize} font-semibold text-white leading-tight mt-0.5`}>
                {songTitle}
              </p>
            </div>
          </div>
          
          {/* Search Links */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto">
            <a
              href={`https://open.spotify.com/search/${encodeURIComponent(currentSong)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-all text-[10px] text-emerald-400 hover:text-emerald-300"
            >
              <SpotifyIcon className="w-3.5 h-3.5" />
              Spotify
            </a>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentSong)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-2.5 sm:py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all text-[10px] text-red-400 hover:text-red-300"
            >
              <YouTubeIcon className="w-3.5 h-3.5" />
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

