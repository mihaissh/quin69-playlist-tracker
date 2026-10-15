import {
  getPlaybackState,
  parseTtsDonations,
  parseTokenMessages,
  isPauseActive,
  buildDonationLogUrl,
  formatTtsToken,
  getPauseTimes,
  pickPauseDonation,
  toDonationRecords,
  type IvrLogMessage,
} from '../donation';
import type { TtsDonation } from '@/types/donation';

// Real sequence from 2026-10-15 (newest first, as returned with ?reverse)
const sheepfarmerLines = [
  '[2026-10-15 17:06:12] #quin69 sheepfarmer: ⏸\r',
  '[2026-10-15 17:05:54] #quin69 sheepfarmer: 🔊 Marcin Przybyłowicz - Forbidden Forest\r',
  '[2026-10-15 17:04:22] #quin69 sheepfarmer: ▶️\r',
];

describe('getPlaybackState', () => {
  it('detects a pause when ⏸ is the latest playback event', () => {
    expect(getPlaybackState(sheepfarmerLines)).toEqual({ paused: true, pausedAt: '2026-10-15 17:06:12' });
  });

  it('is not paused after ▶️', () => {
    const lines = ['[2026-10-15 17:10:37] #quin69 sheepfarmer: ▶️', ...sheepfarmerLines];
    expect(getPlaybackState(lines).paused).toBe(false);
  });

  it('is not paused when a new song started after the pause', () => {
    const lines = ['[2026-10-15 17:11:00] #quin69 sheepfarmer: 🔊 Artist - Song', ...sheepfarmerLines];
    expect(getPlaybackState(lines).paused).toBe(false);
  });

  it('ignores unrelated bot messages', () => {
    const lines = ['[2026-10-15 17:07:00] #quin69 sheepfarmer: CHECKOUT MY LATEST VIDEO', ...sheepfarmerLines];
    expect(getPlaybackState(lines).paused).toBe(true);
  });

  it('handles empty input', () => {
    expect(getPlaybackState([])).toEqual({ paused: false, pausedAt: null });
  });
});

describe('parseTtsDonations', () => {
  const cheer: IvrLogMessage = {
    text: 'Cheer1000 (TTS:6ab03f0164461667b15e0ce5)',
    displayName: 'oscitate_',
    timestamp: '2026-10-15T17:06:10.116Z',
    tags: { bits: '1000', color: '#D4A6FF', id: 'cc6fe5e9' },
  };

  it('extracts donor, bits and token from a bits cheer', () => {
    expect(parseTtsDonations([cheer])).toEqual([{
      id: 'cc6fe5e9',
      donor: 'oscitate_',
      donorColor: '#D4A6FF',
      bits: 1000,
      token: '6ab03f0164461667b15e0ce5',
      timestamp: '2026-10-15T17:06:10.116Z',
      source: 'bits',
    }]);
  });

  it('ignores tokens pasted without bits', () => {
    const pasted = { ...cheer, text: 'Any oilers wanna play (TTS:6ab03f0164461667b15e0ce5)', tags: { id: 'x' } };
    expect(parseTtsDonations([pasted])).toEqual([]);
  });

  it('ignores cheers without a TTS token', () => {
    const plain = { ...cheer, text: 'Cheer420 QuinHD: hello', tags: { bits: '420', id: 'y' } };
    expect(parseTtsDonations([plain])).toEqual([]);
  });

  it('returns multiple donations oldest first', () => {
    const later = { ...cheer, timestamp: '2026-10-15T17:07:00.000Z', displayName: 'later', tags: { bits: '500', id: 'b' } };
    const result = parseTtsDonations([later, cheer]);
    expect(result.map(d => d.donor)).toEqual(['oscitate_', 'later']);
  });
});

describe('isPauseActive', () => {
  const pausedMs = Date.parse('2026-10-15T17:06:12Z');
  it('is active shortly after the pause', () => {
    expect(isPauseActive('2026-10-15 17:06:12', pausedMs + 60_000)).toBe(true);
  });
  it('expires after 10 minutes', () => {
    expect(isPauseActive('2026-10-15 17:06:12', pausedMs + 11 * 60_000)).toBe(false);
  });
  it('is inactive without a timestamp', () => {
    expect(isPauseActive(null)).toBe(false);
  });
});

describe('helpers', () => {
  it('builds a small JSON log window around the pause', () => {
    const url = buildDonationLogUrl('https://logs.ivr.fi/channel/quin69', '2026-10-15 17:06:12');
    expect(url).toContain('from=2026-10-15T17%3A05%3A42.000Z');
    expect(url).toContain('to=2026-10-15T17%3A06%3A17.000Z');
    expect(url).toContain('json=1');
  });

  it('formats the token', () => {
    expect(formatTtsToken('abc')).toBe('(TTS:abc)');
  });
});

describe('getPauseTimes', () => {
  it('lists every ⏸ newest first', () => {
    const lines = [
      '[2026-10-15 17:32:59] #quin69 sheepfarmer: ▶️',
      '[2026-10-15 17:28:23] #quin69 sheepfarmer: ⏸',
      ...sheepfarmerLines,
    ];
    expect(getPauseTimes(lines)).toEqual(['2026-10-15 17:28:23', '2026-10-15 17:06:12']);
  });

  it('handles empty input', () => {
    expect(getPauseTimes([])).toEqual([]);
  });
});

describe('pickPauseDonation / toDonationRecords', () => {
  const make = (id: string, timestamp: string): TtsDonation => ({
    id, donor: id, donorColor: null, bits: 100, token: 'a'.repeat(24), timestamp,
  });

  it('picks the latest cheer in the window', () => {
    const a = make('a', '2026-10-15T17:05:50Z');
    const b = make('b', '2026-10-15T17:06:10Z');
    expect(pickPauseDonation([a, b])).toBe(b);
    expect(pickPauseDonation([])).toBeNull();
  });

  it('lists donations newest first, skipping manual pauses and duplicates', () => {
    const a = make('a', '2026-10-15T17:00:49Z');
    const records = toDonationRecords({
      '2026-10-15 17:06:12': make('b', '2026-10-15T17:06:10Z'),
      '2026-10-15 17:00:52': a,
      '2026-10-15 17:01:10': a, // same cheer seen by a second pause
      '2026-10-15 16:56:19': null,
    });
    expect(records.map(r => [r.id, r.pausedAt])).toEqual([
      ['b', '2026-10-15 17:06:12'],
      ['a', '2026-10-15 17:00:52'],
    ]);
  });
});

describe('money tips (token pasted before the pause)', () => {
  const pasted = (time: string, user = 'litfeels'): IvrLogMessage => ({
    text: '(TTS:6ad0eb657a96c8990f791f88)',
    displayName: user,
    timestamp: time,
    tags: { id: `${user}-${time}`, color: '#00FF7F' },
  });

  it('uses a token pasted a few seconds before the ⏸ when there is no cheer', () => {
    const tips = parseTokenMessages([pasted('2026-10-15T15:59:15.000Z')]);
    const picked = pickPauseDonation([], '2026-10-15 15:59:19', tips);
    expect(picked).toMatchObject({ donor: 'litfeels', bits: 0, source: 'tip', token: '6ad0eb657a96c8990f791f88' });
  });

  it('ignores a token pasted long before the ⏸', () => {
    const tips = parseTokenMessages([pasted('2026-10-15T15:58:40.000Z')]);
    expect(pickPauseDonation([], '2026-10-15 15:59:19', tips)).toBeNull();
  });

  it('prefers a bits cheer over a pasted token', () => {
    const cheer: IvrLogMessage = {
      text: 'Cheer1000 (TTS:6ab03f0164461667b15e0ce5)',
      displayName: 'oscitate_',
      timestamp: '2026-10-15T15:59:10.000Z',
      tags: { bits: '1000', id: 'c' },
    };
    const msgs = [cheer, pasted('2026-10-15T15:59:15.000Z')];
    const picked = pickPauseDonation(parseTtsDonations(msgs), '2026-10-15 15:59:19', parseTokenMessages(msgs));
    expect(picked?.donor).toBe('oscitate_');
  });

  it('does not treat cheers as tips', () => {
    expect(parseTokenMessages([{ text: 'Cheer100 (TTS:6ab03f0164461667b15e0ce5)', timestamp: 'x', tags: { bits: '100' } }])).toEqual([]);
  });
});
