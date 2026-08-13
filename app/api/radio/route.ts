import { NextResponse } from 'next/server';

// ジャンル・年代を横断する有名アーティストプール（発見体験の多様性担保）
const ARTIST_POOLS = {
  reiwa: [
    'YOASOBI', 'Official髭男dism', 'King Gnu', 'Vaundy', 'Ado',
    '米津玄師', 'Mrs. GREEN APPLE', '藤井 風', 'あいみょん', 'back number',
    'Aimer', 'RADWIMPS', '優里', 'BE:FIRST', '緑黄色社会', 'SauceGirls',
    'yama', '崎山蒼志', 'iri', 'ヨルシカ', 'キタニタダシ',
  ],
  heisei: [
    'ONE OK ROCK', 'BUMP OF CHICKEN', 'ASIAN KUNG-FU GENERATION',
    'サカナクション', 'UNISON SQUARE GARDEN', 'androp',
    'スピッツ', 'ポルノグラフィティ', 'EXILE', 'GReeeeN',
    'いきものがかり', 'GLAY', 'L\'Arc-en-Ciel', 'Mr.Children',
    'the GazettE', 'マキシマム ザ ホルモン', 'BUMP OF CHICKEN', 'Galileo Galilei',
  ],
  classic: [
    '山下達郎', '竹内まりや', '松任谷由実', '荒井由実',
    '宇多田ヒカル', '椎名林檎', 'B\'z', 'サザンオールスターズ',
    '槇原敬之', '小田和正', 'TM NETWORK', '矢沢永吉',
    '中島みゆき', '桑田佳祐', '浜田省吾', '長渕剛',
  ],
  anime: [
    'LiSA', '梶浦由記', '水樹奈々', 'Aimer', 'TK from 凛として時雨',
    'fhána', 'ClariS', 'SawanoHiroyuki[nZk]', '神山羊', 'FLOW',
    'angela', 'ZAQ', 'TRUE', 'YURiKA', 'ReoNa',
    'eill', 'Uru', 'Cö shu Nie', 'nonoc',
  ],
  discovery: [
    'マカロニえんぴつ', '羊文学', 'Creepy Nuts', 'ゲスの極み乙女',
    'キュウソネコカミ', '10-FEET', 'coldrain', 'People In The Box',
    '04 Limited Sazabys', 'クリープハイプ', '星野源', 'never young beach',
    'cero', 'toe', 'odol', 'フレデリック', 'the pillows',
    'LACCO TOWER', 'indigo la End', 'シャムキャッツ',
  ],
};

// 時間帯別アーティスト重み (各スロットから選ぶグループ順)
const TIME_ARTIST_WEIGHTS: Record<string, Array<keyof typeof ARTIST_POOLS>> = {
  morning:  ['reiwa', 'heisei', 'discovery', 'classic', 'anime'],
  daytime:  ['reiwa', 'discovery', 'heisei', 'anime', 'reiwa'],
  evening:  ['classic', 'reiwa', 'discovery', 'heisei', 'classic'],
  midnight: ['discovery', 'anime', 'reiwa', 'heisei', 'classic'],
};

// 時間帯別フォールバック（各スロット 20 曲）
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
    { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: '' },
    { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: '' },
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
    { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: '' },
    { uri: 'spotify:track:59h6J25QnnT8xshPTFLkpe', name: '完全感覚Dreamer', artist: 'ONE OK ROCK', coverUrl: '' },
  ],
  midnight: [
    { uri: 'spotify:track:6JmTrd6VvMOWZFBk439e28', name: 'SPECIALZ', artist: 'King Gnu', coverUrl: '' },
    { uri: 'spotify:track:7jgqNMnqAT9FghC1uSYTFF', name: 'KICK BACK', artist: '米津玄師', coverUrl: '' },
    { uri: 'spotify:track:4cPwi7lcWxRQNEb4xC77fC', name: '新時代', artist: 'Ado', coverUrl: '' },
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
    { uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b', name: '新宝島', artist: 'サカナクション', coverUrl: '' },
    { uri: 'spotify:track:4Di3ueaCyC0BThjixO0Uzq', name: 'シュガーソングとビターステップ', artist: 'UNISON SQUARE GARDEN', coverUrl: '' },
    { uri: 'spotify:track:364w0q0J0G13g7R7Y8x6Wb', name: '青と夏', artist: 'Mrs. GREEN APPLE', coverUrl: '' },
    { uri: 'spotify:track:7y6HOcbQ80bsOsq1GahaVP', name: 'ミックスナッツ', artist: 'Official髭男dism', coverUrl: '' },
    { uri: 'spotify:track:18nkY3pJTub8WwEGiQAGh4', name: '高嶺の花子さん', artist: 'back number', coverUrl: '' },
    { uri: 'spotify:track:2Gmyw5Vg2X5YW2lM3OC7nD', name: 'マリーゴールド', artist: 'あいみょん', coverUrl: '' },
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

async function searchByArtist(
  artistName: string,
  token: string,
  excludedUris: Set<string>,
  popularityMin = 40,
  offsetMax = 10
): Promise<any[]> {
  try {
    const offset = Math.floor(Math.random() * offsetMax);
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=track&market=JP&limit=10&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tracks?.items || []).filter(
      (t: any) => t && t.uri && (t.popularity ?? 0) >= popularityMin && !excludedUris.has(t.uri)
    );
  } catch { return []; }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hour = parseInt(searchParams.get('hour') || new Date().getHours().toString(), 10);
    const userToken = searchParams.get('userToken') || null;
    const excludedUrisParam = searchParams.get('excludedUris') || '';
    const excludedUris = new Set(excludedUrisParam ? excludedUrisParam.split(',').filter(Boolean) : []);

    // ユーザーのトップアーティスト（好みベースの発見に使用）
    const topArtistsParam = searchParams.get('topArtists') || '';
    const userTopArtists = topArtistsParam ? topArtistsParam.split(',').filter(Boolean).slice(0, 5) : [];

    // 時間帯判定
    let timeKey: keyof typeof TIME_ARTIST_WEIGHTS = 'daytime';
    if (hour >= 5 && hour < 10) timeKey = 'morning';
    else if (hour >= 10 && hour < 17) timeKey = 'daytime';
    else if (hour >= 17 && hour < 22) timeKey = 'evening';
    else timeKey = 'midnight';

    const token = userToken || await getClientCredentialsToken();

    if (!token) {
      const fallback = TIME_FALLBACK[timeKey] || TIME_FALLBACK.daytime;
      const selected = fallback.filter((t) => !excludedUris.has(t.uri)).sort(() => Math.random() - 0.5).slice(0, 20);
      return NextResponse.json({ tracks: selected, timeKey, source: 'fallback-no-token' });
    }

    // ─── 選曲戦略: 3 レイヤー ───────────────────────────────────────
    //
    //  Layer A (30%): 有名アーティスト → 知っている曲のアンカー
    //  Layer B (40%): ユーザーのトップアーティスト → 好みベースの発見
    //  Layer C (30%): ディスカバリープール → 全く新しい出会い (popularityMin 低め)
    //
    // ──────────────────────────────────────────────────────────────────

    const seenUris = new Set<string>(excludedUris);
    const artistTrackCount = new Map<string, number>();
    const MAX_PER_ARTIST = 2; // 同一アーティストの曲は最大 2 曲

    const addTracks = (rawTracks: any[], bucket: any[]) => {
      for (const t of rawTracks) {
        if (!t?.uri || seenUris.has(t.uri)) continue;
        const artistKey = t.artists?.[0]?.name || 'unknown';
        if ((artistTrackCount.get(artistKey) || 0) >= MAX_PER_ARTIST) continue;
        seenUris.add(t.uri);
        artistTrackCount.set(artistKey, (artistTrackCount.get(artistKey) || 0) + 1);
        bucket.push({
          uri: t.uri,
          name: t.name,
          artist: t.artists ? t.artists.map((a: any) => a.name).join(', ') : 'Unknown',
          coverUrl: t.album?.images?.[0]?.url || '',
        });
      }
    };

    // ─── Layer A: 有名アーティスト (目標 6 曲) ───────────────────
    const weightedGroups = TIME_ARTIST_WEIGHTS[timeKey];
    const famousArtists: string[] = [];
    const usedFamous = new Set<string>();
    for (const group of weightedGroups) {
      if (famousArtists.length >= 3) break;
      const pool = ARTIST_POOLS[group];
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (!usedFamous.has(candidate)) {
        famousArtists.push(candidate);
        usedFamous.add(candidate);
      }
    }

    // ─── Layer B: ユーザーのトップアーティスト (目標 8 曲) ─────────
    // topArtists が来ていない場合は reiwa/heisei から追加アーティストを選出
    const tasteArtists = userTopArtists.length >= 2
      ? userTopArtists.slice(0, 4)
      : [
          ...ARTIST_POOLS.reiwa.sort(() => Math.random() - 0.5).slice(0, 2),
          ...ARTIST_POOLS.heisei.sort(() => Math.random() - 0.5).slice(0, 2),
        ];

    // ─── Layer C: ディスカバリーアーティスト (目標 6 曲) ──────────
    const discoveryArtists = [
      ...ARTIST_POOLS.discovery.sort(() => Math.random() - 0.5).slice(0, 2),
      ARTIST_POOLS.anime[Math.floor(Math.random() * ARTIST_POOLS.anime.length)],
    ];

    const allArtistsToSearch = [
      ...famousArtists,
      ...tasteArtists,
      ...discoveryArtists,
    ];

    console.log(`📻 [/api/radio] ${timeKey} - Famous: [${famousArtists}] Taste: [${tasteArtists}] Discovery: [${discoveryArtists}]`);

    // 全アーティストを並列検索
    const [famousResults, tasteResults, discoveryResults] = await Promise.all([
      Promise.all(famousArtists.map((a) => searchByArtist(a, token, seenUris, 50, 8))),
      Promise.all(tasteArtists.map((a) => searchByArtist(a, token, seenUris, 35, 20))), // offset 広め = バリエーション
      Promise.all(discoveryArtists.map((a) => searchByArtist(a, token, seenUris, 25, 30))), // popularity 低め = 発見
    ]);

    const layerA: any[] = [];
    const layerB: any[] = [];
    const layerC: any[] = [];

    // ラウンドロビンで各レイヤーに均等配分
    const maxRounds = 5;
    for (let r = 0; r < maxRounds; r++) {
      famousResults.forEach((tracks) => addTracks([tracks[r]].filter(Boolean), layerA));
      tasteResults.forEach((tracks) => addTracks([tracks[r]].filter(Boolean), layerB));
      discoveryResults.forEach((tracks) => addTracks([tracks[r]].filter(Boolean), layerC));
    }

    // 3 レイヤーを 30:40:30 で混合
    const targetA = 6;   // 有名曲 (Layer A)
    const targetB = 8;   // 好みベース発見 (Layer B)
    const targetC = 6;   // 完全新発見 (Layer C)

    const finalTracks = [
      ...layerA.slice(0, targetA),
      ...layerB.slice(0, targetB),
      ...layerC.slice(0, targetC),
    ];

    // 不足分をフォールバックで補填
    if (finalTracks.length < 12) {
      const fallback = (TIME_FALLBACK[timeKey] || TIME_FALLBACK.daytime)
        .filter((t) => !seenUris.has(t.uri));
      finalTracks.push(...fallback);
    }

    // シャッフルして最大 20 曲返す
    const selected = finalTracks.sort(() => Math.random() - 0.5).slice(0, 20);

    console.log(`📻 [/api/radio] Returning ${selected.length} tracks (A:${layerA.length} B:${layerB.length} C:${layerC.length})`);

    return NextResponse.json({
      tracks: selected,
      timeKey,
      layers: { famous: layerA.length, taste: layerB.length, discovery: layerC.length },
    });
  } catch (error: any) {
    console.error('Radio API Error:', error);
    const fallback = TIME_FALLBACK.daytime.sort(() => Math.random() - 0.5).slice(0, 20);
    return NextResponse.json({ tracks: fallback });
  }
}
