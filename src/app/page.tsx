'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { NowPlaying } from '@/components/NowPlaying';
import { RecentlyPlayed } from '@/components/RecentlyPlayed';

interface PlaylistData {
  currentSongTitle: string | null;
  historyTitles: string[];
  isOffline: boolean;
}

// Constants
const UPDATE_INTERVAL_MS = 30000; // 30 seconds
const EASTER_EGG_CLICKS = 5;
const EASTER_EGG_DURATION_MS = 3000;
const MAX_HISTORY_SONGS = 15;

export default function Home() {
  const [playlist, setPlaylist] = useState<PlaylistData>({
    currentSongTitle: null,
    historyTitles: [],
    isOffline: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [isStreamLive, setIsStreamLive] = useState(false);

  const checkStreamStatus = useCallback(async () => {
    try {
      // Use decapi.me to check if stream is live
      const response = await fetch('https://decapi.me/twitch/uptime/quin69');
      const text = await response.text();
      
      // If the response contains "offline" or error message, stream is not live
      const isLive = !text.toLowerCase().includes('offline') && 
                     !text.toLowerCase().includes('error') &&
                     text.trim() !== '';
      
      setIsStreamLive(isLive);
      return isLive;
    } catch (err) {
      console.error('Error checking stream status:', err);
      setIsStreamLive(false);
      return false;
    }
  }, []);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle) return;
    
    try {
      // Use iTunes Search API to find album artwork
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(songTitle)}&entity=song&limit=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Get the highest quality artwork (replace 100x100 with 600x600)
        const artworkUrl = data.results[0].artworkUrl100?.replace('100x100', '600x600');
        setAlbumArt(artworkUrl || null);
      } else {
        setAlbumArt(null);
      }
    } catch (err) {
      console.error('Error fetching album art:', err);
      setAlbumArt(null);
    }
  }, []);

  const updatePlaylist = useCallback(async () => {
    try {
      setError(false);
      
      // Check if stream is live on Twitch
      const streamIsLive = await checkStreamStatus();
      
      // Fetch WITH reverse to get newest messages first
      const response = await fetch('https://logs.ivr.fi/channel/quin69/user/sheepfarmer/?reverse');
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedData = parsePlaylist(lines, streamIsLive);
      
      // Fetch album art if song changed
      if (parsedData.currentSongTitle && parsedData.currentSongTitle !== playlist.currentSongTitle) {
        fetchAlbumArt(parsedData.currentSongTitle);
      }
      
      setPlaylist(parsedData);
    } catch (err) {
      console.error('Error fetching playlist:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [playlist.currentSongTitle, fetchAlbumArt, checkStreamStatus]);

  useEffect(() => {
    updatePlaylist();
    const interval = setInterval(updatePlaylist, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updatePlaylist]);

  const handlePlayButtonClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === EASTER_EGG_CLICKS) {
      setShowEasterEgg(true);
      setClickCount(0);
      
      setTimeout(() => {
        setShowEasterEgg(false);
      }, EASTER_EGG_DURATION_MS);
    }
  };

  function parsePlaylist(lines: string[], streamIsLive: boolean): PlaylistData {
    let currentSongTitle: string | null = null;
    let historyTitles: string[] = [];
    
    // Use actual Twitch stream status
    const isOffline = !streamIsLive;

    // Get all songs with 🔊 (speaker emoji)
    // With ?reverse, newest messages are first
    const allSongs = lines
      .filter(line => 
        line.includes('🔊') && 
        !line.includes('VIBE') && 
        !line.toLowerCase().includes('offline') &&
        !line.includes('Clearing the spotify')
      )
      .map(line => line.substring(line.indexOf('🔊') + 2).trim());

    if (allSongs.length === 0) {
      // No valid songs found
      return { currentSongTitle: null, historyTitles: [], isOffline };
    }

    // The FIRST song (most recent message) is the current song
    currentSongTitle = allSongs[0];

    // All songs after the first (older messages) are history
    // Remove duplicates but keep order
    const seen = new Set<string>();
    seen.add(currentSongTitle); // Don't include current in history
    
    for (let i = 1; i < allSongs.length; i++) {
      const song = allSongs[i];
      if (!seen.has(song)) {
        historyTitles.push(song);
        seen.add(song);
      }
    }

    // Limit history to most recent unique songs
    historyTitles = historyTitles.slice(0, MAX_HISTORY_SONGS);

    return { currentSongTitle, historyTitles, isOffline };
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto px-6 py-8">
        <Header isOffline={playlist.isOffline} hasError={error} />

        {/* Vertical 2-Card Layout */}
        <div className="space-y-6">
          {/* Card 1: Now Playing */}
          <NowPlaying
            isLoading={loading}
            isOffline={playlist.isOffline}
            currentSong={playlist.currentSongTitle}
            albumArt={albumArt}
            showEasterEgg={showEasterEgg}
            onPlayButtonClick={handlePlayButtonClick}
          />

          {/* Card 2: Recently Played */}
          <RecentlyPlayed historyTitles={playlist.historyTitles} />
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className="text-xs text-zinc-600">
            Updates every 30s
          </p>
        </footer>
      </div>
    </div>
  );
}
