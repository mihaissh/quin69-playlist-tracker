'use client';

import { useEffect, useState } from 'react';
import { BitsIcon, PauseIcon, TtsTokenRow } from '@/components/shared';
import { logTimestampToMs } from '@/utils/donation';
import { cleanSongString } from '@/utils/songParser';
import type { ActiveDonation } from '@/types/donation';

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function useElapsed(pausedAt: string): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return formatElapsed(now - logTimestampToMs(pausedAt));
}

/** Animated equalizer bars - shows "something is playing" */
function Equalizer() {
  return (
    <div className="flex items-end gap-[5px] h-9" aria-hidden="true">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="eq-bar w-[5px] rounded-full bg-gradient-to-t from-violet-400 to-emerald-300"
          style={{ animationDelay: `${i * -0.22}s` }}
        />
      ))}
    </div>
  );
}

interface DonationStateProps {
  donation: ActiveDonation;
  /** The Spotify song that was interrupted (resumes after the donation) */
  pausedSong?: string | null;
}

export function DonationState({ donation, pausedSong }: DonationStateProps) {
  const { current, pausedAt } = donation;
  const elapsed = useElapsed(pausedAt);
  const resumeSong = pausedSong ? cleanSongString(pausedSong) : null;

  return (
    <div className="space-y-4 py-1">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-600/40 via-violet-900/40 to-emerald-600/30 border border-white/10 flex items-center justify-center shadow-lg shadow-violet-950/50 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
          <Equalizer />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-[11px] font-bold text-violet-300/90 uppercase tracking-wider block">
            Donated AI song
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="text-xl sm:text-2xl font-extrabold truncate max-w-full leading-tight"
              style={{ color: current.donorColor ?? '#e4e4e7' }}
            >
              {current.donor}
            </span>
            {current.bits > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-200 text-xs sm:text-sm font-bold">
                <BitsIcon className="w-3.5 h-3.5 text-violet-300" />
                {current.bits.toLocaleString()} bits
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-bold"
                title="Paid donation - the amount isn't shown in chat"
              >
                $ Tip
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            Playing for <span className="font-mono tabular-nums text-zinc-300">{elapsed}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">TTS token</span>
          <span className="text-[11px] text-zinc-500">tap to copy</span>
        </div>
        <TtsTokenRow token={current.token} />
      </div>

      {resumeSong && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-950/40 border border-white/5 text-xs text-zinc-400 min-w-0">
          <PauseIcon className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="flex-shrink-0">Spotify paused on</span>
          <span className="truncate font-medium text-zinc-300" title={resumeSong}>{resumeSong}</span>
        </div>
      )}
    </div>
  );
}
