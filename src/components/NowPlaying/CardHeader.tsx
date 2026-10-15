'use client';

import { MusicIcon } from '@/components/shared';

/**
 * Card header component for Now Playing card
 */
/** Three bouncing bars shown instead of the note while music is playing */
function PillEqualizer() {
  return (
    <span className="flex items-end gap-[2px] w-3.5 h-3 flex-shrink-0" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="pill-eq-bar flex-1 h-full rounded-sm"
          style={{ background: 'var(--album-c1, #a5b4fc)', animationDelay: `${i * -0.3}s`, animationDuration: `${0.7 + i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export function CardHeader({
  className = '',
  label = 'Now Playing',
  playing = false,
}: {
  className?: string;
  label?: string;
  /** Animate the icon (music is playing) */
  playing?: boolean;
}) {
  return (
    <div className={`px-3.5 py-2.5 relative z-20 flex items-center ${className}`} style={{ minHeight: '40px' }}>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md shadow-md">
        {playing ? (
          <PillEqualizer />
        ) : (
          <MusicIcon
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: 'var(--album-c1, #a5b4fc)' }}
          />
        )}
        <span
          className="text-xs font-bold tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
          style={{
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.95), 0 0 12px var(--album-c1, rgba(99, 102, 241, 0.4))',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

