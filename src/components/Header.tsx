'use client';

import Image from 'next/image';
import type { HeaderProps } from '@/types/header';
import { ASSETS } from '@/constants';
import { Reveal } from './Reveal';

export function Header({ isOffline, hasError, streamTitle }: HeaderProps) {
  const isOfflineOrError = isOffline || hasError;
  const subtitle = streamTitle || 'Song Requests';

  return (
    <header className="mb-1.5 sm:mb-2 relative">
      <Reveal>
        <div className="flex items-center justify-between gap-4">
          {/* Profile */}
          <a
            href="https://www.twitch.tv/quin69"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group flex-1"
          >
            <div className="relative">
              <Image
                src={`${ASSETS.BASE_PATH}/${ASSETS.PROFILE_IMAGE}`}
                alt="Quin69"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full ring-2 ring-white/20 transition-all group-hover:ring-white/40"
                priority
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${isOfflineOrError ? 'bg-zinc-500' : 'bg-red-500'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors">
                Quin69
              </h1>
              <div className="max-w-[280px] sm:max-w-[480px] md:max-w-[560px] overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)' }}>
                <p className="text-xs text-zinc-400 font-semibold whitespace-nowrap marquee-scroll inline-block">
                  <span className="pr-12">{subtitle}</span>
                  <span className="pr-12">{subtitle}</span>
                </p>
              </div>
            </div>
          </a>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${isOfflineOrError ? 'bg-zinc-500/10 text-zinc-400' : 'bg-red-500/10 text-red-400'}`}>
              {isOfflineOrError ? 'Offline' : 'Live'}
            </div>
          </div>
        </div>
      </Reveal>
    </header>
  );
}

