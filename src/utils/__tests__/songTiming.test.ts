import { getSongTiming } from '../playlist';

const ms = (t: string) => Date.parse(t.replace(' ', 'T') + 'Z');

// newest first, like logs.ivr.fi with ?reverse
const lines = [
  '[2026-10-15 17:10:37] #quin69 sheepfarmer: ▶️',
  '[2026-10-15 17:06:12] #quin69 sheepfarmer: ⏸',
  '[2026-10-15 17:05:54] #quin69 sheepfarmer: 🔊 Marcin Przybyłowicz - Forbidden Forest',
  '[2026-10-15 17:04:22] #quin69 sheepfarmer: ▶️',
  '[2026-10-15 17:00:52] #quin69 sheepfarmer: ⏸',
  '[2026-10-15 17:00:16] #quin69 sheepfarmer: 🔊 Calum Martin - Martyrdom - Movement 1',
];

describe('getSongTiming', () => {
  it('starts at the announcement and subtracts a finished pause', () => {
    expect(getSongTiming(lines, 'Marcin Przybyłowicz - Forbidden Forest')).toEqual({
      startedAt: ms('2026-10-15 17:05:54'),
      pausedMs: ms('2026-10-15 17:10:37') - ms('2026-10-15 17:06:12'),
      pausedSince: null,
    });
  });

  it('freezes while paused', () => {
    const timing = getSongTiming(lines.slice(1), 'Marcin Przybyłowicz - Forbidden Forest');
    expect(timing?.pausedSince).toBe(ms('2026-10-15 17:06:12'));
    expect(timing?.pausedMs).toBe(0);
  });

  it('merges a re-announced song after a pause', () => {
    const repost = [
      '[2026-10-15 16:56:21] #quin69 sheepfarmer: 🔊 Ramin Djawadi - Victory',
      '[2026-10-15 16:56:19] #quin69 sheepfarmer: ⏸',
      '[2026-10-15 16:55:33] #quin69 sheepfarmer: 🔊 Ramin Djawadi - Victory',
      '[2026-10-15 16:54:51] #quin69 sheepfarmer: ▶️',
    ];
    expect(getSongTiming(repost, 'Ramin Djawadi - Victory')).toEqual({
      startedAt: ms('2026-10-15 16:55:33'),
      pausedMs: 2000,
      pausedSince: null,
    });
  });

  it('returns null without a current song', () => {
    expect(getSongTiming(lines, null)).toBeNull();
    expect(getSongTiming(lines, 'Not in the log')).toBeNull();
  });
});
