'use client';

import { Header } from '@/components/Header';
import { NowPlaying } from '@/components/NowPlaying';
import { HistoryPanel } from '@/components/HistoryPanel';
import { Reveal } from '@/components/Reveal';
import { Footer } from '@/components/Footer';
import { StreamStatusLoader } from '@/components/StreamStatusLoader';
import { useStreamStatus } from '@/hooks/useStreamStatus';
import { useAlbumArt } from '@/hooks/useAlbumArt';
import { usePlaylist } from '@/hooks/usePlaylist';
import { useDonations } from '@/hooks/useDonations';

export default function Home() {
  const { isStreamLive, streamStatusChecked, streamTitle, checkStreamStatus } = useStreamStatus();
  const { albumArt, albumArtSong, durationMs, fetchAlbumArt } = useAlbumArt();
  const { playlist, loading, error, initialLoadComplete, pauseTimes, activePausedAt } = usePlaylist({
    checkStreamStatus,
    fetchAlbumArt,
  });
  const { donation, recentDonations } = useDonations({ pauseTimes, activePausedAt });

  if (!streamStatusChecked) {
    return <StreamStatusLoader />;
  }

  return (
    // Fits the viewport: only the history list scrolls (page scrolls only if the screen is too short)
    <div className="h-dvh bg-zinc-900 text-white flex flex-col overflow-x-hidden overflow-y-auto relative">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 min-h-0 flex flex-col relative z-10">
        <Header isOffline={!isStreamLive} hasError={error} streamTitle={streamTitle} />

        <main className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="flex-shrink-0">
            <NowPlaying
              isLoading={loading && !initialLoadComplete}
              isOffline={playlist.isOffline}
              currentSong={playlist.currentSongTitle}
              albumArt={albumArt}
              albumArtReady={albumArtSong === playlist.currentSongTitle}
              songTiming={playlist.currentSongTiming}
              durationMs={durationMs}
              donation={donation}
            />
          </div>

          <Reveal delay={0.15} className="flex-1 min-h-[240px]">
            <HistoryPanel
              historySongs={playlist.historySongs}
              donations={recentDonations}
              activePausedAt={donation ? activePausedAt : null}
            />
          </Reveal>
        </main>

        <Footer />
      </div>
    </div>
  );
}
