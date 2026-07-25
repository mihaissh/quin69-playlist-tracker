'use client';

import { useState } from 'react';
import { SpotifyIcon, YouTubeIcon, ExternalLinkIcon } from './icons';
import { CopyButton } from './shared';
import { ClockIcon, ChevronDownIcon } from './shared/icons';
import { HistoryAlbumArt } from './HistoryAlbumArt';
import { formatTimestamp } from '@/utils/timestamp';
import type { RecentlyPlayedProps } from '@/types/playlist';
import { EMPTY_STATE_MESSAGES } from '@/constants';

export function RecentlyPlayed({ historySongs }: RecentlyPlayedProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const hasHistory = historySongs.length > 0;

  return (
    <div 
      className="bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-zinc-800/80 overflow-hidden relative shadow-2xl transition-all duration-500 hover:border-zinc-700/60"
      style={{ boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)' }}
    >
      {/* Top indigo light accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* Card Header */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 via-zinc-800/40 to-zinc-900/90 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2.5 text-zinc-300">
          <span className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 flex items-center justify-center">
            <ClockIcon className="w-3.5 h-3.5" />
          </span>
          <span>Recently Played</span>
        </h3>

        {hasHistory && (
          <span className="px-2.5 py-0.5 bg-indigo-950/40 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {historySongs.length} {historySongs.length === 1 ? 'song' : 'songs'}
          </span>
        )}
      </div>

      {/* Songs List */}
      <div className="divide-y divide-zinc-800/50 max-h-[380px] sm:max-h-[440px] overflow-y-auto minimal-scrollbar">
        {hasHistory ? (
          historySongs.map((songData, index) => {
            const song = songData.title;
            const timestamp = formatTimestamp(songData.timestamp);
            const isSkipped = song.toLowerCase().includes('skipped');
            const isSelected = selectedSong === song;

            // Strip "skipped"/"(skipped)" etc. from the title for search queries and clean title
            const searchQuery = isSkipped
              ? song.replace(/\s*\(?\s*skipped\s*\)?\s*/gi, '').trim()
              : song;

            const cleanTitle = isSkipped
              ? song.replace(/\s*\(?\s*skipped\s*\)?\s*/gi, '').trim()
              : song;

            return (
              <div 
                key={`${song}-${index}`} 
                className={`transition-colors duration-300 ${isSelected ? 'bg-indigo-950/20' : ''}`}
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <button
                  onClick={() => setSelectedSong(isSelected ? null : song)}
                  className={`group relative w-full text-left px-5 py-3 transition-all duration-300 flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-indigo-900/20 via-zinc-800/40 to-transparent' 
                      : 'hover:bg-gradient-to-r hover:from-indigo-950/20 hover:via-zinc-800/40 hover:to-transparent'
                  }`}
                  aria-expanded={isSelected}
                >
                  {/* Left accent bar on hover or when expanded */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r transition-all duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`} 
                  />

                  {/* Left Content: Index, Album Cover Thumbnail, Title, Badges */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-medium text-zinc-500 group-hover:text-indigo-400 transition-colors w-4 text-right flex-shrink-0">
                      #{index + 1}
                    </span>

                    {/* Album Cover Thumbnail */}
                    <HistoryAlbumArt songTitle={searchQuery} size="sm" />

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span 
                        className={`text-sm font-medium transition-all flex-1 truncate ${
                          isSkipped
                            ? 'text-zinc-500 italic group-hover:text-zinc-300'
                            : isSelected
                              ? 'text-indigo-300 font-semibold'
                              : 'text-zinc-200 group-hover:text-indigo-300'
                        }`}
                      >
                        {cleanTitle}
                      </span>

                      {isSkipped && (
                        <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
                          Skipped
                        </span>
                      )}
                    </div>

                    {timestamp && (
                      <span className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-400 bg-zinc-800/40 group-hover:bg-zinc-800/80 px-2 py-0.5 rounded transition-all flex-shrink-0 hidden sm:inline-block">
                        {timestamp}
                      </span>
                    )}

                    <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                      <CopyButton songText={searchQuery} variant="div" />
                    </div>
                  </div>

                  {/* Chevron Icon */}
                  <div className={`p-1 rounded-md transition-all duration-300 flex-shrink-0 ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-300 rotate-180' : 'text-zinc-500 group-hover:text-indigo-400 group-hover:bg-zinc-800/60'
                  }`}>
                    <ChevronDownIcon className="w-4 h-4 transition-transform duration-300" />
                  </div>
                </button>

                {/* Inline Dropdown Accordion */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isSelected ? 'grid-rows-[1fr] opacity-100 border-t border-indigo-500/20' : 'grid-rows-[0fr] opacity-0 border-t border-transparent'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 py-4 bg-zinc-950/70 backdrop-blur-md animate-slide-down flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      {/* Medium Album Art Preview in Dropdown */}
                      <HistoryAlbumArt songTitle={searchQuery} size="lg" />

                      <div className="flex-1 w-full">
                        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2.5">
                          Listen or Search Track
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <a
                            href={`https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 btn-glow-spotify rounded-lg text-emerald-400 hover:text-emerald-300 transition-all duration-300 group shadow-md hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <SpotifyIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                              Search Spotify
                            </span>
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-emerald-400/70 group-hover:text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                          </a>

                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 btn-glow-youtube rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 group shadow-md hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <YouTubeIcon className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-xs font-semibold text-red-400 group-hover:text-red-300">
                              Search YouTube
                            </span>
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-red-400/70 group-hover:text-red-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-500 mb-1">
              <ClockIcon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-400">{EMPTY_STATE_MESSAGES.NO_RECENT_SONGS}</p>
            <p className="text-xs text-zinc-600">Played songs during live streams will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
