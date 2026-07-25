'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { parseSongInfo } from '@/utils/songParser';
import { fetchItunesJsonp } from '@/utils/itunesJsonp';

const MAX_CACHE_SIZE = 100;
const artworkCache = new Map<string, string | null>();

function setCachedArtwork(key: string, value: string | null) {
  if (artworkCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = artworkCache.keys().next().value;
    if (oldestKey) artworkCache.delete(oldestKey);
  }
  artworkCache.set(key, value);
}

async function fetchItunesArt(songTitle: string): Promise<string | null> {
  if (!songTitle) return null;
  const cleanKey = songTitle.toLowerCase().trim();
  
  if (artworkCache.has(cleanKey)) {
    return artworkCache.get(cleanKey) || null;
  }

  const parsed = parseSongInfo(songTitle);
  const searchTerm = parsed.artist ? `${parsed.artist} ${parsed.title}` : parsed.title || songTitle;
  
  if (!searchTerm) {
    setCachedArtwork(cleanKey, null);
    return null;
  }

  const artworkUrl = await fetchItunesJsonp(searchTerm);
  setCachedArtwork(cleanKey, artworkUrl);
  return artworkUrl;
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
    setLoading(true);

    fetchItunesArt(songTitle).then((url) => {
      if (isMounted) {
        setArtUrl(url);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [songTitle]);

  if (loading || !artUrl) {
    return null;
  }

  const dimensions = size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : 'w-20 h-20';

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
