/**
 * AI song / TTS donation detection
 *
 * How it works on stream:
 *  1. A viewer cheers bits with a Brainfrog token, e.g. "Cheer1000 (TTS:6ab03f0164461667b15e0ce5)"
 *  2. A few seconds later sheepfarmer posts "⏸" (Spotify paused, the AI song plays)
 *  3. When the AI song ends sheepfarmer posts "▶️" (Spotify resumes)
 *
 * So the tracker treats "latest playback event is ⏸" as "a donation is playing"
 * and looks up the bits cheer that triggered it in a small window of the channel log.
 * Every ⏸ is looked up once, which also builds the recent donations list.
 */

import type { DonationRecord, PlaybackState, ResolvedPauses, TtsDonation } from '@/types/donation';
import { DONATION_CONFIG, PLAYBACK_MARKERS, PLAYLIST_FILTERS } from '@/constants';

const TIMESTAMP_RE = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/;
const TTS_TOKEN_RE = /\(TTS:([0-9a-f]{24})\)/i;

/** Raw message shape returned by logs.ivr.fi with ?json=1 */
export interface IvrLogMessage {
  text: string;
  displayName?: string;
  username?: string;
  timestamp: string;
  tags?: Record<string, string>;
}

/** Converts a log timestamp "YYYY-MM-DD HH:MM:SS" (UTC) to epoch ms */
export function logTimestampToMs(timestamp: string): number {
  return new Date(timestamp.replace(' ', 'T') + 'Z').getTime();
}

/**
 * Reads sheepfarmer's lines (newest first) and returns whether Spotify is
 * currently paused, based on the most recent ⏸ / ▶️ / 🔊 message.
 */
export function getPlaybackState(lines: string[]): PlaybackState {
  for (const line of lines) {
    const colonIndex = line.indexOf(': ', line.indexOf('#'));
    if (colonIndex === -1) continue;
    const message = line.substring(colonIndex + 2).trim();

    const isPause = message.startsWith(PLAYBACK_MARKERS.PAUSE);
    const isResume = message.startsWith(PLAYBACK_MARKERS.RESUME);
    const isSong = message.startsWith(PLAYLIST_FILTERS.SPEAKER_EMOJI);
    if (!isPause && !isResume && !isSong) continue;

    if (isPause) {
      const match = line.match(TIMESTAMP_RE);
      return { paused: true, pausedAt: match ? match[1] : null };
    }
    return { paused: false, pausedAt: null };
  }
  return { paused: false, pausedAt: null };
}

/**
 * Extracts bits-backed TTS / AI song donations from channel log messages.
 * Messages that only paste a token without cheering bits are ignored here
 * (see parseTokenMessages).
 * Returned oldest first (play order).
 */
export function parseTtsDonations(messages: IvrLogMessage[]): TtsDonation[] {
  const donations: TtsDonation[] = [];

  for (const msg of messages) {
    const bits = Number(msg.tags?.bits ?? 0);
    if (!bits) continue;

    const tokenMatch = msg.text?.match(TTS_TOKEN_RE);
    if (!tokenMatch) continue;

    const id = msg.tags?.id ?? `${msg.timestamp}-${tokenMatch[1]}`;
    if (donations.some(d => d.id === id)) continue;

    donations.push({
      id,
      donor: msg.displayName || msg.tags?.['display-name'] || msg.username || 'Unknown',
      donorColor: msg.tags?.color || null,
      bits,
      token: tokenMatch[1].toLowerCase(),
      timestamp: msg.timestamp,
      source: 'bits',
    });
  }

  return donations.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Plain chat messages containing a token but no bits. Money tips (Streamlabs etc.)
 * never appear in chat, but donors usually paste their token right before it plays.
 * Returned oldest first.
 */
export function parseTokenMessages(messages: IvrLogMessage[]): TtsDonation[] {
  const tips: TtsDonation[] = [];

  for (const msg of messages) {
    if (Number(msg.tags?.bits ?? 0)) continue;
    const tokenMatch = msg.text?.match(TTS_TOKEN_RE);
    if (!tokenMatch) continue;

    tips.push({
      id: msg.tags?.id ?? `${msg.timestamp}-${tokenMatch[1]}`,
      donor: msg.displayName || msg.tags?.['display-name'] || msg.username || 'Unknown',
      donorColor: msg.tags?.color || null,
      bits: 0,
      token: tokenMatch[1].toLowerCase(),
      timestamp: msg.timestamp,
      source: 'tip',
    });
  }

  return tips.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Returns true when a pause is recent enough to plausibly still be a donation
 * (guards against a stale ⏸ if the bot never posted ▶️).
 */
export function isPauseActive(pausedAt: string | null, now: number = Date.now()): boolean {
  if (!pausedAt) return false;
  const pausedMs = logTimestampToMs(pausedAt);
  if (isNaN(pausedMs)) return false;
  return now - pausedMs <= DONATION_CONFIG.MAX_PAUSE_MS;
}

/** Builds the logs.ivr.fi URL that covers the cheer that caused the pause */
export function buildDonationLogUrl(baseUrl: string, pausedAt: string): string {
  const pausedMs = logTimestampToMs(pausedAt);
  const from = new Date(pausedMs - DONATION_CONFIG.LOOKBACK_MS).toISOString();
  const to = new Date(pausedMs + DONATION_CONFIG.LOOKAHEAD_MS).toISOString();
  return `${baseUrl}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&json=1`;
}

/** Timestamps of every ⏸ in sheepfarmer's lines (newest first, like the input) */
export function getPauseTimes(lines: string[]): string[] {
  const pauses: string[] = [];
  for (const line of lines) {
    const colonIndex = line.indexOf(': ', line.indexOf('#'));
    if (colonIndex === -1) continue;
    if (!line.substring(colonIndex + 2).trim().startsWith(PLAYBACK_MARKERS.PAUSE)) continue;
    const match = line.match(TIMESTAMP_RE);
    if (match) pauses.push(match[1]);
  }
  return pauses;
}

/**
 * Picks what triggered a pause:
 *  1. the latest bits cheer in the window (an earlier one belongs to the previous pause)
 *  2. otherwise a token pasted in chat just before the ⏸ (a money tip)
 */
export function pickPauseDonation(
  donations: TtsDonation[],
  pausedAt?: string,
  tokenMessages: TtsDonation[] = []
): TtsDonation | null {
  if (donations.length > 0) return donations[donations.length - 1];
  if (!pausedAt) return null;

  const pausedMs = logTimestampToMs(pausedAt);
  const candidates = tokenMessages.filter(t => {
    const gap = pausedMs - new Date(t.timestamp).getTime();
    // log timestamps are whole seconds, so allow a little clock skew after the ⏸
    return gap >= -2000 && gap <= DONATION_CONFIG.TIP_WINDOW_MS;
  });
  return candidates.length > 0 ? candidates[candidates.length - 1] : null;
}

/** Flattens resolved pauses into a newest-first list, one entry per cheer */
export function toDonationRecords(resolved: ResolvedPauses): DonationRecord[] {
  const seen = new Set<string>();
  const records: DonationRecord[] = [];
  const oldestFirst = Object.keys(resolved).sort();

  for (const pausedAt of oldestFirst) {
    const donation = resolved[pausedAt];
    if (!donation || seen.has(donation.id)) continue;
    seen.add(donation.id);
    records.push({ ...donation, pausedAt });
  }

  return records.reverse();
}

/** Text people paste in chat / Brainfrog to replay the song */
export function formatTtsToken(token: string): string {
  return `(TTS:${token})`;
}

