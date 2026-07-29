'use client';

import Image from 'next/image';
import { MusicIcon } from '@/components/shared';

interface AlbumArtworkBackProps {
  src: string | null;
}

/**
 * Back face of 3D album artwork card with spinning vinyl record aesthetic
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
      {/* Vinyl Grooves & Vinyl Record Look */}
      <div
        className="w-[90%] h-[90%] rounded-full bg-zinc-900 border-4 border-zinc-800/80 flex items-center justify-center relative shadow-inner animate-spin"
        style={{ animationDuration: '16s' }}
      >
        <div className="w-[75%] h-[75%] rounded-full border border-zinc-800 flex items-center justify-center">
          <div className="w-[65%] h-[65%] rounded-full border border-zinc-700/60 flex items-center justify-center">
            {/* Center Record Label */}
            <div className="w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center relative shadow-md">
              {src ? (
                <div className="w-[70%] h-[70%] rounded-full overflow-hidden relative">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>
              ) : (
                <MusicIcon className="w-1/2 h-1/2 text-white" />
              )}
              {/* Spindle hole */}
              <div className="absolute w-[15%] h-[15%] rounded-full bg-zinc-950 ring-1 ring-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Glass Sheen on Back */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
