'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ActiveDonation, DonationRecord, ResolvedPauses, TtsDonation } from '@/types/donation';
import { API_ENDPOINTS, DONATION_CONFIG } from '@/constants';
import {
  buildDonationLogUrl,
  logTimestampToMs,
  parseTokenMessages,
  parseTtsDonations,
  pickPauseDonation,
  toDonationRecords,
  type IvrLogMessage,
} from '@/utils/donation';
import { capResolvedPauses, loadResolvedPauses, saveResolvedPauses } from '@/utils/donationStorage';
import { logger } from '@/utils/logger';

interface UseDonationsProps {
  /** Every ⏸ timestamp from sheepfarmer's log, newest first */
  pauseTimes: string[];
  /** The ⏸ that is currently in effect, if any */
  activePausedAt: string | null;
}

interface UseDonationsReturn {
  /** Set while Spotify is paused for a bits TTS / AI song donation */
  donation: ActiveDonation | null;
  /** Past donations, newest first */
  recentDonations: DonationRecord[];
}

/** Looks up the bits cheer that caused a pause (null for a manual pause) */
async function fetchPauseDonation(pausedAt: string, signal: AbortSignal): Promise<TtsDonation | null> {
  const response = await fetch(buildDonationLogUrl(API_ENDPOINTS.CHANNEL_LOG, pausedAt), {
    signal,
    cache: 'no-cache',
  });
  if (!response.ok) throw new Error(`Channel log request failed: ${response.status}`);
  const data = (await response.json()) as { messages?: IvrLogMessage[] };
  const messages = data.messages ?? [];
  return pickPauseDonation(parseTtsDonations(messages), pausedAt, parseTokenMessages(messages));
}

/**
 * Resolves each ⏸ to the donation that caused it, once, and remembers the
 * result in localStorage. Runs again on every poll (new pauseTimes array),
 * which also retries lookups that failed or came back empty too early.
 */
export function useDonations({ pauseTimes, activePausedAt }: UseDonationsProps): UseDonationsReturn {
  const [resolved, setResolved] = useState<ResolvedPauses>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const resolvedRef = useRef<ResolvedPauses>({});
  const runningRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const stored = loadResolvedPauses();
    resolvedRef.current = stored;
    setResolved(stored);
    setIsInitialized(true);

    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!isInitialized || runningRef.current) return;

    const pending = pauseTimes
      .slice(0, DONATION_CONFIG.BACKFILL_PAUSES)
      .filter(pausedAt => !(pausedAt in resolvedRef.current));
    if (pending.length === 0) return;

    runningRef.current = true;
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    (async () => {
      // Newest first, so the active pause resolves before the backfill
      for (const pausedAt of pending) {
        try {
          const donation = await fetchPauseDonation(pausedAt, signal);
          const isYoung = Date.now() - logTimestampToMs(pausedAt) < DONATION_CONFIG.RETRY_EMPTY_MS;
          if (!donation && isYoung) continue;

          resolvedRef.current = capResolvedPauses({ ...resolvedRef.current, [pausedAt]: donation });
          setResolved(resolvedRef.current);
          saveResolvedPauses(resolvedRef.current);
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return;
          logger.error('Error fetching donation:', err);
          return; // retry on the next poll
        }
      }
    })().finally(() => {
      runningRef.current = false;
    });
  }, [pauseTimes, isInitialized]);

  const recentDonations = useMemo(() => toDonationRecords(resolved), [resolved]);

  const activeEntry = activePausedAt ? resolved[activePausedAt] ?? null : null;
  const donation = useMemo<ActiveDonation | null>(
    () => (activePausedAt && activeEntry ? { current: activeEntry, pausedAt: activePausedAt } : null),
    [activePausedAt, activeEntry]
  );

  return { donation, recentDonations };
}
