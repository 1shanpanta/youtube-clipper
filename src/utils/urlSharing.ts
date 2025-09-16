
export interface ClipParams {
  videoId: string;
  startTime: string;
  endTime: string;
  playbackRate: number;
  name?: string;
}

/**
 * Parse URL parameters to extract clip data
 */
export const parseClipFromUrl = (): ClipParams | null => {
  const urlParams = new URLSearchParams(window.location.search);

  const videoId = urlParams.get('v');
  const startTime = urlParams.get('start') || '';
  const endTime = urlParams.get('end') || '';
  const speed = urlParams.get('speed') || '1';
  const name = urlParams.get('name') || undefined;

  // Must have at least video ID
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    startTime,
    endTime,
    playbackRate: parseFloat(speed),
    name,
  };
};

/**
 * Generate shareable URL for current clip
 */
export const generateClipUrl = (params: ClipParams): string => {
  const urlParams = new URLSearchParams();

  urlParams.set('v', params.videoId);

  if (params.startTime) {
    urlParams.set('start', params.startTime);
  }

  if (params.endTime) {
    urlParams.set('end', params.endTime);
  }

  if (params.playbackRate !== 1) {
    urlParams.set('speed', params.playbackRate.toString());
  }

  if (params.name) {
    urlParams.set('name', params.name);
  }

  return `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
};

/**
 * Copy clip URL to clipboard
 */
export const copyClipUrl = async (params: ClipParams): Promise<boolean> => {
  try {
    const url = generateClipUrl(params);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
};

/**
 * Update current URL without page reload
 */
export const updateUrlWithClip = (params: ClipParams): void => {
  const url = generateClipUrl(params);
  const newUrl = new URL(url);

  // Update URL without page reload
  window.history.replaceState({}, '', newUrl.search);
};

/**
 * Clear URL parameters
 */
export const clearUrlParams = (): void => {
  window.history.replaceState({}, '', window.location.pathname);
};

/**
 * Validate if URL has clip parameters
 */
export const hasClipParams = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('v');
};