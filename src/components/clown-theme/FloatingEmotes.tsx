'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { EMOTES, getEmotePath } from '@/constants/emotes';

interface WaterfallEmote {
  id: string;
  currentEmote: string;
  size: number;
  duration: number;
  delay: number;
  xPosition: number;
  columnIndex: number;
}

let emoteCounter = 0;

const generateWaterfallEmotes = (): WaterfallEmote[] => {
  const emotes: WaterfallEmote[] = [];
  const allEmotesArray = Array.from(EMOTES.FLOATING);
  const columns = 8; // 8 columns across the screen for waterfall

  // Create emotes for each column with staggered delays
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < 3; row++) {
      const emoteIndex = Math.floor(Math.random() * allEmotesArray.length);
      const sizeVariation = Math.random();
      // Create more size diversity: 60-150px with varied distribution
      const size = sizeVariation < 0.3 ? 60 + Math.random() * 30 : // Small: 60-90px
                   sizeVariation < 0.7 ? 90 + Math.random() * 40 : // Medium: 90-130px
                   130 + Math.random() * 20; // Large: 130-150px
      const duration = 10 + Math.random() * 6; // 10-16s per drop (variable speed)

      emotes.push({
        id: `waterfall-${emoteCounter++}`,
        currentEmote: allEmotesArray[emoteIndex],
        size,
        duration,
        delay: row * (duration / 3), // Stagger each row in the column
        xPosition: (col / columns) * 100 + Math.random() * 8, // Even distribution across columns
        columnIndex: col,
      });
    }
  }

  return emotes;
};

export function FloatingEmotes() {
  const { clownMode } = useTheme();
  const emotes = useMemo(() => generateWaterfallEmotes(), []);

  if (!clownMode) return null;

  return (
    <>
      {emotes.map((emote) => (
        <div
          key={emote.id}
          className="fixed pointer-events-none"
          style={{
            left: `${emote.xPosition}%`,
            top: '-150px',
            zIndex: 5,
            animation: `waterfall ${emote.duration}s linear infinite`,
            animationDelay: `${emote.delay}s`,
            width: emote.size,
            height: emote.size,
            overflow: 'visible',
          }}
        >
          <Image
            src={getEmotePath(emote.currentEmote)}
            alt="waterfall clown emote"
            width={emote.size}
            height={emote.size}
            className="w-full h-full object-contain drop-shadow-lg"
            priority={false}
            style={{ overflow: 'visible' }}
          />
        </div>
      ))}
    </>
  );
}
