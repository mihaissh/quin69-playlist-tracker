'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MusicIcon } from '@/components/shared';
import { parseSongInfo } from '@/utils/songParser';
import { API_ENDPOINTS, ITUNES_IMAGE_SIZES } from '@/constants';

// In-memory cache for fetched artwork URLs to prevent duplicate iTunes API calls
const artworkCache = new Map<string, string | null>();

async function fetchItunesArt(songTitle: string, signal?: AbortSignal): Promise<string | null> {
  if (!songTitle) return null;
  const cleanKey = songTitle.toLowerCase().trim();
  
  if (artworkCache.has(cleanKey)) {
    return artworkCache.get(cleanKey) || null;
  }

  try {
    const parsed = parseSongInfo(songTitle);
    const searchTerm = parsed.artist ? `${parsed.artist} ${parsed.title}` : parsed.title || songTitle;
    
    if (!searchTerm) {
      artworkCache.set(cleanKey, null);
      return null;
    }

    const url = `${API_ENDPOINTS.ITUNES_SEARCH}?${new URLSearchParams({
      term: searchTerm,
      media: 'music',
      entity: 'song',
      limit: '1',
    })}`;

    const response = await fetch(url, { signal });
    if (!response.ok) {
      artworkCache.set(cleanKey, null);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const rawUrl = data.results[0].artworkUrl100;
      if (rawUrl) {
        const highQualityUrl = rawUrl.replace(ITUNES_IMAGE_SIZES.DEFAULT, '300x300bb.jpg');
        artworkCache.set(cleanKey, highQualityUrl);
        return highQualityUrl;
      }
    }

    artworkCache.set(cleanKey, null);
    return null;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return null;
    }
    // Cache null on network/adblocker failure to avoid repeated failed requests
    artworkCache.set(cleanKey, null);
    return null;
  }
}

interface HistoryAlbumArtProps {
  songTitle: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HistoryAlbumArt({ songTitle, size = 'sm' }: HistoryAlbumArtProps) {
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setLoading(true);

    fetchItunesArt(songTitle, controller.signal).then((url) => {
      if (isMounted) {
        setArtUrl(url);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [songTitle]);

  const dimensions = size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : 'w-20 h-20';
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-10 h-10';

  if (loading) {
    return (
      <div className={`${dimensions} rounded-lg bg-zinc-800/80 animate-pulse flex-shrink-0 flex items-center justify-center border border-zinc-700/40`}>
        <MusicIcon className={`${iconSize} text-zinc-600/50`} />
      </div>
    );
  }

  if (artUrl) {
    return (
      <div className={`${dimensions} relative rounded-lg overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/10 group-hover:ring-indigo-500/40 transition-all duration-300`}>
        <Image
          src={artUrl}
          alt={songTitle}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={`${dimensions} rounded-lg bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 flex-shrink-0 flex items-center justify-center border border-zinc-700/40 ring-1 ring-white/5`}>
      <MusicIcon className={`${iconSize} text-zinc-600`} />
    </div>
  );
}
