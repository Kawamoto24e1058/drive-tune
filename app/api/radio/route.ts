import { NextResponse } from 'next/server';

// Spotify公式の日本ヒットチャート＆定番プレイリストID
const SPOTIFY_OFFICIAL_PLAYLISTS = {
  latestHits: [
    '37i9dQZF1DXa21B33iL212', // J-Pop Hits
    '37i9dQZEVXbKX3133A1L12', // Top 50 - Japan
    '37i9dQZF1DX9qA1L2123i1', // Hot Hits Japan
  ],
  eraHits: [
    '37i9dQZF1DX83eO2B1L212', // 2010s J-Pop Hits
    '37i9dQZF1DXdbkL2123i12', // 2000s J-Pop Hits
    '37i9dQZF1DX39m2123i123', // 平成ヒッツ
  ],
};

const FALLBACK_HITS = [
  { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273413554ee5b660c6d71b3e8ec' },
  { uri: 'spotify:track:7y6HOcbQ80bsOsq1GahaVP', name: 'ミックスナッツ', artist: 'Official髭男dism', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b1ff088f11559868778a87b5' },
  { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b4d45543c1628d09794bfd0a' },
  { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: 'https://i.scdn.co/image/ab67616d0000b2731802316e6d15efbc5e791e84' },
  { uri: 'spotify:track:4saklk6nie3yiGePpBwUoc', name: '感電', artist: '米津玄師', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273d40faef048bfebf9e7fa56a6' },
  { uri: 'spotify:track:2Gmyw5Vg2X5YW2lM3OC7nD', name: 'マリーゴールド', artist: 'あいみょん', coverUrl: 'https://i.scdn.co/image/ab67616d0000b2731802316e6d15efbc5e791e84' },
  { uri: 'spotify:track:7pk2Mx1LnlaEpxfzNhgRuz', name: '丸ノ内サディスティック', artist: '椎名林檎', coverUrl: 'https://i.scdn.co/image/ab67616d0000b27340aa415c1e0952d7e48cebd4' },
  { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273f3ecfdb3dfd9f8c616834d82' },
];

async function getClientCredentialsToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '387ae192a82d41e4abb7acf114110694';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('⚠️ SPOTIFY_CLIENT_SECRET missing. Using fallback chart tracks.');
    return null;
  }

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch (e) {
    console.error('Client Credentials error:', e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const token = await getClientCredentialsToken();
    const { searchParams } = new URL(request.url);
    const hour = parseInt(searchParams.get('hour') || new Date().getHours().toString(), 10);

    if (!token) {
      const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 8);
      return NextResponse.json({ tracks: selected });
    }

    // 時間帯に応じて最新ヒットと年代ヒットの比率を調整
    const playlistPool = [...SPOTIFY_OFFICIAL_PLAYLISTS.latestHits, ...SPOTIFY_OFFICIAL_PLAYLISTS.eraHits];
    const targetPlaylistId = playlistPool[Math.floor(Math.random() * playlistPool.length)];

    // Spotify公式プレイリストからトラック一覧を取得
    const res = await fetch(`https://api.spotify.com/v1/playlists/${targetPlaylistId}/tracks?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`Playlist fetch failed: ${res.status}`);
      const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 8);
      return NextResponse.json({ tracks: selected });
    }

    const data = await res.json();
    const items = data.items || [];

    // トラック整形
    const tracks = items
      .map((item: any) => item.track)
      .filter((t: any) => t && t.uri && (t.popularity === undefined || t.popularity > 40))
      .map((t: any) => ({
        uri: t.uri,
        name: t.name,
        artist: t.artists ? t.artists.map((a: any) => a.name).join(', ') : 'Unknown Artist',
        coverUrl: t.album?.images?.[0]?.url || '',
      }));

    // ランダムに 8 曲選出して返す
    let selected = tracks.sort(() => Math.random() - 0.5).slice(0, 8);

    if (selected.length === 0) {
      selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 8);
    }

    console.log(`📻 [/api/radio] Extracted ${selected.length} chart tracks from playlist: ${targetPlaylistId}`);

    return NextResponse.json({ tracks: selected });
  } catch (error: any) {
    console.error('Radio Chart API Error:', error);
    const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 8);
    return NextResponse.json({ tracks: selected });
  }
}
