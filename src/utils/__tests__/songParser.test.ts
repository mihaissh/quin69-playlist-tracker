import { parseSongInfo } from '../songParser';

describe('parseSongInfo', () => {
  it('should parse song with artist and title', () => {
    const result = parseSongInfo('Artist Name - Song Title');
    expect(result).toEqual({
      artist: 'Artist Name',
      title: 'Song Title',
    });
  });

  it('should handle multiple dashes in title', () => {
    const result = parseSongInfo('Artist - Song - Part 2');
    expect(result).toEqual({
      artist: 'Artist',
      title: 'Song - Part 2',
    });
  });

  it('should handle song without artist', () => {
    const result = parseSongInfo('Just a Song Title');
    expect(result).toEqual({
      artist: 'Unknown Artist',
      title: 'Just a Song Title',
    });
  });

  it('should trim whitespace', () => {
    const result = parseSongInfo('  Artist  -  Song Title  ');
    expect(result).toEqual({
      artist: 'Artist',
      title: 'Song Title',
    });
  });

  it('should handle empty string', () => {
    const result = parseSongInfo('');
    expect(result).toEqual({
      artist: 'Unknown Artist',
      title: '',
    });
  });

  it('should handle only dashes', () => {
    const result = parseSongInfo('---');
    expect(result).toEqual({
      artist: 'Unknown Artist',
      title: '---',
    });
  });

  it('should extract Twitch requested by metadata', () => {
    const result = parseSongInfo('AIROD - Adrenaline | Requested by hvyweightt');
    expect(result).toEqual({
      artist: 'AIROD',
      title: 'Adrenaline',
      requestedBy: 'hvyweightt',
    });
  });

  it('should handle different formats of requested by metadata', () => {
    const result1 = parseSongInfo('Artist - Song requested by user_one');
    expect(result1).toEqual({
      artist: 'Artist',
      title: 'Song',
      requestedBy: 'user_one',
    });

    const result2 = parseSongInfo('Artist - Song | requested by @user_two');
    expect(result2).toEqual({
      artist: 'Artist',
      title: 'Song',
      requestedBy: 'user_two',
    });
  });
});

