"use client";

import React, { useEffect, useRef, useState } from "react";

// 🎵 Spotify Track Item Definition
export interface TrackItem {
  uri: string;
  name: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  popularity?: number;
}

// 📺 100% Real-Time Spotify Now Playing State
export interface NowPlayingState {
  id?: string;
  uri?: string;
  title: string;
  artist: string;
  coverUrl: string;
  durationMs: number;
  positionMs: number;
  isPaused: boolean;
}

// 🧠 Action Feedback Evaluation Types & Definition
export type FeedbackType = "INSTANT_SKIP" | "MID_SKIP" | "COMPLETED";

export interface FeedbackLog {
  trackUri: string;
  trackName: string;
  artistName: string;
  playedSeconds: number;
  type: FeedbackType;
  scoreChange: number;
  timestamp: string;
}

// 🎨 完全独立型 60fps リアルタイム波形コンポーネント (FluidOrganicEqualizer)
interface VisualizerProps {
  isPlaying: boolean;
}

export const FluidOrganicEqualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const peaksRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const barCount = 20; // 片側20本（左右計40本）

    if (peaksRef.current.length !== barCount) {
      peaksRef.current = new Array(barCount).fill(0);
    }

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const barWidth = 4;
      const barGap = 6;

      // ネオン発光エフェクト
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(16, 185, 129, 0.7)";

      // グラデーション (シアン ➔ エメラルド ➔ ミント ➔ エメラルド ➔ シアン)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#06B6D4"); // シアン
      gradient.addColorStop(0.3, "#10B981"); // エメラルド
      gradient.addColorStop(0.5, "#34D399"); // ミント
      gradient.addColorStop(0.7, "#10B981"); // エメラルド
      gradient.addColorStop(1, "#06B6D4"); // シアン
      ctx.fillStyle = gradient;

      const t = Date.now() / 1000; // 時間経過（秒）

      for (let i = 0; i < barCount; i++) {
        let amplitude = 0.05;

        if (isPlaying) {
          // 複数の波（サイン波＋コサイン波＋高速ランダムノイズ）を合成して「複雑な生の音感」を演出
          const wave1 = Math.sin(t * 4 + i * 0.4);
          const wave2 = Math.cos(t * 8 - i * 0.2) * 0.5;
          const wave3 = Math.sin(t * 15 + i * 0.8) * 0.3;
          const randomSpike = Math.random() * 0.25;

          // 中央（低音）と外側（高音）のベース振幅調整
          const posRatio = 1 - Math.pow(i / barCount, 1.5);
          const combined = (wave1 + wave2 + wave3 + 1.8) / 3.6;

          amplitude = Math.min(1, Math.max(0.12, combined * posRatio + randomSpike));
        } else {
          // 静止/一時停止時はゆっくりとゆらぐ
          amplitude = 0.05 + Math.sin(t * 2 + i * 0.3) * 0.02;
        }

        const halfBarHeight = (amplitude * (height * 0.85)) / 2;

        // 右側バー（上下対称）
        const xRight = centerX + i * (barWidth + barGap) + 4;
        const xLeft = centerX - (i + 1) * (barWidth + barGap) - 4;

        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(xRight, centerY - halfBarHeight, barWidth, halfBarHeight * 2, 2);
          ctx.fill();

          ctx.beginPath();
          ctx.roundRect(xLeft, centerY - halfBarHeight, barWidth, halfBarHeight * 2, 2);
          ctx.fill();
        } else {
          ctx.fillRect(xRight, centerY - halfBarHeight, barWidth, halfBarHeight * 2);
          ctx.fillRect(xLeft, centerY - halfBarHeight, barWidth, halfBarHeight * 2);
        }

        // --- ピークホールド（頂点ドット） ---
        if (halfBarHeight > peaksRef.current[i]) {
          peaksRef.current[i] = halfBarHeight;
        } else {
          peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.0); // 落下速度
        }

        const currentPeak = peaksRef.current[i];
        ctx.fillStyle = "#A7F3D0";
        ctx.shadowColor = "#A7F3D0";

        if (currentPeak > 2) {
          // 上頂点
          ctx.fillRect(xRight, centerY - currentPeak - 3, barWidth, 2);
          ctx.fillRect(xLeft, centerY - currentPeak - 3, barWidth, 2);
          // 下頂点
          ctx.fillRect(xRight, centerY + currentPeak + 1, barWidth, 2);
          ctx.fillRect(xLeft, centerY + currentPeak + 1, barWidth, 2);
        }

        ctx.fillStyle = gradient;
        ctx.shadowColor = "rgba(16, 185, 129, 0.7)";
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={120}
      className="mx-auto my-6 max-w-full"
    />
  );
};

const FALLBACK_COVER_URL = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80";
const SPOTIFY_TOKEN_KEY = "spotify_access_token";
const SPOTIFY_REFRESH_TOKEN_KEY = "spotify_refresh_token";

const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("spotify_access_token") ||
    localStorage.getItem("spotify_user_token") ||
    null
  );
};

const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("spotify_refresh_token") ||
    localStorage.getItem("spotify_user_refresh_token") ||
    null
  );
};

const saveStoredTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("spotify_access_token", accessToken);
  localStorage.setItem("spotify_user_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("spotify_refresh_token", refreshToken);
    localStorage.setItem("spotify_user_refresh_token", refreshToken);
  }
};

const purgeStoredTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_user_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_user_refresh_token");
};

// 🔑 1. リフレッシュトークンによるアクセストークン自動更新機能 (refreshAccessToken)
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken();
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "387ae192a82d41e4abb7acf114110694";

  if (!refreshToken || !clientId) {
    console.warn("⚠️ Refresh token or Client ID is missing.");
    if (typeof window !== "undefined") {
      purgeStoredTokens();
    }
    return null;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      saveStoredTokens(data.access_token, data.refresh_token);
      console.log("🔑 [Auth Token] Access token successfully refreshed!");
      return data.access_token;
    } else {
      console.error("Failed to refresh access token, status:", response.status);
      purgeStoredTokens();
      return null;
    }
  } catch (err) {
    console.error("Error refreshing access token:", err);
    purgeStoredTokens();
    return null;
  }
};

// 🛡️ 3. API 通信時の 401 エラーハンドリングラッパー (fetchWithAuth)
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let token = getStoredAccessToken();

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  let res = await fetch(url, { ...options, headers });

  // 401 Unauthorized（トークン切れ）を検知した場合
  if (res.status === 401) {
    console.warn("⚠️ 401 Unauthorized detected. Attempting token refresh...");
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = {
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`,
      };
      res = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

  return res;
};

// 👑 Seed Fallback Library
const SEED_LIBRARY: TrackItem[] = [
  {
    uri: "spotify:track:3BIsJjQstI4sY7c1r2mI9i",
    name: "踊り子",
    artist: "Vaundy",
    coverUrl: FALLBACK_COVER_URL,
  },
  {
    uri: "spotify:track:03L1309fOOf8d5C56g9z37",
    name: "SPECIALZ",
    artist: "King Gnu",
    coverUrl: FALLBACK_COVER_URL,
  },
  {
    uri: "spotify:track:1vNvyg2k83K19O3c2b87mI",
    name: "きらり",
    artist: "藤井 風",
    coverUrl: FALLBACK_COVER_URL,
  },
  {
    uri: "spotify:track:18bS7Dk9qL7rL2yS0u41kX",
    name: "フライディ・チャイナタウン",
    artist: "泰葉",
    coverUrl: FALLBACK_COVER_URL,
  },
  {
    uri: "spotify:track:7m12028JmS0927xK188902",
    name: "プラスティック・ラブ",
    artist: "竹内まりや",
    coverUrl: FALLBACK_COVER_URL,
  },
];

// ⏱️ 行動評価（フィードバック）判定ロジック (evaluateUserAction)
const evaluateUserAction = (
  playedSec: number,
  durationMs: number
): { type: FeedbackType; scoreChange: number } => {
  const durationSec = Math.floor(durationMs / 1000);
  const playedRatio = durationSec > 0 ? playedSec / durationSec : 0;

  if (playedSec < 10) {
    return { type: "INSTANT_SKIP", scoreChange: -15 };
  }

  if (playedRatio >= 0.8 || (durationSec > 0 && playedSec >= durationSec - 5)) {
    return { type: "COMPLETED", scoreChange: 10 };
  }

  return { type: "MID_SKIP", scoreChange: -5 };
};

// 🔑 PKCE OAuth Helper Functions
const generateRandomString = (length: number) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const getRedirectUri = () => {
  if (typeof window === "undefined") return "";
  const envUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  if (envUri) {
    try {
      const parsed = new URL(envUri);
      return `${window.location.origin}${parsed.pathname}`;
    } catch {
      return envUri;
    }
  }
  return `${window.location.origin}/callback`;
};

// ⏰ 1. 時間帯ごとの Spotify 音響パラメータ定義 (getTimeBasedParams)
export interface TimeAudioParams {
  timeLabel: string;
  targetEnergy: number;
  targetValence: number;
  targetDanceability: number;
  genres: string[];
}

const PERSISTENT_HISTORY_KEY = "drivetune_played_history_v1";

// 永続化された履歴を取得
const getPersistentPlayedUris = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(PERSISTENT_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

// 新しい再生曲を保存 (直近 200 件まで保持)
const savePersistentPlayedUri = (uri: string) => {
  if (typeof window === "undefined" || !uri) return;
  try {
    const history = getPersistentPlayedUris();
    if (!history.includes(uri)) {
      const updated = [uri, ...history].slice(0, 200); // 最大200曲まで保持
      localStorage.setItem(PERSISTENT_HISTORY_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save played history:", e);
  }
};

// 🎲 2. 時間帯別キーワード ＆ 年代ガチャの定義 (getRandomSearchConfig)
const getRandomSearchConfig = () => {
  const hour = new Date().getHours();

  // 時間帯ごとの多角的な検索テーマ・プール
  const morningPool = [
    { q: "朝 爽やか J-POP", year: "2015-2026", label: "Morning Fresh Hits 🌅" },
    { q: "爽快 ドライブ 名曲", year: "2000-2020", label: "Morning Drive Classics 🌅" },
    { q: "アコースティック 邦楽", year: "2010-2026", label: "Morning Acoustic Chill 🌅" },
    { q: "目覚め ポップス", year: "2018-2026", label: "Morning Wakeup Pop 🌅" },
  ];

  const daytimePool = [
    { q: "ドライブ 鉄板 J-POP", year: "2010-2026", label: "Daytime Drive Hits ☀️" },
    { q: "邦楽 ロック フェス", year: "2005-2025", label: "Daytime Festival Anthem ☀️" },
    { q: "平成 アニメソング 名曲", year: "1998-2015", label: "Daytime Nostalgic Anime ☀️" },
    { q: "令和 ヒットチャート", year: "2020-2026", label: "Daytime Top Hits ☀️" },
    { q: "CMソング 定番", year: "2000-2020", label: "Daytime Commercial Classics ☀️" },
    { q: "ドライブ 洋楽 ポップス", year: "2010-2026", label: "Daytime Global Highway ☀️" },
  ];

  const eveningPool = [
    { q: "夕暮れ エモい J-POP", year: "2015-2026", label: "Evening Emo Sunset 🌆" },
    { q: "シティポップ 定番", year: "1980-2025", label: "Evening City Pop Vibes 🌆" },
    { q: "夜ドライブ 泣ける 名曲", year: "2000-2020", label: "Evening Emotional Drive 🌆" },
    { q: "R&B 邦楽 メロウ", year: "2010-2026", label: "Evening Mellow R&B 🌆" },
  ];

  const nightPool = [
    { q: "深夜ドライブ 定番", year: "2010-2026", label: "Late Night Drive 🌙" },
    { q: "ローファイ チル 邦楽", year: "2018-2026", label: "Late Night Lo-Fi Chill 🌙" },
    { q: "深夜 アコースティック", year: "2000-2025", label: "Late Night Acoustic Lounge 🌙" },
    { q: "夜 アニメ サントラ", year: "2005-2026", label: "Late Night Anime Chill 🌙" },
  ];

  let activePool = daytimePool;
  if (hour >= 5 && hour < 10) activePool = morningPool;
  else if (hour >= 17 && hour < 22) activePool = eveningPool;
  else if (hour < 5 || hour >= 22) activePool = nightPool;

  // プールからランダムに 1 つ選出
  const selected = activePool[Math.floor(Math.random() * activePool.length)];
  return {
    query: `${selected.q} year:${selected.year}`,
    label: selected.label,
    targetEnergy: hour >= 10 && hour < 17 ? 0.8 : 0.5,
  };
};

const getTimeBasedFamousConfig = getRandomSearchConfig;
const getTimeBasedDiscoveryConfig = getRandomSearchConfig;

const getTimeBasedParams = () => {
  const cfg = getRandomSearchConfig();
  return {
    timeLabel: cfg.label,
    genres: ["pop", "j-pop"],
    targetEnergy: cfg.targetEnergy,
    targetValence: 0.6,
    targetDanceability: 0.6,
  };
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 代表的な時代・J-POP定番アーティストのプリセットリスト
const FAMOUS_ERA_ARTISTS = [
  // 令和・最新ヒット
  "Mrs. GREEN APPLE", "YOASOBI", "Vaundy", "Official髭男dism", "Ado", "King Gnu", "藤井 風",
  // 2010年代・ドライブ定番
  "米津玄師", "back number", "あいみょん", "RADWIMPS", "ONE OK ROCK", "[Alexandros]", "UNISON SQUARE GARDEN",
  // 平成・2000年代名曲
  "宇多田ヒカル", "スピッツ", "ポルノグラフィティ", "ASIAN KUNG-FU GENERATIONS", "B'z", "L'Arc-en-Ciel", "Mr.Children",
  // 定番・シティポップ
  "サザンオールスターズ", "山下達郎", "竹内まりや", "椎名林檎",
];

// 内部 API (/api/radio) からその瞬間の曲を1曲取得
const fetchNextTrackOnTheFly = async (): Promise<TrackItem | null> => {
  try {
    const currentHour = new Date().getHours();
    const res = await fetch(`/api/radio?hour=${currentHour}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.tracks && data.tracks.length > 0) {
      const item = data.tracks[0];
      return {
        uri: item.uri,
        name: item.name,
        artist: item.artist,
        coverUrl: item.coverUrl || FALLBACK_COVER_URL,
      };
    }
  } catch (e) {
    console.error("Failed to fetch track from internal API:", e);
  }
  return null;
};

// 📻 2. 内部 API (/api/radio) 連携 ✕ 100% エラーフリー・動的選曲プール生成エンジン
const fetchTimeAdaptiveRadioPool = async (
  _token?: string,
  currentSessionUris: string[] = []
): Promise<{ pool: TrackItem[]; timeLabel: string }> => {
  try {
    const hour = new Date().getHours();
    const persistentHistory = getPersistentPlayedUris();
    const usedUris = new Set<string>([...persistentHistory, ...currentSessionUris]);

    // 1. 時間帯判定とラジオ表示ラベルの選出
    let timeLabel = "Daytime Highway ☀️";
    if (hour >= 5 && hour < 10) timeLabel = "Morning Drive 🌅";
    else if (hour >= 10 && hour < 17) timeLabel = "Daytime Highway ☀️";
    else if (hour >= 17 && hour < 22) timeLabel = "Sunset Twilight 🌆";
    else timeLabel = "Midnight Cruise 🌙";

    console.log(`📻 [On-The-Fly Radio Engine] Active Time Slot: ${timeLabel}`);

    // 2. サーバーサイド API Route (/api/radio) からリアルタイム取得
    const apiRes = await fetch(`/api/radio?hour=${hour}`);
    let apiTracks: TrackItem[] = [];

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.tracks && Array.isArray(data.tracks)) {
        apiTracks = data.tracks.map((t: any) => ({
          uri: t.uri,
          name: t.name,
          artist: t.artist,
          coverUrl: t.coverUrl || FALLBACK_COVER_URL,
        }));
      }
    }

    // 3. ユーザーの愛聴曲・過去曲をバックアップ取得
    let rawUserTracks: any[] = [];
    const [longTopRes, savedRes] = await Promise.all([
      fetchWithAuth("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=20"),
      fetchWithAuth("https://api.spotify.com/v1/me/tracks?limit=20"),
    ]);

    if (longTopRes.ok) rawUserTracks.push(...((await longTopRes.json()).items || []));
    if (savedRes.ok) {
      const savedData = await savedRes.json();
      if (savedData.items) rawUserTracks.push(...savedData.items.map((i: any) => i.track));
    }

    const selectedUser: TrackItem[] = [];
    for (const t of shuffleArray(rawUserTracks)) {
      if (selectedUser.length >= 8) break;
      if (t && t.uri && !usedUris.has(t.uri)) {
        usedUris.add(t.uri);
        selectedUser.push({
          uri: t.uri,
          name: t.name,
          artist: t.artists ? t.artists.map((a: any) => a.name).join(", ") : "Unknown Artist",
          coverUrl: t.album?.images?.[0]?.url || FALLBACK_COVER_URL,
        });
      }
    }

    const finalPool = shuffleArray([...apiTracks, ...selectedUser]);

    console.log(`🌐 [On-The-Fly Pool Built] Total: ${finalPool.length} (API: ${apiTracks.length}, User: ${selectedUser.length})`);

    return {
      pool: finalPool.length > 0 ? finalPool : SEED_LIBRARY,
      timeLabel,
    };
  } catch (err) {
    console.error("Critical error in radio pool builder:", err);
    return { pool: SEED_LIBRARY, timeLabel: "Drive Tune Radio 📻" };
  }
};

const fetchFailSafeRadioPool = fetchTimeAdaptiveRadioPool;
const fetchBulletproofRadioPool = fetchTimeAdaptiveRadioPool;
const fetchDirectSearchRadioPool = fetchTimeAdaptiveRadioPool;
const fetchPublicRadioPool = fetchTimeAdaptiveRadioPool;
const fetchFamousBalancedTrackPool = fetchTimeAdaptiveRadioPool;
const fetch30_35_35TrackPool = fetchTimeAdaptiveRadioPool;
const fetch40_30_30TrackPool = fetchTimeAdaptiveRadioPool;
const fetch60_20_20TrackPool = fetchTimeAdaptiveRadioPool;
const fetchHybridTrackPool = fetchTimeAdaptiveRadioPool;

// 🎵 2. クールダウン（重複・連続再生防止）付き選曲ロジック
const selectNextTrackWithCooldown = (
  pool: TrackItem[],
  historyUris: string[],
  historyArtists: string[]
): TrackItem | null => {
  if (!pool || pool.length === 0) return null;

  const recentUris = historyUris.slice(-15);
  const recentArtists = historyArtists.slice(-2);

  const candidates = pool.filter((track) => {
    const isRecentTrack = recentUris.includes(track.uri);
    const isRecentArtist = recentArtists.includes(track.artist);
    return !isRecentTrack && !isRecentArtist;
  });

  const fallbackCandidates = pool.filter((track) => !recentUris.includes(track.uri));
  const finalPool = candidates.length > 0 ? candidates : (fallbackCandidates.length > 0 ? fallbackCandidates : pool);
  return finalPool[Math.floor(Math.random() * finalPool.length)];
};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export default function RadioPlayer() {
  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [hasRadioStarted, setHasRadioStarted] = useState(false);
  const [isPremiumError, setIsPremiumError] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // 🔇 1. ミュート状態の管理 (isMuted) ＆ Autoplay 解禁待機フラグ
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(true);

  // ⚡ [Autoplay Unlock] 画面タップで音声を解禁
  const handleUnlockAutoplay = async () => {
    if (!playerRef.current) return;
    console.log("⚡ [Autoplay Unlock] User tapped screen. Unlocking audio...");

    try {
      await playerRef.current.resume();
      await playerRef.current.setVolume(0.8);
      setIsAutoplayBlocked(false);
    } catch (err) {
      console.error("Autoplay unlock failed:", err);
      setIsAutoplayBlocked(false);
    }
  };

  // ⚡ 自動再生フラグ ＆ 重複防止ガード (Auto-Start & End Guard)
  const autoStartedRef = useRef(false);
  const isHandlingEndRef = useRef(false);

  // ⏱️ Playback Duration Tracking & AI Feedback Logs State
  const trackStartTimeRef = useRef<number | null>(null);
  const currentTrackUriRef = useRef<string | null>(null);
  const [currentPositionSec, setCurrentPositionSec] = useState<number>(0);
  const currentPositionSecRef = useRef<number>(0);
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([]);

  // 🔁 4. 連続再生防止の徹底 (disableSpotifyRepeat)
  const disableSpotifyRepeat = async (tokenStr?: string, currentDeviceId?: string) => {
    const targetDeviceId = currentDeviceId || deviceId;
    if (!targetDeviceId) return;

    try {
      const res = await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/repeat?state=off&device_id=${targetDeviceId}`,
        { method: "PUT" }
      );
      if (res.ok) {
        console.log("📻 [Radio Setup] Repeat mode disabled.");
      }
    } catch (err) {
      console.error("Failed to disable repeat mode:", err);
    }
  };

  // 2. スキップ時の確実な再生 ＆ リピート回避 (startPlaybackWithTrack)
  const startPlaybackWithTrack = async (trackUri: string, targetDeviceId: string) => {
    try {
      const savedToken = getStoredAccessToken() || token || "";
      await disableSpotifyRepeat(savedToken, targetDeviceId);

      const res = await fetchWithAuth(`https://api.spotify.com/v1/me/player/play?device_id=${targetDeviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackUri] }),
      });

      if (!res.ok) {
        console.warn("Playback request failed, attempting SDK resume fallback...");
        if (playerRef.current && typeof playerRef.current.resume === "function") {
          await playerRef.current.resume();
        }
      }
    } catch (err) {
      console.error("Failed to start playback:", err);
    }
  };

  // Personalized Hybrid Track Pool & Cooldown History
  const [trackPool, setTrackPool] = useState<TrackItem[]>(SEED_LIBRARY);
  const [activeTimeLabel, setActiveTimeLabel] = useState<string>("Radio Stream 📻");
  const [historyUris, setHistoryUris] = useState<string[]>([]);
  const [historyArtists, setHistoryArtists] = useState<string[]>([]);
  const [playedUris, setPlayedUris] = useState<string[]>([]);
  const [upcomingUris, setUpcomingUris] = useState<string[]>([]);

  // 🎵 1. 再生済み履歴管理の強化 (Set & Ref の導入)
  const queuedUrisSetRef = useRef<Set<string>>(new Set()); // Spotify キューに追加済みのURI
  const playedHistoryRef = useRef<Set<string>>(new Set()); // 長期的な再生履歴 (Recommendations排除用)
  const isFillingQueueRef = useRef(false);

  // 🔄 プール再取得時の呼び出しロジック (refreshPool)
  const refreshPool = async (customPlayedUris: string[] = playedUris) => {
    const savedToken = getStoredAccessToken() || token;
    if (!savedToken) return;

    const { pool: newPool, timeLabel } = await fetch30_35_35TrackPool(savedToken, customPlayedUris);
    setTrackPool(newPool);
    setActiveTimeLabel(timeLabel);
    console.log("📻 [Pool Refreshed 30:35:35] New track pool loaded excluding played URIs.");
  };

  // 🎵 Dynamic Shuffle ✕ Pre-loading Queue エンジンの実装 (maintainRadioQueue)
  const maintainRadioQueue = async (currentDeviceId: string) => {
    if (isFillingQueueRef.current || !currentDeviceId) return;
    isFillingQueueRef.current = true;

    try {
      const savedToken = getStoredAccessToken() || token;
      if (!savedToken) return;

      // ヘルパー: Spotify キューに追加
      const addToSpotifyQueue = async (trackUri: string) => {
        try {
          const res = await fetchWithAuth(
            `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}&device_id=${currentDeviceId}`,
            { method: "POST" }
          );
          if (res.ok) {
            console.log(`📻 [Queue Added]: ${trackUri}`);
            return true;
          }
        } catch (err) {
          console.error("Failed to add track to Spotify queue:", err);
        }
        return false;
      };

      // --- Dynamic Shuffle: アプリ側のキューの維持・補充 (目標: 常時 8曲キープ) ---
      let currentUpcomingUris = [...upcomingUris];

      if (currentUpcomingUris.length < 5) {
        console.log(`📻 [Dynamic Shuffle] Upcoming queue is low (${currentUpcomingUris.length} tracks). Refilling...`);
        const { pool: newPool } = await fetch30_35_35TrackPool(
          savedToken,
          Array.from(queuedUrisSetRef.current)
        );
        const shuffledNewUris = shuffleArray(newPool.map((t) => t.uri));
        currentUpcomingUris = [...currentUpcomingUris, ...shuffledNewUris];
      }

      // Fisher-Yates アルゴリズムでアプリ側のキュー全体を動的にシャッフル
      currentUpcomingUris = shuffleArray(currentUpcomingUris);
      setUpcomingUris(currentUpcomingUris);

      // --- Pre-loading Queue: Spotify側のキューの事前補充 (目標: Spotify側に常時 3曲待機) ---
      let addedCount = 0;
      for (const uri of currentUpcomingUris) {
        if (addedCount >= 3) break;

        // すでにキューに入れた曲はスキップ
        if (queuedUrisSetRef.current.has(uri)) continue;

        const success = await addToSpotifyQueue(uri);
        if (success) {
          queuedUrisSetRef.current.add(uri);
          addedCount++;
        }
      }
    } catch (err) {
      console.error("Error maintaining upcoming queue:", err);
    } finally {
      isFillingQueueRef.current = false;
    }
  };

  const maintainUpcomingQueue = maintainRadioQueue;

  // 📺 画面表示（UI）の 100% 受動同期 (player_state_changed のみで更新)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingState>({
    uri: SEED_LIBRARY[0].uri,
    title: SEED_LIBRARY[0].name,
    artist: SEED_LIBRARY[0].artist,
    coverUrl: SEED_LIBRARY[0].coverUrl,
    durationMs: 0,
    positionMs: 0,
    isPaused: true,
  });

  const [isPlaying, setIsPlaying] = useState(false);

  // シングルトン playerRef 管理
  const playerRef = useRef<any>(null);
  const initSpotifyPlayerRef = useRef<(() => Promise<void>) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // 🛡️ Mount Check & Access Token Initialization
  useEffect(() => {
    setIsMounted(true);

    const savedToken = getStoredAccessToken();
    if (savedToken) {
      setToken(savedToken);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const codeVerifier =
        localStorage.getItem("spotify_code_verifier") ||
        localStorage.getItem("drivetuner_code_verifier");
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "387ae192a82d41e4abb7acf114110694";
      const redirectUri = localStorage.getItem("spotify_redirect_uri") || getRedirectUri();

      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier || "",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            saveStoredTokens(data.access_token, data.refresh_token);
            setToken(data.access_token);
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log("🔑 [Spotify PKCE Auth] Access & Refresh tokens successfully exchanged!");
          } else {
            console.warn("⚠️ Spotify Token Exchange Failed:", data);
          }
        })
        .catch((err) => {
          console.error("❌ Spotify Token Exchange Error:", err);
        });
    }
  }, []);

  // ⚡ 2. 起動時の前回の曲の自動再生再開 (Resume) ＆ 画面どこでもタップで解禁
  useEffect(() => {
    if (!isMounted) return;

    const attemptAutoPlay = async () => {
      const effectiveDeviceId = deviceId || (typeof window !== "undefined" ? (window as any)._lastKnownDeviceId : null);
      if (autoStartedRef.current || !effectiveDeviceId) return;

      const savedToken = getStoredAccessToken() || token;
      if (!savedToken) return;

      autoStartedRef.current = true;
      console.log("📻 [Auto-Radio] 起動。前回のセッションを確認中...");

      try {
        const { pool, timeLabel } = await fetch40_30_30TrackPool(savedToken);
        setTrackPool(pool);
        setActiveTimeLabel(timeLabel);

        if (playerRef.current && typeof playerRef.current.activateElement === "function") {
          await playerRef.current.activateElement();
        }

        if (playerRef.current && typeof playerRef.current.getCurrentState === "function") {
          const state = await playerRef.current.getCurrentState();

          if (state && state.track_window?.current_track) {
            console.log("📻 [Auto-Radio] 前回の曲から再生を再開します:", state.track_window.current_track.name);
            await playerRef.current.resume();
            setHasRadioStarted(true);
            setIsPremiumError(false);
            maintainUpcomingQueue(effectiveDeviceId);
            return;
          }
        }

        if (pool.length > 0) {
          const firstTrack = pool[0];
          setHistoryUris([firstTrack.uri]);
          setHistoryArtists([firstTrack.artist]);
          setPlayedUris([firstTrack.uri]);

          await startPlaybackWithTrack(firstTrack.uri, effectiveDeviceId);
          console.log(`🟢 [Auto-Radio] 新規トラックの再生がスタートしました: ${firstTrack.name}`);
          setHasRadioStarted(true);
          setIsPremiumError(false);
          maintainUpcomingQueue(effectiveDeviceId);
        }
      } catch (err) {
        console.warn("⚠️ Autoplay blocked by browser. Waiting for first user click...");
      }
    };

    attemptAutoPlay();

    // 画面のどこかを1回でもタップしたら自動起動するアンロック保険
    const handleFirstInteraction = () => {
      if (!autoStartedRef.current && deviceId) {
        attemptAutoPlay();
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [isMounted, deviceId, token]);

  // 🔑 Login Redirect Handler
  const handleLogin = async () => {
    if (typeof window === "undefined") return;

    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    window.localStorage.setItem("spotify_code_verifier", codeVerifier);
    window.localStorage.setItem("drivetuner_code_verifier", codeVerifier);

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "387ae192a82d41e4abb7acf114110694";
    const redirectUri = getRedirectUri();
    window.localStorage.setItem("spotify_redirect_uri", redirectUri);

    const scopeList = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-modify-playback-state",
      "user-read-playback-state",
      "user-library-read",
      "user-top-read",
    ];

    const scopeParam = scopeList.join(" ");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scopeParam,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
      show_dialog: "true",
    });

    // Enforce %20 encoding for scope spaces according to Spotify OAuth spec
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString().replace(/\+/g, "%20")}`;

    console.log("🔑 [Spotify Auth Redirect] Client ID:", clientId);
    console.log("🔗 [Spotify Auth Redirect] Redirect URI:", redirectUri);
    console.log("🌐 [Spotify Auth Redirect] Authorize URL:", authUrl);

    window.location.href = authUrl;
  };

  // 🔇 3. スマホ対応ミュート（Pause/Resume フォールバック）(handleToggleMute)
  const handleToggleMute = async () => {
    if (!playerRef.current) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    try {
      // 1. まず標準の setVolume を試行
      await playerRef.current.setVolume(newMutedState ? 0 : 0.8);

      // 2. モバイルブラウザ対策: ミュート時は一時停止、解除時は再生再開でフォールバック
      if (newMutedState) {
        await playerRef.current.pause();
      } else {
        await playerRef.current.resume();
      }
      console.log(`📻 [Radio Volume] ${newMutedState ? "Muted (Paused)" : "Unmuted (Resumed)"}`);
    } catch (err) {
      console.error("Mute toggle failed:", err);
    }
  };

  // ⚡ 視覚的フィードバックフラグ ＆ 全画面タップスキップ
  const [isFlashing, setIsFlashing] = useState(false);

  // 手動スキップボタンを押した時だけ明示的に nextTrack() を呼ぶ
  const handleSkip = async () => {
    if (!playerRef.current) return;

    // 視覚的フィードバック (150msだけ画面を軽く発光させる)
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    try {
      console.log("⏭️ [Full Screen Tap] Fast-skipping to next track...");
      if (typeof playerRef.current.nextTrack === "function") {
        await playerRef.current.nextTrack();
      } else {
        await fetchWithAuth("https://api.spotify.com/v1/me/player/next", { method: "POST" });
      }
    } catch (err) {
      console.error("Failed to skip using pre-loaded queue:", err);
    }
  };

  const handleManualSkip = handleSkip;

  // 🌟 曲が新しく再生開始されたタイミングで常にキュー補充チェック ＆ 日またぎ履歴保存
  useEffect(() => {
    const effectiveDeviceId = deviceId || (typeof window !== "undefined" ? (window as any)._lastKnownDeviceId : null);
    if (nowPlaying?.id && effectiveDeviceId) {
      if (nowPlaying.uri) {
        queuedUrisSetRef.current.add(nowPlaying.uri);
        playedHistoryRef.current.add(nowPlaying.uri);
        savePersistentPlayedUri(nowPlaying.uri);
      }
      console.log(`🎵 [Track Changed] Now playing: ${nowPlaying.title}. Maintaining queue...`);
      maintainRadioQueue(effectiveDeviceId);
    }
  }, [nowPlaying?.id, deviceId]);

  const handleStartRadio = async () => {
    let effectiveDeviceId = deviceId || (typeof window !== "undefined" ? (window as any)._lastKnownDeviceId : null);
    const savedToken = getStoredAccessToken() || token;

    if (!savedToken) {
      console.warn("⚠️ No access token available. Redirecting to login...");
      handleLogin();
      return;
    }

    // Player/Device ID 未準備時は自動再接続
    if (!playerRef.current || !effectiveDeviceId) {
      console.log("📻 Player or Device ID not ready yet. Re-initializing Spotify Web SDK...");
      if (typeof window !== "undefined" && window.Spotify && window.Spotify.Player && initSpotifyPlayerRef.current) {
        initSpotifyPlayerRef.current();
        await new Promise((resolve) => setTimeout(resolve, 1500));
        effectiveDeviceId = deviceId || (typeof window !== "undefined" ? (window as any)._lastKnownDeviceId : null);
      }
    }

    if (!playerRef.current || !effectiveDeviceId) {
      console.warn("⚠️ Player or Device ID could not be initialized.");
      return;
    }

    try {
      console.log("📻 [Radio Start] User clicked to start playback...");

      if (typeof playerRef.current.activateElement === "function") {
        await playerRef.current.activateElement();
      }

      setHasRadioStarted(true);

      // 1. Check if already playing or paused in SDK state
      if (typeof playerRef.current.getCurrentState === "function") {
        const state = await playerRef.current.getCurrentState();
        if (state && state.track_window?.current_track) {
          console.log("📻 [Radio Start] Resuming existing track:", state.track_window.current_track.name);
          await playerRef.current.resume();
          maintainUpcomingQueue(effectiveDeviceId);
          return;
        }
      }

      // 2. Initial track selection & playback start
      let pool = trackPool;
      if (!pool || pool.length === 0) {
        const { pool: newPool } = await fetch40_30_30TrackPool(savedToken, playedUris);
        pool = newPool;
        setTrackPool(newPool);
      }

      const firstTrack = pool[0] || SEED_LIBRARY[0];
      console.log(`📻 [Radio Start] Starting initial track: ${firstTrack.name} by ${firstTrack.artist}`);
      setHistoryUris([firstTrack.uri]);
      setHistoryArtists([firstTrack.artist]);
      setPlayedUris([firstTrack.uri]);

      await startPlaybackWithTrack(firstTrack.uri, effectiveDeviceId);
      await maintainUpcomingQueue(effectiveDeviceId);
    } catch (err) {
      console.error("Failed to start radio playback:", err);
    }
  };

  // 📺 ⏱️ 経過時間更新 ＆ 画面表示（UI）の 100% 受動同期 (player_state_changed 監視)
  useEffect(() => {
    if (!isMounted || !token) return;

    const initSpotifyPlayer = async () => {
      if (playerRef.current) return;

      console.log("🔑 [SDK Pre-Init] Spotify SDK Ready. Verifying token freshness...");
      let validToken = localStorage.getItem("spotify_access_token") || getStoredAccessToken();

      if (!validToken) {
        console.log("🔑 [SDK Pre-Init] No token found, attempting refresh...");
        validToken = await refreshAccessToken();
      } else {
        console.log("🔑 [SDK Pre-Init] desperate refresh token to ensure fresh...");
        validToken = await refreshAccessToken();
      }

      if (!validToken) {
        console.warn("⚠️ [SDK Pre-Init] Desperate token refresh failed. User needs re-login.");
        handleLogin();
        return;
      }

      console.log("🔑 [SDK Pre-Init] desperate Token refresh success, initializing player...");

      const player = new window.Spotify.Player({
        name: "DriveTune Driver Mode Player",
        getOAuthToken: async (cb: (t: string) => void) => {
          let currentToken = localStorage.getItem("spotify_access_token") || getStoredAccessToken();
          if (!currentToken) currentToken = await refreshAccessToken();
          if (currentToken) cb(currentToken);
        },
        volume: 0, // 🌟 起動時は音量0でAutoplayブロックを回避
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("🟢 Spotify Player Ready. Device ID:", device_id);
        if (typeof window !== "undefined") {
          (window as any)._lastKnownDeviceId = device_id;
        }
        setDeviceId(device_id);
        // 🌟 Autoplay解禁のためにタップオーバーレイを表示
        setIsAutoplayBlocked(true);
      });

      player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.warn("⚠️ [Spotify Web SDK] Device is offline:", device_id);
      });

      // 📺 player_state_changed 内での自動送り制御 ＆ 受動同期
      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;

        const currentTrack = state.track_window?.current_track;
        if (currentTrack) {
          if (currentTrackUriRef.current !== currentTrack.uri && !state.paused) {
            currentTrackUriRef.current = currentTrack.uri;
            trackStartTimeRef.current = Date.now();
          }

          const posSec = trackStartTimeRef.current
            ? Math.floor((Date.now() - trackStartTimeRef.current) / 1000)
            : Math.floor(state.position / 1000);

          setCurrentPositionSec(posSec);
          currentPositionSecRef.current = posSec;

          const trackId = currentTrack.id || (currentTrack.uri ? currentTrack.uri.split(":")[2] : null);

          setNowPlaying({
            id: trackId || undefined,
            uri: currentTrack.uri,
            title: currentTrack.name,
            artist: currentTrack.artists.map((a: any) => a.name).join(", "),
            coverUrl: currentTrack.album?.images?.[0]?.url || FALLBACK_COVER_URL,
            durationMs: state.duration,
            positionMs: state.position,
            isPaused: state.paused,
          });

          setIsPlaying(!state.paused);

          // --- 曲遷移ロジックの改修 ---
          const isEnded = state.position === 0 && state.paused && state.track_window?.previous_tracks?.length > 0;
          if (isEnded) {
            console.log("📻 [Auto-Radio] Track finished. Waiting for Spotify's native queue to take over.");
          }
        }
      });

      player.addListener("initialization_error", ({ message }: any) => {
        console.error("❌ Spotify SDK Init Error:", message);
      });

      player.addListener("authentication_error", async ({ message }: any) => {
        console.error("❌ Spotify Auth Error (Expired token):", message);
        console.log("🔄 Attempting automatic re-authentication due to auth error...");

        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log("🟢 Token refreshed! Re-initializing Spotify Player with fresh token...");
          setToken(newToken);
          if (playerRef.current && typeof playerRef.current.disconnect === "function") {
            try {
              playerRef.current.disconnect();
            } catch (e) {}
            playerRef.current = null;
          }
          setTimeout(() => {
            initSpotifyPlayerRef.current?.();
          }, 300);
        } else {
          purgeStoredTokens();
          setToken(null);
          setHasRadioStarted(false);
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }
      });

      player.addListener("account_error", ({ message }: any) => {
        console.error("❌ Spotify Account Error (Requires Spotify Premium):", message);
        setIsPremiumError(true);
      });

      player.connect();
    };

    initSpotifyPlayerRef.current = initSpotifyPlayer;

    const loadSDK = () => {
      if (window.Spotify && window.Spotify.Player) {
        initSpotifyPlayer();
        return;
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        initSpotifyPlayer();
      };

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    };

    loadSDK();

    return () => {
      if (playerRef.current && typeof playerRef.current.disconnect === "function") {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isMounted, token]);



  // 🎵 Web Audio API AnalyserNode Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // AudioContext & Analyser の初期化
  const setupAudioAnalyser = (mediaStreamOrAudioEl: HTMLAudioElement) => {
    if (analyserRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();

      analyser.fftSize = 64; // バーの数に合わせた解像度 (32の周波数ビン)
      analyser.smoothingTimeConstant = 0.8; // 動きの滑らかさ

      const source = audioCtx.createMediaElementSource(mediaStreamOrAudioEl);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      console.log("🎵 [Web Audio API] AnalyserNode initialized successfully.");
    } catch (err) {
      console.warn("⚠️ setupAudioAnalyser warning:", err);
    }
  };

  // 🌊 Web Audio API (AnalyserNode) ＆ シンメトリー（左右対称）波形のリアルタイム描画 (requestAnimationFrame)
  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stepCounter = 0;

    const renderFrame = () => {
      animationFrameId = requestAnimationFrame(renderFrame);
      stepCounter += 0.05;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // バーの数（片側16本 ➔ 左右合計32本）
      const barCount = 16;
      const barWidth = 4;
      const barGap = 6;
      const centerX = width / 2;

      let dataArray: Uint8Array | null = null;
      if (analyserRef.current && isPlaying && !isMuted) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        (analyserRef.current.getByteFrequencyData as any)(dataArray);
      }

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;

        if (dataArray && dataArray[i] !== undefined) {
          const value = dataArray[i] || 0;
          const percent = value / 255;
          barHeight = Math.max(4, percent * (height * 0.8));
        } else if (isPlaying && !isMuted) {
          const noise = Math.sin(stepCounter + i * 0.3) * Math.cos(stepCounter * 0.7 + i * 0.2);
          barHeight = Math.max(4, Math.abs(noise) * (height * 0.75) + 4);
        }

        const xOffset = i * (barWidth + barGap);

        // ネオンカラーグラデーション (Spotify Green #1DB954 ➔ Deep Blue #1E3A8A)
        const gradient = ctx.createLinearGradient(0, (height - barHeight) / 2, 0, (height + barHeight) / 2);
        gradient.addColorStop(0, "#1DB954");
        gradient.addColorStop(0.5, "#34D399");
        gradient.addColorStop(1, "#1E3A8A");
        ctx.fillStyle = gradient;

        // 右側の描画 (roundRect)
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(centerX + xOffset, (height - barHeight) / 2, barWidth, barHeight, 2);
          ctx.fill();

          // 左側の描画 (シンメトリー)
          ctx.beginPath();
          ctx.roundRect(centerX - xOffset - barWidth, (height - barHeight) / 2, barWidth, barHeight, 2);
          ctx.fill();
        } else {
          ctx.fillRect(centerX + xOffset, (height - barHeight) / 2, barWidth, barHeight);
          ctx.fillRect(centerX - xOffset - barWidth, (height - barHeight) / 2, barWidth, barHeight);
        }
      }
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted, isPlaying, isMuted]);

  // 🔑 Sleek Spotify Premium Login Overlay
  if (!token) {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 pointer-events-none" />
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="w-28 h-28 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(16,185,129,0.5)]">
            <span className="text-5xl">💚</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              DriveTuner Radio
            </h1>
            <p className="text-sm sm:text-base text-emerald-400 font-semibold tracking-wide">
              本物のメジャー J-POP をクリアにストリーミング
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-4 px-8 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-extrabold rounded-full text-base shadow-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-3"
          >
            <span>Spotify Premium でログイン</span>
            <span className="text-xl">🎵</span>
          </button>

          <p className="text-xs text-zinc-500">
            ※ Spotify Web Playback SDK の再生には Spotify Premium アカウントが必要です
          </p>
        </div>
      </main>
    );
  }

  // 🔇 3. ブラウザ自動再生ブロック（Autoplay Policy）対策のフォールバック
  if (!hasRadioStarted) {
    return (
      <main
        onClick={handleStartRadio}
        className="relative w-screen h-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center p-6 select-none font-sans cursor-pointer"
      >
        <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 pointer-events-none" />
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="w-28 h-28 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(16,185,129,0.5)]">
            <span className="text-5xl">📻</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              ラジオを聴く (タップして起動) 📻
            </h2>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wider">
              タップして高音質 J-POP ラジオストリーミングを開始します
            </p>
          </div>

          <button className="w-full py-4 px-8 bg-white text-black hover:bg-neutral-200 active:scale-95 font-extrabold rounded-full text-base shadow-2xl transition-all duration-200 cursor-pointer">
            タップして再生を開始
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-black text-white flex flex-col justify-between items-center py-8 px-6 select-none font-sans cursor-pointer"
      onClick={handleManualSkip}
    >
      {/* ⚡ タップ時の視覚フィードバック (150msだけ画面を一瞬軽発光させる) */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 bg-white/20 pointer-events-none transition-opacity duration-100" />
      )}

      {/* 🌟 UI の最上部に Autoplay 解禁オーバーレイを追加 */}
      {isAutoplayBlocked && deviceId && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={(e) => {
            e.stopPropagation();
            handleUnlockAutoplay();
          }}
        >
          <div className="text-center p-8 backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 max-w-sm shadow-2xl animate-pulse space-y-4">
            <div className="text-6xl mb-2">📻</div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ラジオ起動
            </div>
            <div className="text-sm text-emerald-400 font-semibold leading-relaxed">
              ドライブモードを開始するために、<br />画面をタップしてください 🚗💨
            </div>
          </div>
        </div>
      )}

      {/* ⏰ Time-Based Radio Mood Badge */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 bg-black/60 border border-emerald-500/30 text-emerald-300 rounded-full text-xs sm:text-sm font-bold shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>{activeTimeLabel}</span>
      </div>

      {/* ⚠️ 403 Premium / Device Warning Toast */}
      {isPremiumError && (
        <div className="fixed top-4 z-50 px-6 py-3 bg-rose-500/90 border border-rose-400 text-white rounded-full text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md animate-bounce pointer-events-none">
          ⚠️ 403 Error: Spotify Premium アカウント、またはアクティブなデバイス許可が必要です。再ログインをお試しください。
        </div>
      )}

      {/* 🖼️ Background: Fullscreen Album Artwork with backdrop-filter: blur(24px) & Dark Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 filter blur-[24px] opacity-40 pointer-events-none"
        style={{ backgroundImage: `url(${nowPlaying.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 pointer-events-none" />

      {/* 🎛️ 1. TOP SECTION: Action Guide & Sub-control */}
      <div className="relative z-10 w-full max-w-md flex justify-between items-center pt-2 px-2 pointer-events-none">
        <div className="text-xs uppercase tracking-widest text-emerald-400/80 font-bold">
          画面のどこでもタップでスキップ ⏭️
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleMute();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 transition active:scale-95 backdrop-blur-md rounded-full border text-xs font-bold shadow-xl cursor-pointer pointer-events-auto ${
            isMuted
              ? "bg-rose-500/20 border-rose-400/50 text-rose-300 hover:bg-rose-500/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
        >
          <span className="text-base">{isMuted ? "🔇" : "🔊"}</span>
          <span>{isMuted ? "消音中" : "音声ON"}</span>
        </button>
      </div>

      {/* 2. CENTER SECTION: 巨大アルバムアート ＆ リアルタイム波形 */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-2 space-y-4 pointer-events-none">
        {/* 巨大アルバムアート */}
        <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl shadow-2xl overflow-hidden border border-white/15 transition-transform duration-500">
          {nowPlaying.coverUrl ? (
            <img
              src={nowPlaying.coverUrl}
              alt={nowPlaying.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center text-5xl">
              📻
            </div>
          )}
        </div>

        {/* 60fps 波形 */}
        <div className="w-full flex justify-center">
          <FluidOrganicEqualizer isPlaying={isPlaying && !isMuted} />
        </div>
      </div>

      {/* 3. CENTER-LOWER SECTION: Track Metadata */}
      <div className="relative z-10 text-center space-y-2 mb-20 transition-all duration-300 transform max-w-md px-4 pointer-events-none">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg text-white line-clamp-1">
          {nowPlaying.title || "ラジオを準備中..."}
        </h1>
        <p className="text-base sm:text-xl text-emerald-400 font-bold tracking-wide line-clamp-1">
          {nowPlaying.artist || "画面をタップして開始"}
        </p>
      </div>

      {/* 4. BOTTOM SECTION: ガラスモフィズムコントロール ＆ 巨大スキップタップ領域 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-50 pointer-events-auto">
        <div className="max-w-md mx-auto relative backdrop-blur-xl bg-black/40 rounded-3xl border border-white/10 p-5 flex items-center justify-between shadow-2xl overflow-hidden">
          {/* 左側: 曲情報 ＆ 再生タイマー */}
          <div className="flex items-center gap-3 overflow-hidden z-20 pointer-events-none">
            {nowPlaying.coverUrl ? (
              <img
                src={nowPlaying.coverUrl}
                alt={nowPlaying.title}
                className="w-12 h-12 rounded-xl object-cover shadow-lg border border-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl flex-shrink-0">
                🎵
              </div>
            )}
            <div className="overflow-hidden text-left">
              <p className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[220px]">
                {nowPlaying.title}
              </p>
              <p className="text-xs text-emerald-400/90 font-medium truncate max-w-[180px] sm:max-w-[220px]">
                {nowPlaying.artist} ({currentPositionSec}s)
              </p>
            </div>
          </div>

          {/* 右側: ミュート切替 ＆ スキップ表示アイコン */}
          <div className="flex items-center gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMute();
              }}
              className={`p-3 rounded-full border text-base font-bold shadow-lg transition active:scale-95 cursor-pointer pointer-events-auto ${
                isMuted
                  ? "bg-rose-500/30 border-rose-400 text-rose-300"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
              title={isMuted ? "消音解除" : "消音"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <div className="p-3 bg-white text-black rounded-full font-bold text-base shadow-xl flex items-center justify-center pointer-events-none">
              ⏭
            </div>
          </div>

          {/* 透明スキップタップ領域 (下部パネル内) */}
          <div
            className="absolute inset-0 cursor-pointer active:bg-white/10 transition-colors rounded-3xl z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            title="画面下部をタップでスキップ (ドライブモード)"
          />
        </div>
      </div>
    </main>
  );
}
