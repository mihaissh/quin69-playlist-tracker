'use client';

import type { InfoFieldProps } from '@/types/music';

/**
 * Info field component for displaying labeled information
 */
export function InfoField({ 
  label, 
  value, 
  labelColor = "text-zinc-400",
  valueColor = "text-white",
  textSize = "text-base"
}: InfoFieldProps) {
  return (
    <div className="relative">
      <span className={`${labelColor} text-[11px] font-bold uppercase tracking-wider block mb-1 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
        {label}
      </span>
      <p className={`${textSize} font-extrabold ${valueColor} leading-snug relative z-10 break-words`} style={{
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.8)'
      }}>
        {value}
      </p>
    </div>
  );
}

