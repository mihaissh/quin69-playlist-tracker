'use client';

/* eslint-disable @next/next/no-img-element */

import { ASSETS } from '@/constants';

interface AlbumArtworkBackProps {
  src: string | null;
}

/**
 * Back face of the 3D album artwork card (click the cover to flip):
 * the sombrero frog dancing on a blurred copy of the artwork.
 */
export function AlbumArtworkBack({ src }: AlbumArtworkBackProps) {
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden ring-1 ring-white/20 bg-zinc-950 flex items-center justify-center shadow-inner"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-50 saturate-150"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-zinc-900 to-emerald-900/40" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,transparent_30%,rgba(9,9,11,0.7))]" />

      <img
        src={`${ASSETS.BASE_PATH}/${ASSETS.SOMBRERO_FROG}`}
        alt="Frog in a sombrero"
        className="relative w-[92%] h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] select-none"
        draggable={false}
        loading="lazy"
      />

      {/* Glass Sheen on Back */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
