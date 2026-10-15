'use client';

/**
 * Footer component
 */

export function Footer() {

  return (
    <footer className="pt-3 text-center animate-fade-in delay-300 relative flex-shrink-0">
      <p className="text-xs text-zinc-500">
        <span className="text-zinc-600">Updates every 15s</span>{' '}•{' '}
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
          className="font-bold text-zinc-300 hover:text-white transition-colors"
        >
          mihaissh
        </a>
      </p>
    </footer>
  );
}

