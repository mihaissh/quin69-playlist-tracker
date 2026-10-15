/**
 * TTS / AI song donation types
 */

export interface TtsDonation {
  /** Twitch message id */
  id: string;
  donor: string;
  /** Donor's chat color, if set */
  donorColor: string | null;
  /** Bits cheered; 0 for a money tip (amount not visible in chat) */
  bits: number;
  /** 'bits' = Cheer with a token, 'tip' = token pasted in chat right before the pause */
  source?: 'bits' | 'tip';
  /** 24-char hex Brainfrog token, without the "(TTS:...)" wrapper */
  token: string;
  /** ISO timestamp of the cheer */
  timestamp: string;
}

/** A donation matched to the ⏸ it caused */
export interface DonationRecord extends TtsDonation {
  /** "YYYY-MM-DD HH:MM:SS" (UTC) of the ⏸ message */
  pausedAt: string;
}

export interface PlaybackState {
  paused: boolean;
  /** "YYYY-MM-DD HH:MM:SS" (UTC) of the ⏸ message */
  pausedAt: string | null;
}

export interface ActiveDonation {
  /** The donation currently playing */
  current: TtsDonation;
  pausedAt: string;
}

/** pausedAt -> donation that caused it, or null for a pause without a TTS cheer */
export type ResolvedPauses = Record<string, TtsDonation | null>;
