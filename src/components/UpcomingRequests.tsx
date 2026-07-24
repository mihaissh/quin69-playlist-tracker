'use client';

import { SearchLinks, CopyButton } from '@/components/shared';
import type { UpcomingRequestsProps } from '@/types/playlist';
import { formatTimestamp } from '@/utils/timestamp';

export function UpcomingRequests({ upcomingSongs }: UpcomingRequestsProps) {
  if (!upcomingSongs || upcomingSongs.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-md rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-zinc-700/50 bg-zinc-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-200">Upcoming Requests</h3>
          <span className="px-2 py-0.5 text-[11px] font-bold bg-fuchsia-500/20 text-fuchsia-300 rounded-full border border-fuchsia-500/30">
            {upcomingSongs.length}
          </span>
        </div>
        <span className="text-xs text-zinc-500 font-medium">Channel Point Queue</span>
      </div>

      <div className="divide-y divide-zinc-700/30 max-h-[320px] overflow-y-auto minimal-scrollbar">
        {upcomingSongs.map((song, index) => (
          <div 
            key={`${song.timestamp}-${index}`}
            className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-zinc-700/20 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-700/40">
                  @{song.requester}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {formatTimestamp(song.timestamp)}
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate" title={song.title}>
                {song.title}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <SearchLinks songQuery={song.title} />
              <CopyButton songText={song.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
