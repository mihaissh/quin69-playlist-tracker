import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, STREAM_STATUS_INDICATORS } from '@/constants';
import { logger } from '@/utils/logger';

interface UseStreamStatusReturn {
  isStreamLive: boolean;
  streamStatusChecked: boolean;
  streamTitle: string | null;
  checkStreamStatus: (signal?: AbortSignal, useCache?: boolean) => Promise<boolean>;
}

export function useStreamStatus(): UseStreamStatusReturn {
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [streamStatusChecked, setStreamStatusChecked] = useState(false);
  const [streamTitle, setStreamTitle] = useState<string | null>(null);

  const checkStreamStatus = useCallback(async (signal?: AbortSignal, useCache: boolean = true): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_ENDPOINTS.TWITCH_UPTIME, {
        signal: signal || controller.signal,
        cache: useCache ? 'default' : 'no-cache',
      });
      clearTimeout(timeoutId);

      const text = await response.text();

      const isLive = !text.toLowerCase().includes(STREAM_STATUS_INDICATORS.OFFLINE) &&
                     !text.toLowerCase().includes(STREAM_STATUS_INDICATORS.ERROR) &&
                     text.trim() !== '';

      setIsStreamLive(isLive);

      if (isLive) {
        try {
          const titleController = new AbortController();
          const titleTimeoutId = setTimeout(() => titleController.abort(), 5000);
          const titleResponse = await fetch(API_ENDPOINTS.TWITCH_TITLE, {
            signal: signal || titleController.signal,
            cache: useCache ? 'default' : 'no-cache',
          });
          clearTimeout(titleTimeoutId);
          const title = await titleResponse.text();
          if (title && title.trim() !== '') {
            setStreamTitle(title.trim());
          }
        } catch {
          // Silently fail for non-critical stream title
        }
      } else {
        setStreamTitle(null);
      }

      return isLive;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return false;
      }
      logger.error('Error checking stream status:', err);
      setIsStreamLive(false);
      setStreamTitle(null);
      return false;
    }
  }, []);

  useEffect(() => {
    checkStreamStatus(undefined, false).then(() => {
      setStreamStatusChecked(true);
    });
  }, [checkStreamStatus]);

  return {
    isStreamLive,
    streamStatusChecked,
    streamTitle,
    checkStreamStatus,
  };
}
