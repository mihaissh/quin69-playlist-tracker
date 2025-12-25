'use client';

import { useState } from 'react';
import { SpotifyIcon, YouTubeIcon, ExternalLinkIcon } from './icons';
import { ComponentEmote } from './clown-theme';
import { CopyButton } from './shared';
import { ClockIcon, ChevronDownIcon } from './shared/icons';
import { formatTimestamp } from '@/utils/timestamp';
import type { SongWithTimestamp, RecentlyPlayedProps } from '@/types/playlist';
import { EMPTY_STATE_MESSAGES } from '@/constants';

export function RecentlyPlayed({ historySongs }: RecentlyPlayedProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const hasHistory = historySongs.length > 0;

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden relative" style={{ boxShadow: '0 8px 16px rgba(0, 0, 0, 0.6)' }}>
      <ComponentEmote position="bottom-left" size={56} />
      <div className="px-5 py-3 border-b border-zinc-700/50 bg-zinc-800/30">
        <h3 className="text-sm font-medium flex items-center gap-2 text-zinc-400">
          <ClockIcon className="w-4 h-4 text-zinc-500" />
          Recently Played
          {hasHistory && (
            <span className="ml-auto px-2 py-0.5 bg-zinc-700/50 text-zinc-400 text-xs rounded-full">
              {historySongs.length}
            </span>
          )}
        </h3>
      </div>
      <div className="divide-y divide-zinc-700/20 max-h-[350px] overflow-y-auto minimal-scrollbar">
        {hasHistory ? (
          historySongs.map((songData, index) => {
            const song = songData.title;
            const timestamp = formatTimestamp(songData.timestamp);
            const isSkipped = song.toLowerCase().includes('skipped');
            
            return (
              <div key={index}>
                {isSkipped ? (
                  // Skipped songs - no dropdown
                  <div className="w-full text-left px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-500 italic flex-1 truncate">
                        {song}
                      </span>
                      {timestamp && (
                        <span className="text-xs text-zinc-600 flex-shrink-0">
                          {timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  // Normal songs with dropdown
                  <>
                    <button
                      onClick={() => setSelectedSong(selectedSong === song ? null : song)}
                      className="group w-full text-left px-5 py-3.5 hover:bg-zinc-700/20 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm text-zinc-300 group-hover:text-emerald-400 transition-colors flex-1 truncate">
                          {song}
                        </span>
                        {timestamp && (
                          <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors flex-shrink-0">
                            {timestamp}
                          </span>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                          <CopyButton songText={song} variant="div" />
                        </div>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all flex-shrink-0 ml-2 ${selectedSong === song ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {/* Inline Dropdown */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        selectedSong === song
                          ? 'max-h-32 opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-5 py-4 bg-zinc-900/50 border-t border-zinc-700/30">
                        <div className="flex gap-2.5">
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(song)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all group"
                          >
                            <SpotifyIcon className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                              Spotify
                            </span>
                            <ExternalLinkIcon className="w-4 h-4 text-emerald-400" />
                          </a>

                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all group"
                          >
                            <YouTubeIcon className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-medium text-red-400 group-hover:text-red-300">
                              YouTube
                            </span>
                            <ExternalLinkIcon className="w-4 h-4 text-red-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-600">{EMPTY_STATE_MESSAGES.NO_RECENT_SONGS}</p>
          </div>
        )}
      </div>
    </div>
  );
}

