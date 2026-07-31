"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// 🎵 Genre & Track Types
export type Genre = "pop" | "rock" | "citypop" | "chill" | "acoustic" | "synthwave";
export type TimeSlotId = "morning" | "daytime" | "evening" | "night";

export interface RadioTrack {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  genre: Genre;
  coverUrl: string;
  lyrics: { time: number; text: string }[];
}

export interface LearningScores {
  [slot: string]: {
    [genre in Genre]?: number;
  };
}

// 🎧 Rich YouTube Track Library Tagged by Genre
const TRACK_LIBRARY: RadioTrack[] = [
  // Pop
  {
    id: "v8B5C0_mP3s",
    title: "新宝島",
    artist: "サカナクション",
    genre: "pop",
    coverUrl: "https://img.youtube.com/vi/v8B5C0_mP3s/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 15, text: "次をとおりすぎた風が 歩道をたたいてゆく" },
      { time: 24, text: "このまま君を連れてゆくと 丁寧に描くよ" },
      { time: 40, text: "新宝島へとつづく" },
    ],
  },
  {
    id: "0aUev8_J0mY",
    title: "怪獣の花唄",
    artist: "Vaundy",
    genre: "pop",
    coverUrl: "https://img.youtube.com/vi/0aUev8_J0mY/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 10, text: "思い出すのは君の歌 会話よりも鮮明だ" },
      { time: 21, text: "どこに行くにも連れていくよ 騒がしい日々の隙間に" },
      { time: 33, text: "もっと騒げ怪獣の歌" },
    ],
  },
  {
    id: "7oK9RyfiKMv1y0q0WzW72g",
    title: "アイドル",
    artist: "YOASOBI",
    genre: "pop",
    coverUrl: "https://img.youtube.com/vi/7oK9RyfiKMv1y0q0WzW72g/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 12, text: "無敵の笑顔で荒らすメディア 知りたいその秘密オブキュリアス" },
      { time: 28, text: "究極のアイドル" },
    ],
  },
  // Rock
  {
    id: "ony539T074w",
    title: "SPECIALZ",
    artist: "King Gnu",
    genre: "rock",
    coverUrl: "https://img.youtube.com/vi/ony539T074w/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 14, text: "U R MY SPECIAL 今夜愚かな宴を始めよう" },
      { time: 30, text: "混沌を極めた世界で" },
    ],
  },
  {
    id: "L18d4i5qJjQ",
    title: "青と夏",
    artist: "Mrs. GREEN APPLE",
    genre: "rock",
    coverUrl: "https://img.youtube.com/vi/L18d4i5qJjQ/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 15, text: "涼しい風吹く 青空の夏が始まる" },
      { time: 32, text: "映画じゃない 僕らの夏だ" },
    ],
  },
  {
    id: "1-69pU-f9vQ",
    title: "感電",
    artist: "米津玄師",
    genre: "rock",
    coverUrl: "https://img.youtube.com/vi/1-69pU-f9vQ/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 16, text: "逃げ出したい夜のすきまに 稲妻のようにひらめいた" },
      { time: 34, text: "たった一瞬の稲妻になれ" },
    ],
  },
  // Citypop
  {
    id: "9Gj47G2e1Jc",
    title: "真夜中のドア / Stay With Me",
    artist: "松原みき",
    genre: "citypop",
    coverUrl: "https://img.youtube.com/vi/9Gj47G2e1Jc/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 18, text: "To you, yes my love to you" },
      { time: 26, text: "Stay with me... 真夜中のドアをたたき" },
      { time: 42, text: "帰らない夜を抱きしめて" },
    ],
  },
  {
    id: "3bNITQR4480",
    title: "Plastic Love",
    artist: "竹内まりや",
    genre: "citypop",
    coverUrl: "https://img.youtube.com/vi/3bNITQR4480/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 20, text: "突然のキスや熱い眼差しで 恋のプログラムを狂わせないで" },
      { time: 40, text: "I'm just playing games, I know it's plastic love" },
    ],
  },
  // Chill / Acoustic
  {
    id: "1A_3q8N4U0k",
    title: "きらり",
    artist: "藤井 風",
    genre: "acoustic",
    coverUrl: "https://img.youtube.com/vi/1A_3q8N4U0k/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 12, text: "荒れ狂う季節の中を二人は伸び伸びと進む" },
      { time: 20, text: "さらりさらり逃げてゆく時に抱かれ" },
      { time: 28, text: "連れていって 連れていって どこまでも行くよ" },
    ],
  },
  {
    id: "tJi2Z-o07Kk",
    title: "ドライフラワー",
    artist: "優里",
    genre: "chill",
    coverUrl: "https://img.youtube.com/vi/tJi2Z-o07Kk/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 15, text: "きっとお互い様だったね 枯れてゆく色を見つめてた" },
      { time: 35, text: "色褪せないドライフラワーのように" },
    ],
  },
  // Synthwave / Night
  {
    id: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    genre: "synthwave",
    coverUrl: "https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 16, text: "I've been on my own for long enough" },
      { time: 30, text: "I can't sleep until I feel your touch" },
      { time: 45, text: "I'm blinded by the lights!" },
    ],
  },
  {
    id: "MV_3Dpw-BRY",
    title: "Nightcall",
    artist: "Kavinsky",
    genre: "synthwave",
    coverUrl: "https://img.youtube.com/vi/MV_3Dpw-BRY/hqdefault.jpg",
    lyrics: [
      { time: 0, text: "（Intro）" },
      { time: 20, text: "I'm giving you a night call to tell you how I feel" },
      { time: 40, text: "There's something inside you, it's hard to explain" },
    ],
  },
];

const STORAGE_KEY = "drivetuner_learning_scores";

// Default Initial Weight Scores per Time-Slot
const DEFAULT_SCORES: LearningScores = {
  morning: { acoustic: 50, pop: 40, chill: 30, citypop: 20, rock: 10, synthwave: 5 },
  daytime: { pop: 50, rock: 45, citypop: 30, acoustic: 20, chill: 15, synthwave: 5 },
  evening: { citypop: 50, chill: 40, pop: 30, acoustic: 25, rock: 15, synthwave: 10 },
  night: { synthwave: 50, chill: 45, citypop: 35, acoustic: 20, rock: 10, pop: 10 },
};

// Helper: Get Current Time-Slot ID
function getTimeSlotId(): TimeSlotId {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 17) return "daytime";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function RadioPlayer() {
  const [learningScores, setLearningScores] = useState<LearningScores>(DEFAULT_SCORES);
  const [currentSlot, setCurrentSlot] = useState<TimeSlotId>(getTimeSlotId());
  const [currentTrack, setCurrentTrack] = useState<RadioTrack>(TRACK_LIBRARY[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);

  const playerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const currentVolumeRef = useRef<number>(100);
  const playbackTimeRef = useRef<number>(0);
  const listenedOver30sRef = useRef<boolean>(false);

  // Load Saved Learning Scores from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLearningScores(JSON.parse(saved));
      }
    } catch {
      // Fallback to default
    }

    const slotTimer = setInterval(() => {
      setCurrentSlot(getTimeSlotId());
    }, 300000);

    return () => clearInterval(slotTimer);
  }, []);

  // Save Learning Scores to localStorage
  const saveScores = useCallback((updated: LearningScores) => {
    setLearningScores(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage full
    }
  }, []);

  // Modify Score for Genre in Current Slot
  const adjustScore = useCallback(
    (genre: Genre, delta: number) => {
      const slot = getTimeSlotId();
      const currentSlotScores = learningScores[slot] || DEFAULT_SCORES[slot];
      const oldScore = currentSlotScores[genre] ?? 20;
      const newScore = Math.max(5, Math.min(200, oldScore + delta));

      const updated = {
        ...learningScores,
        [slot]: {
          ...currentSlotScores,
          [genre]: newScore,
        },
      };

      saveScores(updated);
      console.log(`🧠 AI Engine: Score [${slot}][${genre}]: ${oldScore} -> ${newScore} (${delta >= 0 ? "+" : ""}${delta}pt)`);
    },
    [learningScores, saveScores]
  );

  // Weighted Random Genre & Track Selection
  const selectNextTrack = useCallback(
    (excludeTrackId?: string): RadioTrack => {
      const slot = getTimeSlotId();
      const scores = learningScores[slot] || DEFAULT_SCORES[slot];
      const availableGenres: Genre[] = ["pop", "rock", "citypop", "chill", "acoustic", "synthwave"];

      const weights = availableGenres.map((g) => Math.max(5, scores[g] ?? 20));
      const totalWeight = weights.reduce((acc, w) => acc + w, 0);

      let randomVal = Math.random() * totalWeight;
      let selectedGenre: Genre = "pop";

      for (let i = 0; i < availableGenres.length; i++) {
        randomVal -= weights[i];
        if (randomVal <= 0) {
          selectedGenre = availableGenres[i];
          break;
        }
      }

      const candidateTracks = TRACK_LIBRARY.filter(
        (t) => t.genre === selectedGenre && t.id !== excludeTrackId
      );

      if (candidateTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidateTracks.length);
        return candidateTracks[randomIndex];
      }

      const fallbackTracks = TRACK_LIBRARY.filter((t) => t.id !== excludeTrackId);
      return fallbackTracks[Math.floor(Math.random() * fallbackTracks.length)] || TRACK_LIBRARY[0];
    },
    [learningScores]
  );

  // 1. YouTube IFrame API Initialization with Strict Unmute & Origin Parameters
  useEffect(() => {
    const initialTrack = selectNextTrack();
    setCurrentTrack(initialTrack);

    const loadYT = () => {
      if (window.YT && window.YT.Player) {
        initPlayer(initialTrack.id);
        return;
      }
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => initPlayer(initialTrack.id);
    };

    const initPlayer = (videoId: string) => {
      playerRef.current = new window.YT.Player("yt-hidden-player", {
        height: "1",
        width: "1",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (event: any) => {
            if (typeof event.target.unMute === "function") {
              event.target.unMute();
            }
            event.target.setVolume(100);
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              adjustScore(currentTrack.genre, 15);
              handleAutoNext();
            }
          },
        },
      });
    };

    loadYT();

    const timer = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const t = playerRef.current.getCurrentTime() || 0;
        setCurrentTime(t);
        playbackTimeRef.current = t;

        if (t >= 30 && !listenedOver30sRef.current) {
          listenedOver30sRef.current = true;
          adjustScore(currentTrack.genre, 10);
        }
      }
    }, 500);

    return () => {
      clearInterval(timer);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  // First-Time User Activation Trigger (Bypasses Browser Autoplay Restrictions)
  const handleActivateRadio = () => {
    setHasActivated(true);
    if (playerRef.current) {
      if (typeof playerRef.current.unMute === "function") {
        playerRef.current.unMute();
      }
      if (typeof playerRef.current.setVolume === "function") {
        playerRef.current.setVolume(100);
      }
      if (typeof playerRef.current.playVideo === "function") {
        playerRef.current.playVideo();
      }
    }
    setIsPlaying(true);
  };

  // 2. 🎵 Pseudo-Crossfade Volume Fade (300ms)
  const fadeVolume = (targetVolume: number, duration: number = 300): Promise<void> => {
    return new Promise((resolve) => {
      if (!playerRef.current || !playerRef.current.setVolume) {
        resolve();
        return;
      }

      const startVolume = currentVolumeRef.current;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newVolume = Math.round(startVolume + (targetVolume - startVolume) * progress);

        currentVolumeRef.current = newVolume;
        if (playerRef.current.setVolume) {
          playerRef.current.setVolume(newVolume);
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  };

  // Switch Track Helper
  const changeTrackWithCrossfade = async (nextTrack: RadioTrack) => {
    if (isFading || !playerRef.current) return;
    setIsFading(true);

    // ① Fade Out (300ms)
    await fadeVolume(0, 300);

    // ② Switch Track
    setCurrentTrack(nextTrack);
    playbackTimeRef.current = 0;
    listenedOver30sRef.current = false;

    if (typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(nextTrack.id);
    }
    if (typeof playerRef.current.unMute === "function") {
      playerRef.current.unMute();
    }

    // ③ Fade In (300ms)
    await fadeVolume(100, 300);
    setIsFading(false);
  };

  // Auto Next when Track Ends
  const handleAutoNext = () => {
    const nextTrack = selectNextTrack(currentTrack.id);
    changeTrackWithCrossfade(nextTrack);
  };

  // 3. ⏭️ Manual Skip Handler
  const handleSkip = () => {
    if (isFading) return;
    if (!hasActivated) handleActivateRadio();

    if (playbackTimeRef.current < 15) {
      adjustScore(currentTrack.genre, -20);
    }

    const nextTrack = selectNextTrack(currentTrack.id);
    changeTrackWithCrossfade(nextTrack);
  };

  // 4. 🔄 Regenerate Handler
  const handleReshuffle = () => {
    if (isFading) return;
    if (!hasActivated) handleActivateRadio();

    adjustScore(currentTrack.genre, -15);
    const nextTrack = selectNextTrack(currentTrack.id);
    changeTrackWithCrossfade(nextTrack);
  };

  // 5. 🌊 Symmetrical Waveform Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stepCounter = 0;

    const render = () => {
      animationFrameIdRef.current = requestAnimationFrame(render);
      stepCounter += 0.05;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const barCount = 42;
      const barWidth = 6;
      const gap = 8;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        let amplitude = 4;
        if (isPlaying && !isFading) {
          const noise = Math.sin(stepCounter + i * 0.3) * Math.cos(stepCounter * 0.7 + i * 0.2);
          amplitude = Math.abs(noise) * (centerY - 12) + 6;
        }

        const x = startX + i * (barWidth + gap);

        const gradient = ctx.createLinearGradient(0, centerY - amplitude, 0, centerY + amplitude);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.8)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)");

        ctx.fillStyle = gradient;

        ctx.fillRect(x, centerY - amplitude, barWidth, amplitude);
        ctx.fillRect(x, centerY, barWidth, amplitude);
      }
    };

    render();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isPlaying, isFading]);

  // 6. 📝 Real-Time Single-Line Lyric Extraction
  const currentLyric =
    [...currentTrack.lyrics].reverse().find((l) => currentTime >= l.time)?.text ||
    currentTrack.lyrics[0]?.text ||
    "🎵 DriveTuner Radio • AI Streaming";

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white flex flex-col justify-between items-center py-10 px-6 select-none font-sans">
      {/* First-Time User Activation Fullscreen Overlay (Bypasses Browser Autoplay Restrictions) */}
      {!hasActivated && (
        <div
          onClick={handleActivateRadio}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl cursor-pointer transition-all duration-500 hover:bg-black/80"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <span className="text-4xl text-emerald-400">📻</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight text-center px-4 mb-2">
            タップしてドライブ・ラジオを開始 📻
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wider text-center px-6">
            ブラウザの自動再生規制を解除し、100%リアルタイムストリーミングを開始します
          </p>
        </div>
      )}

      {/* Hidden YouTube IFrame Player */}
      <div className="absolute top-0 left-0 opacity-0 pointer-events-none">
        <div id="yt-hidden-player" />
      </div>

      {/* 🖼️ Background: Fullscreen Album Artwork with blur(24px) & Dark Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 filter blur-[24px] opacity-40"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 pointer-events-none" />

      {/* 1. TOP SECTION: Action Area (ONLY Regenerate & Skip Buttons) */}
      <div className="relative z-10 w-full max-w-md flex justify-around items-center pt-4">
        <button
          onClick={handleReshuffle}
          disabled={isFading}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 transition backdrop-blur-md rounded-full border border-white/20 text-sm font-bold shadow-xl cursor-pointer"
        >
          <span className="text-lg">🔄</span>
          <span>再生成</span>
        </button>

        <button
          onClick={handleSkip}
          disabled={isFading}
          className="flex items-center gap-2.5 px-8 py-3.5 bg-white text-black hover:bg-neutral-200 active:scale-95 transition rounded-full font-extrabold shadow-2xl text-sm cursor-pointer"
        >
          <span>スキップ</span>
          <span className="text-lg">⏭</span>
        </button>
      </div>

      {/* 2. CENTER-UPPER SECTION: Symmetrical Waveform Canvas Visualizer */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center my-4">
        <canvas
          ref={canvasRef}
          width={640}
          height={180}
          className="w-full max-w-lg h-40 object-contain"
        />
      </div>

      {/* 3. CENTER-LOWER SECTION: Track Metadata */}
      <div className="relative z-10 text-center space-y-2 mb-6 transition-all duration-300">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-lg text-white">
          {currentTrack.title}
        </h1>
        <p className="text-base sm:text-xl text-emerald-400 font-bold tracking-wide">
          {currentTrack.artist}
        </p>
      </div>

      {/* 4. BOTTOM SECTION: Real-Time Single-Line Synchronized Lyrics */}
      <div className="relative z-10 w-full max-w-md text-center h-16 flex items-center justify-center px-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg shadow-xl">
        <p className="text-base sm:text-lg font-medium text-emerald-200/90 transition-all duration-500 ease-out">
          {currentLyric}
        </p>
      </div>
    </main>
  );
}
