import { parsePlaylist } from '../playlist';
import type { SongWithTimestamp } from '../../types/playlist';

describe('parsePlaylist', () => {
  const mockLines = [
    '[2025-01-15 10:00:00] #quin69 sheepfarmer: 🔊 Artist - Song Title',
    '[2025-01-15 09:59:00] #quin69 sheepfarmer: 🔊 Previous Artist - Previous Song',
    '[2025-01-15 09:58:00] #quin69 sheepfarmer: 🔊 Another Artist - Another Song',
  ];

  it('should parse current song and history correctly', () => {
    const result = parsePlaylist(mockLines, true);

    expect(result.currentSongTitle).toBe('Artist - Song Title');
    expect(result.historySongs).toHaveLength(2);
    expect(result.historySongs[0].title).toBe('Previous Artist - Previous Song');
    expect(result.historySongs[1].title).toBe('Another Artist - Another Song');
    expect(result.isOffline).toBe(false);
  });

  it('should extract timestamps correctly', () => {
    const result = parsePlaylist(mockLines, true);

    expect(result.historySongs[0].timestamp).toBe('2025-01-15 09:59:00');
    expect(result.historySongs[1].timestamp).toBe('2025-01-15 09:58:00');
  });

  it('should mark as offline when stream is not live', () => {
    const result = parsePlaylist(mockLines, false);
    expect(result.isOffline).toBe(true);
  });

  it('should filter out excluded patterns', () => {
    const linesWithExcluded = [
      '[2025-01-15 10:00:00] #quin69 sheepfarmer: 🔊 Valid Song',
      '[2025-01-15 09:59:00] #quin69 sheepfarmer: 🔊 vibe check',
      '[2025-01-15 09:58:00] #quin69 sheepfarmer: 🔊 offline mode',
      '[2025-01-15 09:57:00] #quin69 sheepfarmer: 🔊 Loco In The Coco was skipped, and points deducted.',
    ];

    const result = parsePlaylist(linesWithExcluded, true);
    expect(result.currentSongTitle).toBe('Valid Song');
    expect(result.historySongs).toHaveLength(0);
  });

  it('should handle empty lines', () => {
    const result = parsePlaylist([], true);
    expect(result.currentSongTitle).toBeNull();
    expect(result.historySongs).toHaveLength(0);
    expect(result.historyTitles).toHaveLength(0);
  });

  it('should remove duplicate songs from history', () => {
    const linesWithDuplicates = [
      '[2025-01-15 10:00:00] #quin69 sheepfarmer: 🔊 Current Song',
      '[2025-01-15 09:59:00] #quin69 sheepfarmer: 🔊 Duplicate Song',
      '[2025-01-15 09:58:00] #quin69 sheepfarmer: 🔊 Duplicate Song',
      '[2025-01-15 09:57:00] #quin69 sheepfarmer: 🔊 Unique Song',
    ];

    const result = parsePlaylist(linesWithDuplicates, true);
    expect(result.currentSongTitle).toBe('Current Song');
    expect(result.historySongs).toHaveLength(2);
    expect(result.historySongs[0].title).toBe('Duplicate Song');
    expect(result.historySongs[1].title).toBe('Unique Song');
  });

  it('should not include current song in history', () => {
    const result = parsePlaylist(mockLines, true);
    const historyTitles = result.historySongs.map((s: SongWithTimestamp) => s.title);
    expect(historyTitles).not.toContain('Artist - Song Title');
  });

  it('should handle lines without timestamps', () => {
    const linesWithoutTimestamps = [
      'sheepfarmer: 🔊 Song Without Timestamp',
      'sheepfarmer: 🔊 Another Song Without Timestamp',
    ];

    const result = parsePlaylist(linesWithoutTimestamps, true);
    expect(result.currentSongTitle).toBe('Song Without Timestamp');
    expect(result.historySongs[0].timestamp).toBe('');
  });

  it('should parse requestedBy field when available in chat logs', () => {
    const linesWithRequests = [
      '[2025-01-15 10:00:00] #quin69 sheepfarmer: 🔊 Current Song | Requested by alice',
      '[2025-01-15 09:59:00] #quin69 sheepfarmer: 🔊 History Song | Requested by bob',
    ];

    const result = parsePlaylist(linesWithRequests, true);
    expect(result.historySongs[0].requestedBy).toBe('bob');
  });
});

