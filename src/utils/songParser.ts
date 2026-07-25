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

/**
 * Clean a song string for API searching (iTunes/Spotify)
 * Strips parentheses, brackets, special symbols, and remix clutter that trigger WAF 403 or search failures
 */
export function cleanSearchTerm(songString: string): string {
  if (!songString) return '';
  return songString
    .replace(/[\(\[\{].*?[\)\]\}]/g, '')
    .replace(/\s*-\s*remix/gi, ' ')
    .replace(/\s*-\s*edit/gi, ' ')
    .replace(/\s*-\s*mix/gi, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
