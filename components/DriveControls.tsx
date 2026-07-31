'use client';

import React from 'react';
import { ThumbsUp, SkipForward, RotateCw, PlusCircle, Check } from 'lucide-react';

interface DriveControlsProps {
  onThumbsUp: () => void;
  onSkip: () => void;
  onRefresh: () => void;
  onSavePlaylist: () => void;
  isSaved?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

export const DriveControls: React.FC<DriveControlsProps> = ({
  onThumbsUp,
  onSkip,
  onRefresh,
  onSavePlaylist,
  isSaved = false,
  isSaving = false,
  disabled = false,
}) => {
  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
      {/* Thumbs Up Button */}
      <button
        onClick={onThumbsUp}
        disabled={disabled}
        className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-900/90 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-500/50 text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-900/20"
        title="高評価 - 今の曲の雰囲気を今後の選曲に反映します"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 transition-transform group-hover:scale-110">
          <ThumbsUp className="w-7 h-7" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-zinc-200 group-hover:text-emerald-300">
          高評価 👍
        </span>
        <span className="text-[11px] text-zinc-500">バイブス学習</span>
      </button>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        disabled={disabled}
        className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        title="スキップ - 次の曲へ移動します"
      >
        <div className="w-14 h-14 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center text-zinc-200 mb-2 transition-transform group-hover:scale-110">
          <SkipForward className="w-7 h-7" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-zinc-200">
          スキップ ⏭️
        </span>
        <span className="text-[11px] text-zinc-500">次の曲へ</span>
      </button>

      {/* Save to Spotify Button */}
      <button
        onClick={onSavePlaylist}
        disabled={disabled || isSaving || isSaved}
        className={`group flex flex-col items-center justify-center p-5 rounded-2xl border transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
          isSaved
            ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
            : 'bg-zinc-900/90 hover:bg-emerald-950/40 border-zinc-800 hover:border-emerald-500/50 text-white'
        }`}
        title="プレイリスト保存 - Spotifyアカウントに新規保存"
      >
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
            isSaved ? 'bg-emerald-500/30 text-emerald-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {isSaved ? <Check className="w-7 h-7" /> : <PlusCircle className="w-7 h-7" />}
        </div>
        <span className="text-sm font-semibold tracking-wide">
          {isSaved ? '保存完了! 💚' : isSaving ? '保存中...' : 'リスト保存'}
        </span>
        <span className="text-[11px] text-zinc-500">Spotifyへ追加</span>
      </button>

      {/* Refresh Drive Mix Button */}
      <button
        onClick={onRefresh}
        disabled={disabled}
        className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-900/90 hover:bg-blue-950/40 border border-zinc-800 hover:border-blue-500/50 text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        title="ミックス更新 - 現在の時間帯の選曲を再生成"
      >
        <div className="w-14 h-14 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2 transition-transform group-hover:scale-110">
          <RotateCw className="w-7 h-7" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-zinc-200 group-hover:text-blue-300">
          ミックス更新 🔄
        </span>
        <span className="text-[11px] text-zinc-500">選曲を再生成</span>
      </button>
    </div>
  );
};
