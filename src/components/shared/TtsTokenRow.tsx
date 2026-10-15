'use client';

import { useEffect, useRef, useState } from 'react';
import { formatTtsToken } from '@/utils/donation';
import { logger } from '@/utils/logger';

const CopyIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * "(TTS:...)" token. The whole row is one big copy button so it is easy to hit on phones.
 */
export function TtsTokenRow({ token, compact = false }: { token: string; compact?: boolean }) {
  const text = formatTtsToken(token);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy token:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Token copied' : `Copy TTS token ${text}`}
      className={`group/token w-full min-w-0 flex items-center gap-2 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] ${
        compact ? 'px-3 py-2' : 'px-3.5 sm:px-4 py-3 sm:py-3.5'
      } ${
        copied
          ? 'bg-emerald-950/50 border-emerald-500/50 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
          : 'bg-zinc-950/80 border-white/10 hover:border-emerald-500/40 hover:bg-zinc-950'
      }`}
    >
      <code
        className={`flex-1 min-w-0 truncate font-mono tracking-tight text-emerald-300 ${
          compact ? 'text-[11px] sm:text-xs' : 'text-[12.5px] min-[400px]:text-[13px] sm:text-base'
        }`}
        title={text}
      >
        {text}
      </code>
      <span
        className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
        } ${
          copied
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-zinc-800/80 text-zinc-300 group-hover/token:bg-emerald-500/15 group-hover/token:text-emerald-200'
        }`}
        aria-live="polite"
      >
        {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
      </span>
    </button>
  );
}
