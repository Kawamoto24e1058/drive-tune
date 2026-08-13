import { NextResponse } from 'next/server';

// 時間帯・ジャンル・年代の動的検索キーワード定義
const TIME_SEARCH_MAP = {
  morning: ['J-POP 爽やか', '平成 ヒット', '2010年代 アニメ', 'ドライブ 邦楽', '80年代 シティポップ'],
  daytime: ['J-POP ヒット', 'ドライブ 鉄板', '2000年代 邦ロック', '令和 トレンド', '平成 アニソン'],
  evening: ['エモい J-POP', 'シティポップ 名曲', '平成 名曲', '90年代 邦楽', 'メロウ R&B'],
  midnight: ['夜ドライブ 邦楽', 'J-POP 泣ける', '深夜 アニメ サントラ', '2010年代 ロック', 'ローファイ 邦楽'],
};

// バックアップフォールバック曲リスト (Client Secret 未設定時やネットワーク障害用)
const FALLBACK_TRACKS: Record<string, Array<{ uri: string; name: string; artist: string; coverUrl: string }>> = {
  morning: [
    { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b4d45543c1628d09794bfd0a' },
    { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: 'https://i.scdn.co/image/ab67616d0000b2731802316e6d15efbc5e791e84' },
    { uri: 'spotify:track:364w0q0J0G13g7R7Y8x6Wb', name: '青と夏', artist: 'Mrs. GREEN APPLE', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273d40faef048bfebf9e7fa56a6' },
  ],
  daytime: [
    { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273413554ee5b660c6d71b3e8ec' },
    { uri: 'spotify:track:7y6HOcbQ80bsOsq1GahaVP', name: 'ミックスナッツ', artist: 'Official髭男dism', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b1ff088f11559868778a87b5' },
    { uri: 'spotify:track:3XNnq2oo1zmHDseKZKaYEF', name: '前前前世', artist: 'RADWIMPS', coverUrl: 'https://i.scdn.co/image/ab67616d0000b2734d40026e4745aaadabcf4e8a' },
  ],
  evening: [
    { uri: 'spotify:track:7pk2Mx1LnlaEpxfzNhgRuz', name: '丸ノ内サディスティック', artist: '椎名林檎', coverUrl: 'https://i.scdn.co/image/ab67616d0000b27340aa415c1e0952d7e48cebd4' },
    { uri: 'spotify:track:3khEEPRyBeOUabbmOPJzAG', name: 'Pretender', artist: 'Official髭男dism', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ca35d72e737754b2d69e46f6' },
    { uri: 'spotify:track:5oG8Ewk6dqsroYdmNFO7nu', name: 'きらり', artist: '藤井 風', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273e9365ce18a44b1c73c3ee64c' },
  ],
  midnight: [
    { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273f3ecfdb3dfd9f8c616834d82' },
    { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: 'https://i.scdn.co/image/ab67616d0000b27376c694ab51a80d5b5bf08be4' },
    { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b06e934a3be4112e4f0a2335' },
  ],
};

// Spotify アプリ権限トークン (Client Credentials) の取得
async function getClientCredentialsToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '387ae192a82d41e4abb7acf114110694';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('⚠️ SPOTIFY_CLIENT_SECRET 未設定のため、静的フォールバック選曲を使用します。');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`Token fetch returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.access_token || null;
  } catch (err) {
    console.error('Client credentials token error:', err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hour = parseInt(searchParams.get('hour') || new Date().getHours().toString(), 10);

    let timeKey: keyof typeof TIME_SEARCH_MAP = 'daytime';
    if (hour >= 5 && hour < 10) timeKey = 'morning';
    else if (hour >= 10 && hour < 17) timeKey = 'daytime';
    else if (hour >= 17 && hour < 22) timeKey = 'evening';
    else timeKey = 'midnight';

    // 1. サーバー間通信用トークン取得 (400/403 エラーが絶対に起きない)
    const token = await getClientCredentialsToken();

    if (!token) {
      // Client Credentials Token が取れない場合の安全なフォールバック
      const fallbackList = FALLBACK_TRACKS[timeKey] || FALLBACK_TRACKS.daytime;
      const selected = fallbackList.sort(() => Math.random() - 0.5).slice(0, 3);
      console.log(`📻 [/api/radio] Fallback Picked ${selected.length} track(s) for timeKey: "${timeKey}"`);
      return NextResponse.json({ tracks: selected, timeKey, query: 'Fallback' });
    }

    // 2. キーワード ✕ オフセットの動的ガチャ
    const keywords = TIME_SEARCH_MAP[timeKey];
    const query = keywords[Math.floor(Math.random() * keywords.length)];
    const offset = Math.floor(Math.random() * 30); // 0〜30位の範囲からランダム抽出

    // 3. Spotify カタログ直接検索
    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );

    if (!spotifyRes.ok) {
      const fallbackList = FALLBACK_TRACKS[timeKey] || FALLBACK_TRACKS.daytime;
      const selected = fallbackList.sort(() => Math.random() - 0.5).slice(0, 3);
      return NextResponse.json({ tracks: selected, timeKey, query });
    }

    const data = await spotifyRes.json();
    const rawTracks = data.tracks?.items || [];

    // 4. 整形して 1〜3 曲選出して返す
    const formattedTracks = rawTracks
      .filter((t: any) => t && t.uri && (t.popularity === undefined || t.popularity > 35)) // ある程度有名な曲
      .map((t: any) => ({
        uri: t.uri,
        name: t.name,
        artist: t.artists ? t.artists.map((a: any) => a.name).join(', ') : 'Unknown Artist',
        coverUrl: t.album?.images?.[0]?.url || '',
      }));

    let selected = formattedTracks.sort(() => Math.random() - 0.5).slice(0, 3);

    if (selected.length === 0) {
      const fallbackList = FALLBACK_TRACKS[timeKey] || FALLBACK_TRACKS.daytime;
      selected = fallbackList.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    console.log(`📻 [/api/radio] Realtime Picked ${selected.length} track(s) for query: "${query}"`);

    return NextResponse.json({ tracks: selected, timeKey, query });
  } catch (error: any) {
    console.error('Radio API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
