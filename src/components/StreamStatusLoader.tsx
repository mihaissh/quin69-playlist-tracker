/**
 * Loading component shown while checking stream status
 */

import { Spinner } from '@/components/Spinner';

export function StreamStatusLoader() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-8 h-8 text-white" size={32} />
        <span className="text-sm text-zinc-500">Checking stream status...</span>
      </div>
    </div>
  );
}
