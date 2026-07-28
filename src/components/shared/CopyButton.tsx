'use client';

import { useState } from 'react';
import { logger } from '@/utils/logger';
import type { IconProps } from '@/types/common';

const CopyIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

export interface CopyButtonProps {
  songText: string;
  variant?: 'button' | 'div';
  className?: string;
}

/**
 * Reusable copy button component
 * Can be used as a button or div (for keyboard accessibility)
 */
export function CopyButton({ songText, variant = 'button', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(songText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const baseClasses = `p-2 rounded-xl btn-clean-copy relative flex items-center justify-center transition-colors ${
    copied
      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
      : 'text-zinc-400 hover:text-zinc-200'
  } ${className}`;

  const content = (
    <>
      <div className={`transition-all duration-200 ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
        <CopyIcon className="w-4 h-4 text-indigo-400" />
      </div>
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <CheckIcon className="w-4 h-4 text-emerald-400" />
      </div>
    </>
  );

  if (variant === 'div') {
    return (
      <div
        onClick={handleCopy}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopy();
          }
        }}
        className={`${baseClasses} cursor-pointer`}
        aria-label="Copy song and artist"
      >
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={baseClasses}
      aria-label="Copy song and artist"
    >
      {content}
    </button>
  );
}
