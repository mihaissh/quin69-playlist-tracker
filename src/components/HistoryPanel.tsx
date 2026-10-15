'use client';

import { useEffect, useMemo, useState } from 'react';
import { BitsIcon, ClockIcon, SearchIcon } from '@/components/shared';
import { RecentlyPlayed } from '@/components/RecentlyPlayed';
import { RecentDonations } from '@/components/RecentDonations';
import { usePersistentHistory } from '@/hooks/usePersistentHistory';
import { HISTORY_TAB_STORAGE_KEY } from '@/constants';
import type { SongWithTimestamp } from '@/types/playlist';
import type { DonationRecord } from '@/types/donation';

type HistoryTab = 'songs' | 'donations';

interface HistoryPanelProps {
  historySongs: SongWithTimestamp[];
  donations: DonationRecord[];
  /** pausedAt of the donation playing right now */
  activePausedAt: string | null;
}

function loadTab(): HistoryTab {
  try {
    return localStorage.getItem(HISTORY_TAB_STORAGE_KEY) === 'donations' ? 'donations' : 'songs';
  } catch {
    return 'songs';
  }
}

function saveTab(tab: HistoryTab): void {
  try {
    localStorage.setItem(HISTORY_TAB_STORAGE_KEY, tab);
  } catch {
    // storage unavailable (private mode) - tab just isn't remembered
  }
}

/**
 * Tabbed card: Recently Played songs / Recent AI song donations.
 * Fills the remaining viewport height; only the list scrolls.
 */
export function HistoryPanel({ historySongs, donations, activePausedAt }: HistoryPanelProps) {
  const { filteredSongs, searchTerm, setSearchTerm, totalStoredCount } = usePersistentHistory({
    incomingHistory: historySongs,
  });
  const [tab, setTab] = useState<HistoryTab>('songs');

  useEffect(() => {
    setTab(loadTab());
  }, []);

  const selectTab = (next: HistoryTab) => {
    setTab(next);
    saveTab(next);
  };

  const filteredDonations = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return donations;
    return donations.filter(
      d => d.donor.toLowerCase().includes(query) || d.token.includes(query)
    );
  }, [donations, searchTerm]);

  const tabs: { id: HistoryTab; label: string; count: number; icon: JSX.Element }[] = [
    { id: 'songs', label: 'Recently Played', count: totalStoredCount, icon: <ClockIcon className="w-3.5 h-3.5" /> },
    { id: 'donations', label: 'Donations', count: donations.length, icon: <BitsIcon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-zinc-800/80 overflow-hidden relative shadow-2xl transition-colors duration-500 hover:border-zinc-700/60 flex flex-col h-full min-h-0"
      style={{ boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px opacity-70 transition-[background] duration-700"
        style={{ background: 'linear-gradient(to right, transparent, var(--accent, #6366f1), transparent)' }}
      />

      {/* Tabs + search */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 via-zinc-800/40 to-zinc-900/90 flex flex-wrap items-center gap-2 flex-shrink-0">
        <div role="tablist" aria-label="History" className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
          {tabs.map(t => {
            const isActive = tab === t.id;
            const showLive = t.id === 'donations' && activePausedAt !== null && !isActive;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`history-tab-${t.id}`}
                aria-selected={isActive}
                aria-controls="history-panel"
                onClick={() => selectTab(t.id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm ring-1 ring-white/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <span
                  className={isActive && t.id === 'donations' ? 'text-violet-400' : ''}
                  style={isActive && t.id === 'songs' ? { color: 'var(--accent, #818cf8)' } : undefined}
                >
                  {t.icon}
                </span>
                <span>{t.label}</span>
                <span className={`px-1.5 rounded-full text-[10px] tabular-nums ${isActive ? 'bg-zinc-700/80 text-zinc-200' : 'bg-zinc-800/60 text-zinc-500'}`}>
                  {t.count}
                </span>
                {showLive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-label="Donation playing" />
                )}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <SearchIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={tab === 'songs' ? 'Search songs...' : 'Search donors...'}
            aria-label={tab === 'songs' ? 'Search recently played songs' : 'Search donations'}
            className="w-full bg-zinc-800/50 hover:bg-zinc-800/80 focus:bg-zinc-900 border border-zinc-700/50 focus:border-indigo-500/50 rounded-lg pl-8 pr-7 py-1.5 text-base sm:text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:outline-none focus:ring-0 transition-colors shadow-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs px-1"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Only this part scrolls */}
      <div
        id="history-panel"
        role="tabpanel"
        aria-labelledby={`history-tab-${tab}`}
        className="flex-1 min-h-0 overflow-y-auto minimal-scrollbar"
      >
        <div key={tab} className="animate-fade-in">
          {tab === 'songs' ? (
            <RecentlyPlayed songs={filteredSongs} searchTerm={searchTerm} />
          ) : (
            <RecentDonations donations={filteredDonations} searchTerm={searchTerm} activePausedAt={activePausedAt} />
          )}
        </div>
      </div>
    </div>
  );
}
