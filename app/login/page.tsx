'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { redirectToSpotifyLogin, getEffectiveRedirectUri } from '@/lib/spotify';
import { Loader2, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || localStorage.getItem('drivetuner_spotify_client_id') || '';
    const redirectUri = getEffectiveRedirectUri();

    if (!clientId) {
      setError('Spotify Client IDが設定されていません。トップページのヘッダー設定からClient IDを入力してください。');
      return;
    }

    try {
      redirectToSpotifyLogin(clientId, redirectUri);
    } catch (err: any) {
      console.error('Spotify Auth Redirect Error:', err);
      setError(err.message || 'Spotifyへの認証リダイレクトに失敗しました。');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 text-center">
      {error ? (
        <div className="glass-panel p-8 rounded-2xl max-w-md border border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">ログイン認証エラー</h2>
          <p className="text-xs text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            ダッシュボードに戻る
          </button>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl max-w-md border border-emerald-500/30 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <h2 className="text-lg font-bold text-white mb-1">Spotifyログインへ転送中</h2>
          <p className="text-xs text-zinc-400">Spotify認証画面へリダイレクトしています...</p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
