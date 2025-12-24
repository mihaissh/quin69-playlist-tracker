'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { EMOTES, getEmotePath } from '@/constants/emotes';
import type { EmotePosition } from '@/types/theme';

interface ComponentEmoteProps {
  position?: EmotePosition;
  size?: number;
}

const positionClasses: Record<EmotePosition, string> = {
  'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
  'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4',
  'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
  'left': 'top-1/2 left-0 -translate-x-1/4 -translate-y-1/2',
  'right': 'top-1/2 right-0 translate-x-1/4 -translate-y-1/2',
};

export function ComponentEmote({ position = 'top-right', size = 48 }: ComponentEmoteProps) {
  const { clownMode } = useTheme();

  if (!clownMode) return null;

  // Randomly select a component emote
  const emotesArray = Array.from(EMOTES.COMPONENT);
  const emote = emotesArray[Math.floor(Math.random() * emotesArray.length)];

  return (
    <div
      className={`
        absolute ${positionClasses[position]}
        opacity-15 hover:opacity-25 transition-opacity pointer-events-none
      `}
      style={{ width: size, height: size }}
    >
      <Image
        src={getEmotePath(emote)}
        alt="clown emote decoration"
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority={false}
      />
    </div>
  );
}
