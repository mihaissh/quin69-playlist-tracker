'use client';

import { MusicIcon } from '@/components/shared';

/**
 * Card header component for Now Playing card
 */
export function CardHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`px-3 py-2 border-b border-emerald-500/20 bg-emerald-500/5 relative z-20 ${className}`} style={{ height: '40px' }}>
      <h3 className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
        <MusicIcon />
        Now Playing
      </h3>
    </div>
  );
}

