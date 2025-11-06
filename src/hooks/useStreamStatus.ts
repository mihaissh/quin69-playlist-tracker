/**
 * Custom hook for checking Twitch stream status
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseStreamStatusReturn {
  isStreamLive: boolean;
  streamStatusChecked: boolean;
  checkStreamStatus: (signal?: AbortSignal) => Promise<boolean>;
}

/**
 * Hook to manage stream status checking
 * Performs initial check and provides function for subsequent checks
 */
export function useStreamStatus(): UseStreamStatusReturn {
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [streamStatusChecked, setStreamStatusChecked] = useState(false);

  const checkStreamStatus = useCallback(async (signal?: AbortSignal): Promise<boolean> => {
    try {
      // Use decapi.me to check if stream is live with caching
      const response = await fetch('https://decapi.me/twitch/uptime/quin69', {
        signal,
        cache: 'default', // Use browser cache when possible
      });
      const text = await response.text();
      
      // If the response contains "offline" or error message, stream is not live
      const isLive = !text.toLowerCase().includes('offline') && 
                     !text.toLowerCase().includes('error') &&
                     text.trim() !== '';
      
      setIsStreamLive(isLive);
      return isLive;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return false; // Return false if aborted since we couldn't verify
      }
      console.error('Error checking stream status:', err);
      setIsStreamLive(false);
      return false;
    }
  }, []);

  // Fast initial stream status check - runs before first render
  useEffect(() => {
    const initialCheck = async () => {
      try {
        const response = await fetch('https://decapi.me/twitch/uptime/quin69', {
          cache: 'no-cache',
        });
        const text = await response.text();
        const isLive = !text.toLowerCase().includes('offline') && 
                       !text.toLowerCase().includes('error') &&
                       text.trim() !== '';
        setIsStreamLive(isLive);
        setStreamStatusChecked(true);
      } catch (err) {
        console.error('Error checking initial stream status:', err);
        setIsStreamLive(false);
        setStreamStatusChecked(true); // Still mark as checked to proceed
      }
    };
    
    initialCheck();
  }, []);

  return {
    isStreamLive,
    streamStatusChecked,
    checkStreamStatus,
  };
}

