/**
 * 소개 페이지 — GSAP ScrollTrigger 스크롤 연동 히어로 영상
 */
(function initAboutScrollVideo() {
  if (!document.body.classList.contains('about-page')) return;

  const section = document.querySelector('.scroll-video-section');
  const media = document.querySelector('[data-scroll-video-media]');
  const video = document.querySelector('#scrollVideo');
  if (!section || !media || !video) return;

  const DESKTOP_SOURCES = [
    'videos/plaster-scroll.mp4',
    'assets/picture/bg_mix_video.mp4',
  ];
  const MOBILE_SOURCES = [
    'videos/plaster-scroll-mobile.mp4',
    'assets/picture/bg_mix_video.mp4',
  ];
  const POSTER_SOURCES = [
    'images/plaster-scroll-poster.webp',
    'assets/picture/bg_mix3.png',
  ];
  const SCROLL_SCRUB = 1.2;
  const SMOOTH_FACTOR = 0.08;
  const SEEK_THRESHOLD = 0.01;
  const MOBILE_MQ = window.matchMedia('(max-width: 768px)');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scrollTrigger = null;
  let resizeObserver = null;
  let activeSrc = '';
  let sourceCandidates = DESKTOP_SOURCES;
  let sourceCandidateIndex = 0;

  let targetTime = 0;
  let smoothTime = 0;
  let animationFrameId = null;

  const resolvePath = (path) => {
    try {
      return new URL(path, document.baseURI).href;
    } catch {
      return path;
    }
  };

  const getMaxTime = () => {
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return 0;
    return Math.max(duration - 0.001, 0);
  };

  const clampTime = (time) => Math.min(Math.max(time, 0), getMaxTime());

  const applyPoster = (path) => {
    const resolved = resolvePath(path);
    media.style.setProperty('--scroll-video-poster', `url("${resolved}")`);
    video.setAttribute('poster', path);
  };

  const initPoster = () => {
    applyPoster(POSTER_SOURCES[0]);
  };

  const setPosterFallback = () => {
    media.classList.add('is-video-fallback');
    media.classList.remove('is-video-ready');
    video.classList.remove('is-ready');
    applyPoster(POSTER_SOURCES[POSTER_SOURCES.length - 1]);
  };

  const markVideoReady = () => {
    media.classList.remove('is-video-fallback');
    media.classList.add('is-video-ready');
    video.classList.add('is-ready');
  };

  const stopSmoothLoop = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const destroyScrollScrub = () => {
    stopSmoothLoop();
    scrollTrigger?.kill();
    scrollTrigger = null;
  };

  const cleanup = () => {
    destroyScrollScrub();
    resizeObserver?.disconnect();
    resizeObserver = null;
  };

  const updateVideoTime = () => {
    animationFrameId = null;

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      animationFrameId = requestAnimationFrame(updateVideoTime);
      return;
    }

    targetTime = clampTime(targetTime);

    const difference = targetTime - smoothTime;
    smoothTime += difference * SMOOTH_FACTOR;

    if (Math.abs(difference) < 0.0001) {
      smoothTime = targetTime;
    }

    smoothTime = clampTime(smoothTime);

    if (video.readyState >= 2 && Math.abs(video.currentTime - smoothTime) > SEEK_THRESHOLD) {
      video.pause();
      video.currentTime = smoothTime;
    }

    animationFrameId = requestAnimationFrame(updateVideoTime);
  };

  const startSmoothLoop = () => {
    stopSmoothLoop();
    updateVideoTime();
  };

  const pickSourceList = () => (MOBILE_MQ.matches ? MOBILE_SOURCES : DESKTOP_SOURCES);

  const bindScrollScrub = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (reduceMotion) return;

    destroyScrollScrub();

    gsap.registerPlugin(ScrollTrigger);

    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    targetTime = 0;
    smoothTime = 0;
    video.pause();
    video.currentTime = 0;

    scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: SCROLL_SCRUB,
      invalidateOnRefresh: true,
      onUpdate(self) {
        targetTime = self.progress * getMaxTime();
      },
    });

    startSmoothLoop();
    ScrollTrigger.refresh();
  };

  const onMetadataReady = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      tryNextSource();
      return;
    }

    markVideoReady();
    video.pause();
    targetTime = 0;
    smoothTime = 0;
    video.currentTime = 0;

    if (reduceMotion) return;

    bindScrollScrub();
  };

  const tryNextSource = () => {
    sourceCandidateIndex += 1;
    if (sourceCandidateIndex < sourceCandidates.length) {
      loadVideoSource(sourceCandidates[sourceCandidateIndex]);
      return;
    }
    setPosterFallback();
  };

  const loadVideoSource = (src) => {
    if (src === activeSrc && video.readyState >= 1) {
      onMetadataReady();
      return;
    }

    destroyScrollScrub();
    activeSrc = src;
    media.classList.remove('is-video-ready');
    video.classList.remove('is-ready');

    const onReady = () => {
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('error', onError);
      onMetadataReady();
    };

    const onError = () => {
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('error', onError);
      tryNextSource();
    };

    video.pause();
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('error', onError, { once: true });
    video.src = resolvePath(src);
    video.load();
  };

  const startLoading = () => {
    sourceCandidates = pickSourceList();
    sourceCandidateIndex = 0;
    loadVideoSource(sourceCandidates[0]);
  };

  initPoster();

  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.controls = false;
  video.disablePictureInPicture = true;
  video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
  video.setAttribute('preload', 'auto');
  video.pause();

  startLoading();

  MOBILE_MQ.addEventListener('change', () => {
    activeSrc = '';
    startLoading();
  });

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
    resizeObserver.observe(section);
  }

  window.addEventListener('resize', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });

  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });

  window.addEventListener('pagehide', cleanup);
})();
