import React, { useEffect, useRef } from 'react';
import { MonitorPlay } from 'lucide-react';
import { VideoPlayerProps, YouTubePlayer as YTPlayer, YouTubePlayerConfig } from '../../types';
import { usePlayerStore } from '../../store';

export const YouTubePlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onReady,
  onError,
  className = "",
}) => {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setPlayer } = usePlayerStore();

  useEffect(() => {
    if (!videoId) return;

    // Cleanup existing player
    if (playerRef.current?.destroy) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying player:', error);
      }
      playerRef.current = null;
    }

    // Create new player with proper API readiness checking
    const attemptCreatePlayer = (attempts = 0) => {
      if (window.YT && window.YT.Player) {
        console.log('Creating YouTube player for video:', videoId);
        createPlayer();
      } else if (attempts < 10) {
        // Retry up to 10 times with increasing delay
        console.log(`YouTube API not ready (attempt ${attempts + 1}), retrying...`);
        setTimeout(() => attemptCreatePlayer(attempts + 1), 100 + (attempts * 50));
      } else {
        console.error('YouTube API failed to load after 10 attempts');
        onError?.('YouTube API failed to load. Please refresh the page.');
      }
    };

    attemptCreatePlayer();

    return () => {
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying player:', error);
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const createPlayer = () => {
    if (!videoId || !containerRef.current) return;

    const config: YouTubePlayerConfig = {
      height: '100%',
      width: '100%',
      videoId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        controls: 1,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          playerRef.current = event.target;
          setPlayer(event.target);
          onReady?.();
        },
        onStateChange: (event) => {
          // Sync player state with our app state
          const playerState = event.data;
          const { setIsPlaying } = usePlayerStore.getState();

          // YouTube player states: 1 = playing, 2 = paused, 0 = ended
          if (playerState === 1) {
            setIsPlaying(true);
          } else if (playerState === 2 || playerState === 0) {
            setIsPlaying(false);
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
          onError?.('Failed to load video. Please verify the URL.');
        },
      },
    };

    try {
      // Clear the container
      containerRef.current.innerHTML = '';

      // Create a new div for the player
      const playerDiv = document.createElement('div');
      playerDiv.id = `youtube-player-${Date.now()}`;
      containerRef.current.appendChild(playerDiv);

      new window.YT.Player(playerDiv.id, config);
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      onError?.('Failed to create video player.');
    }
  };

  return (
    <section className={`rounded-2xl bg-white/5 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.45)] overflow-hidden ${className}`}>
      <div className="p-4 sm:p-5 md:p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_20px_rgba(0,0,0,0.4)]">
              <MonitorPlay className="h-4 w-4 text-white/70" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white/90">
              Player
            </h2>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4 md:p-5">
        <div className="relative w-full rounded-xl bg-black/30 ring-1 ring-white/10 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_30px_rgba(0,0,0,0.45)]">
          <div className="aspect-video relative">
            <div
              ref={containerRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};