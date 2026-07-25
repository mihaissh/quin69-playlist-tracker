import { ITUNES_IMAGE_SIZES } from '@/constants';

// In-memory artwork cache to prevent duplicate lookups
const artworkMemoryCache = new Map<string, string | null>();

/**
 * Fetch iTunes artwork via JSONP to bypass browser CORS policies cleanly
 * Compatible with static exports (e.g. GitHub Pages) and client-side SPA
 */
export function fetchItunesJsonp(searchTerm: string): Promise<string | null> {
  if (!searchTerm || !searchTerm.trim()) {
    return Promise.resolve(null);
  }

  const cacheKey = searchTerm.toLowerCase().trim();
  if (artworkMemoryCache.has(cacheKey)) {
    return Promise.resolve(artworkMemoryCache.get(cacheKey) || null);
  }

  return new Promise((resolve) => {
    // Check if we are running in browser environment
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const callbackName = `itunes_cb_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const script = document.createElement('script');

    const timeoutId = setTimeout(() => {
      cleanup();
      artworkMemoryCache.set(cacheKey, null);
      resolve(null);
    }, 6000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };

    (window as unknown as Record<string, unknown>)[callbackName] = (data: { results?: Array<{ artworkUrl100?: string }> }) => {
      cleanup();
      if (data && data.results && data.results.length > 0) {
        const rawUrl = data.results[0].artworkUrl100;
        if (rawUrl) {
          const highQualityUrl = rawUrl.replace(ITUNES_IMAGE_SIZES.DEFAULT, ITUNES_IMAGE_SIZES.HIGH_QUALITY);
          artworkMemoryCache.set(cacheKey, highQualityUrl);
          resolve(highQualityUrl);
          return;
        }
      }
      artworkMemoryCache.set(cacheKey, null);
      resolve(null);
    };

    script.onerror = () => {
      cleanup();
      artworkMemoryCache.set(cacheKey, null);
      resolve(null);
    };

    const searchParams = new URLSearchParams({
      term: searchTerm.trim(),
      media: 'music',
      entity: 'song',
      limit: '1',
      callback: callbackName,
    });

    script.src = `https://itunes.apple.com/search?${searchParams.toString()}`;
    script.async = true;
    document.body.appendChild(script);
  });
}
