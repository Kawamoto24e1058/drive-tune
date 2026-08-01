"use client";

import React, { useEffect, useRef, useState } from "react";

// 🎵 Spotify Track Item Definition
export interface TrackItem {
  uri: string;
  name: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
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
  return window.location.origin.replace(/\/$/, "");
};

// 🎵 1. 未知の曲 ＋ お気に入り曲のハイブリッド取得 (fetchHybridTrackPool)
const fetchHybridTrackPool = async (token: string): Promise<TrackItem[]> => {
  try {
    const favRes = await fetch("https://api.spotify.com/v1/me/tracks?limit=20", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (favRes.status === 401 || favRes.status === 403) {
      console.warn("⚠️ Spotify token expired or missing scope. Clearing token...");
      localStorage.removeItem(SPOTIFY_TOKEN_KEY);
      if (typeof window !== "undefined") window.location.reload();
      return SEED_LIBRARY;
    }

    let favTracks: TrackItem[] = [];

    if (favRes.ok) {
      const favData = await favRes.json();
      if (favData.items && favData.items.length > 0) {
        favTracks = favData.items.map((item: any) => ({
          uri: item.track.uri,
          name: item.track.name,
          artist: item.track.artists.map((a: any) => a.name).join(", "),
          artistId: item.track.artists[0]?.id,
          coverUrl: item.track.album.images[0]?.url || FALLBACK_COVER_URL,
        }));
      }
    }

    let recommendedTracks: TrackItem[] = [];
    const searchQueries = ["Vaundy", "YOASOBI", "King Gnu", "Fujii Kaze", "Official髭男dism"];
    const randomArtist = searchQueries[Math.floor(Math.random() * searchQueries.length)];

    console.log(`🔍 [Discovery Search] Fetching recommended tracks for: "${randomArtist}"`);
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(randomArtist)}&type=track&limit=15`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.tracks && searchData.tracks.items?.length > 0) {
        recommendedTracks = searchData.tracks.items.map((item: any) => ({
          uri: item.uri,
          name: item.name,
          artist: item.artists.map((a: any) => a.name).join(", "),
          artistId: item.artists[0]?.id,
          coverUrl: item.album.images[0]?.url || FALLBACK_COVER_URL,
        }));
      }
    }

    const combined = [...favTracks, ...recommendedTracks];
    console.log(`📻 [Track Pool Created] Total: ${combined.length} tracks (Fav: ${favTracks.length}, Rec: ${recommendedTracks.length})`);

    return combined.length > 0 ? combined.sort(() => Math.random() - 0.5) : SEED_LIBRARY;
  } catch (err) {
    console.error("❌ Failed to fetch hybrid track pool:", err);
    return SEED_LIBRARY;
  }
};

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

  // 🔇 1. ミュート状態の管理 (isMuted)
  const [isMuted, setIsMuted] = useState(false);

  // ⚡ 自動再生フラグ ＆ 重複防止ガード (Auto-Start & End Guard)
  const autoStartedRef = useRef(false);
  const isHandlingEndRef = useRef(false);

  // ⏱️ Playback Duration Tracking & AI Feedback Logs State
  const trackStartTimeRef = useRef<number | null>(null);
  const currentTrackUriRef = useRef<string | null>(null);
  const [currentPositionSec, setCurrentPositionSec] = useState<number>(0);
  const currentPositionSecRef = useRef<number>(0);
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([]);

  // 🔁 1. Spotify リピートモードの強制解除 (disableSpotifyRepeat)
  const disableSpotifyRepeat = async (authToken: string) => {
    try {
      await fetch("https://api.spotify.com/v1/me/player/repeat?state=off", {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("📻 [Radio Setup] Repeat mode disabled.");
    } catch (err) {
      console.warn("Failed to disable repeat mode:", err);
    }
  };

  // 2. スキップ時の確実な再生 ＆ リピート回避 (startPlaybackWithTrack)
  const startPlaybackWithTrack = async (trackUri: string, targetDeviceId: string) => {
    const savedToken = localStorage.getItem(SPOTIFY_TOKEN_KEY) || token;
    if (!savedToken) return;

    try {
      // リピート設定を OFF にリセット
      await disableSpotifyRepeat(savedToken);

      // デバイスIDを明示して再生命令を送信
      const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${targetDeviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${savedToken}`,
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
  const [historyUris, setHistoryUris] = useState<string[]>([]);
  const [historyArtists, setHistoryArtists] = useState<string[]>([]);

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // 🛡️ Mount Check for Hydration Guarantee
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🔑 PKCE Code Exchange & Access Token Load
  useEffect(() => {
    if (!isMounted) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const codeVerifier = localStorage.getItem("spotify_code_verifier");
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "387ae192a82d41e4abb7acf114110694";
      const redirectUri = getRedirectUri();

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
            localStorage.setItem(SPOTIFY_TOKEN_KEY, data.access_token);
            setToken(data.access_token);
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log("🔑 [Spotify PKCE Auth] Access token successfully exchanged!");
          } else {
            console.warn("⚠️ Spotify Token Exchange Failed:", data);
          }
        })
        .catch((err) => {
          console.error("❌ Spotify Token Exchange Error:", err);
        });
    } else {
      const savedToken = localStorage.getItem(SPOTIFY_TOKEN_KEY);
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, [isMounted]);

  // ⚡ 2. 起動時の前回の曲の自動再生再開 (Resume) ＆ 画面どこでもタップで解禁
  useEffect(() => {
    if (!isMounted) return;

    const attemptAutoPlay = async () => {
      if (autoStartedRef.current || !deviceId) return;

      const savedToken = localStorage.getItem(SPOTIFY_TOKEN_KEY) || token;
      if (!savedToken) return;

      autoStartedRef.current = true;
      console.log("📻 [Auto-Radio] 起動。前回のセッションを確認中...");

      try {
        // トラックプールをあらかじめ準備
        const pool = await fetchHybridTrackPool(savedToken);
        setTrackPool(pool);

        if (playerRef.current && typeof playerRef.current.activateElement === "function") {
          await playerRef.current.activateElement();
        }

        // 前回の再生状態（トラック情報）が存在するかチェック
        if (playerRef.current && typeof playerRef.current.getCurrentState === "function") {
          const state = await playerRef.current.getCurrentState();

          if (state && state.track_window?.current_track) {
            console.log("📻 [Auto-Radio] 前回の曲から再生を再開します:", state.track_window.current_track.name);
            await playerRef.current.resume();
            setHasRadioStarted(true);
            setIsPremiumError(false);
            return;
          }
        }

        // 前回の状態がない場合（初回起動時等）のみ新曲を再生
        if (pool.length > 0) {
          const randomIndex = Math.floor(Math.random() * pool.length);
          const firstTrack = pool[randomIndex];
          setHistoryUris([firstTrack.uri]);
          setHistoryArtists([firstTrack.artist]);

          // 1. Transfer Playback
          await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${savedToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              device_ids: [deviceId],
              play: true,
            }),
          });

          // 2. Play first track with repeat disabled
          await startPlaybackWithTrack(firstTrack.uri, deviceId);
          console.log(`🟢 [Auto-Radio] 新規トラックの再生がスタートしました: ${firstTrack.name}`);
          setHasRadioStarted(true);
          setIsPremiumError(false);
        }
      } catch (err) {
        console.warn("⚠️ Autoplay blocked by browser. Waiting for first user touch...");
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

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "387ae192a82d41e4abb7acf114110694";
    const redirectUri = getRedirectUri();

    const scope = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-modify-playback-state",
      "user-read-playback-state",
      "user-library-read",
      "user-top-read",
    ].join(" ");

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.search = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scope,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
      show_dialog: "true",
    }).toString();

    window.location.href = authUrl.toString();
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

  // ⏭️ 安全なスキップ処理 (handleSkip)
  const handleSkip = async () => {
    try {
      if (nowPlaying && nowPlaying.title && nowPlaying.durationMs > 0) {
        let playedSec = 0;
        if (trackStartTimeRef.current) {
          playedSec = Math.floor((Date.now() - trackStartTimeRef.current) / 1000);
        } else {
          playedSec = currentPositionSecRef.current || currentPositionSec;
        }

        const evalResult = evaluateUserAction(playedSec, nowPlaying.durationMs);

        console.log(`🧠 [AI Feedback Log]
          曲名: ${nowPlaying.title}
          実再生時間: ${playedSec}秒
          判定: ${evalResult.type} (${evalResult.scoreChange > 0 ? "+" : ""}${evalResult.scoreChange}pt)
        `);

        setFeedbackLogs((prev) => [
          ...prev,
          {
            trackUri: nowPlaying.uri || "",
            trackName: nowPlaying.title,
            artistName: nowPlaying.artist,
            playedSeconds: playedSec,
            type: evalResult.type,
            scoreChange: evalResult.scoreChange,
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      trackStartTimeRef.current = Date.now();

      const savedToken = localStorage.getItem(SPOTIFY_TOKEN_KEY) || token;
      if (!savedToken || !deviceId) {
        console.warn("⚠️ [Skip Cancelled] Token or DeviceID is missing.");
        return;
      }

      if (playerRef.current && typeof playerRef.current.activateElement === "function") {
        await playerRef.current.activateElement();
      }

      // トラックプールから次の曲を選出
      const histUris = historyUris.length > 0 ? historyUris : feedbackLogs.map((l) => l.trackUri);
      const histArtists = historyArtists.length > 0 ? historyArtists : feedbackLogs.map((l) => l.artistName);

      const nextTrack = selectNextTrackWithCooldown(trackPool, histUris, histArtists);

      if (nextTrack) {
        console.log(`📻 [Auto-Radio] Next track selected: ${nextTrack.name} by ${nextTrack.artist}`);
        setHistoryUris((prev) => [...prev.slice(-20), nextTrack.uri]);
        setHistoryArtists((prev) => [...prev.slice(-10), nextTrack.artist]);
        await startPlaybackWithTrack(nextTrack.uri, deviceId);
        setHasRadioStarted(true);
        setIsPremiumError(false);
      } else {
        console.warn("⚠️ [Track Pool Empty] Re-fetching track pool...");
        const newPool = await fetchHybridTrackPool(savedToken);
        setTrackPool(newPool);
        if (newPool.length > 0) {
          const first = newPool[0];
          setHistoryUris((prev) => [...prev.slice(-20), first.uri]);
          setHistoryArtists((prev) => [...prev.slice(-10), first.artist]);
          await startPlaybackWithTrack(first.uri, deviceId);
          setHasRadioStarted(true);
          setIsPremiumError(false);
        }
      }
    } catch (err) {
      console.error("❌ Failed to skip to next track:", err);
    }
  };

  const handleStartRadio = async () => {
    if (!playerRef.current || !deviceId) {
      console.warn("⚠️ Player or Device ID not ready yet.");
      return;
    }

    setHasRadioStarted(true);
    await handleSkip();
  };

  // 📺 ⏱️ 経過時間更新 ＆ 画面表示（UI）の 100% 受動同期 (player_state_changed 監視)
  useEffect(() => {
    if (!isMounted || !token) return;

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

    const initSpotifyPlayer = () => {
      if (playerRef.current) return;

      const player = new window.Spotify.Player({
        name: "Drive Tune Web Player",
        getOAuthToken: (cb: (t: string) => void) => cb(token),
        volume: 0.8,
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("🟢 [Spotify Web SDK Ready] Device ID:", device_id);
        setDeviceId(device_id);
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

          // ⏭️ 曲完奏時の自動送り判定 (Auto-Skip on Track Completion)
          const durationSec = Math.floor(state.duration / 1000);
          const isTrackEnded =
            (state.paused && (state.position === 0 || state.position >= state.duration - 1500)) ||
            (state.duration > 0 && state.position >= state.duration - 1000) ||
            (durationSec > 0 && posSec >= durationSec && state.paused);

          if (isTrackEnded) {
            if (!isHandlingEndRef.current) {
              isHandlingEndRef.current = true;
              console.log("📻 [Auto-Radio] 曲の完奏を検知。次のトラックへ自動移行します...");

              (async () => {
                try {
                  await handleSkip();
                } catch (e) {
                  console.error("Auto skip execution failed:", e);
                } finally {
                  setTimeout(() => {
                    isHandlingEndRef.current = false;
                  }, 2500);
                }
              })();
            }
          }
        }
      });

      player.addListener("initialization_error", ({ message }: any) => {
        console.error("❌ Spotify SDK Init Error:", message);
      });

      player.addListener("authentication_error", ({ message }: any) => {
        console.error("❌ Spotify Auth Error (Expired token):", message);
        localStorage.removeItem(SPOTIFY_TOKEN_KEY);
        setToken(null);
      });

      player.addListener("account_error", ({ message }: any) => {
        console.error("❌ Spotify Account Error (Requires Spotify Premium):", message);
        setIsPremiumError(true);
      });

      player.connect();
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

  // ⏱️ 1秒ごとの完奏監視タイマー (Dual Safety Net for Track End)
  useEffect(() => {
    if (!isMounted || !hasRadioStarted) return;

    const interval = setInterval(() => {
      if (!nowPlaying || nowPlaying.durationMs <= 0) return;
      const durationSec = Math.floor(nowPlaying.durationMs / 1000);

      let currentSec = 0;
      if (trackStartTimeRef.current) {
        currentSec = Math.floor((Date.now() - trackStartTimeRef.current) / 1000);
      } else {
        currentSec = currentPositionSecRef.current;
      }

      // 再生時間が曲の長さ（秒数）に達した場合に自動スキップ発火
      if (durationSec > 0 && currentSec >= durationSec) {
        if (!isHandlingEndRef.current) {
          isHandlingEndRef.current = true;
          console.log(`📻 [Auto-Radio Timer] 経過時間 (${currentSec}s / ${durationSec}s) が満了しました。次の曲へ自動移行します。`);

          (async () => {
            try {
              await handleSkip();
            } catch (e) {
              console.error("Auto skip execution failed:", e);
            } finally {
              setTimeout(() => {
                isHandlingEndRef.current = false;
              }, 2500);
            }
          })();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMounted, hasRadioStarted, nowPlaying]);

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

  // 🛡️ SSR Hydration Guarantee
  if (!isMounted) {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-black text-white flex items-center justify-center font-sans">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.5)]">
          <span className="text-4xl text-emerald-400">🎵</span>
        </div>
      </main>
    );
  }

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
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white flex flex-col justify-between items-center py-10 px-6 select-none font-sans">
      {/* ⚠️ 403 Premium / Device Warning Toast */}
      {isPremiumError && (
        <div className="fixed top-4 z-50 px-6 py-3 bg-rose-500/90 border border-rose-400 text-white rounded-full text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md animate-bounce">
          ⚠️ 403 Error: Spotify Premium アカウント、またはアクティブなデバイス許可が必要です。再ログインをお試しください。
        </div>
      )}

      {/* 🖼️ Background: Fullscreen Album Artwork with backdrop-filter: blur(24px) & Dark Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 filter blur-[24px] opacity-40"
        style={{ backgroundImage: `url(${nowPlaying.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 pointer-events-none" />

      {/* 🎛️ 1. TOP SECTION: Action Area (ONLY Mute Toggle & Skip Buttons) */}
      <div className="relative z-10 w-full max-w-md flex justify-around items-center pt-4">
        {/* 🔇 ミュート切替ボタン */}
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-2 px-6 py-3.5 transition active:scale-95 backdrop-blur-md rounded-full border text-sm font-bold shadow-xl cursor-pointer ${
            isMuted
              ? "bg-rose-500/20 border-rose-400/50 text-rose-300 hover:bg-rose-500/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
        >
          <span className="text-lg">{isMuted ? "🔇" : "🔊"}</span>
          <span>{isMuted ? "解除" : "消音"}</span>
        </button>

        {/* ⏭️ スキップボタン */}
        <button
          onClick={handleSkip}
          className="flex items-center gap-2.5 px-8 py-3.5 bg-white text-black hover:bg-neutral-200 active:scale-95 transition rounded-full text-sm font-extrabold shadow-2xl cursor-pointer"
        >
          <span>スキップ</span>
          <span className="text-lg">⏭</span>
        </button>
      </div>

      {/* 2. CENTER-UPPER SECTION: 完全独立型 60fps リアルタイム波形 (FluidOrganicEqualizer) */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center my-4">
        <FluidOrganicEqualizer isPlaying={isPlaying && !isMuted} />
      </div>

      {/* 3. CENTER-LOWER SECTION: Track Metadata (100% Driven PASSIVELY by Spotify Player State) */}
      <div className="relative z-10 text-center space-y-2 mb-6 transition-all duration-300 transform">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-lg text-white">
          {nowPlaying.title}
        </h1>
        <p className="text-base sm:text-xl text-emerald-400 font-bold tracking-wide">
          {nowPlaying.artist}
        </p>
      </div>

      {/* 4. BOTTOM SECTION: Real-Time Audio Streaming Status & Playback Timer */}
      <div className="relative z-10 w-full max-w-md text-center h-16 flex items-center justify-center px-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg shadow-xl">
        <p className="text-base sm:text-lg font-medium text-emerald-200/90 transition-all duration-500 ease-out">
          🎵 {nowPlaying.title} - {nowPlaying.artist} ({currentPositionSec}s)
        </p>
      </div>
    </main>
  );
}
