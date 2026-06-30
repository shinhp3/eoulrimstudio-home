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
    { src: 'assets/picture/bg_mix_video.mp4', type: 'video/mp4' },
    { src: 'assets/picture/bg_mix_video-720.mp4', type: 'video/mp4' },
    { src: 'assets/picture/bg_mix_video-720.webm', type: 'video/webm; codecs="vp9"' },
  ];
  const MOBILE_SOURCES = [
    { src: 'assets/picture/bg_mix_video.mp4', type: 'video/mp4' },
    { src: 'assets/picture/bg_mix_video-720.mp4', type: 'video/mp4' },
    { src: 'assets/picture/bg_mix_video-540.mp4', type: 'video/mp4' },
  ];
  const POSTER_SOURCES = {
    desktop: 'assets/picture/bg_mix3-poster.webp',
    mobile: 'assets/picture/bg_mix3-poster-mobile.webp',
    fallback: 'assets/picture/bg_mix3.png',
  };
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
    applyPoster(MOBILE_MQ.matches ? POSTER_SOURCES.mobile : POSTER_SOURCES.desktop);
  };

  const setPosterFallback = () => {
    media.classList.add('is-video-fallback');
    media.classList.remove('is-video-ready');
    video.classList.remove('is-ready');
    applyPoster(POSTER_SOURCES.fallback);
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
    video.pause();
    video.removeAttribute('src');
    while (video.firstChild) video.removeChild(video.firstChild);
    video.load();
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

  const pickSourceList = () => {
    const sources = MOBILE_MQ.matches ? MOBILE_SOURCES : DESKTOP_SOURCES;
    const playableSources = sources.filter(({ type }) => !type || !video.canPlayType || video.canPlayType(type));
    return (playableSources.length ? playableSources : sources).map(({ src }) => src);
  };

  const isMobilePlayback = () => MOBILE_MQ.matches;

  const bindMobilePlayback = () => {
    destroyScrollScrub();
    section.classList.add('is-mobile-playback');

    video.loop = true;
    video.setAttribute('loop', '');
    video.currentTime = 0;
    video.preload = 'auto';

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, { once: true });
  };

  const bindScrollScrub = () => {
    if (isMobilePlayback()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (reduceMotion) return;

    section.classList.remove('is-mobile-playback');
    video.loop = false;
    video.removeAttribute('loop');

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

    if (reduceMotion) return;

    if (isMobilePlayback()) {
      bindMobilePlayback();
      return;
    }

    video.pause();
    targetTime = 0;
    smoothTime = 0;
    video.currentTime = 0;
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
    video.preload = 'metadata';
    video.load();
  };

  const startLoading = () => {
    sourceCandidates = pickSourceList();
    sourceCandidateIndex = 0;
    loadVideoSource(sourceCandidates[0]);
  };

  initPoster();

  if (isMobilePlayback()) {
    section.classList.add('is-mobile-playback');
  }

  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.controls = false;
  video.disablePictureInPicture = true;
  video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
  video.setAttribute('preload', 'metadata');
  video.pause();

  if (reduceMotion) {
    setPosterFallback();
    return;
  }

  const updateHeroPastState = () => {
    const past = section.getBoundingClientRect().bottom <= 0;
    section.classList.toggle('is-past', past);

    const cue = document.querySelector('[data-hero-scroll-cue]');
    if (cue && isMobilePlayback()) {
      cue.classList.toggle('is-hidden', window.scrollY > 32 || past);
    }
  };

  updateHeroPastState();
  window.addEventListener('scroll', updateHeroPastState, { passive: true });
  window.addEventListener('resize', updateHeroPastState);

  const scheduleVideoLoad = () => {
    const load = () => {
      if (activeSrc) return;
      startLoading();
    };
    const afterLoad = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(load, { timeout: 1500 });
        return;
      }
      window.setTimeout(load, 500);
    };
    const afterDomReady = () => {
      window.setTimeout(load, 1800);
    };

    if (document.readyState === 'complete') {
      afterLoad();
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', afterDomReady, { once: true });
    } else {
      afterDomReady();
    }

    window.addEventListener('load', afterLoad, { once: true });
  };

  scheduleVideoLoad();

  MOBILE_MQ.addEventListener('change', () => {
    initPoster();
    section.classList.remove('is-mobile-playback');
    video.loop = false;
    video.removeAttribute('loop');
    video.pause();
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
