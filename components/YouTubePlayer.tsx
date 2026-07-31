'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YouTubePlayerHandle {
  setVolume: (volume: number) => void;
  fadeVolume: (startVol: number, targetVol: number, durationMs?: number) => Promise<void>;
  play: () => void;
  pause: () => void;
}

interface YouTubePlayerProps {
  videoId: string;
  onEnded?: () => void;
  onReady?: () => void;
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoId, onEnded, onReady }, ref) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      setVolume: (volume: number) => {
        if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(Math.max(0, Math.min(100, volume)));
        }
      },
      fadeVolume: async (startVol: number, targetVol: number, durationMs: number = 300) => {
        const steps = 6;
        const stepTime = Math.floor(durationMs / steps);
        const delta = (targetVol - startVol) / steps;

        for (let i = 1; i <= steps; i++) {
          const currentVol = Math.round(startVol + delta * i);
          if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
            playerRef.current.setVolume(Math.max(0, Math.min(100, currentVol)));
          }
          await new Promise((resolve) => setTimeout(resolve, stepTime));
        }
      },
      play: () => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      },
      pause: () => {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      },
    }));

    useEffect(() => {
      // Load YouTube IFrame Player API Script
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const initPlayer = () => {
        if (!containerRef.current) return;
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(100);
              event.target.playVideo();
              if (onReady) onReady();
            },
            onStateChange: (event: any) => {
              // event.data === 0 means YT.PlayerState.ENDED
              if (event.data === 0 && onEnded) {
                onEnded();
              }
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = () => {
          initPlayer();
        };
      }

      return () => {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      };
    }, []);

    // Load new video when videoId prop updates
    useEffect(() => {
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(videoId);
      }
    }, [videoId]);

    return (
      <div className="w-0 h-0 opacity-0 overflow-hidden pointer-events-none absolute top-0 left-0">
        <div ref={containerRef} />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';
