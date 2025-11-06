import Image from 'next/image';
import type { HeaderProps } from '@/types/header';
import { ASSETS } from '@/constants';
import { Reveal } from './Reveal';

export function Header({ isOffline, hasError }: HeaderProps) {
  const isOfflineOrError = isOffline || hasError;
  
  return (
    <header className="mb-8">
      <Reveal>
        <div className="flex items-center justify-between">
          {/* Profile */}
          <a 
            href="https://www.twitch.tv/quin69"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <Image
                src={`${ASSETS.BASE_PATH}/${ASSETS.PROFILE_IMAGE}`}
                alt="Quin69"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full ring-2 ring-emerald-500/20 transition-all group-hover:ring-emerald-500/40"
                priority
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${isOfflineOrError ? 'bg-zinc-500' : 'bg-red-500'}`} />
            </div>
            <div>
              <h1 className="text-lg font-semibold group-hover:text-emerald-400 transition-colors">
                Quin69
              </h1>
              <p className="text-xs text-zinc-500">
                Song Requests
              </p>
            </div>
          </a>

          {/* Status Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${isOfflineOrError ? 'bg-zinc-500/10 text-zinc-400' : 'bg-red-500/10 text-red-400'}`}>
            {isOfflineOrError ? 'Offline' : 'Live'}
          </div>
        </div>
      </Reveal>
    </header>
  );
}

