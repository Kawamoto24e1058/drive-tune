'use client';

import React, { useEffect, useState } from 'react';
import { RadioTrack } from '@/types/radio';

interface LyricsLine {
  text: string;
}

interface LyricsViewerProps {
  currentTrack: RadioTrack | null;
  isPlaying: boolean;
}

function generateDriveLyrics(track?: RadioTrack | null): LyricsLine[] {
  const title = track?.title || 'Drive Radio';
  const artist = track?.artist || 'DriveTuner';

  return [
    { text: `🎵 ${title} - ${artist}` },
    { text: '流れるハイウェイ 澄み渡る夜空の風を感じて' },
    { text: '街のネオンがリフレクション 光の粒が踊り出す' },
    { text: 'アクセルを踏み込めば 昨日の悩みも過去になる' },
    { text: 'ラジオから流れるリズムに 心を委ねて走り抜ける' },
    { text: '幾千の光が交差する このドライブコースで' },
    { text: '君と聴いたあのメロディーが 今も輝き続ける' },
    { text: '果てしない地平線を目指して 風を追い越していく' },
    { text: '夜風がささやく未来へのフレーズ 永遠に響け' },
    { text: 'Don\'t stop the music, keep on driving through the night' },
  ];
}

export const LyricsViewer: React.FC<LyricsViewerProps> = ({ currentTrack }) => {
  const [lyrics, setLyrics] = useState<LyricsLine[]>([]);

  useEffect(() => {
    setLyrics(generateDriveLyrics(currentTrack));
  }, [currentTrack]);

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-4 bg-black/40 border border-white/10 backdrop-blur-md">
      <div className="h-28 overflow-y-auto space-y-2 text-center px-4 scrollbar-none flex flex-col items-center">
        {lyrics.map((line, idx) => (
          <p
            key={idx}
            className={`font-sans leading-relaxed text-sm md:text-base font-medium ${
              idx === 0 ? 'text-white font-bold' : 'text-zinc-300/80'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
};
