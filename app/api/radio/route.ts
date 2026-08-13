import { NextResponse } from 'next/server';

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
    console.warn('⚠️ SPOTIFY_CLIENT_SECRET is missing. Using fallback chart tracks.');
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
    console.error('Client credentials error:', e);
    return null;
  }
}

export async function GET(_request: Request) {
  try {
    const token = await getClientCredentialsToken();

    if (!token) {
      const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 15);
      return NextResponse.json({ tracks: selected });
    }

    // 🌟 1. Spotify 日本公式の「Featured Playlists (注目の最新プレイリスト)」と「J-POP カテゴリ」を動的検索
    const [featuredRes, jpopRes] = await Promise.all([
      fetch('https://api.spotify.com/v1/browse/featured-playlists?country=JP&limit=10', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch('https://api.spotify.com/v1/browse/categories/0JQ5DAqbMKFEZ332ch2S4B/playlists?country=JP&limit=10', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
    ]);

    let playlistIds: string[] = [];

    if (featuredRes.ok) {
      const data = await featuredRes.json();
      const items = data.playlists?.items || [];
      items.forEach((p: any) => { if (p?.id) playlistIds.push(p.id); });
    }

    if (jpopRes.ok) {
      const data = await jpopRes.json();
      const items = data.playlists?.items || [];
      items.forEach((p: any) => { if (p?.id) playlistIds.push(p.id); });
    }

    if (playlistIds.length === 0) {
      const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 15);
      return NextResponse.json({ tracks: selected });
    }

    // 🌟 2. ランダムに選んだ最新ヒットプレイリストから曲一覧をマイニング
    const selectedPlaylistId = playlistIds[Math.floor(Math.random() * playlistIds.length)];
    const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks?limit=50&market=JP`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!tracksRes.ok) {
      const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 15);
      return NextResponse.json({ tracks: selected });
    }

    const tracksData = await tracksRes.json();
    const rawItems = tracksData.items || [];

    // 🌟 3. 有名度 (popularity > 30) の最新・流行曲だけを整形して抽出
    const extractedTracks = rawItems
      .map((item: any) => item.track)
      .filter((t: any) => t && t.uri && (t.popularity === undefined || t.popularity > 30))
      .map((t: any) => ({
        uri: t.uri,
        name: t.name,
        artist: t.artists ? t.artists.map((a: any) => a.name).join(', ') : 'Unknown Artist',
        coverUrl: t.album?.images?.[0]?.url || '',
      }));

    // ランダムに 15 曲選出して返す
    let selected = extractedTracks.sort(() => Math.random() - 0.5).slice(0, 15);

    if (selected.length === 0) {
      selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 15);
    }

    console.log(`📻 [/api/radio] Dynamically mined ${selected.length} fresh chart tracks from playlist: ${selectedPlaylistId}`);

    return NextResponse.json({ tracks: selected });
  } catch (error: any) {
    console.error('Radio Dynamic Chart API Error:', error);
    const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 15);
    return NextResponse.json({ tracks: selected });
  }
}
