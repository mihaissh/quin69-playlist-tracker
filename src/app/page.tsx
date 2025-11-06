'use client';

import { lazy, Suspense } from 'react';
import { Header } from '@/components/Header';
import { NowPlaying } from '@/components/NowPlaying';
import { Reveal } from '@/components/Reveal';
import { Footer } from '@/components/Footer';
import { StreamStatusLoader } from '@/components/StreamStatusLoader';
import { useStreamStatus } from '@/hooks/useStreamStatus';
import { useAlbumArt } from '@/hooks/useAlbumArt';
import { usePlaylist } from '@/hooks/usePlaylist';
import { useEasterEgg } from '@/hooks/useEasterEgg';

// Lazy load RecentlyPlayed component for better initial load performance
const RecentlyPlayed = lazy(() => import('@/components/RecentlyPlayed').then(mod => ({ default: mod.RecentlyPlayed })));

export default function Home() {
  // Custom hooks for managing different concerns
  const { isStreamLive, streamStatusChecked, checkStreamStatus } = useStreamStatus();
  const { albumArt, fetchAlbumArt } = useAlbumArt();
  const { playlist, loading, error, initialLoadComplete } = usePlaylist({
    checkStreamStatus,
    fetchAlbumArt,
  });
  const { showEasterEgg, clickMessage, handlePlayButtonClick } = useEasterEgg();

  // Don't render main content until stream status is checked
  if (!streamStatusChecked) {
    return <StreamStatusLoader />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex-grow flex flex-col">
        <Header isOffline={!isStreamLive} hasError={error} />

        {/* Vertical Card Layout */}
        <div className="space-y-6 flex-grow">
          {/* Card 1: Now Playing */}
          <NowPlaying
            isLoading={loading && !initialLoadComplete}
            isOffline={playlist.isOffline}
            currentSong={playlist.currentSongTitle}
            albumArt={albumArt}
            showEasterEgg={showEasterEgg}
            onPlayButtonClick={handlePlayButtonClick}
            clickMessage={clickMessage}
          />

          {/* Card 2: Recently Played - Lazy loaded */}
          <Suspense fallback={
            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-700/50 bg-zinc-800/30">
                <h3 className="text-sm font-medium text-zinc-400">Recently Played</h3>
              </div>
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-600">Loading...</p>
              </div>
            </div>
          }>
            <Reveal delay={0.15}>
              <RecentlyPlayed historySongs={playlist.historySongs} />
            </Reveal>
          </Suspense>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
