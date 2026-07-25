'use client';

import Image from 'next/image';
import { MusicIcon } from '@/components/shared';

interface AlbumArtworkFrontProps {
  src: string | null;
  alt?: string;
}

/**
 * Front face of 3D album artwork card
 */
export function AlbumArtworkFront({ src, alt = "Album Art" }: AlbumArtworkFrontProps) {
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
            src={src}
            alt={alt}
            fill
            sizes="208px"
            className="object-cover"
            priority
            unoptimized
          />
          {/* Glass Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-zinc-800/90 via-zinc-800/50 to-zinc-900/90 flex items-center justify-center">
          <MusicIcon className="w-20 h-20 text-zinc-600 group-hover:text-indigo-400/70 transition-colors duration-200" />
        </div>
      )}
    </div>
  );
}
