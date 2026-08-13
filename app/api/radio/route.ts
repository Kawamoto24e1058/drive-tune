import { NextResponse } from 'next/server';

// 毎回ランダムに付与する「選曲の切り口（サブテーマ）」
const RANDOM_SUB_FLAVORS = [
  "2000年代〜2010年代の平成懐かし名曲・大ヒット曲を中心に",
  "フェスやライブで激熱になるドライブ邦ロック・バンド中心に",
  "TikTokやSNSで話題になった令和の最新トレンド＆バズソングを中心に",
  "90年代〜2000年代のアニメ主題歌・アニソン名曲を隠し味に",
  "ドライブにぴったりの80年代〜90年代シティポップ・名曲を中心に",
  "ボーカルの歌唱力が際立つ車内大合唱アンセムを中心に",
  "エモくてメロウなアコースティック＆インディーズポップを中心に"
];

// 1. Spotify サーバー間認証 (Client Credentials)
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '387ae192a82d41e4abb7acf114110694';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId) {
    throw new Error('SPOTIFY_CLIENT_ID is missing in environment variables.');
  }

  // Client secretがない場合はトークンなしとして扱うか、Client Credentialsのリクエストを送る
  if (!clientSecret) {
    console.warn('⚠️ SPOTIFY_CLIENT_SECRET is not set. Client Credentials search might be limited.');
    return null;
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch Spotify client credentials token');
  const data = await res.json();
  return data.access_token;
}

// 2. Gemini API による AI プロDJ選曲
async function getAiSongRecommendations(hour: number, excludeListStr: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is missing in environment variables.");
    return null;
  }

  // 時間帯コンテキスト
  let timeContext = "";
  if (hour >= 5 && hour < 10) timeContext = "朝のドライブ。爽やかで目覚めるようなJ-POPヒット、朝日を浴びながら聴きたい名曲。";
  else if (hour >= 10 && hour < 17) timeContext = "昼のハイウェイドライブ。テンポが良くドライブ感あふれる定番ヒット曲、平成・令和のフェス名曲。";
  else if (hour >= 17 && hour < 22) timeContext = "夕方〜夜のドライブ。エモいメロディ、夕暮れに浸れるJ-POP名曲、少し大人っぽいシティポップ。";
  else timeContext = "深夜のドライブ。車内で熱唱できるハイテンポでエモい邦ロック/アニソン (40%) + しっとりチルな夜曲 (30%) + オシャレなR&B/シティポップ (30%)。";

  // 毎回違うサブテーマをランダム選出
  const randomFlavor = RANDOM_SUB_FLAVORS[Math.floor(Math.random() * RANDOM_SUB_FLAVORS.length)];

  const prompt = `あなたはプロのラジオDJです。日本のドライブ中に聴く最高の音楽を選曲してください。

【基本状況】
現在時刻: ${hour}時 (${timeContext})
今回のスペシャルテーマ: 【${randomFlavor}】

【選曲厳格ルール】
1. 誰もが知っている有名曲・ヒット曲（J-POP, 邦ロック, 年代ヒット, アニソン）から選曲してください。
2. 同一アーティストは1曲までにしてください。
3. 以下の「過去に再生された曲・アーティストのリスト」に含まれる曲は【絶対に追加しないでください】:
   [${excludeListStr}]

【出力フォーマット】
以下の純粋な JSON 配列のみを出力してください（Markdownの装飾やコードブロックは一切不要です）:
[
  { "song": "曲名", "artist": "アーティスト名" }
]
提案曲数: 15曲`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.95 // 被りを防ぐためランダム度を極限まで引き上げる
      }
    })
  });

  if (!res.ok) throw new Error(`Gemini API Failed with status: ${res.status}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  try {
    return JSON.parse(text);
  } catch (e) {
    // Markdownコードブロックが含まれている場合のクリーニング
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  }
}

// フォールバック選曲リスト (Gemini APIキーがない場合またはエラー時)
const FALLBACK_AI_RECOMMENDATIONS = [
  { song: '怪獣の花唄', artist: 'Vaundy' },
  { song: 'ミックスナッツ', artist: 'Official髭男dism' },
  { song: '新宝島', artist: 'サカナクション' },
  { song: 'ハルジオン', artist: 'YOASOBI' },
  { song: '感電', artist: '米津玄師' },
  { song: 'マリーゴールド', artist: 'あいみょん' },
  { song: '丸ノ内サディスティック', artist: '椎名林檎' },
  { song: 'SPECIALZ', artist: 'King Gnu' },
  { song: 'KICK BACK', artist: '米津玄師' },
  { song: '新時代', artist: 'Ado' },
  { song: '高嶺の花子さん', artist: 'back number' },
  { song: '青と夏', artist: 'Mrs. GREEN APPLE' },
  { song: '天体観測', artist: 'BUMP OF CHICKEN' },
  { song: '前前前世', artist: 'RADWIMPS' },
  { song: 'きらり', artist: '藤井 風' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const excludeNames: string[] = body.excludeNames || []; // "曲名 - アーティスト名" の配列
    const hour = parseInt(body.hour || new Date().getHours().toString(), 10);
    const userToken: string | null = body.userToken || null;

    const excludeStr = excludeNames.slice(-60).join(', ');

    console.log(`🤖 [AI Radio DJ] Generating AI playlist for ${hour}:00 with flavor...`);
    let aiRecommendations: any[] | null = null;
    try {
      aiRecommendations = await getAiSongRecommendations(hour, excludeStr);
    } catch (e) {
      console.error('Failed to get AI song recommendations:', e);
    }

    if (!aiRecommendations || !Array.isArray(aiRecommendations) || aiRecommendations.length === 0) {
      console.warn('⚠️ Using fallback AI recommendations list.');
      aiRecommendations = FALLBACK_AI_RECOMMENDATIONS;
    }

    // Spotify トークンの準備: ユーザートークンまたは Client Credentials
    let spotifyToken: string | null = userToken;
    if (!spotifyToken) {
      try {
        spotifyToken = await getSpotifyToken();
      } catch (e) {
        console.warn('Spotify Client Credentials token error:', e);
      }
    }

    const resultTracks: any[] = [];

    // AI提案曲を Spotify API で検索して Spotify URI を回収
    if (spotifyToken) {
      for (const rec of aiRecommendations) {
        if (!rec || !rec.song || !rec.artist) continue;

        // 除外チェック
        const recLabel = `${rec.song} - ${rec.artist}`;
        if (excludeNames.includes(recLabel)) continue;

        // 1. ピンポイント検索: `track:"曲名" artist:"アーティスト名"`
        let q = `track:"${rec.song}" artist:"${rec.artist}"`;
        let searchRes = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=JP&limit=1`,
          { headers: { Authorization: `Bearer ${spotifyToken}` } }
        );

        let item: any = null;
        if (searchRes.ok) {
          const data = await searchRes.json();
          item = data.tracks?.items?.[0];
        }

        // 2. ピンポイントでダメな場合はプレーンテキスト検索: `${rec.song} ${rec.artist}`
        if (!item) {
          q = `${rec.song} ${rec.artist}`;
          searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=JP&limit=1`,
            { headers: { Authorization: `Bearer ${spotifyToken}` } }
          );
          if (searchRes.ok) {
            const data = await searchRes.json();
            item = data.tracks?.items?.[0];
          }
        }

        if (item) {
          resultTracks.push({
            uri: item.uri,
            name: item.name,
            artist: item.artists.map((a: any) => a.name).join(', '),
            coverUrl: item.album?.images?.[0]?.url || '',
          });
        }
      }
    }

    console.log(`✨ [AI Radio DJ] Mined ${resultTracks.length} tracks successfully.`);

    return NextResponse.json({ tracks: resultTracks });
  } catch (error: any) {
    console.error('AI Radio Engine Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hour = parseInt(searchParams.get('hour') || new Date().getHours().toString(), 10);
    
    // GETハンドラもPOST同様に動作させる
    const dummyReq = new Request(request.url, {
      method: 'POST',
      body: JSON.stringify({ hour, excludeNames: [] }),
    });
    return await POST(dummyReq);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
