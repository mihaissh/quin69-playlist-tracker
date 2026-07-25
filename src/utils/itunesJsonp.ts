import { ITUNES_IMAGE_SIZES } from '@/constants';
import { cleanSearchTerm } from './songParser';

let callbackCounter = 0;

/**
 * Fetch iTunes album artwork using JSONP with sanitized query parameters
 * Avoids WAF 403 blocks and CORS errors by using %20 encoding and cleaned search strings.
 */
export function fetchItunesJsonp(searchTerm: string, timeoutMs: number = 5000): Promise<string | null> {
  if (typeof window === 'undefined' || !searchTerm) {
    return Promise.resolve(null);
  }

  const sanitizedTerm = cleanSearchTerm(searchTerm);
  if (!sanitizedTerm) {
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

    const encodedTerm = encodeURIComponent(sanitizedTerm);
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=song&limit=1&callback=${callbackName}`;

    script.src = url;
    script.async = true;
    document.head.appendChild(script);
  });
}
