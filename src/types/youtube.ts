// YouTube API types
export interface YouTubePlayer {
  destroy: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getPlayerState: () => PlayerState;
}

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

export interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: PlayerState;
}

export interface YouTubePlayerConfig {
  height: string;
  width: string;
  videoId: string;
  host?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    modestbranding?: 0 | 1;
    rel?: 0 | 1;
    controls?: 0 | 1;
    playsinline?: 0 | 1;
    origin?: string;
  };
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerEvent) => void;
  };
}

// App-specific types
export interface VideoInfo {
  id: string;
  url: string;
  title?: string;
  duration?: number;
  thumbnail?: string;
}

export interface Clip {
  id: string;
  videoId: string;
  name: string;
  startTime: number;
  endTime: number;
  playbackRate: number;
  createdAt: Date;
  tags?: string[];
}

export interface ClipPreset {
  name: string;
  duration: number; // in seconds
  label: string;
}

export type TimeInputFormat = 'seconds' | 'minutes-seconds' | 'mixed';

export interface AppStatus {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLooping: boolean;
  activeClip: Clip | null;
}