'use client';

import React, { useState } from 'react';
import { SpotifyUser } from '@/types/spotify';
import { LogIn, LogOut, Radio, User as UserIcon, Settings, Download } from 'lucide-react';

interface HeaderProps {
  user: SpotifyUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onSaveClientId?: (clientId: string) => void;
  currentClientId?: string;
  installPromptEvent?: any;
  onInstallPwa?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  onSaveClientId,
  currentClientId = '',
  installPromptEvent,
  onInstallPwa,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(currentClientId);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveClientId) {
      onSaveClientId(clientIdInput.trim());
    }
    setShowSettings(false);
  };

  return (
    <header className="w-full glass-panel sticky top-0 z-50 px-4 py-3 mb-6 border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* App Logo */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-emerald-500/20">
            <Radio className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              DriveTuner
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                PWA
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">時間帯・気分に合わせたドライブ選曲アプリ</p>
          </div>
        </div>

        {/* User Actions & Settings */}
        <div className="flex items-center space-x-3">
          {/* PWA Install Button */}
          {installPromptEvent && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PWAをインストール</span>
            </button>
          )}

          {/* Settings / Client ID Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Spotify Client ID 設定"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Login / User Status */}
          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-zinc-800">
              <div className="flex items-center space-x-2">
                {user.images?.[0]?.url ? (
                  <img
                    src={user.images[0].url}
                    alt={user.display_name || 'User'}
                    className="w-8 h-8 rounded-full ring-2 ring-emerald-500/50 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-semibold text-zinc-200">
                    {user.display_name || user.id}
                  </span>
                  {user.email && (
                    <span className="text-[10px] text-emerald-400 font-mono" title="Spotify Dashboard登録メールアドレス">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-colors"
                title="Spotify連携解除"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Spotify連携</span>
            </button>
          )}
        </div>
      </div>

      {/* Spotify Client ID Settings Modal */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-zinc-800/80 max-w-6xl mx-auto">
          <form onSubmit={handleSaveSettings} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1">
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Spotify Developer Client ID (PKCE認証)
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="Spotify Client IDを入力..."
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-colors self-end"
            >
              IDを保存
            </button>
          </form>
          <p className="text-[10px] text-zinc-500 mt-1">
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" className="underline text-emerald-400">Spotify Developer Dashboard</a>からClient IDを取得できます。リダイレクトURIには <code>http://localhost:3000/callback</code> または <code>https://localhost:3000/callback</code> を登録してください。
          </p>
        </div>
      )}
    </header>
  );
};
