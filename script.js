const resolvePath = (path) => {
  try {
    return new URL(path, document.baseURI).href;
  } catch {
    return path;
  }
};

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const sectionNavLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-menu a')];
const processSection = document.querySelector('#process');

const progressBar = document.querySelector('.page-progress i');
const scrollTopBtn = document.querySelector('.scroll-top');
const SCROLL_TOP_THRESHOLD = 400;
const SCROLL_TOP_IDLE_MS = 1600;
let scrollTopIdleTimer = null;

const scheduleScrollTopFade = () => {
  if (!scrollTopBtn) return;
  clearTimeout(scrollTopIdleTimer);
  scrollTopIdleTimer = setTimeout(() => {
    if (scrollTopBtn.classList.contains('is-visible')) {
      scrollTopBtn.classList.add('is-fading');
    }
  }, SCROLL_TOP_IDLE_MS);
};

const updateScrollTop = (scrollY = window.scrollY) => {
  if (!scrollTopBtn) return;

  if (scrollY <= SCROLL_TOP_THRESHOLD) {
    scrollTopBtn.classList.remove('is-visible', 'is-fading');
    clearTimeout(scrollTopIdleTimer);
    return;
  }

  scrollTopBtn.classList.add('is-visible');
  scrollTopBtn.classList.remove('is-fading');
  scheduleScrollTopFade();
};
const hero = document.querySelector('.hero');
const cursor = document.querySelector('.cursor');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const updateHeader = (scrollY = window.scrollY) => {
  if (!header || !progressBar) return;
  header.classList.toggle('scrolled', window.scrollY > 40 || document.body.classList.contains('inner-page'));
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
  updateScrollTop(scrollY);
};

const linkTargetHash = (href) => {
  if (!href) return '';
  try {
    return new URL(href, document.baseURI).hash;
  } catch {
    return href.startsWith('#') ? href : '';
  }
};

const updateSectionNavigation = () => {
  if (!processSection || !header) return;

  const processIsActive = processSection.getBoundingClientRect().top <= header.offsetHeight + 48;
  const activeHref = processIsActive ? '#process' : '#top';

  sectionNavLinks.forEach((link) => {
    const hash = linkTargetHash(link.getAttribute('href'));
    if (hash === '#top' || hash === '#process') {
      if (hash === activeHref) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  });
};

updateHeader();
updateSectionNavigation();

if (document.body.classList.contains('about-page')) {
  const normalizePath = (pathname) => {
    const path = pathname.replace(/\\/g, '/').replace(/\/index\.html$/i, '').replace(/\/$/, '');
    return path || '/';
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    let url;
    try {
      url = new URL(link.href, document.baseURI);
    } catch {
      return;
    }

    if (!url.hash) return;

    const currentPath = normalizePath(location.pathname);
    const linkPath = normalizePath(url.pathname);
    if (linkPath !== currentPath) return;

    const target = document.querySelector(url.hash);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    updateSectionNavigation();
  });
}

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', (event) => {
    event.preventDefault();
    clearTimeout(scrollTopIdleTimer);
    scrollTopBtn.classList.remove('is-visible', 'is-fading');
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  });

  scrollTopBtn.addEventListener('transitionend', (event) => {
    if (event.target !== scrollTopBtn || event.propertyName !== 'opacity') return;
    if (!scrollTopBtn.classList.contains('is-fading')) return;
    scrollTopBtn.classList.remove('is-visible', 'is-fading');
  });

  scrollTopBtn.addEventListener('mouseenter', () => {
    scrollTopBtn.classList.remove('is-fading');
    clearTimeout(scrollTopIdleTimer);
  });

  scrollTopBtn.addEventListener('mouseleave', () => {
    if (scrollTopBtn.classList.contains('is-visible')) scheduleScrollTopFade();
  });

  scrollTopBtn.addEventListener('focus', () => {
    scrollTopBtn.classList.remove('is-fading');
    clearTimeout(scrollTopIdleTimer);
  });
  scrollTopBtn.addEventListener('blur', () => {
    if (scrollTopBtn.classList.contains('is-visible')) scheduleScrollTopFade();
  });
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }));
}

const projectData = {
  '01': {
    title: '둥근 형태를 살린 도자기 괄사',
    year: '2026',
    type: '솔리드 캐스팅',
    service: '3D 모델링 · 몰드 제작 · 테스트',
    images: [
      'assets/picture/pj_1/pj_1_main.png',
      'assets/picture/pj_1/pj_1_sub_1.png',
      'assets/picture/pj_1/pj_1_sub_2.png',
    ],
    kicker: '손에 닿는 곡선을 정확하게 구현합니다.',
    description: '곡면의 형태와 탈형 방향을 고려해 제작한 석고몰드입니다. 솔리드 캐스팅을 위해 별도의 주입구를 설계했으며, 실제 캐스팅 테스트를 통해 주입과 탈형 과정을 확인했습니다.'
  },
  '02': {
    title: '분할선이 없는 꽃 찻잔',
    year: '2026',
    type: '최소 분할 몰드 · 분할선 설계',
    service: '원형 제작 · 분할선 설계 · 표면 정리',
    images: [
      'assets/picture/pj_2/pj_2_main.png',
      'assets/picture/pj_2/pj_2_sub.png',
    ],
    kicker: '분할선이 남지않도록 최소한의 피스',
    description: '원물의 수축률을 계산해 몰드 크기와 구조를 설계했습니다. 표면 문양을 최대한 온전히 유지할 수 있도록 분할 위치를 조정하고, 분할선이 기물의 주요 표면에 남지 않도록 2피스 구조로 제작했습니다.'
  },
  '03': {
    title: '음각이 깔끔하게 표현되는 작품',
    year: '2026',
    type: '양각 표현 · 분할 설계',
    service: '양각 표현 테스트 · 표면 품질 검토',
    images: [
      'assets/picture/pj_3/pj_3_main.png',
      'assets/picture/pj_3/pj_3_sub_1.png',
      'assets/picture/pj_3/pj_3_sub_2.png',
      'assets/picture/pj_3/pj_3_sub_3.png',
    ],
    kicker: '양각 캐릭터의 형태를 선명하게 유지합니다.',
    description: '표면의 양각 캐릭터가 선명하게 구현되도록 몰드 구조와 분할 위치를 설계했습니다.'
  },
};

const getProjectImages = (project) =>
  Array.isArray(project?.images) ? project.images.filter(Boolean) : [];

const getOptimizedImageSrc = (src) =>
  typeof src === 'string' && /\.(png|jpe?g)$/i.test(src)
    ? src.replace(/\.(png|jpe?g)$/i, '.webp')
    : src;

const getGalleryColumnCount = (count) => {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  return 3;
};

const renderProjectGallery = (project) => {
  const images = getProjectImages(project);
  const gallery = document.querySelector('[data-project-gallery]');
  if (!gallery || !images.length) return;

  gallery.classList.add(`is-count-${getGalleryColumnCount(images.length)}`);
  gallery.innerHTML = images
    .map((src, index) => {
      const figureClass = index === 0 ? ' class="detail-hero"' : '';
      const alt =
        index === 0
          ? `${project.title} 대표 이미지`
          : `${project.title} 이미지 ${index + 1}`;
      const optimizedSrc = getOptimizedImageSrc(src);
      const loading = index === 0 ? 'eager' : 'lazy';
      const fetchPriority = index === 0 ? 'high' : 'auto';
      return `<figure${figureClass}><button type="button" class="detail-gallery__trigger" data-gallery-index="${index}" data-cursor="확대" aria-label="${alt} 확대 보기"><img src="${optimizedSrc}" alt="${alt}" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}"></button></figure>`;
    })
    .join('');

  initProjectLightbox(project);

  if (typeof window.bindCursorTargets === 'function') {
    window.bindCursorTargets();
  }
};

const initProjectLightbox = (project) => {
  const lightbox = document.querySelector('[data-project-lightbox]');
  const gallery = document.querySelector('[data-project-gallery]');
  if (!lightbox || !gallery) return;

  const images = getProjectImages(project);
  if (!images.length) return;

  const alts = images.map((_, index) =>
    index === 0
      ? `${project.title} 대표 이미지`
      : `${project.title} 이미지 ${index + 1}`,
  );

  const viewport = lightbox.querySelector('[data-lightbox-viewport]');
  const track = lightbox.querySelector('[data-lightbox-track]');
  const counterEl = lightbox.querySelector('[data-lightbox-counter]');
  const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
  const nextBtn = lightbox.querySelector('[data-lightbox-next]');
  const closeBtn = lightbox.querySelector('.project-lightbox__close');
  const dialog = lightbox.querySelector('.project-lightbox__dialog');
  const backdrop = lightbox.querySelector('.project-lightbox__backdrop');
  const showNav = images.length > 1;
  const mobileLightbox = window.matchMedia('(max-width: 640px)');

  if (track) {
    track.innerHTML = images
      .map(
        (src, index) => `
<div class="project-lightbox__slide">
  <img src="${resolvePath(getOptimizedImageSrc(src))}" alt="${alts[index]}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" draggable="false">
</div>`.trim(),
      )
      .join('');
  }

  let currentIndex = 0;
  let lastFocused = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragPx = 0;
  let dragPy = 0;
  let dragMode = 'pending';
  let isDragging = false;
  let activePointerId = null;

  const slideWidth = () => viewport?.getBoundingClientRect().width || 0;

  const clampIndex = (index) => Math.min(images.length - 1, Math.max(0, index));

  const applyPosition = (offsetPx = 0) => {
    if (!track) return;
    let offset = offsetPx;
    if (currentIndex === 0 && offset > 0) offset *= 0.3;
    if (currentIndex === images.length - 1 && offset < 0) offset *= 0.3;
    track.style.transform = `translate3d(${-(currentIndex * slideWidth()) + offset}px, 0, 0)`;
  };

  const updateChrome = () => {
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
      counterEl.hidden = !showNav;
    }
    const showButtons = showNav && !mobileLightbox.matches;
    if (prevBtn) {
      prevBtn.hidden = !showButtons;
      prevBtn.disabled = currentIndex === 0;
    }
    if (nextBtn) {
      nextBtn.hidden = !showButtons;
      nextBtn.disabled = currentIndex === images.length - 1;
    }
  };

  const goTo = (index, { animate = true } = {}) => {
    if (!track || !viewport) return;
    const nextIndex = clampIndex(index);
    if (nextIndex === currentIndex && animate) {
      applyPosition(0);
      return;
    }
    currentIndex = nextIndex;
    updateChrome();
    track.classList.toggle('is-animating', animate && !reduceMotion);
    applyPosition(0);
    if (!animate || reduceMotion) {
      track.classList.remove('is-animating');
    }
  };

  const step = (delta) => {
    goTo(currentIndex + delta, { animate: !reduceMotion });
  };

  const resetDismiss = () => {
    dragPy = 0;
    dragMode = 'pending';
    lightbox.classList.remove('is-dismissing');
    dialog?.classList.remove('is-snapping');
    backdrop?.classList.remove('is-snapping');
    if (dialog) {
      dialog.style.transform = '';
      dialog.style.opacity = '';
    }
    if (backdrop) backdrop.style.opacity = '';
  };

  const applyDismiss = (offsetPx = 0) => {
    if (!dialog) return;
    const progress = Math.min(1, offsetPx / 280);
    dialog.style.transform = `translate3d(0, ${offsetPx}px, 0)`;
    dialog.style.opacity = String(1 - progress * 0.35);
    if (backdrop) backdrop.style.opacity = String(1 - progress * 0.55);
  };

  const snapBackDismiss = () => {
    if (!dialog) return;
    dialog.classList.add('is-snapping');
    backdrop?.classList.add('is-snapping');
    applyDismiss(0);
    window.setTimeout(() => {
      resetDismiss();
    }, 320);
  };

  const dismissAndClose = () => {
    if (!dialog) {
      close();
      return;
    }
    dialog.classList.add('is-snapping');
    backdrop?.classList.add('is-snapping');
    applyDismiss(window.innerHeight * 0.35);
    window.setTimeout(() => {
      close();
    }, 240);
  };

  const close = () => {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    resetDismiss();
    if (typeof lastFocused?.focus === 'function') lastFocused.focus();
  };

  const open = (index) => {
    resetDismiss();
    currentIndex = index;
    updateChrome();
    goTo(index, { animate: false });
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn?.focus();
  };

  const onPointerDown = (event) => {
    if (lightbox.hidden || !viewport) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const isMobile = mobileLightbox.matches;
    if (!isMobile && !showNav) return;

    isDragging = true;
    dragMode = 'pending';
    activePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragPx = 0;
    dragPy = 0;
    viewport.classList.add('is-dragging');
    track?.classList.remove('is-animating');
    viewport.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!isDragging || event.pointerId !== activePointerId) return;

    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;

    if (dragMode === 'pending') {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX < 8 && absY < 8) return;

      if (mobileLightbox.matches && absY > absX && dy > 0) {
        dragMode = 'vertical';
        lightbox.classList.add('is-dismissing');
      } else if (showNav && absX >= absY) {
        dragMode = 'horizontal';
      } else {
        isDragging = false;
        activePointerId = null;
        viewport?.classList.remove('is-dragging');
        viewport?.releasePointerCapture(event.pointerId);
        return;
      }
    }

    if (dragMode === 'horizontal') {
      dragPx = dx;
      applyPosition(dragPx);
      return;
    }

    if (dragMode === 'vertical') {
      dragPy = Math.max(0, dy);
      applyDismiss(dragPy);
    }
  };

  const finishDrag = (event) => {
    if (!isDragging || event.pointerId !== activePointerId) return;

    const mode = dragMode;
    isDragging = false;
    activePointerId = null;
    dragMode = 'pending';
    viewport?.classList.remove('is-dragging');
    viewport?.releasePointerCapture(event.pointerId);

    if (mode === 'vertical') {
      const threshold = Math.min(120, window.innerHeight * 0.14);
      if (dragPy > threshold) dismissAndClose();
      else snapBackDismiss();
      dragPx = 0;
      dragPy = 0;
      return;
    }

    if (mode === 'horizontal') {
      const width = slideWidth();
      const threshold = width * 0.16;

      if (dragPx < -threshold && currentIndex < images.length - 1) step(1);
      else if (dragPx > threshold && currentIndex > 0) step(-1);
      else goTo(currentIndex, { animate: !reduceMotion });
    }

    dragPx = 0;
    dragPy = 0;
  };

  gallery.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-gallery-index]');
    if (!trigger) return;
    open(Number(trigger.dataset.galleryIndex));
  });

  prevBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    step(-1);
  });
  nextBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    step(1);
  });
  lightbox.querySelectorAll('[data-lightbox-close]').forEach((element) => {
    element.addEventListener('click', close);
  });

  backdrop?.addEventListener('click', () => {
    if (mobileLightbox.matches) close();
  });

  window.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft' && showNav && currentIndex > 0) step(-1);
    if (event.key === 'ArrowRight' && showNav && currentIndex < images.length - 1) step(1);
  });

  viewport?.addEventListener('pointerdown', onPointerDown);
  viewport?.addEventListener('pointermove', onPointerMove);
  viewport?.addEventListener('pointerup', finishDrag);
  viewport?.addEventListener('pointercancel', finishDrag);

  window.addEventListener('resize', () => {
    if (lightbox.hidden) return;
    goTo(currentIndex, { animate: false });
  });

  updateChrome();
  goTo(0, { animate: false });
};

const renderPortfolioCatalog = () => {
  const catalog = document.querySelector('[data-portfolio-catalog]');
  if (!catalog) return;

  catalog.innerHTML = Object.entries(projectData)
    .map(([id, project], index) => {
      const thumb = getProjectImages(project)[0];
      if (!thumb) return '';

      const optimizedThumb = getOptimizedImageSrc(thumb);
      const loading = index < 3 ? 'eager' : 'lazy';
      const fetchPriority = index === 0 ? 'high' : 'auto';
      return `
<a class="portfolio-card reveal" href="${typeof window.pageUrl === "function" ? window.pageUrl(`project/?id=${id}`) : `project/?id=${id}`}" data-cursor="상세 보기">
  <figure><img src="${optimizedThumb}" alt="${project.title}" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}"><span>${id}</span></figure>
  <div><h2>${project.title}</h2><p>${project.type} · ${project.year}</p></div>
</a>`.trim();
    })
    .join('');

  if (typeof window.bindCursorTargets === 'function') {
    window.bindCursorTargets();
  }
};

const initProjectDetailPage = () => {
  const detailPage = document.querySelector('[data-project-detail]');
  if (!detailPage) return;

  const id = new URLSearchParams(window.location.search).get('id') || '01';
  const keys = Object.keys(projectData);
  const safeId = projectData[id] ? id : '01';
  const project = projectData[safeId];
  const nextId = keys[(keys.indexOf(safeId) + 1) % keys.length];
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  renderProjectGallery(project);
  setText('[data-project-number]', safeId);
  setText('[data-project-title]', project.title);
  setText('[data-project-year]', project.year);
  setText('[data-project-type]', project.type);
  setText('[data-project-service]', project.service);
  setText('[data-project-kicker]', project.kicker);
  setText('[data-project-description]', project.description);

  const nextProject = document.querySelector('[data-next-project]');
  if (nextProject) {
    nextProject.href =
      typeof window.pageUrl === "function"
        ? window.pageUrl(`project/?id=${nextId}`)
        : `project/?id=${nextId}`;
    nextProject.setAttribute('aria-label', `다음 프로젝트: ${projectData[nextId].title}`);
  }
  document.title = `${project.title} | 어울림`;
};

const initCatalogViewToggle = () => {
  const catalog = document.querySelector('[data-portfolio-catalog]');
  const toggle = document.querySelector('[data-catalog-view-toggle]');
  if (!catalog || !toggle) return;

  const syncToggle = () => {
    const isDual = catalog.classList.contains('is-dual-column');
    toggle.setAttribute('aria-pressed', String(isDual));
    toggle.setAttribute('aria-label', isDual ? '1열 보기' : '2열 보기');
  };

  try {
    if (localStorage.getItem('catalog-view') === 'dual') {
      catalog.classList.add('is-dual-column');
    }
  } catch (error) {
    // localStorage unavailable
  }

  toggle.addEventListener('click', () => {
    catalog.classList.toggle('is-dual-column');
    syncToggle();
    try {
      localStorage.setItem(
        'catalog-view',
        catalog.classList.contains('is-dual-column') ? 'dual' : 'single',
      );
    } catch (error) {
      // localStorage unavailable
    }
  });

  syncToggle();
};

renderPortfolioCatalog();
initProjectDetailPage();
initCatalogViewToggle();

const revealItems = [...document.querySelectorAll('.reveal')];
const reversibleReveal = document.body.classList.contains('about-page');
const revealEntries = revealItems.map((item) => {
  const parent = item.parentElement;
  const sequentialParent = parent && parent.matches('.intro-grid, .principle-list, .process-list, .stats');
  const delay = sequentialParent ? [...parent.children].indexOf(item) * 0.08 : 0;
  return { item, delay };
});
const projects = [...document.querySelectorAll('.project')];
const counters = [...document.querySelectorAll('[data-count]')];
const studioImage = document.querySelector('.studio-image');
let animationFramePending = false;
let renderedScrollY = window.scrollY;
let previousFrameTime = performance.now();

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeOut = (value) => 1 - Math.pow(1 - value, 4);

const initRevealAnimations = () => {
  if (reversibleReveal) return;

  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('is-revealed', 'visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-revealed', 'visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        requestAnimationFrame(() => {
          entry.target.classList.add('is-revealed', 'visible');
        });
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
};

initRevealAnimations();

const elementProgress = (element, scrollY = window.scrollY) => {
  const rect = element.getBoundingClientRect();
  const virtualTop = rect.top + window.scrollY - scrollY;
  const distance = window.innerHeight * 0.42;
  const scrollProgress = clamp((window.innerHeight * 0.88 - virtualTop) / distance);

  if (rect.bottom <= 0 || rect.top >= window.innerHeight) return scrollProgress;

  const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  const visibilityProgress = clamp(visibleHeight / Math.max(rect.height, 1));

  return Math.max(scrollProgress, visibilityProgress);
};

const renderScrollAnimations = (time = performance.now()) => {
  const elapsed = Math.min(time - previousFrameTime, 32);
  const smoothing = reduceMotion ? 1 : 1 - Math.exp(-elapsed / 150);
  const scrollDifference = window.scrollY - renderedScrollY;
  renderedScrollY += scrollDifference * smoothing;
  previousFrameTime = time;
  updateHeader(renderedScrollY);
  updateSectionNavigation();

  if (reduceMotion) {
    counters.forEach((counter) => { counter.textContent = counter.dataset.count; });
    revealItems.forEach((item) => {
      item.classList.add('is-revealed', 'visible');
      item.style.removeProperty('opacity');
      item.style.removeProperty('transform');
    });
    renderedScrollY = window.scrollY;
    animationFramePending = false;
    return;
  }

  if (reversibleReveal) {
    revealEntries.forEach(({ item, delay }) => {
      const rawProgress = elementProgress(item, renderedScrollY);
      const progress = easeOut(clamp((rawProgress - delay) / Math.max(1 - delay, 0.1)));
      const isFullyRevealed = progress >= 0.98;

      if (isFullyRevealed) {
        item.style.removeProperty('opacity');
        item.style.removeProperty('transform');
      } else {
        item.style.opacity = progress.toFixed(3);
        item.style.transform = `translate3d(0, ${((1 - progress) * 34).toFixed(2)}px, 0)`;
      }

      item.classList.toggle('is-revealed', progress > 0.02);
      item.classList.toggle('visible', progress > 0.02);
    });
  }

  projects.forEach((project) => {
    const progress = easeOut(elementProgress(project, renderedScrollY));
    const rect = project.getBoundingClientRect();
    const virtualTop = rect.top + window.scrollY - renderedScrollY;
    const centerOffset = (virtualTop + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    project.style.setProperty('--reveal-mask', `${((1 - progress) * 100).toFixed(2)}%`);
    project.style.setProperty('--reveal-scale', (1 + (1 - progress) * 0.08).toFixed(4));
    project.style.setProperty('--parallax-y', `${clamp(centerOffset, -1, 1) * -12}px`);
  });

  counters.forEach((counter) => {
    const progress = easeOut(elementProgress(counter, renderedScrollY));
    counter.textContent = String(Math.round(Number(counter.dataset.count) * progress));
  });

  if (studioImage) {
    const rect = studioImage.getBoundingClientRect();
    const virtualTop = rect.top + window.scrollY - renderedScrollY;
    const travel = clamp((window.innerHeight - virtualTop) / (window.innerHeight + rect.height));
    studioImage.style.setProperty('--parallax-y', `${(-56 + travel * 56).toFixed(2)}px`);
  }

  if (Math.abs(window.scrollY - renderedScrollY) > 0.04) {
    requestAnimationFrame(renderScrollAnimations);
  } else {
    renderedScrollY = window.scrollY;
    animationFramePending = false;
  }
};

const requestScrollRender = () => {
  if (animationFramePending) return;
  animationFramePending = true;
  previousFrameTime = performance.now();
  requestAnimationFrame(renderScrollAnimations);
};

window.addEventListener('scroll', requestScrollRender, { passive: true });
window.addEventListener('resize', requestScrollRender);
renderScrollAnimations(performance.now());

if (!reduceMotion && finePointer && cursor) {
  document.documentElement.classList.add('custom-cursor');

  const bindCursorTargets = () => {
    document.querySelectorAll('[data-cursor]').forEach((item) => {
      if (item.dataset.cursorBound === 'true') return;
      item.dataset.cursorBound = 'true';
      item.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        cursor.querySelector('span').textContent = item.dataset.cursor || '보기';
      });
      item.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  };

  window.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = '1';
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  bindCursorTargets();
  window.bindCursorTargets = bindCursorTargets;

  projects.forEach((project) => {
    const link = project.querySelector('a');
    if (!link) return;
    link.addEventListener('mousemove', (event) => {
      const rect = link.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5;
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5;
      project.style.setProperty('--hover-x', `${(x * 5).toFixed(2)}px`);
      project.style.setProperty('--hover-y', `${(y * 5).toFixed(2)}px`);
      project.style.setProperty('--tilt-x', `${(-y * 1.2).toFixed(2)}deg`);
      project.style.setProperty('--tilt-y', `${(x * 1.2).toFixed(2)}deg`);
    });
    link.addEventListener('mouseleave', () => {
      project.style.setProperty('--hover-x', '0px');
      project.style.setProperty('--hover-y', '0px');
      project.style.setProperty('--tilt-x', '0deg');
      project.style.setProperty('--tilt-y', '0deg');
    });
  });

  if (hero) {
    hero.addEventListener('mousemove', (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * -18;
      const y = (event.clientY / window.innerHeight - 0.5) * -18;
      hero.style.setProperty('--mx', `${x}px`);
      hero.style.setProperty('--my', `${y}px`);
    });
    hero.addEventListener('mouseleave', () => {
      hero.style.setProperty('--mx', '0px');
      hero.style.setProperty('--my', '0px');
    });
  }
}
