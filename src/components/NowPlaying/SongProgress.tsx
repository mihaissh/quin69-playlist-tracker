'use client';

import { useEffect, useState } from 'react';
import type { SongTiming } from '@/types/playlist';

/** If we're this far past the iTunes length, the length is probably wrong - stop showing a bar */
const OVERRUN_TOLERANCE_MS = 30_000;

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface SongProgressProps {
  timing: SongTiming;
  /** Track length from iTunes, if known */
  durationMs: number | null;
}

/**
 * Song position worked out from when sheepfarmer announced the song (minus pauses)
 * and the track length from iTunes. It is an estimate - the bot posts a few seconds late.
 */
export function SongProgress({ timing, durationMs }: SongProgressProps) {
  const [now, setNow] = useState(() => Date.now());
  const isPaused = timing.pausedSince !== null;

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isPaused]);

  const clockNow = timing.pausedSince ?? now;
  const elapsed = Math.max(0, clockNow - timing.startedAt - timing.pausedMs);
  const hasLength = durationMs !== null && durationMs > 0 && elapsed <= durationMs + OVERRUN_TOLERANCE_MS;
  const shownElapsed = hasLength ? Math.min(elapsed, durationMs as number) : elapsed;
  const progress = hasLength ? Math.min(1, elapsed / (durationMs as number)) : 0;

  return (
    <div className="w-full" aria-label={`Song position ${formatTime(shownElapsed)}${hasLength ? ` of ${formatTime(durationMs as number)}` : ''}`}>
      {hasLength && (
        <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-1000 ease-linear"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(to right, var(--album-c1, #818cf8), rgba(255, 255, 255, 0.9))',
              boxShadow: '0 0 10px var(--album-c1, rgba(129, 140, 248, 0.6))',
            }}
          />
        </div>
      )}
      <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono tabular-nums text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          {isPaused && (
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-amber-400">Paused</span>
          )}
          {formatTime(shownElapsed)}
        </span>
        {hasLength && <span>{formatTime(durationMs as number)}</span>}
      </div>
    </div>
  );
}
