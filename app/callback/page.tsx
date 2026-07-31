'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForToken, getEffectiveRedirectUri } from '@/lib/spotify';
import { Loader2, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (authError) {
      setError(`Spotify認証エラー: ${authError}`);
      return;
    }

    if (!code) {
      setError('クエリパラメータに認証コードが含まれていません。');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || localStorage.getItem('drivetuner_spotify_client_id') || '';
    const redirectUri = getEffectiveRedirectUri();

    if (!clientId) {
      setError('Spotify Client IDが設定されていません。ヘッダーの設定からClient IDを保存してください。');
      return;
    }

    exchangeCodeForToken(code, clientId, redirectUri)
      .then((data) => {
        console.log('✅ [OAuth Callback] Token exchanged successfully!');
        console.log('🔑 Stored Access Token:', `${data.accessToken.substring(0, 12)}...`);
        router.push('/');
      })
      .catch((err) => {
        console.error('❌ [OAuth Callback] PKCE Exchange Error:', err);
        setError(err.message || 'Spotifyアクセストークンの取得に失敗しました。');
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 text-center">
      {error ? (
        <div className="glass-panel p-8 rounded-2xl max-w-md border border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">認証エラー</h2>
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
          <h2 className="text-lg font-bold text-white mb-1">DriveTunerに連携中</h2>
          <p className="text-xs text-zinc-400">Spotifyと安全なPKCEトークンを交換しています...</p>
        </div>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
