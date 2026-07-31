'use client';

import React from 'react';
import { RadioTrack, TimeSlotConfig } from '@/types/radio';
import { Visualizer } from '@/components/Visualizer';
import { LyricsViewer } from '@/components/LyricsViewer';
import { SkipForward, RotateCw } from 'lucide-react';

interface RadioStereoProps {
  currentTrack: RadioTrack | null;
  timeSlot: TimeSlotConfig;
  isPlaying: boolean;
  onSkip: () => void;
  onRefresh: () => void;
  isFading?: boolean;
}

export const RadioStereo: React.FC<RadioStereoProps> = ({
  currentTrack,
  timeSlot,
  isPlaying,
  onSkip,
  onRefresh,
  isFading = false,
}) => {
  const albumImage = currentTrack?.albumCover;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between p-6 md:p-10 select-none bg-black">
      {/* Background: Album Artwork with blur(20px) and dark overlay */}
      {albumImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-[20px] scale-110 opacity-50 transition-all duration-700"
          style={{ backgroundImage: `url(${albumImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 opacity-80" />
      )}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Main 4-Tier Container */}
      <div className="relative z-10 w-full h-full max-w-4xl mx-auto flex flex-col justify-between py-4">
        
        {/* 1. Action Area (Top: ONLY Skip & Regenerate Buttons) */}
        <div className="w-full flex items-center justify-end gap-4">
          <button
            onClick={onSkip}
            className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-emerald-500 hover:text-zinc-950 text-white font-black text-base shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-2.5 transition-all transform active:scale-95"
          >
            <SkipForward className="w-6 h-6 fill-current" />
            <span>スキップ (⏭)</span>
          </button>

          <button
            onClick={onRefresh}
            className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-emerald-500 hover:text-zinc-950 text-white font-black text-base shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-2.5 transition-all transform active:scale-95"
          >
            <RotateCw className="w-6 h-6" />
            <span>再生成 (🔄)</span>
          </button>
        </div>

        {/* 2. Visual Area (Center: Symmetrical Waveform Visualizer Canvas) */}
        <div
          className={`w-full flex-1 flex items-center justify-center my-2 transition-all duration-300 transform ${
            isFading ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-none'
          }`}
        >
          <div className="w-full px-2">
            <Visualizer isPlaying={isPlaying && !isFading} accentColor={timeSlot.color || '#10b981'} />
          </div>
        </div>

        {/* 3. Metadata Area (Below Waveform: Track Title & Artist Name) */}
        <div
          className={`w-full text-center my-4 transition-all duration-300 transform ${
            isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight truncate leading-tight drop-shadow-lg">
            {currentTrack ? currentTrack.title : 'ラジオ選曲中...'}
          </h1>
          <p className="text-xl md:text-3xl font-bold text-emerald-400 mt-2 truncate tracking-wide">
            {currentTrack ? currentTrack.artist : 'DriveTuner Radio'}
          </p>
        </div>

        {/* 4. Lyrics Area (Bottom: Real-Time Lyrics View) */}
        <div className="w-full">
          <LyricsViewer currentTrack={currentTrack} isPlaying={isPlaying && !isFading} />
        </div>

      </div>
    </div>
  );
};
