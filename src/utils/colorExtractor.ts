function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Adjust lightness/brightness of a color while preserving its exact hue
 */
function adjustShade(r: number, g: number, b: number, factor: number): string {
  const newR = Math.min(255, Math.max(20, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(20, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(20, Math.round(b * factor)));
  return `rgb(${newR}, ${newG}, ${newB})`;
}

export async function extractDominantColors(
  imageUrl: string | null
): Promise<[string, string, string]> {
  const defaultColors: [string, string, string] = [
    'rgba(255, 255, 255, 0.9)', 
    'rgba(255, 255, 255, 0.5)', 
    'rgba(255, 255, 255, 0.2)'
  ];

  if (!imageUrl) return defaultColors;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    const timeout = setTimeout(() => {
      resolve(defaultColors);
    }, 2000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(defaultColors);

        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);

        const imgData = ctx.getImageData(0, 0, 16, 16).data;
        const colorCounts: { [key: string]: { count: number; r: number; g: number; b: number; sat: number } } = {};

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lum = (max + min) / 2 / 255;
          const sat = max === 0 ? 0 : (max - min) / max;

          // Skip extremely dark blacks or pure white backgrounds
          if (lum < 0.10 || lum > 0.94) continue;

          const key = `${qr},${qg},${qb}`;
          if (!colorCounts[key]) {
            colorCounts[key] = { count: 0, r, g, b, sat };
          }
          colorCounts[key].count += 1;
        }

        const sorted = Object.values(colorCounts).sort((a, b) => (b.sat * 2.5 + b.count) - (a.sat * 2.5 + a.count));

        if (sorted.length >= 3) {
          const c1 = `rgb(${sorted[0].r}, ${sorted[0].g}, ${sorted[0].b})`;
          let c2 = `rgb(${sorted[1].r}, ${sorted[1].g}, ${sorted[1].b})`;
          let c3 = `rgb(${sorted[2].r}, ${sorted[2].g}, ${sorted[2].b})`;

          const dist12 = colorDistance(sorted[0].r, sorted[0].g, sorted[0].b, sorted[1].r, sorted[1].g, sorted[1].b);
          const dist13 = colorDistance(sorted[0].r, sorted[0].g, sorted[0].b, sorted[2].r, sorted[2].g, sorted[2].b);

          // If sampled colors are nearly identical (monochromatic cover), derive distinct light/dark shades of the album's main color
          if (dist12 < 60 && dist13 < 60) {
            c2 = adjustShade(sorted[0].r, sorted[0].g, sorted[0].b, 1.45); // Lighter highlight
            c3 = adjustShade(sorted[0].r, sorted[0].g, sorted[0].b, 0.65); // Deeper shade
          } else if (dist12 < 60) {
            c2 = adjustShade(sorted[0].r, sorted[0].g, sorted[0].b, 1.4);
          }

          resolve([c1, c2, c3]);
        } else if (sorted.length === 2) {
          const c1 = `rgb(${sorted[0].r}, ${sorted[0].g}, ${sorted[0].b})`;
          const c2 = `rgb(${sorted[1].r}, ${sorted[1].g}, ${sorted[1].b})`;
          const c3 = adjustShade(sorted[0].r, sorted[0].g, sorted[0].b, 1.35);
          resolve([c1, c2, c3]);
        } else if (sorted.length === 1) {
          const c1 = `rgb(${sorted[0].r}, ${sorted[0].g}, ${sorted[0].b})`;
          const c2 = adjustShade(sorted[0].r, sorted[0].g, sorted[0].b, 1.45);
          const c3 = adjustShade(sorted[0].r, sorted[0].g, sorted[0].b, 0.65);
          resolve([c1, c2, c3]);
        } else {
          resolve(defaultColors);
        }
      } catch {
        resolve(defaultColors);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(defaultColors);
    };

    img.src = imageUrl;
  });
}
