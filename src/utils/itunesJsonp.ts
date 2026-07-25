import { ITUNES_IMAGE_SIZES } from '@/constants';

let callbackCounter = 0;

/**
 * Fetch iTunes album artwork using JSONP to eliminate 403 Forbidden & CORS errors.
 * Works seamlessly across development and static production deployments.
 */
export function fetchItunesJsonp(searchTerm: string, timeoutMs: number = 5000): Promise<string | null> {
  if (typeof window === 'undefined' || !searchTerm) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const callbackName = `__itunes_cb_${Date.now()}_${++callbackCounter}`;
    const script = document.createElement('script');
    
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };

    timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    (window as unknown as Record<string, unknown>)[callbackName] = (data: { results?: Array<{ artworkUrl100?: string }> }) => {
      cleanup();
      if (data?.results && data.results.length > 0 && data.results[0].artworkUrl100) {
        const rawUrl = data.results[0].artworkUrl100;
        resolve(rawUrl.replace(ITUNES_IMAGE_SIZES.DEFAULT, ITUNES_IMAGE_SIZES.HIGH_QUALITY));
      } else {
        resolve(null);
      }
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    const url = `https://itunes.apple.com/search?${new URLSearchParams({
      term: searchTerm,
      media: 'music',
      entity: 'song',
      limit: '1',
      callback: callbackName,
    })}`;

    script.src = url;
    script.async = true;
    document.head.appendChild(script);
  });
}
