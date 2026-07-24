'use client';

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
  };
  const textSizeClass = getTextSizeClass(songInfo.artist, songInfo.title);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0 mx-auto sm:mx-0">
        <AlbumArtwork src={albumArt} />
      </div>
      
      <div className="flex-1 relative">
        <div className="relative z-10 h-full flex flex-col justify-between">
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
          
          <div className="mt-auto flex items-center justify-center sm:justify-start gap-2">
            <SearchLinks songQuery={currentSong} />
            <CopyButton songText={currentSong} />
          </div>
        </div>
      </div>
    </div>
  );
}

