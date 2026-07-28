export interface ParsedSongInfo {
  artist: string;
  title: string;
  requestedBy?: string;
}

/**
 * Strips Twitch chat metadata like "| Requested by username" from a song string.
 */
export function cleanSongString(songString: string): string {
  if (!songString) return '';
  return songString
    .replace(/\s*(?:\|\s*)?(?:requested\s*by|requested):?\s*@?[a-zA-Z0-9_]+.*$/i, '')
    .replace(/\s*\|\s*(?:requested|requested by).*$/i, '')
    .replace(/\s*requested by.*$/i, '')
    .trim();
}

export function parseSongInfo(songString: string): ParsedSongInfo {
  if (!songString) {
    return {
      artist: 'Unknown Artist',
      title: '',
    };
  }

  const requestedByMatch = songString.match(/\s*(?:\|\s*)?(?:requested\s*by|requested):?\s*@?([a-zA-Z0-9_]+)/i);
  const requestedBy = requestedByMatch ? requestedByMatch[1] : undefined;

  const cleaned = cleanSongString(songString);

  if (!cleaned) {
    return {
      artist: 'Unknown Artist',
      title: '',
      ...(requestedBy ? { requestedBy } : {}),
    };
  }

  const parts = cleaned.split(' - ');
  
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      ...(requestedBy ? { requestedBy } : {}),
    };
  }
  
  return {
    artist: 'Unknown Artist',
    title: cleaned.trim(),
    ...(requestedBy ? { requestedBy } : {}),
  };
}
