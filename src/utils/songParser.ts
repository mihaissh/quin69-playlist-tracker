export interface ParsedSongInfo {
  artist: string;
  title: string;
}

export function parseSongInfo(songString: string): ParsedSongInfo {
  const parts = songString.split(' - ');
  
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    };
  }
  
  return {
    artist: 'Unknown Artist',
    title: songString.trim()
  };
}
