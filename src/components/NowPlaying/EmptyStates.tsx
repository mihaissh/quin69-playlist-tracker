'use client';

import { LoadingSpinner } from '@/components/Spinner';
import { NoMusicIcon } from '@/components/shared';
import { EMPTY_STATE_MESSAGES } from '@/constants';

/**
 * Loading state component
 */
export function LoadingState() {
  return <LoadingSpinner text={EMPTY_STATE_MESSAGES.LOADING} />;
}

/**
 * No song state component
 */
export function NoSongState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
        <NoMusicIcon />
      </div>
      <p className="text-zinc-600 text-sm">{EMPTY_STATE_MESSAGES.NO_SONG_PLAYING}</p>
    </div>
  );
}

