import { useEffect, useState } from 'react';
import { loadYouTubeAPI } from '../utils/youtube';

/**
 * Hook to manage YouTube IFrame API loading
 */
export const useYouTubeAPI = () => {
  const [isApiReady, setIsApiReady] = useState(() => {
    return !!(window.YT && window.YT.Player);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isApiReady) return;

    setIsLoading(true);
    setError(null);

    loadYouTubeAPI()
      .then(() => {
        setIsApiReady(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load YouTube API');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isApiReady]);

  return { isApiReady, isLoading, error };
};