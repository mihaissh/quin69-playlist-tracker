import { useState } from 'react';
import { SpotifyIcon, YouTubeIcon, ExternalLinkIcon } from './icons';

interface RecentlyPlayedProps {
  historyTitles: string[];
}

export function RecentlyPlayed({ historyTitles }: RecentlyPlayedProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const hasHistory = historyTitles.length > 0;

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-700/50 bg-zinc-800/30">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recently Played
          {hasHistory && (
            <span className="ml-auto px-2 py-0.5 bg-zinc-700/50 text-zinc-400 text-xs rounded-full">
              {historyTitles.length}
            </span>
          )}
        </h3>
      </div>
      <div className="divide-y divide-zinc-700/20 max-h-[350px] overflow-y-auto minimal-scrollbar">
        {hasHistory ? (
          historyTitles.map((song, index) => {
            const isSkipped = song.toLowerCase().includes('skipped');
            
            return (
              <div key={index}>
                {isSkipped ? (
                  // Skipped songs - no dropdown
                  <div className="w-full text-left px-5 py-3.5">
                    <span className="text-sm text-zinc-500 italic flex-1 truncate">
                      {song}
                    </span>
                  </div>
                ) : (
                  // Normal songs with dropdown
                  <>
                    <button
                      onClick={() => setSelectedSong(selectedSong === song ? null : song)}
                      className="group w-full text-left px-5 py-3.5 hover:bg-zinc-700/20 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm text-zinc-300 group-hover:text-emerald-400 transition-colors flex-1 truncate">
                        {song}
                      </span>
                      <svg
                        className={`w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all flex-shrink-0 ml-2 ${selectedSong === song ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Inline Dropdown */}
                    {selectedSong === song && (
                      <div className="px-5 py-4 bg-zinc-900/50 border-t border-zinc-700/30">
                        <div className="space-y-2.5">
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(song)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all group"
                          >
                            <SpotifyIcon className="w-5 h-5 text-emerald-400" />
                            <span className="flex-1 text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                              Open in Spotify
                            </span>
                            <ExternalLinkIcon className="w-4 h-4 text-emerald-400" />
                          </a>

                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all group"
                          >
                            <YouTubeIcon className="w-5 h-5 text-red-400" />
                            <span className="flex-1 text-sm font-medium text-red-400 group-hover:text-red-300">
                              Open in YouTube
                            </span>
                            <ExternalLinkIcon className="w-4 h-4 text-red-400" />
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-600">No recently played songs</p>
          </div>
        )}
      </div>
    </div>
  );
}

