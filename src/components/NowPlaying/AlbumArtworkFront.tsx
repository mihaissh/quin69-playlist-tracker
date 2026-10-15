'use client';

import Image from 'next/image';
import { MusicIcon } from '@/components/shared';

interface AlbumArtworkFrontProps {
  src: string | null;
  alt?: string;
  /** Song text - picks the placeholder's colors so each song looks different */
  seed?: string;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(seed: string): string {
  const artist = seed.split(' - ')[0] ?? seed;
  const words = artist.split(/\s+/).map(w => w.replace(/^[^A-Za-z0-9\u00C0-\u024F]+/, '')).filter(Boolean);
  return words.slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

/** Generated cover for songs without iTunes artwork */
function PlaceholderCover({ seed }: { seed?: string }) {
  const hash = hashString(seed || 'quin69');
  const hue = hash % 360;
  const hue2 = (hue + 40 + (hash % 80)) % 360;
  const initials = seed ? getInitials(seed) : '';

  return (
    <div
      className="w-full h-full relative flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at 25% 20%, hsl(${hue} 55% 38% / 0.9), transparent 60%),
          radial-gradient(circle at 80% 85%, hsl(${hue2} 60% 30% / 0.9), transparent 55%),
          linear-gradient(135deg, hsl(${hue} 25% 14%), hsl(${hue2} 25% 9%))`,
      }}
    >
      {/* Vinyl grooves */}
      <div className="absolute inset-[12%] rounded-full border border-white/[0.06]" />
      <div className="absolute inset-[22%] rounded-full border border-white/[0.05]" />
      <div className="absolute inset-[32%] rounded-full border border-white/[0.04]" />

      <div className="relative flex flex-col items-center gap-1.5">
        {initials ? (
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {initials}
          </span>
        ) : (
          <MusicIcon className="w-16 h-16 text-white/60" />
        )}
        <MusicIcon className="w-4 h-4 text-white/40" />
      </div>
    </div>
  );
}

/**
 * Front face of 3D album artwork card
 */
export function AlbumArtworkFront({ src, alt = "Album Art", seed }: AlbumArtworkFrontProps) {
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden ring-1 ring-white/15 group-hover:ring-indigo-500/50 transition-colors duration-200 bg-zinc-900"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {src ? (
        <>
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            sizes="240px"
            className="object-cover animate-album-art-in"
            priority
            unoptimized
          />
          {/* Glass Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
        </>
      ) : (
        <PlaceholderCover seed={seed} />
      )}
    </div>
  );
}
