import { useEffect, useState } from 'react';
import { usePlayerStore } from '../store';
import { parseClipFromUrl, hasClipParams, ClipParams } from '../utils/urlSharing';

/**
 * Hook to orchestrate proper loading with URL params taking priority over localStorage
 */
export const useUrlClipLoader = (isApiReady: boolean) => {
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  const [urlClipData, setUrlClipData] = useState<ClipParams | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUrlParamLoad, setIsUrlParamLoad] = useState(false);

  const {
    url,
    setUrl,
    setStartTime,
    setEndTime,
    setPlaybackRate,
    loadVideo,
    setStatus,
  } = usePlayerStore();

  useEffect(() => {
    // Only run once when API is ready and we haven't initialized yet
    if (!isApiReady || hasInitialized) return;

    const initializeApp = async () => {
      setIsLoadingFromUrl(true);

      // Check URL parameters first (highest priority)
      if (hasClipParams()) {
        const clipData = parseClipFromUrl();

        if (clipData) {
          setUrlClipData(clipData);
          setIsUrlParamLoad(true); // Flag to prevent auto-load effect

          // Construct YouTube URL from video ID
          const youtubeUrl = `https://www.youtube.com/watch?v=${clipData.videoId}`;

          // Load clip data into store (this will override localStorage)
          setUrl(youtubeUrl);
          setStartTime(clipData.startTime);
          setEndTime(clipData.endTime);
          setPlaybackRate(clipData.playbackRate);

          // Load video immediately, let the player component handle the rest
          loadVideo(clipData.videoId);

          // Set initial status - success message will come from video player when ready
          const clipName = clipData.name ? ` "${clipData.name}"` : '';
          setStatus(`Loading shared clip${clipName} from URL...`, 'info');

        } else {
          setStatus('Invalid clip URL parameters', 'error');
        }
      } else {
        // No URL params - check if localStorage has data and load video if needed
        if (url.trim()) {
          const videoId = parseVideoId(url);
          if (videoId) {
            loadVideo(videoId);
            setStatus('Restoring session from localStorage...', 'info');
          }
        } else {
          setStatus('Paste a YouTube URL, set start/end times, then load and play.', 'info');
        }
      }

      setIsLoadingFromUrl(false);
      setHasInitialized(true);
    };

    initializeApp();
  }, [isApiReady, hasInitialized]); // Only depend on API readiness and initialization status

  // Helper function (moved here to avoid unused import warning)
  const parseVideoId = (input: string): string | null => {
    if (!input) return null;

    const idLike = /^[A-Za-z0-9_-]{11}$/;
    if (idLike.test(input)) return input;

    try {
      const u = new URL(input.trim());
      const host = u.hostname.replace('www.', '');

      if (host === 'youtu.be') {
        const seg = u.pathname.split('/').filter(Boolean)[0];
        if (idLike.test(seg)) return seg;
      }

      if (host.endsWith('youtube.com')) {
        const v = u.searchParams.get('v');
        if (idLike.test(v || '')) return v;
      }
    } catch {
      // URL parsing failed, continue to regex matching
    }

    const rx = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|live\/|)([A-Za-z0-9_-]{11})/;
    const m = input.match(rx);
    if (m && m[1]) return m[1];

    return null;
  };

  // Function to reset URL param load flag when user manually changes URL
  const resetUrlParamLoad = () => {
    setIsUrlParamLoad(false);
  };

  return {
    isLoadingFromUrl,
    urlClipData,
    hasSharedClip: !!urlClipData,
    hasInitialized,
    isUrlParamLoad, // Expose this flag to prevent auto-load conflicts
    resetUrlParamLoad, // Allow manual reset of the flag
  };
};