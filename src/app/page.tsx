'use client';

import { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { Header } from '@/components/Header';
import { NowPlaying } from '@/components/NowPlaying';
import { Reveal } from '@/components/Reveal';
import type { PlaylistData, SongWithTimestamp } from '@/types/playlist';
import {
  UPDATE_INTERVAL_MS,
  EASTER_EGG_CLICKS,
  EASTER_EGG_DURATION_MS,
  MAX_HISTORY_SONGS,
  EASTER_EGG_COOLDOWN_MS,
  EASTER_EGG_MESSAGES
} from '@/constants';

// Lazy load RecentlyPlayed component for better initial load performance
const RecentlyPlayed = lazy(() => import('@/components/RecentlyPlayed').then(mod => ({ default: mod.RecentlyPlayed })));

export default function Home() {
  const [playlist, setPlaylist] = useState<PlaylistData>({
    currentSongTitle: null,
    historyTitles: [],
    historySongs: [],
    isOffline: false,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [streamStatusChecked, setStreamStatusChecked] = useState(false);
  const [error, setError] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [clickMessage, setClickMessage] = useState<string | null>(null);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownMessageShown, setCooldownMessageShown] = useState(false);
  
  // Refs to store timeout IDs and abort controllers for proper cleanup
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  const albumArtAbortControllerRef = useRef<AbortController | null>(null);

  const checkStreamStatus = useCallback(async (signal?: AbortSignal) => {
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

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) return;
    
    // Cancel previous album art fetch if still in progress
    if (albumArtAbortControllerRef.current) {
      albumArtAbortControllerRef.current.abort();
    }
    
    albumArtAbortControllerRef.current = new AbortController();
    
    try {
      // Use iTunes Search API to find album artwork with optimized image size
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(songTitle)}&entity=song&limit=1`,
        {
          signal: albumArtAbortControllerRef.current.signal,
          cache: 'force-cache', // Aggressively cache album art
        }
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Use 300x300 for better performance on 3G (was 600x600)
        const artworkUrl = data.results[0].artworkUrl100?.replace('100x100', '300x300');
        setAlbumArt(artworkUrl || null);
      } else {
        setAlbumArt(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      console.error('Error fetching album art:', err);
      setAlbumArt(null);
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

  const updatePlaylist = useCallback(async () => {
    // Cancel previous fetch if still in progress
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }
    
    fetchAbortControllerRef.current = new AbortController();
    const signal = fetchAbortControllerRef.current.signal;
    
    try {
      setError(false);
      
      // Check if stream is live on Twitch
      const streamIsLive = await checkStreamStatus(signal);
      
      // Fetch WITH reverse to get newest messages first with optimized caching
      const response = await fetch('https://logs.ivr.fi/channel/quin69/user/sheepfarmer/?reverse', {
        signal,
        cache: 'no-cache', // Always get fresh data for playlist
      });
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedData = parsePlaylist(lines, streamIsLive);
      
      // Fetch album art if song changed (defer to not block UI)
      if (parsedData.currentSongTitle && parsedData.currentSongTitle !== playlist.currentSongTitle) {
        // Defer album art fetch to next tick to prioritize playlist update
        setTimeout(() => fetchAlbumArt(parsedData.currentSongTitle!), 0);
      }
      
      setPlaylist(parsedData);
      
      // Mark initial load as complete after first successful fetch
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      console.error('Error fetching playlist:', err);
      setError(true);
      
      // Still mark as complete even on error to prevent infinite loading
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
      setLoading(false);
    }
  }, [playlist.currentSongTitle, fetchAlbumArt, checkStreamStatus, initialLoadComplete]);

  useEffect(() => {
    updatePlaylist();
    const interval = setInterval(updatePlaylist, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updatePlaylist]);

  // Cleanup timeouts and abort controllers on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (cooldownMessageTimeoutRef.current) {
        clearTimeout(cooldownMessageTimeoutRef.current);
      }
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      if (albumArtAbortControllerRef.current) {
        albumArtAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Check cooldown timer
  useEffect(() => {
    if (cooldownEndTime) {
      const checkCooldown = () => {
        const now = Date.now();
        if (now >= cooldownEndTime) {
          setIsOnCooldown(false);
          setCooldownEndTime(null);
          setCooldownMessageShown(false); // Reset message flag when cooldown ends
        }
      };

      const interval = setInterval(checkCooldown, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownEndTime]);

  const handlePlayButtonClick = () => {
    // Ignore clicks while easter egg is showing
    if (showEasterEgg) {
      return;
    }

    // Check if on cooldown
    if (isOnCooldown) {
      // Show cooldown message only once, then nothing for the rest of the cooldown
      if (!cooldownMessageShown) {
        // Clear any existing cooldown message timeout
        if (cooldownMessageTimeoutRef.current) {
          clearTimeout(cooldownMessageTimeoutRef.current);
        }
        
        setClickMessage(EASTER_EGG_MESSAGES.COOLDOWN);
        setCooldownMessageShown(true);
        
        cooldownMessageTimeoutRef.current = setTimeout(() => {
          setClickMessage(null);
          cooldownMessageTimeoutRef.current = null;
        }, 2000);
      }
      // Do nothing if message was already shown
      return;
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    const remainingClicks = EASTER_EGG_CLICKS - newCount;

    if (remainingClicks > 0) {
      // Clear any existing message timeout before setting a new one
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      
      // Show countdown message
      setClickMessage(EASTER_EGG_MESSAGES.CLICK_MORE(remainingClicks));
      
      // Set new timeout and store reference
      messageTimeoutRef.current = setTimeout(() => {
        setClickMessage(null);
        messageTimeoutRef.current = null;
      }, 1500);
    } else if (newCount === EASTER_EGG_CLICKS) {
      // Clear any existing message timeout
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
      
      // Trigger easter egg
      setShowEasterEgg(true);
      setClickCount(0);
      setClickMessage(null);
      
      setTimeout(() => {
        setShowEasterEgg(false);
        
        // Start cooldown
        setCooldownEndTime(Date.now() + EASTER_EGG_COOLDOWN_MS);
        setIsOnCooldown(true);
      }, EASTER_EGG_DURATION_MS);
    }
  };

  function parsePlaylist(lines: string[], streamIsLive: boolean): PlaylistData {
    let currentSongTitle: string | null = null;
    let historyTitles: string[] = [];
    let historySongs: SongWithTimestamp[] = [];
    
    // Use actual Twitch stream status
    const isOffline = !streamIsLive;

    // Get all songs with 🔊 (speaker emoji) and extract timestamps
    // With ?reverse, newest messages are first
    // Format: [2025-11-02 16:09:47] #quin69 sheepfarmer: 🔊 Song Title
    const allSongsWithTimestamps = lines
      .filter(line => 
        line.includes('🔊') && 
        !line.includes('VIBE') && 
        !line.toLowerCase().includes('offline') &&
        !line.includes('Clearing the spotify')
      )
      .map(line => {
        // Extract timestamp from [YYYY-MM-DD HH:MM:SS] format
        const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
        const timestamp = timestampMatch ? timestampMatch[1] : '';
        
        // Extract song title after 🔊
        const songTitle = line.substring(line.indexOf('🔊') + 2).trim();
        
        return { title: songTitle, timestamp };
      });

    if (allSongsWithTimestamps.length === 0) {
      // No valid songs found
      return { currentSongTitle: null, historyTitles: [], historySongs: [], isOffline };
    }

    // The FIRST song (most recent message) is the current song
    currentSongTitle = allSongsWithTimestamps[0].title;

    // All songs after the first (older messages) are history
    // Remove duplicates but keep order
    const seen = new Set<string>();
    seen.add(currentSongTitle); // Don't include current in history
    
    for (let i = 1; i < allSongsWithTimestamps.length; i++) {
      const song = allSongsWithTimestamps[i];
      if (!seen.has(song.title)) {
        historyTitles.push(song.title);
        historySongs.push(song);
        seen.add(song.title);
      }
    }

    // Limit history to most recent unique songs
    historyTitles = historyTitles.slice(0, MAX_HISTORY_SONGS);
    historySongs = historySongs.slice(0, MAX_HISTORY_SONGS);

    return { currentSongTitle, historyTitles, historySongs, isOffline };
  }

  // Don't render main content until stream status is checked
  if (!streamStatusChecked) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-zinc-500">Checking stream status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex-grow flex flex-col">
        <Header isOffline={!isStreamLive} hasError={error} />

        {/* Vertical Card Layout */}
        <div className="space-y-6 flex-grow">
          {/* Card 1: Now Playing */}
          <NowPlaying
            isLoading={loading && !initialLoadComplete}
            isOffline={playlist.isOffline}
            currentSong={playlist.currentSongTitle}
            albumArt={albumArt}
            showEasterEgg={showEasterEgg}
            onPlayButtonClick={handlePlayButtonClick}
            clickMessage={clickMessage}
          />

          {/* Card 2: Recently Played - Lazy loaded */}
          <Suspense fallback={
            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-700/50 bg-zinc-800/30">
                <h3 className="text-sm font-medium text-zinc-400">Recently Played</h3>
              </div>
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-600">Loading...</p>
              </div>
            </div>
          }>
            <Reveal delay={0.15}>
              <RecentlyPlayed historySongs={playlist.historySongs} />
            </Reveal>
          </Suspense>
        </div>

        {/* Footer */}
        <footer className="mt-6 pt-6 text-center space-y-2 animate-fade-in delay-300">
          <p className="text-xs text-zinc-600">
            Updates every 30s
          </p>
          <p className="text-xs text-zinc-500">
            Made with{' '}
            <span className="text-red-400">♥</span>{' '}
            for{' '}
            <a 
              href="https://twitch.tv/quin69" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Quin69&apos;s
            </a>{' '}
            community • by{' '}
            <a 
              href="https://github.com/mihaissh/quin69-playlist-tracker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              mihaissh
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
