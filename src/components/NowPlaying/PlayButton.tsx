'use client';

import { PlayIcon } from '@/components/shared';
import type { PlayButtonProps } from '@/types/music';

/**
 * Play button component with easter egg functionality
 */
export function PlayButton({ 
  onClick, 
  disabled, 
  message 
}: PlayButtonProps) {
  return (
    <div className="hidden sm:flex items-center justify-start gap-3">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label="Play button easter egg"
        className={`
          w-10 h-10 rounded-full bg-emerald-500/10 
          flex items-center justify-center relative flex-shrink-0 transition-all
          ${disabled 
            ? 'opacity-50 cursor-default' 
            : 'animate-pulse-ring cursor-pointer hover:scale-105'
          }
        `}
      >
        {!disabled && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow" />
        )}
        <PlayIcon className={`w-5 h-5 text-emerald-500 relative z-10 ${!disabled && 'animate-pulse-slow'}`} />
      </button>
      
      {message && (
        <div 
          key={message}
          className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shadow-lg animate-slide-in-fade"
        >
          <p className="text-xs font-medium text-emerald-400 whitespace-nowrap">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

