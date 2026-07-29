'use client';

import { useState, useRef, useEffect } from 'react';
import { parseSongInfo } from '@/utils/songParser';
import { AlbumArtwork } from './AlbumArtwork';
import { InfoField } from './InfoField';
import { SearchLinks, CopyButton } from '@/components/shared';
import type { PlayingStateProps, SongInfo } from '@/types/music';

const getTextSizeClass = (text1: string, text2: string): string => {
  const maxLength = Math.max(text1.length, text2.length);

  if (maxLength > 50) return 'text-sm sm:text-base';
  if (maxLength > 30) return 'text-base sm:text-lg';
  return 'text-lg sm:text-xl font-extrabold';
};

export function PlayingState({ currentSong, albumArt }: PlayingStateProps) {
  const parsed = parseSongInfo(currentSong);
  const songInfo: SongInfo = {
    artist: parsed.artist,
    title: parsed.title,
    requestedBy: parsed.requestedBy,
  };
  const textSizeClass = getTextSizeClass(songInfo.artist, songInfo.title);
  const cleanQuery = songInfo.artist !== 'Unknown Artist'
    ? `${songInfo.artist} - ${songInfo.title}`
    : songInfo.title;

  const rightColRef = useRef<HTMLDivElement>(null);
  const [artworkSize, setArtworkSize] = useState<number | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (rightColRef.current && window.innerWidth >= 640) {
        const height = rightColRef.current.offsetHeight;
        if (height > 0) {
          setArtworkSize(height);
        }
      } else {
        setArtworkSize(null);
      }
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    if (rightColRef.current) {
      observer.observe(rightColRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [currentSong]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
      <div className="flex-shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
        <AlbumArtwork src={albumArt} size={artworkSize} />
      </div>

      <div ref={rightColRef} className="flex-1 relative w-full">
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="space-y-3 text-center sm:text-left mb-4">
            <InfoField
              label="Artist"
              value={songInfo.artist}
              labelColor="text-indigo-400 font-bold"
              valueColor="text-zinc-100"
              textSize={textSizeClass}
            />
            <InfoField
              label="Song"
              value={songInfo.title}
              labelColor="text-purple-400 font-bold"
              valueColor="text-white"
              textSize={textSizeClass}
            />
            {songInfo.requestedBy && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Requested By
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 shadow-md">
                  <span className="text-sm sm:text-base font-extrabold text-indigo-300">
                    @{songInfo.requestedBy}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto flex items-center justify-center sm:justify-start gap-2">
            <SearchLinks songQuery={cleanQuery} />
            <CopyButton songText={cleanQuery} />
          </div>
        </div>
      </div>
    </div>
  );
}

