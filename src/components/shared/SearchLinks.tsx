'use client';

import { SpotifyIcon, YouTubeIcon } from './icons';
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
        className="inline-flex items-center gap-2 px-3.5 py-2 btn-clean-spotify rounded-xl text-xs font-semibold text-zinc-300 transition-colors"
        aria-label={`Search "${songQuery}" on Spotify`}
      >
        <SpotifyIcon className="w-4 h-4 text-emerald-400" />
        <span>Spotify</span>
      </a>

      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-2 btn-clean-youtube rounded-xl text-xs font-semibold text-zinc-300 transition-colors"
        aria-label={`Search "${songQuery}" on YouTube`}
      >
        <YouTubeIcon className="w-4 h-4 text-rose-400" />
        <span>YouTube</span>
      </a>
    </div>
  );
}
