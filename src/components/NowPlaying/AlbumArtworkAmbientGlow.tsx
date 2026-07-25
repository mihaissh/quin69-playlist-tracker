'use client';

import Image from 'next/image';

interface AlbumArtworkAmbientGlowProps {
  src: string | null;
}

/**
 * Ambient color glow projection component behind album artwork
 */
export function AlbumArtworkAmbientGlow({ src }: AlbumArtworkAmbientGlowProps) {
  if (!src) return null;

  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none">
      <Image
        src={src}
        alt=""
        fill
        sizes="208px"
        className="object-cover"
        priority
        unoptimized
      />
    </div>
  );
}
