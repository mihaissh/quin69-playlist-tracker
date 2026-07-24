import { useState, useEffect } from 'react';
import { extractDominantColors } from '@/utils/colorExtractor';

export function useAlbumColors(albumArt: string | null) {
  const [colors, setColors] = useState<[string, string, string]>(['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.2)']);

  useEffect(() => {
    let isMounted = true;
    extractDominantColors(albumArt).then((extracted) => {
      if (isMounted) {
        setColors(extracted);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [albumArt]);

  return colors;
}
