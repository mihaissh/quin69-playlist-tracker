/**
 * Storage utilities for resolved donation pauses
 */

import type { ResolvedPauses, TtsDonation } from '@/types/donation';
import { DONATION_CONFIG, DONATION_HISTORY_STORAGE_KEY } from '@/constants';
import { logger } from '@/utils/logger';

function isValidDonation(item: unknown): item is TtsDonation {
  if (typeof item !== 'object' || item === null) return false;
  const d = item as TtsDonation;
  return (
    typeof d.id === 'string' &&
    typeof d.donor === 'string' &&
    typeof d.bits === 'number' &&
    typeof d.token === 'string' &&
    typeof d.timestamp === 'string'
  );
}

/** Keeps only the newest pauses */
export function capResolvedPauses(resolved: ResolvedPauses, max: number = DONATION_CONFIG.MAX_STORED_PAUSES): ResolvedPauses {
  const keys = Object.keys(resolved).sort().slice(-max);
  return Object.fromEntries(keys.map(key => [key, resolved[key]]));
}

export function loadResolvedPauses(): ResolvedPauses {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(DONATION_HISTORY_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

    const resolved: ResolvedPauses = {};
    for (const [pausedAt, value] of Object.entries(parsed)) {
      if (value === null) resolved[pausedAt] = null;
      else if (isValidDonation(value)) resolved[pausedAt] = { ...value, donorColor: value.donorColor ?? null };
    }
    return resolved;
  } catch (error) {
    logger.error('Failed to load donation history from localStorage:', error);
    return {};
  }
}

export function saveResolvedPauses(resolved: ResolvedPauses): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(DONATION_HISTORY_STORAGE_KEY, JSON.stringify(capResolvedPauses(resolved)));
  } catch (error) {
    logger.error('Failed to save donation history to localStorage:', error);
  }
}
