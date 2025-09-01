import  { useState, useRef, useEffect } from 'react';
import { Link2, Clock, Play, Pause, Repeat, Info, MonitorPlay, Clapperboard, AlertTriangle } from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('Paste a YouTube URL, set start/end times, then load and play.');
  const [apiReady, setApiReady] = useState(!!(window.YT && window.YT.Player));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const playerInstanceRef = useRef(null);
  const loopTimerRef = useRef(null);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    return () => {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
        try { playerInstanceRef.current.destroy(); } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (url && url.trim()) {
      const debounceTimer = setTimeout(() => {
        loadVideo();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [url, apiReady]);

  const parseVideoId = (input) => {
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

        const path = u.pathname.split('/').filter(Boolean);
        if (path.length >= 2) {
          const maybeId = path[1];
          if (idLike.test(maybeId)) return maybeId;
        }
      }
    } catch (e) {}

    const rx =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|live\/|)([A-Za-z0-9_-]{11})/;
    const m = input.match(rx);
    if (m && m[1]) return m[1];

    return null;
  };

  const destroyPlayer = () => {
    if (playerInstanceRef.current) {
      try { playerInstanceRef.current.destroy(); } catch {}
      playerInstanceRef.current = null;
    }
  };

  const stopLoop = () => {
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  };

  const pauseClip = () => {
    const player = playerInstanceRef.current;
    if (!player || !player.pauseVideo) {
      setStatus('No video loaded to pause.');
      return;
    }

    stopLoop();
    player.pauseVideo();
    setIsPlaying(false);
    setStatus('Clip paused.');
  };

  const loadVideo = () => {
    const id = parseVideoId(url);
    if (!id) {
      setStatus('Invalid URL. Please paste a full YouTube link or a valid video ID.');
      return;
    }
    if (!apiReady) {
      setStatus('Loading YouTube API… please wait.');
      return;
    }

    setStatus('Loading video…');
    stopLoop();
    destroyPlayer();

    playerInstanceRef.current = new window.YT.Player('player', {
      height: '360',
      width: '640',
      videoId: id,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        controls: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          setStatus('Video ready. Set times and click Play Clip to loop.');
          if (playbackRate !== 1) {
            event.target.setPlaybackRate(playbackRate);
          }
        },
        onError: () => {
          setStatus('Failed to load video. Please verify the URL.');
        },
      },
    });
  };

  const playClip = () => {
    const s = parseFloat(startTime);
    const e = parseFloat(endTime);

    if (isNaN(s) || isNaN(e) || s < 0 || e <= s) {
      setStatus('Invalid times. Enter seconds only. End time must be greater than Start time.');
      return;
    }
    const player = playerInstanceRef.current;
    if (!player || !player.seekTo) {
      setStatus('Load a video first, then set times.');
      return;
    }

    const duration = player.getDuration ? player.getDuration() : 0;
    
    // Check if end time exceeds video duration
    if (duration > 0 && e > duration) {
      setStatus(`End time (${e}s) exceeds video duration (${duration.toFixed(1)}s). Please adjust the end time.`);
      return;
    }

    stopLoop();

    let endBound = e;
    if (duration > 0 && endBound > duration) {
      endBound = Math.max(0, duration - 0.05);
    }

    try {
      if (playbackRate !== 1 && player.setPlaybackRate) {
        player.setPlaybackRate(playbackRate);
      }
      player.seekTo(s, true);
      player.playVideo();
      setIsPlaying(true);
      const rateText = playbackRate !== 1 ? ` at ${playbackRate}x speed` : '';
      setStatus(`Playing clip ${s.toFixed(2)}s → ${endBound.toFixed(2)}s (looping)${rateText}`);
    } catch (err) {
      setStatus('Unable to play. Please try reloading the video.');
      return;
    }

    loopTimerRef.current = setInterval(() => {
      if (!player || !player.getCurrentTime) return;
      const t = player.getCurrentTime();
      if (t >= endBound - 0.02) {
        player.seekTo(s, true);
        player.playVideo();
      }
    }, 200);
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    const player = playerInstanceRef.current;
    if (player && player.setPlaybackRate) {
      player.setPlaybackRate(rate);
    }
  };

  const onEnterPlay = (e) => {
    if (e.key === 'Enter') {
      playClip();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#0a0a0b] text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-100" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji' }}>
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0b] to-black"></div>
        <div className="pointer-events-none absolute -inset-24 opacity-30"></div>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent 40%)' }}></div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ background: 'radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%)' }}></div>
      </div>

      <main className="w-full max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-6 sm:mb-8 w-full flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_30px_rgba(0,0,0,0.45)] flex items-center justify-center">
              <span className="text-white/80 font-semibold tracking-tight">YL</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tight font-semibold text-white/90">
                YouTube Clipper & Looper
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Paste a link, set a range, loop it endlessly.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Warning */}
        <div className="block lg:hidden mb-6 rounded-xl bg-amber-500/10 backdrop-blur-sm ring-1 ring-amber-400/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-200">
              <p className="font-medium mb-1">Desktop Experience Recommended</p>
              <p className="text-amber-200/80">This app is optimized for laptop/desktop screens. While it works on mobile, the experience is not fully responsive.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Controls Card */}
          <section className="rounded-2xl bg-white/5 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.45)]">
            <div className="p-5 sm:p-6 md:p-7">
              <div className="space-y-5">
                {/* URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2 mb-1">
                    <Link2 className="h-4 w-4 text-white/60" />
                    YouTube URL
                  </label>
                  <div className="w-full rounded-xl bg-white/5 ring-1 ring-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.35)] focus-within:ring-white/20 transition">
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="w-full bg-transparent outline-none px-4 py-3 text-sm sm:text-base placeholder:text-white/35 text-white/90 focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Playback Speed */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2 mb-1">
                    <MonitorPlay className="h-4 w-4 text-white/60" />
                    Playback Speed
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`px-3 py-2 text-xs rounded-lg ring-1 transition ${
                          playbackRate === rate
                            ? 'bg-cyan-400/20 text-cyan-200 ring-cyan-300/30'
                            : 'bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white/90'
                        }`}
                      >
                        {rate === 0.25 || rate === 0.5 || rate === 0.75 ? `${rate}x (Slow)` : `${rate}x`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-white/60" />
                      Start (s)
                    </label>
                    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.35)] focus-within:ring-white/20 transition">
                      <input
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        onKeyDown={onEnterPlay}
                        inputMode="decimal"
                        placeholder="0"
                        className="w-full bg-transparent outline-none px-4 py-3 text-sm sm:text-base placeholder:text-white/35 text-white/90"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-white/60" />
                      End (s)
                    </label>
                    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.35)] focus-within:ring-white/20 transition">
                      <input
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        onKeyDown={onEnterPlay}
                        inputMode="decimal"
                        placeholder="10"
                        className="w-full bg-transparent outline-none px-4 py-3 text-sm sm:text-base placeholder:text-white/35 text-white/90"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={playClip}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-medium bg-white/5 text-white/90 ring-1 ring-white/10 hover:bg-white/7 hover:ring-white/20 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 flex-1 sm:flex-none"
                      title="Play Clip"
                    >
                      <Play className="h-5 w-5 text-emerald-300 group-hover:text-emerald-200" />
                      Play
                    </button>
                    <button
                      onClick={pauseClip}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-medium bg-white/5 text-white/90 ring-1 ring-white/10 hover:bg-white/7 hover:ring-white/20 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 flex-1 sm:flex-none"
                      title="Pause Clip"
                    >
                      <Pause className="h-5 w-5 text-red-300 group-hover:text-red-200" />
                      Pause
                    </button>
                  </div>

                  <div className="sm:ml-auto flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 rounded-xl px-3 py-2 bg-white/5 ring-1 ring-white/10">
                      <Repeat className="h-4 w-4 text-white/60" />
                      Auto-loop enabled
                    </div>
                    <button
                      className="group inline-flex items-center justify-center rounded-xl p-2 bg-amber-400/10 text-amber-200 ring-1 ring-amber-300/20 hover:bg-amber-400/15 hover:ring-amber-300/30 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      title="⚠️ Important Tips: 1) Don't play the same video on YouTube and this website simultaneously - it may cause playback conflicts and audio overlap. 2) Close YouTube tabs with the same video for best experience. 3) Use headphones to avoid audio feedback if testing multiple players."
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-200 group-hover:text-amber-100" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_6px_20px_rgba(0,0,0,0.35)]">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 mt-0.5 text-white/70" title="Status" />
                    <p className="text-sm text-white/80">{status}</p>
                  </div>
                </div>

                {/* Tips */}
                <div className="text-[11px] sm:text-xs text-amber-200/60">
                  ⚠️ Avoid playing the same video on YouTube and here simultaneously to prevent conflicts.
                </div>
              </div>
            </div>
          </section>

          {/* Player Card */}
          <section className="rounded-2xl bg-white/5 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.45)] overflow-hidden">
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
                <div className="aspect-video">
                  <div id="player" className="w-full h-full"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;