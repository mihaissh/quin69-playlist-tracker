// All 13 emotes available (8 original + 5 new)
const ALL_EMOTES = [
  'clown-tiny.avif',
  'clown-small.avif',
  'clown-medium-1.avif',
  'clown-medium-2.avif',
  'clown-large-1.avif',
  'clown-large-2.avif',
  'clown-large-3.avif',
  'clown-huge.avif',
  'clown-new-1.avif',
  'clown-new-2.avif',
  'clown-new-3.avif',
  'clown-new-4.avif',
  'clown-new-5.avif',
] as const;

export const EMOTES = {
  ALL: ALL_EMOTES,
  SCATTERED: ALL_EMOTES,
  FLOATING: ALL_EMOTES,
  COMPONENT: ALL_EMOTES,
  HERO: 'clown-huge.avif',
} as const;

// Dynamically determine the base path based on environment
const EMOTE_BASE_PATH = process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker/7tv' : '/7tv';

export const getEmotePath = (emote: string): string => {
  return `${EMOTE_BASE_PATH}/${emote}`;
};
