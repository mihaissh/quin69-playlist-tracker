'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

interface AlbumBackdropProps {
  /** Album artwork url, or null for the fallback background */
  src: string | null;
  /** Use the donation (violet / emerald) background instead of artwork */
  donation?: boolean;
}

/** How long a new background takes to fade in over the old one */
const CROSSFADE_MS = 900;

type Layer = { id: number; key: string; src: string | null; donation: boolean };

let nextLayerId = 0;

function BackdropLayer({ layer }: { layer: Layer }) {
  if (layer.donation) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 15% 25%, rgba(139, 92, 246, 0.35), transparent 55%), radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.22), transparent 55%)',
        }}
      />
    );
  }
  if (layer.src) {
    return (
      <img
        src={layer.src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl saturate-[1.5] opacity-80"
      />
    );
  }
  return null;
}

/**
 * Blurred album artwork filling the Now Playing card.
 * A new background cross-fades over the previous one, so there is no dark flash between songs.
 */
export function AlbumBackdrop({ src, donation = false }: AlbumBackdropProps) {
  const key = donation ? 'donation' : src ?? 'none';
  const [layers, setLayers] = useState<Layer[]>(() => [{ id: nextLayerId++, key, src, donation }]);

  useEffect(() => {
    setLayers(prev => {
      if (prev[prev.length - 1]?.key === key) return prev;
      // Keep the previous top layer underneath while the new one fades in
      return [...prev.slice(-1), { id: nextLayerId++, key, src, donation }];
    });
  }, [key, src, donation]);

  // Drop the old layer once the new one is fully visible
  useEffect(() => {
    if (layers.length < 2) return;
    const timer = setTimeout(() => setLayers(prev => prev.slice(-1)), CROSSFADE_MS + 50);
    return () => clearTimeout(timer);
  }, [layers]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Slowly drifting / breathing artwork */}
      <div className="absolute inset-0 backdrop-drift">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`absolute inset-0 ${index > 0 || layers.length === 1 ? 'animate-backdrop-in' : ''}`}
          >
            <BackdropLayer layer={layer} />
          </div>
        ))}
      </div>

      {/* Two soft lights in the album colours floating around */}
      <div
        className="absolute -top-1/3 -left-1/4 w-2/3 aspect-square rounded-full blur-3xl opacity-25 mix-blend-screen backdrop-orb-a transition-colors duration-1000"
        style={{ background: 'radial-gradient(circle, var(--album-c1, #818cf8), transparent 65%)' }}
      />
      <div
        className="absolute -bottom-1/2 -right-1/4 w-2/3 aspect-square rounded-full blur-3xl opacity-20 mix-blend-screen backdrop-orb-b transition-colors duration-1000"
        style={{ background: 'radial-gradient(circle, var(--album-c2, #c084fc), transparent 65%)' }}
      />

      {/* Darkening layers keep the text readable on bright covers */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/65 via-zinc-950/45 to-zinc-950/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-zinc-950/20" />
    </div>
  );
}
