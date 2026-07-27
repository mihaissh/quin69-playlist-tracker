export interface ParsedSongInfo {
  artist: string;
  title: string;
}

/**
 * Strips Twitch chat metadata like "| Requested by username" from a song string.
 */
export function cleanSongString(songString: string): string {
  if (!songString) return '';
  return songString
    .replace(/\s*\|\s*(?:requested|requested by).*$/i, '')
    .replace(/\s*requested by.*$/i, '')
    .trim();
}

export function parseSongInfo(songString: string): ParsedSongInfo {
  const cleaned = cleanSongString(songString);

  if (!cleaned) {
    return {
      artist: 'Unknown Artist',
      title: '',
    };
  }

  const parts = cleaned.split(' - ');
  
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
    };
  }
  
  return {
    artist: 'Unknown Artist',
    title: cleaned.trim(),
  };
}

