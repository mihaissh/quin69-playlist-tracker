'use client';

import { parseSongInfo } from '@/utils/songParser';
import { AlbumArtwork } from './AlbumArtwork';
import { SongProgress } from './SongProgress';
import { SearchLinks, CopyButton } from '@/components/shared';
import type { PlayingStateProps } from '@/types/music';

const TEXT_SHADOW = '0 2px 12px rgba(0, 0, 0, 0.85), 0 1px 3px rgba(0, 0, 0, 0.7)';

/** Big title for short names, smaller for long ones so they still fit */
function getTitleSizeClass(title: string): string {
  if (title.length > 45) return 'text-xl sm:text-2xl';
  if (title.length > 25) return 'text-2xl sm:text-3xl';
  return 'text-3xl sm:text-4xl';
}

export function PlayingState({ currentSong, albumArt, timing, durationMs = null }: PlayingStateProps) {
  const { artist, title, requestedBy } = parseSongInfo(currentSong);
  const hasArtist = artist !== 'Unknown Artist';
  const cleanQuery = hasArtist ? `${artist} - ${title}` : title;

  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-stretch">
      <div className="flex-shrink-0 flex items-center justify-center">
        <AlbumArtwork src={albumArt} seed={cleanQuery} />
      </div>

      <div className="flex-1 min-w-0 w-full flex flex-col justify-between gap-4 text-center sm:text-left sm:py-1">
        <div className="space-y-1.5 min-w-0">
          <h2
            className={`${getTitleSizeClass(title)} font-extrabold text-white leading-tight tracking-tight break-words line-clamp-3`}
            style={{ textShadow: TEXT_SHADOW }}
            title={title}
          >
            {title}
          </h2>
          {hasArtist && (
            <p
              className="text-base sm:text-xl font-semibold text-zinc-200/90 break-words line-clamp-2"
              style={{ textShadow: TEXT_SHADOW }}
            >
              {artist}
            </p>
          )}
          {requestedBy && (
            <div className="pt-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/60 border border-white/10 text-xs text-zinc-300 backdrop-blur-sm">
                <span className="text-zinc-400">requested by</span>
                <span className="font-bold text-white">@{requestedBy}</span>
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {timing && <SongProgress timing={timing} durationMs={durationMs} />}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <SearchLinks songQuery={cleanQuery} />
            <CopyButton songText={cleanQuery} />
          </div>
        </div>
      </div>
    </div>
  );
}
