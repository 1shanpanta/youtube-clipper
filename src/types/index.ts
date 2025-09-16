// Re-export all types for easy importing
export * from './youtube';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TimeInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export interface UrlInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface VideoPlayerProps extends BaseComponentProps {
  videoId?: string;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export interface PlaybackControlsProps extends BaseComponentProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  disabled?: boolean;
}