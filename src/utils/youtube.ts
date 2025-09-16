/**
 * Utility functions for YouTube API integration
 */

/**
 * Parse various YouTube URL formats and extract video ID
 */
export const parseVideoId = (input: string): string | null => {
  if (!input) return null;

  // Check if input is already a valid video ID
  const idLike = /^[A-Za-z0-9_-]{11}$/;
  if (idLike.test(input)) return input;

  try {
    const u = new URL(input.trim());
    const host = u.hostname.replace('www.', '');

    // Handle youtu.be format
    if (host === 'youtu.be') {
      const seg = u.pathname.split('/').filter(Boolean)[0];
      if (idLike.test(seg)) return seg;
    }

    // Handle youtube.com formats
    if (host.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (idLike.test(v || '')) return v;

      const path = u.pathname.split('/').filter(Boolean);
      if (path.length >= 2) {
        const maybeId = path[1];
        if (idLike.test(maybeId)) return maybeId;
      }
    }
  } catch {
    // Fall through to regex matching
  }

  // Fallback regex matching
  const rx =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|live\/|)([A-Za-z0-9_-]{11})/;
  const m = input.match(rx);
  if (m && m[1]) return m[1];

  return null;
};

/**
 * Parse time input in various formats and return seconds
 */
export const parseTimeInput = (input: string): number => {
  if (!input || typeof input !== 'string') return NaN;

  const trimmed = input.trim().toLowerCase();

  // Handle pure numbers (backwards compatibility)
  if (/^\d+\.?\d*$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Handle seconds only format: "50s", "160s"
  const secondsMatch = trimmed.match(/^(\d+\.?\d*)s$/);
  if (secondsMatch) {
    return parseFloat(secondsMatch[1]);
  }

  // Handle minutes and seconds format: "1m26s", "2m30s", "0m45s"
  const minutesSecondsMatch = trimmed.match(/^(\d+)m(\d+\.?\d*)s$/);
  if (minutesSecondsMatch) {
    const minutes = parseInt(minutesSecondsMatch[1]);
    const seconds = parseFloat(minutesSecondsMatch[2]);
    return minutes * 60 + seconds;
  }

  // Handle minutes only format: "1m", "2m"
  const minutesOnlyMatch = trimmed.match(/^(\d+)m$/);
  if (minutesOnlyMatch) {
    const minutes = parseInt(minutesOnlyMatch[1]);
    return minutes * 60;
  }

  return NaN;
};

/**
 * Format seconds into human-readable time string
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Validate time range
 */
export const validateTimeRange = (startTime: string, endTime: string, videoDuration?: number): {
  isValid: boolean;
  startSeconds: number;
  endSeconds: number;
  error?: string;
} => {
  const startSeconds = parseTimeInput(startTime);
  const endSeconds = parseTimeInput(endTime);

  if (isNaN(startSeconds) || isNaN(endSeconds)) {
    return {
      isValid: false,
      startSeconds: NaN,
      endSeconds: NaN,
      error: 'Invalid time format. Use formats like: 50, 50s, 1m26s, or 2m.',
    };
  }

  if (startSeconds < 0) {
    return {
      isValid: false,
      startSeconds,
      endSeconds,
      error: 'Start time cannot be negative.',
    };
  }

  if (endSeconds <= startSeconds) {
    return {
      isValid: false,
      startSeconds,
      endSeconds,
      error: 'End time must be greater than start time.',
    };
  }

  if (videoDuration && videoDuration > 0 && endSeconds > videoDuration) {
    return {
      isValid: false,
      startSeconds,
      endSeconds,
      error: `End time (${endSeconds}s) exceeds video duration (${videoDuration.toFixed(1)}s).`,
    };
  }

  return {
    isValid: true,
    startSeconds,
    endSeconds,
  };
};

/**
 * Load YouTube IFrame API
 */
export const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Check if script is already loading
    if (window.onYouTubeIframeAPIReady) {
      // API is loading, wait for it
      const originalCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        originalCallback();
        resolve();
      };
      return;
    }

    // Load the API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
};

// Declare global types for YouTube API
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: unknown) => unknown;
    };
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}