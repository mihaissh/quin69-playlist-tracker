import {
  loadStoredHistory,
  saveStoredHistory,
  clearStoredHistory,
  mergeSongHistory,
} from '../songHistoryStorage';
import { SONG_HISTORY_STORAGE_KEY } from '@/constants';
import type { SongWithTimestamp } from '@/types/playlist';

describe('songHistoryStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const mockSong1: SongWithTimestamp = {
    title: 'Artist 1 - Song 1',
    timestamp: '2025-01-15 10:00:00',
    requestedBy: 'user1',
  };

  const mockSong2: SongWithTimestamp = {
    title: 'Artist 2 - Song 2',
    timestamp: '2025-01-15 09:30:00',
  };

  const mockSong3: SongWithTimestamp = {
    title: 'Artist 3 - Song 3',
    timestamp: '2025-01-15 09:00:00',
    requestedBy: 'user3',
  };

  describe('loadStoredHistory and saveStoredHistory', () => {
    it('should return empty array if no history saved', () => {
      expect(loadStoredHistory()).toEqual([]);
    });

    it('should save and load songs correctly', () => {
      const songs = [mockSong1, mockSong2];
      const success = saveStoredHistory(songs);
      expect(success).toBe(true);

      const loaded = loadStoredHistory();
      expect(loaded).toEqual(songs);
    });

    it('should handle corrupt localStorage data gracefully', () => {
      localStorage.setItem(SONG_HISTORY_STORAGE_KEY, 'invalid-json-{');
      expect(loadStoredHistory()).toEqual([]);
    });

    it('should ignore invalid stored song entries', () => {
      localStorage.setItem(
        SONG_HISTORY_STORAGE_KEY,
        JSON.stringify([
          { title: 'Valid Song', timestamp: '2025-01-15 10:00:00' },
          { title: '', timestamp: '2025-01-15 09:00:00' },
          { timestamp: '2025-01-15 08:00:00' },
          'not-an-object',
        ])
      );

      expect(loadStoredHistory()).toEqual([
        { title: 'Valid Song', timestamp: '2025-01-15 10:00:00' },
      ]);
    });
  });

  describe('clearStoredHistory', () => {
    it('should remove history from localStorage', () => {
      saveStoredHistory([mockSong1]);
      expect(loadStoredHistory()).toHaveLength(1);

      clearStoredHistory();
      expect(loadStoredHistory()).toEqual([]);
    });
  });

  describe('mergeSongHistory', () => {
    it('should merge existing and incoming songs without duplicates', () => {
      const existing = [mockSong2, mockSong3];
      const incoming = [mockSong1, mockSong2]; // mockSong2 is duplicated

      const merged = mergeSongHistory(existing, incoming);
      expect(merged).toHaveLength(3);
      expect(merged[0].title).toBe('Artist 1 - Song 1');
      expect(merged[1].title).toBe('Artist 2 - Song 2');
      expect(merged[2].title).toBe('Artist 3 - Song 3');
    });

    it('should sort songs reverse chronologically by timestamp', () => {
      const existing = [mockSong3];
      const incoming = [mockSong1, mockSong2];

      const merged = mergeSongHistory(existing, incoming);
      expect(merged[0].timestamp).toBe('2025-01-15 10:00:00');
      expect(merged[1].timestamp).toBe('2025-01-15 09:30:00');
      expect(merged[2].timestamp).toBe('2025-01-15 09:00:00');
    });
  });
});
