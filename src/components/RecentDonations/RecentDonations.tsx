'use client';

import { BitsIcon, TtsTokenRow } from '@/components/shared';
import { formatTimestamp } from '@/utils/timestamp';
import type { DonationRecord } from '@/types/donation';

interface RecentDonationsProps {
  donations: DonationRecord[];
  searchTerm: string;
  /** pausedAt of the donation playing right now */
  activePausedAt: string | null;
}

export function RecentDonations({ donations, searchTerm, activePausedAt }: RecentDonationsProps) {
  if (donations.length === 0) {
    return (
      <div className="px-5 py-12 text-center flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-500 mb-1">
          <BitsIcon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-zinc-400">
          {searchTerm ? 'No donations match your search query' : 'No AI song donations yet'}
        </p>
        <p className="text-xs text-zinc-600">
          {searchTerm ? 'Try searching for another donor or token' : 'Bits-backed TTS songs will appear here when they play'}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-800/50">
      {donations.map(donation => {
        const isPlaying = donation.pausedAt === activePausedAt;
        return (
          <li
            key={donation.id}
            className={`px-4 sm:px-5 py-3 space-y-2 transition-colors duration-300 ${isPlaying ? 'bg-violet-950/20' : 'hover:bg-zinc-800/20'}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-sm font-bold truncate"
                style={{ color: donation.donorColor ?? '#e4e4e7' }}
              >
                {donation.donor}
              </span>
              {donation.bits > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-200 text-[11px] font-bold flex-shrink-0">
                  <BitsIcon className="w-3 h-3 text-violet-300" />
                  {donation.bits.toLocaleString()}
                </span>
              ) : (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[11px] font-bold flex-shrink-0"
                  title="Paid donation - the amount isn't shown in chat"
                >
                  $ Tip
                </span>
              )}
              {isPlaying && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                  Playing
                </span>
              )}
              <span className="ml-auto text-[11px] font-mono text-zinc-500 bg-zinc-800/40 px-2 py-0.5 rounded flex-shrink-0">
                {formatTimestamp(donation.pausedAt)}
              </span>
            </div>
            <TtsTokenRow token={donation.token} compact />
          </li>
        );
      })}
    </ul>
  );
}
