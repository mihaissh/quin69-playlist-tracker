'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { HeaderProps } from '@/types/header';
import { ASSETS } from '@/constants';
import { Reveal } from './Reveal';

/**
 * Stream title: static when it fits, scrolling marquee only when it overflows.
 */
function StreamTitle({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;
    const check = () => setOverflows(measure.scrollWidth > box.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(box);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div
      ref={boxRef}
      className="relative w-full overflow-hidden"
      style={
        overflows
          ? {
              maskImage: 'linear-gradient(to right, transparent, black 4%, black 92%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 92%, transparent)',
            }
          : undefined
      }
      title={text}
    >
      {/* Hidden copy used only to measure the natural width */}
      <span ref={measureRef} className="absolute invisible whitespace-nowrap text-xs font-semibold" aria-hidden="true">
        {text}
      </span>
      {overflows ? (
        <p className="text-xs text-zinc-400 font-semibold whitespace-nowrap marquee-scroll inline-block">
          <span className="pr-12">{text}</span>
          <span className="pr-12" aria-hidden="true">{text}</span>
        </p>
      ) : (
        <p className="text-xs text-zinc-400 font-semibold whitespace-nowrap truncate">{text}</p>
      )}
    </div>
  );
}

export function Header({ isOffline, hasError, streamTitle }: HeaderProps) {
  const isOfflineOrError = isOffline || hasError;
  const subtitle = streamTitle || 'Song Requests';

  return (
    <header className="mb-4 sm:mb-5 relative flex-shrink-0">
      <Reveal>
        <div className="flex items-center justify-between gap-4">
          {/* Profile */}
          <a
            href="https://www.twitch.tv/quin69"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group flex-1 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <Image
                src={`${ASSETS.BASE_PATH}/${ASSETS.PROFILE_IMAGE}`}
                alt="Quin69"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full ring-2 ring-white/20 transition-all group-hover:ring-white/40"
                priority
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${
                  isOfflineOrError ? 'bg-zinc-500' : 'bg-red-500'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors">
                Quin69
              </h1>
              <StreamTitle text={subtitle} />
            </div>
          </a>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isOfflineOrError
                  ? 'bg-zinc-500/10 text-zinc-400 border-zinc-700/50'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              <span className="relative flex w-1.5 h-1.5">
                {!isOfflineOrError && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping motion-reduce:animate-none" />
                )}
                <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${isOfflineOrError ? 'bg-zinc-500' : 'bg-red-500'}`} />
              </span>
              {isOfflineOrError ? 'Offline' : 'Live'}
            </div>
          </div>
        </div>
      </Reveal>
    </header>
  );
}

