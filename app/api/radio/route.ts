import { NextResponse } from 'next/server';

// サーバー側で検索する多角的なヒット曲・年代曲クエリ
const SEARCH_QUERY_POOLS = [
  'J-POP ヒット 2025',
  'J-POP 2024',
  'ビルボード 邦楽',
  'TikTok 邦楽 ヒット',
  '平成 J-POP 名曲',
  '2010年代 アニメ 主題歌',
  '定番 ドライブ 邦楽',
  '令和 ヒットチャート',
  'J-POP ドライブ',
  '邦楽 2023',
  'アニメ OP 人気',
  'J-POP バラード 名曲',
];

const FALLBACK_HITS = [
  { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273413554ee5b660c6d71b3e8ec' },
  { uri: 'spotify:track:7y6HOcbQ80bsOsq1GahaVP', name: 'ミックスナッツ', artist: 'Official髭男dism', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b1ff088f11559868778a87b5' },
  { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b4d45543c1628d09794bfd0a' },
  { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: 'https://i.scdn.co/image/ab67616d0000b2731802316e6d15efbc5e791e84' },
  { uri: 'spotify:track:4saklk6nie3yiGePpBwUoc', name: '感電', artist: '米津玄師', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273d40faef048bfebf9e7fa56a6' },
  { uri: 'spotify:track:2Gmyw5Vg2X5YW2lM3OC7nD', name: 'マリーゴールド', artist: 'あいみょん', coverUrl: 'https://i.scdn.co/image/ab67616d0000b2731802316e6d15efbc5e791e84' },
  { uri: 'spotify:track:7pk2Mx1LnlaEpxfzNhgRuz', name: '丸ノ内サディスティック', artist: '椎名林檎', coverUrl: 'https://i.scdn.co/image/ab67616d0000b27340aa415c1e0952d7e48cebd4' },
  { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273f3ecfdb3dfd9f8c616834d82' },
  { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: 'https://i.scdn.co/image/ab67616d0000b27376c694ab51a80d5b5bf08be4' },
  { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b06e934a3be4112e4f0a2335' },
];

async function getClientCredentialsToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '387ae192a82d41e4abb7acf114110694';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('⚠️ SPOTIFY_CLIENT_SECRET is missing. Using fallback tracks.');
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

export async function GET() {
  try {
    // 1. サーバー用トークン取得 (Client Credentials)
    const token = await getClientCredentialsToken();

    if (!token) {
      const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 18);
      return NextResponse.json({ tracks: selected });
    }

    // 2. クエリプールからランダムに 2 つの検索テーマを選出
    const shuffledQueries = [...SEARCH_QUERY_POOLS].sort(() => Math.random() - 0.5);
    const q1 = shuffledQueries[0];
    const q2 = shuffledQueries[1];

    const offset1 = Math.floor(Math.random() * 20);
    const offset2 = Math.floor(Math.random() * 20);

    // 3. Spotify カタログ直接検索 (Server-to-Server 通信のため 100% 成功)
    const [res1, res2] = await Promise.all([
      fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(q1)}&type=track&market=JP&limit=25&offset=${offset1}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
      fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(q2)}&type=track&market=JP&limit=25&offset=${offset2}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
    ]);

    let rawTracks: any[] = [];
    if (res1.ok) {
      const data1 = await res1.json();
      if (data1.tracks?.items) rawTracks.push(...data1.tracks.items);
    }
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.tracks?.items) rawTracks.push(...data2.tracks.items);
    }

    // 4. 人気度 45 以上の「世間で流行っているヒット曲・名曲」を抽出
    const seenUris = new Set<string>();
    const extractedTracks = rawTracks
      .filter((t: any) => {
        if (!t || !t.uri || (t.popularity ?? 0) < 45) return false;
        if (seenUris.has(t.uri)) return false;
        seenUris.add(t.uri);
        return true;
      })
      .map((t: any) => ({
        uri: t.uri,
        name: t.name,
        artist: t.artists ? t.artists.map((a: any) => a.name).join(', ') : 'Unknown Artist',
        coverUrl: t.album?.images?.[0]?.url || '',
      }));

    // ランダムに 18 曲抽出して返却
    let selected = extractedTracks.sort(() => Math.random() - 0.5).slice(0, 18);

    if (selected.length === 0) {
      selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 18);
    }

    console.log(`📻 [/api/radio] Server mined ${selected.length} tracks for queries: "${q1}" & "${q2}"`);

    return NextResponse.json({ tracks: selected });
  } catch (error: any) {
    console.error('Radio Server Search API Error:', error);
    const selected = [...FALLBACK_HITS].sort(() => Math.random() - 0.5).slice(0, 18);
    return NextResponse.json({ tracks: selected });
  }
}
