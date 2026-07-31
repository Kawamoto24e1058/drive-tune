import { NextResponse } from 'next/server';
import { SPOTIFY_SCOPES } from '@/lib/spotify';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${origin}/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not configured.' },
      { status: 400 }
    );
  }

  // Redirect to /login page where PKCE verifier/challenge is generated client-side
  return NextResponse.redirect(`${origin}/login`);
}
