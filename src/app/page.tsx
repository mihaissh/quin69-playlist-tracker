'use client';

import { useEffect, useState, useCallback } from 'react';
import { SpotifyIcon, YouTubeIcon, ExternalLinkIcon } from '@/components/icons';

interface PlaylistData {
  currentSongTitle: string | null;
  historyTitles: string[];
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [fetchingArt, setFetchingArt] = useState(false);

  const fetchAlbumArt = useCallback(async (songTitle: string) => {
    if (!songTitle || fetchingArt) return;
    
    setFetchingArt(true);
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
    } finally {
      setFetchingArt(false);
    }
  }, [fetchingArt]);

  const updatePlaylist = useCallback(async () => {
    try {
      setError(false);
      // Fetch WITH reverse to get newest messages first
      const response = await fetch('https://logs.ivr.fi/channel/quin69/user/sheepfarmer/?reverse');
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedData = parsePlaylist(lines);
      
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
  }, [playlist.currentSongTitle, fetchAlbumArt]);

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

  function parsePlaylist(lines: string[]): PlaylistData {
    let currentSongTitle: string | null = null;
    let historyTitles: string[] = [];

    // Get all songs with 🔊 (speaker emoji)
    // With ?reverse, newest messages are first
    const allSongs = lines
      .filter(line => line.includes('🔊') && !line.includes('VIBE'))
      .map(line => line.substring(line.indexOf('🔊') + 2).trim());

    if (allSongs.length === 0) {
      return { currentSongTitle: null, historyTitles: [] };
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

    return { currentSongTitle, historyTitles };
  }

  const hasHistory = playlist.historyTitles.length > 0;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
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
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
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
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {error ? 'Offline' : 'Live'}
            </div>
          </div>
        </header>

        {/* Vertical 2-Card Layout */}
        <div className="space-y-6">
          {/* Card 1: Now Playing */}
          <div className="bg-zinc-800/50 rounded-xl border border-emerald-500/30 overflow-hidden">
            <div className="px-5 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                Now Playing
              </h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-zinc-500 text-xs uppercase tracking-wider">Loading</span>
                </div>
              ) : playlist.currentSongTitle ? (
                <div>
                  {/* Album Art, Play Button, and Song Name Layout */}
                  <div className="flex items-center gap-4 mb-6">
                    {/* Album Artwork */}
                    {albumArt && !showEasterEgg ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden shadow-lg ring-2 ring-emerald-500/20 flex-shrink-0">
                        <img
                          src={albumArt}
                          alt="Album Art"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : !showEasterEgg && (
                      <div className="w-24 h-24 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-10 h-10 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </div>
                    )}
                    
                    {/* Easter Egg */}
                    {showEasterEgg && (
                      <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
                        <img
                          src={`${process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : ''}/ABOBA.gif`}
                          alt="Easter Egg"
                          className="w-24 h-24 object-contain animate-fade-in-out"
                        />
                      </div>
                    )}
                    
                    {/* Right side: Play button and Song name */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                      {/* Play Button */}
                      {!showEasterEgg && (
                        <div className="flex items-center">
                          <button
                            onClick={handlePlayButtonClick}
                            className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center relative animate-pulse-ring cursor-pointer hover:scale-105 transition-transform"
                          >
                            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                            <svg className="w-6 h-6 text-emerald-500 relative z-10 animate-pulse-slow" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {/* Song Name */}
                      <p className="text-lg font-medium text-white leading-snug text-left">
                        {playlist.currentSongTitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Search Links */}
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={`https://open.spotify.com/search/${encodeURIComponent(playlist.currentSongTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      <SpotifyIcon />
                      Spotify
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(playlist.currentSongTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all text-sm text-red-400 hover:text-red-300"
                    >
                      <YouTubeIcon />
                      YouTube
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <p className="text-zinc-600 text-sm">No song playing</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Recently Played */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-700/50 bg-zinc-800/30">
              <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recently Played
              </h3>
            </div>
            <div className="divide-y divide-zinc-700/20 max-h-[350px] overflow-y-auto minimal-scrollbar">
              {hasHistory ? (
                playlist.historyTitles.map((song, index) => {
                  const isSkipped = song.toLowerCase().includes('skipped');
                  
                  return (
                    <div key={index}>
                      {isSkipped ? (
                        // Skipped songs - no dropdown
                        <div className="w-full text-left px-5 py-3.5">
                          <span className="text-sm text-zinc-500 italic flex-1 truncate">
                            {song}
                          </span>
                        </div>
                      ) : (
                        // Normal songs with dropdown
                        <>
                          <button
                            onClick={() => setSelectedSong(selectedSong === song ? null : song)}
                            className="group w-full text-left px-5 py-3.5 hover:bg-zinc-700/20 transition-colors flex items-center justify-between"
                          >
                            <span className="text-sm text-zinc-300 group-hover:text-emerald-400 transition-colors flex-1 truncate">
                              {song}
                            </span>
                            <svg
                              className={`w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all flex-shrink-0 ml-2 ${selectedSong === song ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Inline Dropdown */}
                          {selectedSong === song && (
                            <div className="px-5 py-4 bg-zinc-900/50 border-t border-zinc-700/30">
                              <div className="space-y-2.5">
                                <a
                                  href={`https://open.spotify.com/search/${encodeURIComponent(song)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all group"
                                >
                                  <SpotifyIcon className="w-5 h-5 text-emerald-400" />
                                  <span className="flex-1 text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                                    Open in Spotify
                                  </span>
                                  <ExternalLinkIcon className="w-4 h-4 text-emerald-400" />
                                </a>

                                <a
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all group"
                                >
                                  <YouTubeIcon className="w-5 h-5 text-red-400" />
                                  <span className="flex-1 text-sm font-medium text-red-400 group-hover:text-red-300">
                                    Open in YouTube
                                  </span>
                                  <ExternalLinkIcon className="w-4 h-4 text-red-400" />
                                </a>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm text-zinc-600">No recently played songs</p>
                </div>
              )}
            </div>
          </div>
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
