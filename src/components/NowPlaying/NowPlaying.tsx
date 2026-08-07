'use client';

import { useState, useEffect, useRef } from 'react';
import { Reveal } from '@/components/Reveal';
import { CardHeader, LoadingState, NoSongState, OfflineState, PlayingState } from './';
import { useAlbumColors } from '@/hooks/useAlbumColors';
import type { NowPlayingProps } from '@/types/music';

const FADE_OUT_MS = 400;

export function NowPlaying({
  isLoading,
  isOffline,
  currentSong,
  albumArt,
}: NowPlayingProps) {
  const [displaySong, setDisplaySong] = useState<string | null>(currentSong);
  const [displayAlbumArt, setDisplayAlbumArt] = useState<string | null>(albumArt);
  const [contentVisible, setContentVisible] = useState(true);

  const displaySongRef = useRef(currentSong);
  const displayAlbumArtRef = useRef(albumArt);
  const isInitialMount = useRef(true);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [c1, c2, c3] = useAlbumColors(displayAlbumArt ?? albumArt);

  useEffect(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      displaySongRef.current = currentSong;
      displayAlbumArtRef.current = albumArt;
      setDisplaySong(currentSong);
      setDisplayAlbumArt(albumArt);
      return;
    }

    if (isLoading || isOffline) {
      displaySongRef.current = currentSong;
      displayAlbumArtRef.current = albumArt;
      setDisplaySong(currentSong);
      setDisplayAlbumArt(albumArt);
      setContentVisible(true);
      return;
    }

    const songChanged = currentSong !== displaySongRef.current;

    if (!songChanged) {
      if (albumArt !== displayAlbumArtRef.current) {
        displayAlbumArtRef.current = albumArt;
        setDisplayAlbumArt(albumArt);
      }
      return;
    }

    setContentVisible(false);

    transitionTimerRef.current = setTimeout(() => {
      displaySongRef.current = currentSong;
      displayAlbumArtRef.current = albumArt;
      setDisplaySong(currentSong);
      setDisplayAlbumArt(albumArt);
      setContentVisible(true);
      transitionTimerRef.current = null;
    }, FADE_OUT_MS);

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [currentSong, albumArt, isLoading, isOffline]);

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isOffline) return <OfflineState />;
    if (displaySong) {
      return (
        <PlayingState
          currentSong={displaySong}
          albumArt={displayAlbumArt}
        />
      );
    }
    return <NoSongState />;
  };

  return (
    <Reveal>
      <div
        className="rounded-xl dynamic-ambient-border backdrop-blur-xl overflow-hidden relative shadow-2xl"
        style={{
          '--album-c1': c1,
          '--album-c2': c2,
          '--album-c3': c3,
        } as React.CSSProperties}
      >
        <div className="bg-zinc-900/90 rounded-[10px] overflow-hidden relative">
          <div
            className={`absolute inset-0 dynamic-bg-wave pointer-events-none z-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
              contentVisible ? 'opacity-[0.09]' : 'opacity-0'
            }`}
          />
          <CardHeader className="relative z-20" />

          <div className="p-3 relative z-10">
            <div
              className={`song-change-transition ${
                contentVisible ? 'song-change-visible' : 'song-change-hidden'
              }`}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

