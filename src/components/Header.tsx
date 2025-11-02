interface HeaderProps {
  isOffline: boolean;
  hasError: boolean;
}

export function Header({ isOffline, hasError }: HeaderProps) {
  const isOfflineOrError = isOffline || hasError;
  
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        {/* Profile */}
        <a 
          href="https://www.twitch.tv/quin69"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <img
              src={`${process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : ''}/quin69.png`}
              alt="Quin69"
              className="w-12 h-12 rounded-full ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${isOfflineOrError ? 'bg-zinc-500' : 'bg-emerald-500'}`} />
          </div>
          <div>
            <h1 className="text-lg font-semibold group-hover:text-emerald-400 transition-colors">
              Quin69
            </h1>
            <p className="text-xs text-zinc-500">
              Song Requests
            </p>
          </div>
        </a>

        {/* Status Badge */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${isOfflineOrError ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {isOfflineOrError ? 'Offline' : 'Live'}
        </div>
      </div>
    </header>
  );
}

