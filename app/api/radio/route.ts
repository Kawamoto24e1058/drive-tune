import { NextResponse } from 'next/server';

// 時間帯別・多様な検索クエリプール
const TIME_SEARCH_QUERIES: Record<string, string[]> = {
  morning: [
    'J-POP 爽やか 朝',
    'morning drive Japan hits',
    '邦楽 アップテンポ 2023',
    '平成 ヒット曲 ドライブ',
    '2010年代 J-POP 定番',
    '米津玄師 OR YOASOBI OR Official髭男dism',
    'Mrs. GREEN APPLE OR back number OR あいみょん',
  ],
  daytime: [
    'J-POP ヒット 2024',
    'ドライブ 邦楽 定番',
    '2020年代 J-POP',
    'Vaundy OR King Gnu OR Ado',
    'RADWIMPS OR ONE OK ROCK OR BUMP OF CHICKEN',
    '邦楽 ロック ヒット',
    'アニメ 主題歌 人気 2023',
    '令和 ヒット曲',
  ],
  evening: [
    'シティポップ 邦楽',
    '夕暮れ ドライブ J-POP',
    '山下達郎 OR 竹内まりや OR 椎名林檎',
    '90年代 J-POP 名曲',
    'エモい 邦楽 バラード',
    '2000年代 J-POP ヒット',
    '平成 名曲 邦楽',
  ],
  midnight: [
    '夜ドライブ 邦楽',
    '深夜 J-POP アップテンポ',
    '邦楽 ロック 2022',
    'KICK BACK OR SPECIALZ OR 新時代',
    '2010年代 アニメ サントラ 名曲',
    'ローファイ 邦楽',
    'J-POP 疾走感',
  ],
};

// 時間帯別・大量フォールバック曲リスト（重複防止）
const TIME_FALLBACK: Record<string, Array<{ uri: string; name: string; artist: string; coverUrl: string }>> = {
  morning: [
    { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: '' },
    { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: '' },
    { uri: 'spotify:track:4saklk6nie3yiGePpBwUoc', name: '感電', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:2Gmyw5Vg2X5YW2lM3OC7nD', name: 'マリーゴールド', artist: 'あいみょん', coverUrl: '' },
    { uri: 'spotify:track:18nkY3pJTub8WwEGiQAGh4', name: '高嶺の花子さん', artist: 'back number', coverUrl: '' },
    { uri: 'spotify:track:364w0q0J0G13g7R7Y8x6Wb', name: '青と夏', artist: 'Mrs. GREEN APPLE', coverUrl: '' },
    { uri: 'spotify:track:2ntXQnx4ZUraj1u5Hwqjem', name: '天体観測', artist: 'BUMP OF CHICKEN', coverUrl: '' },
    { uri: 'spotify:track:3XNnq2oo1zmHDseKZKaYEF', name: '前前前世', artist: 'RADWIMPS', coverUrl: '' },
    { uri: 'spotify:track:59h6J25QnnT8xshPTFLkpe', name: '完全感覚Dreamer', artist: 'ONE OK ROCK', coverUrl: '' },
    { uri: 'spotify:track:3khEEPRyBeOUabbmOPJzAG', name: 'Pretender', artist: 'Official髭男dism', coverUrl: '' },
    { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: '' },
    { uri: 'spotify:track:7y6HOcbQ80bsOsq1GahaVP', name: 'ミックスナッツ', artist: 'Official髭男dism', coverUrl: '' },
    { uri: 'spotify:track:0qHT5elQ5RNmTA7oDKgb1m', name: '一途', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:4Di3ueaCyC0BThjixO0Uzq', name: 'シュガーソングとビターステップ', artist: 'UNISON SQUARE GARDEN', coverUrl: '' },
    { uri: 'spotify:track:5oG8Ewk6dqsroYdmNFO7nu', name: 'きらり', artist: '藤井 風', coverUrl: '' },
    { uri: 'spotify:track:1jgHrhblhrm0ALKoceU4aj', name: 'プラスティック・ラブ', artist: '竹内まりや', coverUrl: '' },
    { uri: 'spotify:track:08sjU4Uck88xYCQA3ncPS5', name: 'RIDE ON TIME', artist: '山下達郎', coverUrl: '' },
  ],
  daytime: [
    { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: '' },
    { uri: 'spotify:track:7y6HOcbQ80bsOsq1GahaVP', name: 'ミックスナッツ', artist: 'Official髭男dism', coverUrl: '' },
    { uri: 'spotify:track:0qHT5elQ5RNmTA7oDKgb1m', name: '一途', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:3XNnq2oo1zmHDseKZKaYEF', name: '前前前世', artist: 'RADWIMPS', coverUrl: '' },
    { uri: 'spotify:track:59h6J25QnnT8xshPTFLkpe', name: '完全感覚Dreamer', artist: 'ONE OK ROCK', coverUrl: '' },
    { uri: 'spotify:track:4Di3ueaCyC0BThjixO0Uzq', name: 'シュガーソングとビターステップ', artist: 'UNISON SQUARE GARDEN', coverUrl: '' },
    { uri: 'spotify:track:2ntXQnx4ZUraj1u5Hwqjem', name: '天体観測', artist: 'BUMP OF CHICKEN', coverUrl: '' },
    { uri: 'spotify:track:3khEEPRyBeOUabbmOPJzAG', name: 'Pretender', artist: 'Official髭男dism', coverUrl: '' },
    { uri: 'spotify:track:364w0q0J0G13g7R7Y8x6Wb', name: '青と夏', artist: 'Mrs. GREEN APPLE', coverUrl: '' },
    { uri: 'spotify:track:4saklk6nie3yiGePpBwUoc', name: '感電', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:18nkY3pJTub8WwEGiQAGh4', name: '高嶺の花子さん', artist: 'back number', coverUrl: '' },
    { uri: 'spotify:track:2Gmyw5Vg2X5YW2lM3OC7nD', name: 'マリーゴールド', artist: 'あいみょん', coverUrl: '' },
    { uri: 'spotify:track:5oG8Ewk6dqsroYdmNFO7nu', name: 'きらり', artist: '藤井 風', coverUrl: '' },
    { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: '' },
    { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: '' },
    { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: '' },
    { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:1jgHrhblhrm0ALKoceU4aj', name: 'プラスティック・ラブ', artist: '竹内まりや', coverUrl: '' },
    { uri: 'spotify:track:7pk2Mx1LnlaEpxfzNhgRuz', name: '丸ノ内サディスティック', artist: '椎名林檎', coverUrl: '' },
  ],
  evening: [
    { uri: 'spotify:track:7pk2Mx1LnlaEpxfzNhgRuz', name: '丸ノ内サディスティック', artist: '椎名林檎', coverUrl: '' },
    { uri: 'spotify:track:3khEEPRyBeOUabbmOPJzAG', name: 'Pretender', artist: 'Official髭男dism', coverUrl: '' },
    { uri: 'spotify:track:6FhWelfRDMFZRtFUU6SIdC', name: '踊り子', artist: 'Vaundy', coverUrl: '' },
    { uri: 'spotify:track:5oG8Ewk6dqsroYdmNFO7nu', name: 'きらり', artist: '藤井 風', coverUrl: '' },
    { uri: 'spotify:track:1jgHrhblhrm0ALKoceU4aj', name: 'プラスティック・ラブ', artist: '竹内まりや', coverUrl: '' },
    { uri: 'spotify:track:08sjU4Uck88xYCQA3ncPS5', name: 'RIDE ON TIME', artist: '山下達郎', coverUrl: '' },
    { uri: 'spotify:track:4saklk6nie3yiGePpBwUoc', name: '感電', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:2Gmyw5Vg2X5YW2lM3OC7nD', name: 'マリーゴールド', artist: 'あいみょん', coverUrl: '' },
    { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: '' },
    { uri: 'spotify:track:3XNnq2oo1zmHDseKZKaYEF', name: '前前前世', artist: 'RADWIMPS', coverUrl: '' },
    { uri: 'spotify:track:18nkY3pJTub8WwEGiQAGh4', name: '高嶺の花子さん', artist: 'back number', coverUrl: '' },
    { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: '' },
    { uri: 'spotify:track:2ntXQnx4ZUraj1u5Hwqjem', name: '天体観測', artist: 'BUMP OF CHICKEN', coverUrl: '' },
    { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: '' },
    { uri: 'spotify:track:4Di3ueaCyC0BThjixO0Uzq', name: 'シュガーソングとビターステップ', artist: 'UNISON SQUARE GARDEN', coverUrl: '' },
    { uri: 'spotify:track:364w0q0J0G13g7R7Y8x6Wb', name: '青と夏', artist: 'Mrs. GREEN APPLE', coverUrl: '' },
  ],
  midnight: [
    { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: '' },
    { uri: 'spotify:track:2wsyebeX4ptSxKIpJtWE6B', name: '逆光', artist: 'Ado', coverUrl: '' },
    { uri: 'spotify:track:3huSUfmhUr4entz2S0G31O', name: 'クロノスタシス', artist: 'BUMP OF CHICKEN', coverUrl: '' },
    { uri: 'spotify:track:7ugSlmtBWNMAgTpdvBPcIh', name: 'エイリアンズ', artist: 'キリンジ', coverUrl: '' },
    { uri: 'spotify:track:4saklk6nie3yiGePpBwUoc', name: '感電', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:0qHT5elQ5RNmTA7oDKgb1m', name: '一途', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:6EzZn96uOc9JsVGNRpx06n', name: '怪獣の花唄', artist: 'Vaundy', coverUrl: '' },
    { uri: 'spotify:track:59h6J25QnnT8xshPTFLkpe', name: '完全感覚Dreamer', artist: 'ONE OK ROCK', coverUrl: '' },
    { uri: 'spotify:track:3khEEPRyBeOUabbmOPJzAG', name: 'Pretender', artist: 'Official髭男dism', coverUrl: '' },
    { uri: 'spotify:track:7pk2Mx1LnlaEpxfzNhgRuz', name: '丸ノ内サディスティック', artist: '椎名林檎', coverUrl: '' },
    { uri: 'spotify:track:37IPQgBkvbmH9JR5mlY6a8', name: 'ハルジオン', artist: 'YOASOBI', coverUrl: '' },
    { uri: 'spotify:track:2ntXQnx4ZUraj1u5Hwqjem', name: '天体観測', artist: 'BUMP OF CHICKEN', coverUrl: '' },
    { uri: 'spotify:track:3XNnq2oo1zmHDseKZKaYEF', name: '前前前世', artist: 'RADWIMPS', coverUrl: '' },
    { uri: 'spotify:track:1jgHrhblhrm0ALKoceU4aj', name: 'プラスティック・ラブ', artist: '竹内まりや', coverUrl: '' },
    { uri: 'spotify:track:5oG8Ewk6dqsroYdmNFO7nu', name: 'きらり', artist: '藤井 風', coverUrl: '' },
  ],
};

async function getClientCredentialsToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '387ae192a82d41e4abb7acf114110694';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

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
  } catch { return null; }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hour = parseInt(searchParams.get('hour') || new Date().getHours().toString(), 10);
    // ユーザーのアクセストークンをクライアントから受け取る (Client Credentials が不要になる)
    const userToken = searchParams.get('userToken') || null;
    // クライアントから除外すべき既聴 URI を受け取る
    const excludedUrisParam = searchParams.get('excludedUris') || '';
    const excludedUris = new Set(excludedUrisParam ? excludedUrisParam.split(',').filter(Boolean) : []);

    // 時間帯判定
    let timeKey: keyof typeof TIME_SEARCH_QUERIES = 'daytime';
    if (hour >= 5 && hour < 10) timeKey = 'morning';
    else if (hour >= 10 && hour < 17) timeKey = 'daytime';
    else if (hour >= 17 && hour < 22) timeKey = 'evening';
    else timeKey = 'midnight';

    // 使用するトークン: ユーザートークン優先 → Client Credentials → フォールバック
    const token = userToken || await getClientCredentialsToken();

    if (!token) {
      // 時間帯別フォールバック: 既聴を除外してシャッフル
      const fallback = TIME_FALLBACK[timeKey] || TIME_FALLBACK.daytime;
      const selected = fallback
        .filter((t) => !excludedUris.has(t.uri))
        .sort(() => Math.random() - 0.5)
        .slice(0, 18);
      console.log(`📻 [/api/radio] Fallback (no token) - returning ${selected.length} tracks for ${timeKey}`);
      return NextResponse.json({ tracks: selected, timeKey });
    }

    // 時間帯別クエリプールからランダムに 2 クエリを選出
    const queries = TIME_SEARCH_QUERIES[timeKey];
    const shuffled = [...queries].sort(() => Math.random() - 0.5);
    const q1 = shuffled[0];
    const q2 = shuffled[1];
    const offset1 = Math.floor(Math.random() * 15);
    const offset2 = Math.floor(Math.random() * 15);

    // Spotify カタログ直接検索（ユーザートークンまたは Client Credentials）
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
      const d = await res1.json();
      if (d.tracks?.items) rawTracks.push(...d.tracks.items);
    }
    if (res2.ok) {
      const d = await res2.json();
      if (d.tracks?.items) rawTracks.push(...d.tracks.items);
    }

    // 重複排除 ＋ 人気度フィルター ＋ 既聴除外
    const seenUris = new Set<string>(excludedUris);
    const extractedTracks = rawTracks
      .filter((t: any) => {
        if (!t || !t.uri) return false;
        if ((t.popularity ?? 0) < 40) return false;
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

    let selected = extractedTracks.sort(() => Math.random() - 0.5).slice(0, 18);

    // 検索結果が少ない場合はフォールバックで補填
    if (selected.length < 8) {
      const fallback = (TIME_FALLBACK[timeKey] || TIME_FALLBACK.daytime)
        .filter((t) => !seenUris.has(t.uri));
      selected = [...selected, ...fallback].slice(0, 18);
    }

    console.log(`📻 [/api/radio] ${selected.length} tracks for "${q1}" & "${q2}" (${timeKey}, ${userToken ? 'user-token' : 'cc-token'})`);

    return NextResponse.json({ tracks: selected, timeKey, queries: [q1, q2] });
  } catch (error: any) {
    console.error('Radio API Error:', error);
    const fallback = TIME_FALLBACK.daytime.sort(() => Math.random() - 0.5).slice(0, 18);
    return NextResponse.json({ tracks: fallback });
  }
}
