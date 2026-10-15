'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Reveal } from '@/components/Reveal';
import { AlbumBackdrop } from './AlbumBackdrop';
import { CardHeader, DonationState, LoadingState, NoSongState, OfflineState, PlayingState } from './';
import { useAlbumColors } from '@/hooks/useAlbumColors';
import type { NowPlayingProps } from '@/types/music';
import type { ActiveDonation } from '@/types/donation';
import type { SongTiming } from '@/types/playlist';

const FADE_OUT_MS = 400;
/** Longest we keep the card faded out waiting for the next song's artwork */
const MAX_ART_WAIT_MS = 2500;
const DONATION_COLORS: [string, string, string] = ['#a78bfa', 'rgba(52, 211, 153, 0.6)', 'rgba(124, 58, 237, 0.3)'];

type ViewKind = 'loading' | 'offline' | 'donation' | 'song' | 'empty';

interface View {
  kind: ViewKind;
  /** Changes whenever the card should cross-fade to new content */
  key: string;
  song: string | null;
  albumArt: string | null;
  donation: ActiveDonation | null;
  /** False while the song's artwork is still loading */
  ready: boolean;
  songTiming: SongTiming | null;
  durationMs: number | null;
}

function getView({
  isLoading,
  isOffline,
  currentSong,
  albumArt,
  albumArtReady = true,
  donation,
  songTiming = null,
  durationMs = null,
}: NowPlayingProps): View {
  // Never pair a new song with the previous song's artwork (or length)
  const base = {
    song: currentSong,
    albumArt: albumArtReady ? albumArt : null,
    donation: donation ?? null,
    ready: true,
    songTiming,
    durationMs: albumArtReady ? durationMs : null,
  };
  if (isLoading) return { ...base, kind: 'loading', key: 'loading' };
  if (isOffline) return { ...base, kind: 'offline', key: 'offline' };
  if (donation) return { ...base, kind: 'donation', key: `donation:${donation.current.id}` };
  if (currentSong) return { ...base, kind: 'song', key: `song:${currentSong}`, ready: albumArtReady };
  return { ...base, kind: 'empty', key: 'empty' };
}

const LABELS: Record<ViewKind, string> = {
  loading: 'Now Playing',
  offline: 'Now Playing',
  donation: 'AI Song Donation',
  song: 'Now Playing',
  empty: 'Now Playing',
};

/** Animates its height to fit its content */
function useAutoHeight() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { contentRef, height };
}

export function NowPlaying({
  isLoading,
  isOffline,
  currentSong,
  albumArt,
  albumArtReady = true,
  donation = null,
  songTiming = null,
  durationMs = null,
}: NowPlayingProps) {
  const target = useMemo(
    () => getView({ isLoading, isOffline, currentSong, albumArt, albumArtReady, donation, songTiming, durationMs }),
    [isLoading, isOffline, currentSong, albumArt, albumArtReady, donation, songTiming, durationMs]
  );

  // What is on screen. Lags behind `target`: fade out -> wait for artwork -> swap -> fade in.
  const [shown, setShown] = useState<View>(target);
  const [contentVisible, setContentVisible] = useState(true);
  const [fadedOut, setFadedOut] = useState(false);
  const [waitExpired, setWaitExpired] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { contentRef, height } = useAutoHeight();

  const clearTimers = () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
    fadeTimerRef.current = null;
    waitTimerRef.current = null;
  };

  useEffect(() => {
    if (target.key === shown.key) {
      // Same content (or it changed back mid fade-out): update in place
      if (!contentVisible) {
        clearTimers();
        setFadedOut(false);
        setWaitExpired(false);
        setContentVisible(true);
      }
      if (target !== shown) setShown(target);
      return;
    }

    if (contentVisible) {
      // Start fading the old content out
      setContentVisible(false);
      setFadedOut(false);
      setWaitExpired(false);
      clearTimers();
      fadeTimerRef.current = setTimeout(() => setFadedOut(true), FADE_OUT_MS);
      waitTimerRef.current = setTimeout(() => setWaitExpired(true), MAX_ART_WAIT_MS);
      return;
    }

    // Faded out: swap once the new artwork is loaded (or we've waited long enough)
    if (fadedOut && (target.ready || waitExpired)) {
      clearTimers();
      setShown(target);
      setFadedOut(false);
      setWaitExpired(false);
      setContentVisible(true);
    }
  }, [target, shown, contentVisible, fadedOut, waitExpired]);

  useEffect(() => clearTimers, []);

  const albumColors = useAlbumColors(shown.albumArt);
  const [c1, c2, c3] = shown.kind === 'donation' ? DONATION_COLORS : albumColors;

  // Share the album accent with the rest of the page (history list highlights)
  useEffect(() => {
    const isDefault = c1.startsWith('rgba(255, 255, 255');
    document.documentElement.style.setProperty('--accent', isDefault ? '#818cf8' : c1);
  }, [c1]);

  const renderContent = () => {
    switch (shown.kind) {
      case 'loading':
        return <LoadingState />;
      case 'offline':
        return <OfflineState />;
      case 'donation':
        return <DonationState donation={shown.donation as ActiveDonation} pausedSong={shown.song} />;
      case 'song':
        return (
          <PlayingState
            currentSong={shown.song as string}
            albumArt={shown.albumArt}
            timing={shown.songTiming}
            durationMs={shown.durationMs}
          />
        );
      default:
        return <NoSongState />;
    }
  };

  return (
    <Reveal>
      <div
        className="rounded-xl overflow-hidden relative shadow-2xl border border-white/10 bg-zinc-900"
        style={{
          '--album-c1': c1,
          '--album-c2': c2,
          '--album-c3': c3,
        } as React.CSSProperties}
      >
        <AlbumBackdrop src={shown.kind === 'song' ? shown.albumArt : null} donation={shown.kind === 'donation'} />

        {/* Only the donation view gets a label; songs speak for themselves */}
        {shown.kind === 'donation' && (
          <CardHeader
            className={`relative z-20 song-change-transition ${contentVisible ? 'song-change-visible' : 'song-change-hidden'}`}
            label={LABELS[shown.kind]}
            playing
          />
        )}

        <div
          className="relative z-10 overflow-hidden card-height-transition"
          style={{ height: height ?? 'auto' }}
        >
          <div ref={contentRef} className={shown.kind === 'donation' ? 'p-3' : 'p-4 sm:p-5'}>
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
