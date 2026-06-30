/**
 * 소개 페이지 영상 — 진입 페이지에서 HTTP 캐시만 미리 워밍 (재생·디코딩 없음)
 */
(function prefetchAboutVideo() {
  if (document.body.classList.contains('about-page')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) return;

  const PREFETCH_SRC = 'assets/picture/bg_mix_video.mp4';
  const resolvePath = (path) => {
    try {
      return new URL(path, document.baseURI).href;
    } catch {
      return path;
    }
  };

  let prefetched = false;

  const prefetch = () => {
    if (prefetched) return;
    prefetched = true;

    const href = resolvePath(PREFETCH_SRC);
    if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    link.href = href;
    document.head.appendChild(link);
  };

  const bindAboutLinkPrefetch = () => {
    document.querySelectorAll('a[href*="about"]').forEach((anchor) => {
      anchor.addEventListener('mouseenter', prefetch, { once: true });
      anchor.addEventListener('focus', prefetch, { once: true });
      anchor.addEventListener('touchstart', prefetch, { once: true, passive: true });
    });
  };

  const schedulePrefetch = () => {
    bindAboutLinkPrefetch();

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch, { timeout: 5000 });
      return;
    }

    window.setTimeout(prefetch, 3500);
  };

  if (document.readyState === 'complete') {
    schedulePrefetch();
  } else {
    window.addEventListener('load', schedulePrefetch, { once: true });
  }
})();
