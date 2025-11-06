/**
 * Loading component shown while checking stream status
 */

export function StreamStatusLoader() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-zinc-500">Checking stream status...</span>
      </div>
    </div>
  );
}

