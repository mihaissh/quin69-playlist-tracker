import { NextRequest, NextResponse } from 'next/server';

/**
 * Spotify API route for fetching album artwork
 * Note: This won't work with static export. For production, deploy as a serverless function
 * or use the Last.fm fallback in the useAlbumArt hook.
 */

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifySearchResponse {
  tracks: {
    items: Array<{
      album: {
        images: Array<{
          url: string;
          height: number;
          width: number;
        }>;
      };
    }>;
  };
}

// Cache for access token
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Spotify credentials not configured');
    console.error('Missing:', {
      clientId: !clientId ? 'SPOTIFY_CLIENT_ID' : '✓',
      clientSecret: !clientSecret ? 'SPOTIFY_CLIENT_SECRET' : '✓',
    });
    return null;
  }

  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Failed to get Spotify token:', response.status, response.statusText);
      console.error('Response:', errorText);
      return null;
    }

    const data: SpotifyTokenResponse = await response.json();
    
    // Cache the token (expire 1 minute before actual expiry)
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return null;
  }
}

async function searchTrackArtwork(accessToken: string, queries: string[]): Promise<{ url: string | null; debug: Record<string, unknown> }> {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
  };
  const debug: Record<string, unknown> = {
    attempts: [] as Array<{ query: string; status: number; found: boolean }>,
  };

  for (const query of queries) {
    const searchUrl = `https://api.spotify.com/v1/search?${new URLSearchParams({
      q: query,
      type: 'track',
      limit: '1',
    })}`;

    const response = await fetch(searchUrl, { headers });
    const attempt = { query, status: response.status, found: false };

    if (!response.ok) {
      attempt.found = false;
      (debug.attempts as Array<{ query: string; status: number; found: boolean }>).push(attempt);
      continue;
    }

    const data: SpotifySearchResponse = await response.json();
    if (data.tracks?.items?.length > 0) {
      const track = data.tracks.items[0];
      if (track.album?.images?.length > 0) {
        attempt.found = true;
        (debug.attempts as Array<{ query: string; status: number; found: boolean }>).push(attempt);
        return { url: track.album.images[0].url, debug };
      }
    }

    (debug.attempts as Array<{ query: string; status: number; found: boolean }>).push(attempt);
  }

  return { url: null, debug };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist');
  const track = searchParams.get('track');

  if (!artist || !track) {
    return NextResponse.json(
      { error: 'Artist and track parameters are required' },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    
    if (!accessToken) {
      const hasClientId = !!process.env.SPOTIFY_CLIENT_ID;
      const hasClientSecret = !!process.env.SPOTIFY_CLIENT_SECRET;
      return NextResponse.json(
        { 
          error: 'Failed to authenticate with Spotify',
          debug: {
            hasClientId,
            hasClientSecret,
            message: !hasClientId || !hasClientSecret 
              ? 'Environment variables not loaded. Make sure .env.local exists and server was restarted.'
              : 'Authentication failed. Check your credentials.'
          }
        },
        { status: 500 }
      );
    }

    const queries = [
      `artist:${artist} track:${track}`,
      `${track} ${artist}`,
      track,
    ];

    const { url, debug } = await searchTrackArtwork(accessToken, queries);

    if (url) {
      return NextResponse.json({
        artworkUrl: url,
        debug,
      });
    }

    return NextResponse.json(
      { error: 'No artwork found', debug },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

