'use client';

import React from 'react';
import { SpotifyTrack } from '@/types/spotify';
import { ExternalLink, Music2, Disc } from 'lucide-react';

interface PlayerEmbedProps {
  currentTrack: SpotifyTrack | null;
  playlistId?: string | null;
  compact?: boolean;
}

export const PlayerEmbed: React.FC<PlayerEmbedProps> = ({
  currentTrack,
  playlistId,
  compact = false,
}) => {
  if (!currentTrack && !playlistId) {
    return (
      <div className="w-full glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center my-4 border border-white/10">
        <Disc className="w-12 h-12 text-zinc-600 animate-spin-slow mb-3" />
        <h3 className="text-lg font-semibold text-zinc-300">トラックが選択されていません</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Spotifyアカウントを連携するか、「ミックス更新」をクリックして時間帯別の選曲リストを生成してください。
        </p>
      </div>
    );
  }

  // Embed URL setup
  let embedUrl = '';
  if (playlistId) {
    embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
  } else if (currentTrack) {
    const trackId = currentTrack.id.startsWith('mock_')
      ? '0VjA8NvtODZjh2vA249kRm' // Default Spotify fallback track for preview
      : currentTrack.id;
    embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  }

  return (
    <div className="w-full glass-panel rounded-2xl p-4 my-4 border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase text-zinc-300 font-semibold">
            {playlistId ? 'Spotify ドライブ選曲プレイヤー' : 'Spotify Web プレイヤー'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            無料・有料プラン両対応
          </span>
        </div>
        {currentTrack && (
          <a
            href={currentTrack.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            Spotifyアプリで開く <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Embedded Spotify Player Iframe */}
      <div className="w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-inner">
        <iframe
          src={embedUrl}
          width="100%"
          height={playlistId ? '380' : compact ? '80' : '152'}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl block"
          title="Spotify Web Player"
        />
      </div>

      {/* Track Details Subcard */}
      {currentTrack && (
        <div className="mt-3 flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
          <div className="flex items-center space-x-3 overflow-hidden">
            {currentTrack.album.images?.[0] ? (
              <img
                src={currentTrack.album.images[0].url}
                alt={currentTrack.name}
                className="w-12 h-12 rounded-lg object-cover shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 flex-shrink-0">
                <Music2 className="w-6 h-6" />
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{currentTrack.name}</h4>
              <p className="text-xs text-zinc-400 truncate">
                {currentTrack.artists.map((a) => a.name).join(', ')}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="text-[11px] font-mono text-zinc-500 block">
              {Math.floor(currentTrack.duration_ms / 60000)}:
              {Math.floor((currentTrack.duration_ms % 60000) / 1000)
                .toString()
                .padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
