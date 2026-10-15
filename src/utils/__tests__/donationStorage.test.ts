import { capResolvedPauses, loadResolvedPauses, saveResolvedPauses } from '../donationStorage';
import { DONATION_HISTORY_STORAGE_KEY } from '@/constants';
import type { TtsDonation } from '@/types/donation';

const donation: TtsDonation = {
  id: 'cc6fe5e9',
  donor: 'oscitate_',
  donorColor: '#D4A6FF',
  bits: 1000,
  token: '6ab03f0164461667b15e0ce5',
  timestamp: '2026-10-15T17:06:10.116Z',
};

describe('donationStorage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips resolved pauses, including manual pauses', () => {
    saveResolvedPauses({ '2026-10-15 17:06:12': donation, '2026-10-15 16:56:19': null });
    expect(loadResolvedPauses()).toEqual({ '2026-10-15 17:06:12': donation, '2026-10-15 16:56:19': null });
  });

  it('drops malformed entries and bad JSON', () => {
    localStorage.setItem(DONATION_HISTORY_STORAGE_KEY, JSON.stringify({ a: { donor: 'x' }, b: donation }));
    expect(loadResolvedPauses()).toEqual({ b: donation });

    localStorage.setItem(DONATION_HISTORY_STORAGE_KEY, '{not json');
    expect(loadResolvedPauses()).toEqual({});
  });

  it('keeps only the newest pauses', () => {
    const capped = capResolvedPauses({ '2026-10-15 10:00:00': null, '2026-10-15 12:00:00': null, '2026-10-15 11:00:00': null }, 2);
    expect(Object.keys(capped).sort()).toEqual(['2026-10-15 11:00:00', '2026-10-15 12:00:00']);
  });
});
