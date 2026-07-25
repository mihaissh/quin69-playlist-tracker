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
    if (prevSongRef.current !== currentSong) {
      setIsWaveFading(true);
      const timer = setTimeout(() => {
        prevSongRef.current = currentSong;
        setIsWaveFading(false);
      }, 500);
      return () => clearTimeout(timer);
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
        className={`rounded-xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 overflow-hidden relative shadow-2xl transition-all duration-500 hover:border-zinc-700/60 ${
          isWaveFading ? 'opacity-30 filter blur-[1px]' : 'opacity-100 filter blur-none'
        }`}
        style={{
          boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Top indigo light accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent z-30" />

        <div className="bg-zinc-900/80 rounded-xl overflow-hidden relative">
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

