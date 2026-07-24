'use client';

import { useState, useEffect, useRef } from 'react';
import { Reveal } from '@/components/Reveal';
import { CardHeader, LoadingState, NoSongState, OfflineState, PlayingState } from './';
import { useAlbumColors } from '@/hooks/useAlbumColors';
import type { NowPlayingProps } from '@/types/music';

export function NowPlaying({
  isLoading,
  isOffline,
  currentSong,
  albumArt,
}: NowPlayingProps) {
  const [c1, c2, c3] = useAlbumColors(albumArt);
  const [isWaveFading, setIsWaveFading] = useState(false);
  const prevSongRef = useRef(currentSong);

  useEffect(() => {
    if (prevSongRef.current && currentSong && prevSongRef.current !== currentSong) {
      setIsWaveFading(true);
      const timer = setTimeout(() => {
        setIsWaveFading(false);
      }, 500);
      prevSongRef.current = currentSong;
      return () => clearTimeout(timer);
    } else if (currentSong) {
      prevSongRef.current = currentSong;
    }
  }, [currentSong]);

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isOffline) return <OfflineState />;
    if (currentSong) {
      return (
        <PlayingState
          currentSong={currentSong}
          albumArt={albumArt}
        />
      );
    }
    return <NoSongState />;
  };

  return (
    <Reveal>
      <div 
        className={`rounded-xl p-[2.5px] dynamic-border-wave transition-all duration-700 ease-in-out ${
          isWaveFading ? 'opacity-30 filter blur-[1px]' : 'opacity-100 filter blur-none'
        }`}
        style={{
          '--album-c1': c1,
          '--album-c2': c2,
          '--album-c3': c3,
        } as React.CSSProperties}
      >
        <div className="bg-zinc-900 rounded-[9.5px] overflow-hidden relative">
          <div 
            className={`absolute inset-0 dynamic-bg-wave pointer-events-none z-0 transition-opacity duration-700 ease-in-out ${
              isWaveFading ? 'opacity-0' : 'opacity-[0.09]'
            }`}
          />
          <CardHeader className="relative z-20" />

          <div className="p-3 relative z-10">
            {renderContent()}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

