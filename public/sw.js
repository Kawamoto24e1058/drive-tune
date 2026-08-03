const CACHE_NAME = 'drivetuner-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => caches.delete(cache))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Bypass cache for HTML navigations, API calls, Spotify API & Next.js assets
  if (
    event.request.mode === 'navigate' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('spotify.com') ||
    event.request.url.includes('_next/')
  ) {
    return;
  }
});
