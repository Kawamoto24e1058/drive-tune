import { NextResponse } from 'next/server';

function normalizeKey(title: string, artist: string): string {
  const cleanTitle = (title || '')
    .toLowerCase()
    .replace(/\s*[\(\-\~].*$/g, '')
    .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g, '');
  const cleanArtist = (artist || '')
    .toLowerCase()
    .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g, '');
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

// 時間帯テキストの判定
function getTimeContext(hour: number): string {
  if (hour >= 5 && hour < 10) return "朝のドライブ。清々しく爽やかなJ-POP・アコースティック";
  if (hour >= 10 && hour < 17) return "昼のハイウェイドライブ。開放感とスピード感のあるアップテンポなポップス＆ロック";
  if (hour >= 17 && hour < 22) return "夕方〜エモーショナルな夜ドライブ。メロウでエモいJ-POP・シティポップ";
  return "深夜のミッドナイトドライブ。車内で熱唱できるエモいアンセム ＆ ローファイ/チル";
}

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
    const excludeList: string[] = body.excludeKeys || body.excludeNames || [];
    const userTracks: { name: string; artist: string; uri: string }[] = body.userTracks || [];
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

    const timeMood = getTimeContext(hour);
    console.log(`📻 [/api/radio] Executing Ratio-Based Time-Adaptive Radio DJ for ${hour}:00 (${timeMood})...`);

    // --- 1. 【30%】 ユーザーの愛聴曲から時間帯に合うものを 5 曲抽出 ---
    const selectedUserTracks: any[] = [];
    for (const ut of userTracks) {
      if (!ut || !ut.name || !ut.artist) continue;
      if (selectedUserTracks.length >= 5) break;
      const key = normalizeKey(ut.name, ut.artist);
      if (!excludeKeysSet.has(key)) {
        excludeKeysSet.add(key);
        selectedUserTracks.push({
          uri: ut.uri,
          name: ut.name,
          artist: ut.artist,
          category: 'UserPersonal (30%)',
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiTracks: any[] = [];

    if (apiKey) {
      const prompt = `あなたはプロのドライブ専門ラジオDJです。
現在時刻: ${hour}時
全体共通ムード: 【${timeMood}】 (全曲必ずこの時間帯のドライブ雰囲気に合致させること)

以下の 2 つのカテゴリから指定曲数分、日本の楽曲を選曲して JSON で出力してください。

【カテゴリ A: ユーザー嗜好に合う知らない曲 (5曲)】
ユーザーの好きな世界観（ヨルシカ、米津玄師、忘れらんねえよ、邦ロック/J-POP）に合致するが、メジャーすぎない隠れた名曲・関連アーティストの楽曲。

【カテゴリ B: みんなが知る年代名曲 ＆ 最近のヒット曲 (6曲)】
昭和・平成・2010年代の誰もが歌える定番ヒット曲、および最新チャートの上位曲。

【厳格ルール】
1. 全曲、上記の【全体共通ムード】に合致していること。
2. 同一アーティストは全カテゴリを通して1曲まで。
3. 以下の既聴曲は絶対に含まないこと:
   [${Array.from(excludeKeysSet).slice(-40).join(', ')}]

【出力フォーマット (JSONのみ)】:
[
  { "song": "曲名", "artist": "アーティスト名", "category": "preference" },
  { "song": "曲名", "artist": "アーティスト名", "category": "hit" }
]`;

      try {
        const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.90 }
          })
        });

        if (aiRes.ok) {
          const data = await aiRes.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const items = JSON.parse(cleanedText);

          if (spotifyToken) {
            for (const item of items) {
              if (!item || !item.song || !item.artist) continue;
              const key = normalizeKey(item.song, item.artist);
              if (excludeKeysSet.has(key)) continue;

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
                excludeKeysSet.add(key);
                aiTracks.push({
                  uri: t.uri,
                  name: t.name,
                  artist: t.artists.map((a: any) => a.name).join(', '),
                  coverUrl: t.album?.images?.[0]?.url || '',
                  category: item.category || 'AI Generated',
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("AI Selection failed:", e);
      }
    }

    // 全曲を組み合わせ
    let combined = [...selectedUserTracks, ...aiTracks];

    // 不足分はフォールバックで補充
    if (combined.length < 8) {
      const fallbackFiltered = FALLBACK_HYBRID_TRACKS.filter((t) => {
        const key = normalizeKey(t.name, t.artist);
        return !excludeKeysSet.has(key);
      });
      combined = [...combined, ...fallbackFiltered];
    }

    // ランダムにシャッフル
    combined = combined.sort(() => Math.random() - 0.5);

    console.log(`📻 [/api/radio] Built ratio-based pool: ${combined.length} tracks (UserTracks: ${selectedUserTracks.length}, AITracks: ${aiTracks.length})`);

    return NextResponse.json({ tracks: combined });
  } catch (error: any) {
    console.error('Ratio Radio API Error:', error);
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
