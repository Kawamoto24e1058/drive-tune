import { SpotifyTrack, SpotifyUser, SpotifyRecommendationsResponse, SpotifyArtist, SpotifyPlaylist } from '@/types/spotify';
import { AudioTargetParams } from '@/types/drive';

// Standard Spotify Scopes for DriveTuner (Hardcoded %20 String including Player API Scopes)
export const SPOTIFY_SCOPES = 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state user-top-read user-read-recently-played playlist-modify-public playlist-modify-private';

// Major Japanese & City Pop track IDs verified on Spotify JP Market
export const DEFAULT_FALLBACK_SEED_TRACKS = [
  '0VjA8NvtODZjh2vA249kRm', // Official HIGE DANdism - Subtitle
  '4cOdK2wGLETKBW3PvgPWqT', // Vaundy - Kaiju no Hanauta
  '7oK9RyfiKMv1y0q0WzW72g', // YOASOBI - Idol
];

const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Explicit PKCE User Token Storage Keys
const USER_TOKEN_KEY = 'spotify_user_token';
const REFRESH_TOKEN_KEY = 'spotify_user_refresh_token';
const EXPIRES_AT_KEY = 'spotify_user_expires_at';
const VERIFIER_KEY = 'drivetuner_code_verifier';
const CLIENT_ID_USED_KEY = 'spotify_client_id_used';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// PKCE Helper Functions using Web Crypto API
export function generateCodeVerifier(length: number = 64): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < length; i++) {
      values[i] = Math.floor(Math.random() * possible.length);
    }
  }
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function saveCodeVerifier(verifier: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(VERIFIER_KEY, verifier);
  }
}

export function getCodeVerifier(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(VERIFIER_KEY);
  }
  return null;
}

export function saveTokens(accessToken: string, refreshToken: string, expiresIn: number, clientId?: string) {
  if (typeof window !== 'undefined') {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(USER_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
    if (clientId) {
      localStorage.setItem(CLIENT_ID_USED_KEY, clientId);
    }
    console.log('💾 [PKCE User Token] User Access Token saved successfully to localStorage key "spotify_user_token".');
    console.log('🔑 Sending User Token:', accessToken ? `${accessToken.substring(0, 15)}...` : 'NULL');
    console.log('⏱️ Token expires in:', expiresIn, 'seconds');
  }
}

export function getStoredTokens(): StoredTokens | null {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem(USER_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || '';
  const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);
  
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || !expiresAtStr) {
    return null;
  }
  
  return {
    accessToken,
    refreshToken,
    expiresAt: parseInt(expiresAtStr, 10),
  };
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(VERIFIER_KEY);
    console.log('🧹 [PKCE User Token] spotify_user_token purged from localStorage.');
  }
}

export function getEffectiveRedirectUri(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';
  }
  
  const envUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  if (envUri) {
    try {
      const parsed = new URL(envUri);
      const windowOrigin = window.location.origin;
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${windowOrigin}${parsed.pathname}`;
      }
      return envUri;
    } catch {
      return envUri;
    }
  }

  return `${window.location.origin}/callback`;
}

export async function redirectToSpotifyLogin(clientId: string, customRedirectUri?: string) {
  // Purge any old tokens to guarantee clean PKCE User Token authorization
  clearTokens();

  const verifier = generateCodeVerifier();
  saveCodeVerifier(verifier);
  const challenge = await generateCodeChallenge(verifier);
  const redirectUri = customRedirectUri || getEffectiveRedirectUri();

  console.log('🚀 [OAuth PKCE] Initiating Spotify User Authorization flow with Player API scopes...');
  console.log('🔑 Client ID:', clientId);
  console.log('🔗 Redirect URI:', redirectUri);

  // Explicitly hardcoded scope parameter with %20 encoding including Player API scopes
  const authUrl =
    `${SPOTIFY_AUTH_ENDPOINT}?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=user-read-private%20user-read-email%20user-top-read%20playlist-modify-public%20playlist-modify-private%20user-modify-playback-state%20user-read-playback-state` +
    `&code_challenge_method=S256` +
    `&code_challenge=${encodeURIComponent(challenge)}` +
    `&show_dialog=true`;

  console.log('📡 [OAuth PKCE] Redirecting to Authorize URL:', authUrl);
  window.location.href = authUrl;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const verifier = getCodeVerifier();
  if (!verifier) {
    throw new Error('Code verifier not found in localStorage. Please click Connect Spotify to login again.');
  }

  console.log('📡 [OAuth PKCE] Exchanging code for user_access_token (grant_type=authorization_code)...');

  const payload = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'テキストの取得にも失敗しました');
    console.error('❌ [OAuth PKCE] Token exchange failed Body:', errText);
    throw new Error(`Token exchange failed: ${errText}`);
  }

  const data = await response.json();
  console.log('✅ [OAuth PKCE] PKCE User Access Token received!');
  saveTokens(data.access_token, data.refresh_token, data.expires_in, clientId);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<string> {
  console.log('🔄 [OAuth PKCE] Refreshing user access token (grant_type=refresh_token)...');
  const payload = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'テキストの取得にも失敗しました');
    console.warn('⚠️ [OAuth PKCE] User token refresh failed Body:', errText);
    clearTokens();
    throw new Error(`Failed to refresh Spotify access token: ${errText}`);
  }

  const data = await response.json();
  saveTokens(data.access_token, data.refresh_token || refreshToken, data.expires_in, clientId);
  return data.access_token;
}

export async function getValidAccessToken(clientId?: string): Promise<string | null> {
  if (typeof window !== 'undefined' && clientId) {
    const lastClientId = localStorage.getItem(CLIENT_ID_USED_KEY);
    if (lastClientId && lastClientId !== clientId) {
      console.warn('⚠️ [Client ID Change Detected] Client ID changed from', lastClientId, 'to', clientId, '- Purging cached tokens.');
      clearTokens();
      localStorage.setItem(CLIENT_ID_USED_KEY, clientId);
      return null;
    }
  }

  const tokens = getStoredTokens();
  if (!tokens || !tokens.accessToken) {
    console.warn('⚠️ [Spotify Token] No stored user token (spotify_user_token) found.');
    return null;
  }

  if (Date.now() >= tokens.expiresAt - 60000) {
    if (tokens.refreshToken && clientId) {
      try {
        console.log('🔄 [Spotify Token] User token expiring soon. Executing refresh...');
        return await refreshAccessToken(tokens.refreshToken, clientId);
      } catch (err) {
        console.error('❌ [Spotify Token] Refresh failed:', err);
        return tokens.accessToken;
      }
    }
  }

  console.log('Sending User Token:', `${tokens.accessToken.substring(0, 15)}...`);
  return tokens.accessToken;
}

// Spotify API Endpoints & Pseudo-Crossfade Volume Controls

export async function setSpotifyVolume(accessToken: string, volumePercent: number): Promise<boolean> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') return false;
  const vol = Math.max(0, Math.min(100, Math.round(volumePercent)));
  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/volume?volume_percent=${vol}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fadeVolume(
  accessToken: string | null,
  startVol: number,
  targetVol: number,
  durationMs: number = 300
): Promise<void> {
  const steps = 5;
  const stepTime = Math.floor(durationMs / steps);
  const delta = (targetVol - startVol) / steps;

  for (let i = 1; i <= steps; i++) {
    const currentVol = startVol + delta * i;
    if (accessToken) {
      setSpotifyVolume(accessToken, currentVol).catch(() => {});
    }
    await new Promise((resolve) => setTimeout(resolve, stepTime));
  }
}

export async function skipToNextTrack(accessToken: string): Promise<boolean> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') return false;
  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/next`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function startRadioPlayback(
  accessToken: string,
  trackUris: string[],
  deviceId?: string
): Promise<boolean> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') return false;

  console.log('Sending User Token:', `${accessToken.substring(0, 15)}...`);
  console.log('📻 [Spotify Player API] PUT https://api.spotify.com/v1/me/player/play');

  try {
    const url = deviceId
      ? `${SPOTIFY_API_BASE}/me/player/play?device_id=${deviceId}`
      : `${SPOTIFY_API_BASE}/me/player/play`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: trackUris.slice(0, 50),
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('⚠️ [Spotify Player API] Playback start non-200 (Device not active or Free account):', res.status, errText);
      return false;
    }

    console.log('✅ [Spotify Player API] Radio Playback Started Successfully on Spotify Device!');
    return true;
  } catch (err) {
    console.warn('⚠️ [Spotify Player API] startRadioPlayback skipped:', err);
    return false;
  }
}

export async function fetchUserProfile(accessToken: string): Promise<SpotifyUser> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
    throw new Error('アクセストークンが無効です。再ログインしてください。');
  }

  console.log('Sending User Token:', `${accessToken.substring(0, 15)}...`);
  console.log('📡 [Spotify API] GET https://api.spotify.com/v1/me');

  const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'テキストの取得にも失敗しました');
    console.error(`❌ [Spotify API Error ${res.status}] Body:`, errText);

    if (res.status === 403) {
      throw new Error(`Spotify 403 Forbidden: ${errText}`);
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') || '5';
      throw new Error(`Spotify 429 Rate Limit: API呼び出し制限中です (${errText})`);
    }
    if (res.status === 401) {
      clearTokens();
      throw new Error(`Spotify 401 Unauthorized: セッションが無効です (${errText})`);
    }
    throw new Error(`Spotify API エラー (ステータス ${res.status}): ${errText}`);
  }

  const profile: SpotifyUser = await res.json();
  console.log('✅ [Spotify API] Profile loaded successfully:', profile.display_name || profile.id, profile.email ? `(${profile.email})` : '');
  return profile;
}

export async function fetchTopTracks(
  accessToken: string,
  limit: number = 10
): Promise<SpotifyTrack[]> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') return [];

  console.log('Sending User Token:', `${accessToken.substring(0, 15)}...`);
  console.log('📡 [Spotify API] GET https://api.spotify.com/v1/me/top/tracks');

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/top/tracks?limit=${limit}&time_range=short_term`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'テキストの取得にも失敗しました');
      console.error(`❌ [Spotify API Error ${res.status}] Body:`, errText);
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('⚠️ fetchTopTracks skipped:', err);
    return [];
  }
}

export async function fetchTopArtists(
  accessToken: string,
  limit: number = 5
): Promise<SpotifyArtist[]> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') return [];

  console.log('Sending User Token:', `${accessToken.substring(0, 15)}...`);
  console.log('📡 [Spotify API] GET https://api.spotify.com/v1/me/top/artists');

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/top/artists?limit=${limit}&time_range=medium_term`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'テキストの取得にも失敗しました');
      console.error(`❌ [Spotify API Error ${res.status}] Body:`, errText);
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('⚠️ fetchTopArtists skipped:', err);
    return [];
  }
}

export interface RecommendationQueryOptions {
  seedTracks?: string[];
  seedArtists?: string[];
  targetParams?: AudioTargetParams;
  market?: string;
  limit?: number;
}

export async function fetchRecommendations(
  accessToken: string,
  options: RecommendationQueryOptions
): Promise<SpotifyRecommendationsResponse> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
    throw new Error('アクセストークンが無効です。');
  }

  const params = new URLSearchParams();
  
  if (options.limit) params.append('limit', options.limit.toString());
  else params.append('limit', '20');

  if (options.market) params.append('market', options.market);
  
  // STRICT RULE: MUST NOT use seed_genres. Only use seed_tracks or seed_artists (max 5 IDs).
  if (options.seedTracks && options.seedTracks.length > 0) {
    params.append('seed_tracks', options.seedTracks.slice(0, 5).join(','));
  } else if (options.seedArtists && options.seedArtists.length > 0) {
    params.append('seed_artists', options.seedArtists.slice(0, 5).join(','));
  } else {
    // Fallback to verified major Japanese track IDs
    params.append('seed_tracks', DEFAULT_FALLBACK_SEED_TRACKS.slice(0, 5).join(','));
  }

  if (options.targetParams) {
    Object.entries(options.targetParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
  }

  const reqUrl = `${SPOTIFY_API_BASE}/recommendations?${params.toString()}`;
  console.log('Sending User Token:', `${accessToken.substring(0, 15)}...`);
  console.log('📡 [Spotify API] GET', reqUrl);

  const res = await fetch(reqUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'テキストの取得にも失敗しました');
    console.error(`❌ [Spotify API Error ${res.status}] Body:`, errText);
    
    // Fallback on 404 or 400: Call /v1/search?q=year:2023-2026&type=track&market=JP
    if (res.status === 404 || res.status === 400) {
      console.log('🔄 [Recommendations 404 Fallback] Fetching via /v1/search?q=year:2023-2026&type=track&market=JP...');
      const fallbackTracks = await searchDriveTracks(accessToken, 'year:2023-2026 genre:j-pop');
      if (fallbackTracks.length > 0) {
        return { tracks: fallbackTracks, seeds: [] };
      }
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') || '5';
      throw new Error(`Spotify 429 Rate Limit: API呼び出し制限中です (${errText})`);
    }
    if (res.status === 403) {
      throw new Error(`Spotify 403 Forbidden: ${errText}`);
    }
    throw new Error(`Spotifyからの推薦曲取得に失敗しました: ${errText}`);
  }

  return res.json();
}

export async function searchDriveTracks(
  accessToken: string,
  query: string = 'year:2023-2026 genre:j-pop'
): Promise<SpotifyTrack[]> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') return [];

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '20',
    market: 'JP',
  });
  const reqUrl = `${SPOTIFY_API_BASE}/search?${params.toString()}`;
  console.log('Sending User Token:', `${accessToken.substring(0, 15)}...`);
  console.log('📡 [Spotify API] GET', reqUrl);

  try {
    const res = await fetch(reqUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'テキストの取得にも失敗しました');
      console.error(`❌ [Spotify API Error ${res.status}] Body:`, errText);
      return [];
    }
    const data = await res.json();
    return data.tracks?.items || [];
  } catch (err) {
    console.warn('⚠️ searchDriveTracks failed:', err);
    return [];
  }
}

export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string,
  trackUris: string[]
): Promise<SpotifyPlaylist> {
  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
    throw new Error('アクセストークンが無効です。');
  }

  console.log('Sending User Token:', `${accessToken.substring(0, 15)}...`);
  
  // Create playlist
  const createRes = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      public: true,
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => 'テキストの取得にも失敗しました');
    console.error('❌ [Create Playlist Error]:', errText);
    throw new Error(`Spotifyでのプレイリスト作成に失敗しました: ${errText}`);
  }

  const playlist: SpotifyPlaylist = await createRes.json();

  // Add tracks
  if (trackUris.length > 0) {
    const addRes = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    });

    if (!addRes.ok) {
      const errText = await addRes.text().catch(() => 'テキストの取得にも失敗しました');
      console.warn('Playlist created but failed to add tracks:', errText);
    }
  }

  return playlist;
}
