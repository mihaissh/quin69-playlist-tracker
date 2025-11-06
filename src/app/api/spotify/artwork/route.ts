import { NextRequest, NextResponse } from 'next/server';

/**
 * Spotify API route handler for fetching album artwork
 * This route handles Spotify authentication and search server-side
 * to keep client credentials secure.
 */

// Force dynamic rendering since we use searchParams
// Note: API routes don't work with static export (output: 'export')
// This route will only work in development or if deployed to a platform that supports API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  album: {
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

// Cache for access token to avoid requesting new token on every request
let tokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getSpotifyAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  // Request access token
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.statusText}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  
  // Cache the token (expires in 1 hour, cache for 55 minutes to be safe)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000, // 5 minutes buffer
  };

  return data.access_token;
}

/**
 * Search for a track on Spotify and return album artwork URL
 */
async function searchSpotifyTrack(query: string): Promise<string | null> {
  try {
    const accessToken = await getSpotifyAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }

    const data: SpotifySearchResponse = await response.json();

    if (data.tracks?.items?.length > 0) {
      const track = data.tracks.items[0];
      // Get the medium-sized image (640x640) or fallback to largest
      const image = track.album.images.find(img => img.height === 640) 
        || track.album.images.find(img => img.height === 300)
        || track.album.images[0];
      
      return image?.url || null;
    }

    return null;
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const artworkUrl = await searchSpotifyTrack(query);
    
    if (artworkUrl) {
      return NextResponse.json({ artworkUrl });
    } else {
      return NextResponse.json({ artworkUrl: null });
    }
  } catch (error) {
    console.error('Error in Spotify API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artwork from Spotify' },
      { status: 500 }
    );
  }
}

