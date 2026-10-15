'use client';

const BAR_COUNT = 56;

// Fixed pseudo-random timings so every bar moves differently (and SSR matches the client)
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  const r2 = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1;
  // Taller in the middle, like a real spectrum
  const centre = 1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
  return {
    duration: 0.9 + r1 * 1.1,
    delay: -r2 * 2,
    peak: 0.35 + centre * 0.45 + r1 * 0.2,
  };
});

/**
 * Decorative spectrum bars along the bottom of the Now Playing card,
 * tinted with the album colour. Purely visual - it does not react to the real audio.
 */
export function Visualizer({ active }: { active: boolean }) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 h-16 sm:h-20 flex items-end gap-[3px] px-2 pointer-events-none z-[1] transition-opacity duration-1000 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      }}
      aria-hidden="true"
    >
      {BARS.map((bar, i) => (
        <span
          key={i}
          className="visualizer-bar flex-1 h-full rounded-t-full origin-bottom"
          style={{
            background: 'linear-gradient(to top, var(--album-c1, #818cf8), transparent)',
            animationDuration: `${bar.duration}s`,
            animationDelay: `${bar.delay}s`,
            animationPlayState: active ? 'running' : 'paused',
            '--bar-peak': bar.peak,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
