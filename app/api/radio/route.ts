import { NextResponse } from 'next/server';

// 曲名とアーティスト名を正規化して重複判定キーを作成 (例: "specialz|king gnu")
function normalizeKey(title: string, artist: string): string {
  const cleanTitle = (title || '')
    .toLowerCase()
    .replace(/\s*[\(\-\~].*$/g, '') // (movie ver.) や - Remix 等を除去
    .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g, ''); // 記号除去
  const cleanArtist = (artist || '').toLowerCase().replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g, '');
  return `${cleanTitle}|${cleanArtist}`;
}

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '387ae192a82d41e4abb7acf114110694';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('⚠️ SPOTIFY_CLIENT_SECRET is missing. Proceeding without client credentials.');
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
    console.error('Failed to fetch Spotify token:', e);
    return null;
  }
}

// A. AI による時間帯適応選曲 (40%)
async function fetchAiTimeSlotTracks(hour: number, excludeKeys: Set<string>, spotifyToken: string | null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !spotifyToken) return [];

  let timeContext = hour >= 5 && hour < 10 ? "朝のドライブ。爽やかで目覚めるJ-POP" :
                    hour >= 10 && hour < 17 ? "昼のハイウェイ。爽快な邦ロック＆ポップス" :
                    hour >= 17 && hour < 22 ? "夕暮れのドライブ。エモいメロディ＆シティポップ" : "深夜のドライブ。熱唱アンセム＆ミッドナイトチル";

  const prompt = `プロラジオDJとして、${hour}時(${timeContext})の日本のドライブに合う名曲を10曲選曲してください。
JSON配列形式のみで出力: [{"song": "曲名", "artist": "アーティスト名"}]`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.95 }
      })
    });

    if (!res.ok) return [];
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const items = JSON.parse(cleanedText);

    const tracks: any[] = [];
    for (const item of items) {
      if (!item || !item.song || !item.artist) continue;
      const key = normalizeKey(item.song, item.artist);
      if (excludeKeys.has(key)) continue;

      let q = `track:"${item.song}" artist:"${item.artist}"`;
      let searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=JP&limit=1`, {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });

      let t: any = null;
      if (searchRes.ok) {
        const sData = await searchRes.json();
        t = sData.tracks?.items?.[0];
      }

      if (!t) {
        q = `${item.song} ${item.artist}`;
        searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=JP&limit=1`, {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        if (searchRes.ok) {
          const sData = await searchRes.json();
          t = sData.tracks?.items?.[0];
        }
      }

      if (t && t.uri) {
        excludeKeys.add(key);
        tracks.push({
          uri: t.uri,
          name: t.name,
          artist: t.artists.map((a: any) => a.name).join(', '),
          coverUrl: t.album?.images?.[0]?.url || ''
        });
      }
    }
    return tracks;
  } catch (e) {
    console.error('fetchAiTimeSlotTracks error:', e);
    return [];
  }
}

// B. 年代・ジャンル ディスカバリー検索 (30%)
async function fetchDiscoveryTracks(excludeKeys: Set<string>, spotifyToken: string | null) {
  if (!spotifyToken) return [];

  const queries = ['J-POP 2010年代', '平成 アニメ 主題歌', 'ドライブ 邦楽 定番', '80年代 シティポップ', 'J-ROCK 名曲'];
  const query = queries[Math.floor(Math.random() * queries.length)];
  const offset = Math.floor(Math.random() * 40);

  try {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=JP&limit=15&offset=${offset}`, {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    });

    const tracks: any[] = [];
    if (res.ok) {
      const data = await res.json();
      for (const t of data.tracks?.items || []) {
        if (!t || !t.uri) continue;
        const key = normalizeKey(t.name, t.artists?.[0]?.name || '');
        if (!excludeKeys.has(key) && (t.popularity ?? 0) > 40) {
          excludeKeys.add(key);
          tracks.push({
            uri: t.uri,
            name: t.name,
            artist: t.artists.map((a: any) => a.name).join(', '),
            coverUrl: t.album?.images?.[0]?.url || ''
          });
        }
      }
    }
    return tracks;
  } catch (e) {
    console.error('fetchDiscoveryTracks error:', e);
    return [];
  }
}

// フォールバック用の人気トラックデータベース
const FALLBACK_HYBRID_TRACKS = [
  { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: '' },
  { uri: 'spotify:track:7y6HOcbQ80bsOsq1GahaVP', name: 'ミックスナッツ', artist: 'Official髭男dism', coverUrl: '' },
  { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: '' },
  { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: '' },
  { uri: 'spotify:track:4saklk6nie3yiGePpBwUoc', name: '感電', artist: '米津玄師', coverUrl: '' },
  { uri: 'spotify:track:2Gmyw5Vg2X5YW2lM3OC7nD', name: 'マリーゴールド', artist: 'あいみょん', coverUrl: '' },
  { uri: 'spotify:track:7pk2Mx1LnlaEpxfzNhgRuz', name: '丸ノ内サディスティック', artist: '椎名林檎', coverUrl: '' },
  { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: '' },
  { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: '' },
  { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: '' },
  { uri: 'spotify:track:18nkY3pJTub8WwEGiQAGh4', name: '高嶺の花子さん', artist: 'back number', coverUrl: '' },
  { uri: 'spotify:track:364w0q0J0G13g7R7Y8x6Wb', name: '青と夏', artist: 'Mrs. GREEN APPLE', coverUrl: '' },
  { uri: 'spotify:track:2ntXQnx4ZUraj1u5Hwqjem', name: '天体観測', artist: 'BUMP OF CHICKEN', coverUrl: '' },
  { uri: 'spotify:track:3XNnq2oo1zmHDseKZKaYEF', name: '前前前世', artist: 'RADWIMPS', coverUrl: '' },
  { uri: 'spotify:track:5oG8Ewk6dqsroYdmNFO7nu', name: 'きらり', artist: '藤井 風', coverUrl: '' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const excludeList: string[] = body.excludeKeys || body.excludeNames || []; // "song|artist" または "song - artist" の配列
    const hour = parseInt(body.hour || new Date().getHours().toString(), 10);
    const userToken: string | null = body.userToken || null;

    const excludeKeysSet = new Set<string>();
    excludeList.forEach((k) => {
      if (typeof k === 'string') {
        const parts = k.includes('|') ? k.split('|') : k.split(' - ');
        if (parts.length >= 2) {
          excludeKeysSet.add(normalizeKey(parts[0], parts[1]));
        } else {
          excludeKeysSet.add(k.toLowerCase().trim());
        }
      }
    });

    let spotifyToken = userToken;
    if (!spotifyToken) {
      spotifyToken = await getSpotifyToken();
    }

    // 並列で AI選曲(40%) と ディスカバリー(30%) を取得
    const [aiTracks, discoveryTracks] = await Promise.all([
      fetchAiTimeSlotTracks(hour, excludeKeysSet, spotifyToken),
      fetchDiscoveryTracks(excludeKeysSet, spotifyToken)
    ]);

    // 合体してバランスよくシャッフル
    let combined = [...aiTracks, ...discoveryTracks.slice(0, 6)].sort(() => Math.random() - 0.5);

    if (combined.length < 5) {
      const fallbackFiltered = FALLBACK_HYBRID_TRACKS.filter((t) => {
        const key = normalizeKey(t.name, t.artist);
        return !excludeKeysSet.has(key);
      });
      combined = [...combined, ...fallbackFiltered].sort(() => Math.random() - 0.5);
    }

    console.log(`📻 [/api/radio] Built hybrid pool: ${combined.length} tracks (AI: ${aiTracks.length}, Discovery: ${discoveryTracks.length})`);

    return NextResponse.json({ tracks: combined });
  } catch (error: any) {
    console.error('Hybrid Radio API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hour = parseInt(searchParams.get('hour') || new Date().getHours().toString(), 10);
    
    const dummyReq = new Request(request.url, {
      method: 'POST',
      body: JSON.stringify({ hour, excludeKeys: [] }),
    });
    return await POST(dummyReq);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
