'use client';

import { SpotifyIcon, YouTubeIcon } from '@/components/icons';
import type { SearchLinksProps } from '@/types/music';

/**
 * Reusable search links component for Spotify and YouTube
 */
export function SearchLinks({ songQuery }: SearchLinksProps) {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-2">
      <a
        href={`https://open.spotify.com/search/${encodeURIComponent(songQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/40 backdrop-blur-sm hover:bg-emerald-500/60 rounded-md transition-all text-xs font-medium text-white hover:text-emerald-100 border border-emerald-500/30 shadow-lg"
        aria-label={`Search "${songQuery}" on Spotify`}
      >
        <SpotifyIcon className="w-4 h-4" />
        Spotify
      </a>
      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/40 backdrop-blur-sm hover:bg-red-500/60 rounded-md transition-all text-xs font-medium text-white hover:text-red-100 border border-red-500/30 shadow-lg"
        aria-label={`Search "${songQuery}" on YouTube`}
      >
        <YouTubeIcon className="w-4 h-4" />
        YouTube
      </a>
    </div>
  );
}
