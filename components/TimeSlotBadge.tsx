'use client';

import React from 'react';
import { TimeSlotConfig, TimeSlotType, AudioTargetParams } from '@/types/drive';
import { TIME_SLOT_CONFIGS } from '@/lib/recommendations';
import { Sparkles, Clock, Compass } from 'lucide-react';

interface TimeSlotBadgeProps {
  currentSlot: TimeSlotConfig;
  selectedSlotType?: TimeSlotType;
  onSelectSlotType?: (slot: TimeSlotType) => void;
  adjustedTargets?: AudioTargetParams;
}

export const TimeSlotBadge: React.FC<TimeSlotBadgeProps> = ({
  currentSlot,
  selectedSlotType,
  onSelectSlotType,
  adjustedTargets,
}) => {
  const activeSlot = selectedSlotType ? TIME_SLOT_CONFIGS[selectedSlotType] : currentSlot;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 mb-6 shadow-xl border border-white/10 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: activeSlot.color }}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Main Slot Title & Description */}
        <div className="flex items-start space-x-4">
          <div className="text-4xl p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center justify-center shadow-inner">
            {activeSlot.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${activeSlot.badgeBg}`}>
                {activeSlot.timeRangeLabel}
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 現在時刻から自動検出
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1 tracking-tight flex items-center gap-2">
              {activeSlot.label}
              <span className="text-sm font-normal text-zinc-400">({activeSlot.subLabel})</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-lg">
              {activeSlot.description}
            </p>
          </div>
        </div>

        {/* Target Audio Metrics Badge */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="text-[11px] font-mono uppercase text-zinc-400 mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> 音響目標設定
          </div>

          <div className="px-2.5 py-1 bg-zinc-800/80 rounded-lg text-xs font-mono text-zinc-200">
            エナジー: <span className="text-emerald-400 font-bold">{Math.round((adjustedTargets?.target_energy || activeSlot.targets.target_energy || 0.6) * 100)}%</span>
          </div>

          <div className="px-2.5 py-1 bg-zinc-800/80 rounded-lg text-xs font-mono text-zinc-200">
            ダンス感: <span className="text-blue-400 font-bold">{Math.round((adjustedTargets?.target_danceability || activeSlot.targets.target_danceability || 0.7) * 100)}%</span>
          </div>

          <div className="px-2.5 py-1 bg-zinc-800/80 rounded-lg text-xs font-mono text-zinc-200">
            明るさ: <span className="text-amber-400 font-bold">{Math.round((adjustedTargets?.target_valence || activeSlot.targets.target_valence || 0.5) * 100)}%</span>
          </div>

          <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-300">
            選曲: 邦楽・洋楽 🇯🇵🌐
          </div>
        </div>
      </div>

      {/* Manual Time Slot Switcher */}
      {onSelectSlotType && (
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> 時間帯・ムードの手動切替:
          </div>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {(Object.keys(TIME_SLOT_CONFIGS) as TimeSlotType[]).map((slotKey) => {
              const cfg = TIME_SLOT_CONFIGS[slotKey];
              const isSelected = activeSlot.id === slotKey;
              return (
                <button
                  key={slotKey}
                  onClick={() => onSelectSlotType(slotKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-zinc-200 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
