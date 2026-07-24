function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function shiftHue(r: number, g: number, b: number, degree: number): string {
  let rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  let max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }

  h = (h + degree / 360) % 1;
  s = Math.max(0.7, s);
  l = Math.min(0.65, Math.max(0.45, l));

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

  let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  let p = 2 * l - q;
  let newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  let newG = Math.round(hue2rgb(p, q, h) * 255);
  let newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return `rgb(${newR}, ${newG}, ${newB})`;
}

export async function extractDominantColors(
  imageUrl: string | null
): Promise<[string, string, string]> {
  const defaultColors: [string, string, string] = ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.2)'];

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

          if (lum < 0.12 || lum > 0.92) continue;

          const key = `${qr},${qg},${qb}`;
          if (!colorCounts[key]) {
            colorCounts[key] = { count: 0, r, g, b, sat };
          }
          colorCounts[key].count += 1;
        }

        const sorted = Object.values(colorCounts).sort((a, b) => (b.sat * 2 + b.count) - (a.sat * 2 + a.count));

        if (sorted.length >= 3) {
          let c1 = `rgb(${sorted[0].r}, ${sorted[0].g}, ${sorted[0].b})`;
          let c2 = `rgb(${sorted[1].r}, ${sorted[1].g}, ${sorted[1].b})`;
          let c3 = `rgb(${sorted[2].r}, ${sorted[2].g}, ${sorted[2].b})`;

          const dist12 = colorDistance(sorted[0].r, sorted[0].g, sorted[0].b, sorted[1].r, sorted[1].g, sorted[1].b);
          const dist13 = colorDistance(sorted[0].r, sorted[0].g, sorted[0].b, sorted[2].r, sorted[2].g, sorted[2].b);

          if (dist12 < 85 || dist13 < 85) {
            c2 = shiftHue(sorted[0].r, sorted[0].g, sorted[0].b, 140);
            c3 = shiftHue(sorted[0].r, sorted[0].g, sorted[0].b, 220);
          }

          resolve([c1, c2, c3]);
        } else if (sorted.length === 2) {
          const c1 = `rgb(${sorted[0].r}, ${sorted[0].g}, ${sorted[0].b})`;
          const c2 = shiftHue(sorted[0].r, sorted[0].g, sorted[0].b, 140);
          resolve([c1, c2, defaultColors[2]]);
        } else if (sorted.length === 1) {
          const c1 = `rgb(${sorted[0].r}, ${sorted[0].g}, ${sorted[0].b})`;
          const c2 = shiftHue(sorted[0].r, sorted[0].g, sorted[0].b, 140);
          const c3 = shiftHue(sorted[0].r, sorted[0].g, sorted[0].b, 220);
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
