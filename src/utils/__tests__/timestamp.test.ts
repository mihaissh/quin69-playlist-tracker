import { formatTimestamp } from '../timestamp';

describe('formatTimestamp', () => {
  beforeEach(() => {
    // Mock current time to 2025-01-15 12:00:00 UTC
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "Just now" for timestamps less than 1 minute ago', () => {
    const timestamp = '2025-01-15 11:59:30';
    expect(formatTimestamp(timestamp)).toBe('Just now');
  });

  it('should return minutes ago for timestamps less than 1 hour ago', () => {
    const timestamp = '2025-01-15 11:30:00';
    expect(formatTimestamp(timestamp)).toBe('30m ago');
  });

  it('should return hours ago for timestamps less than 24 hours ago', () => {
    const timestamp = '2025-01-15 10:00:00';
    expect(formatTimestamp(timestamp)).toBe('2h ago');
  });

  it('should return formatted time for timestamps older than 24 hours', () => {
    const timestamp = '2025-01-14 15:30:00';
    expect(formatTimestamp(timestamp)).toBe('15:30');
  });

  it('should handle empty string', () => {
    expect(formatTimestamp('')).toBe('');
  });

  it('should handle invalid timestamp gracefully', () => {
    expect(formatTimestamp('invalid-timestamp')).toBe('');
  });

  it('should pad hours and minutes with zeros', () => {
    const timestamp = '2025-01-14 05:05:00';
    expect(formatTimestamp(timestamp)).toBe('05:05');
  });
});

