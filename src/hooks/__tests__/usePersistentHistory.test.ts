import { renderHook, act } from '@testing-library/react';
import { usePersistentHistory } from '../usePersistentHistory';
import type { SongWithTimestamp } from '@/types/playlist';

describe('usePersistentHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const sampleSongs: SongWithTimestamp[] = [
    { title: 'Artist A - Song A', timestamp: '2025-01-15 12:00:00', requestedBy: 'userA' },
    { title: 'Artist B - Song B', timestamp: '2025-01-15 11:30:00' },
  ];

  it('should initialize with stored songs and merge incoming history', () => {
    const { result } = renderHook(() =>
      usePersistentHistory({ incomingHistory: sampleSongs })
    );

    expect(result.current.historySongs).toHaveLength(2);
    expect(result.current.totalStoredCount).toBe(2);
  });

  it('should filter songs according to search term', () => {
    const { result } = renderHook(() =>
      usePersistentHistory({ incomingHistory: sampleSongs })
    );

    act(() => {
      result.current.setSearchTerm('Song A');
    });

    expect(result.current.filteredSongs).toHaveLength(1);
    expect(result.current.filteredSongs[0].title).toBe('Artist A - Song A');
  });

  it('should clear stored history on demand', () => {
    const { result } = renderHook(() =>
      usePersistentHistory({ incomingHistory: sampleSongs })
    );

    expect(result.current.totalStoredCount).toBe(2);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.totalStoredCount).toBe(0);
    expect(result.current.historySongs).toEqual([]);
  });
});
