'use client';

/**
 * Footer component
 */

export function Footer() {

  return (
    <footer className="mt-3 pt-3 text-center space-y-1 animate-fade-in delay-300 relative">
      <p className="text-xs text-zinc-600">
        Updates every 15s
      </p>
      <p className="text-xs text-zinc-500">
        Made with{' '}
        <span className="text-red-400">♥</span>{' '}
        for{' '}
        <a
          href="https://twitch.tv/quin69"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Quin69&apos;s
        </a>{' '}
        community • by{' '}
        <a
          href="https://github.com/mihaissh/quin69-playlist-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="rgb-wave-text hover:opacity-90 transition-opacity font-bold inline-flex"
          aria-label="mihaissh"
        >
          {"mihaissh".split('').map((char, index) => (
            <span
              key={index}
              className="rgb-wave-letter"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              {char}
            </span>
          ))}
        </a>
      </p>
    </footer>
  );
}

