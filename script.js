const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const sectionNavLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-menu a')];
const processSection = document.querySelector('#process');

const progressBar = document.querySelector('.page-progress i');
const scrollTopBtn = document.querySelector('.scroll-top');
const SCROLL_TOP_THRESHOLD = 400;
const SCROLL_TOP_IDLE_MS = 2800;
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

const updateSectionNavigation = () => {
  if (!processSection || !header) return;

  const processIsActive = processSection.getBoundingClientRect().top <= header.offsetHeight + 48;
  const activeHref = processIsActive ? '#process' : '#top';

  sectionNavLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === '#top' || href === '#process') {
      if (href === activeHref) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  });
};

updateHeader();
updateSectionNavigation();

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('mouseenter', () => {
    scrollTopBtn.classList.remove('is-fading');
    clearTimeout(scrollTopIdleTimer);
  });

  scrollTopBtn.addEventListener('mouseleave', () => {
    if (scrollTopBtn.classList.contains('is-visible')) scheduleScrollTopFade();
  });

  scrollTopBtn.addEventListener('focus', () => scrollTopBtn.classList.remove('is-fading'));
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
        entry.target.classList.add('is-revealed', 'visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -7% 0px' },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
};

initRevealAnimations();

const elementProgress = (element, scrollY = window.scrollY) => {
  const rect = element.getBoundingClientRect();
  const virtualTop = rect.top + window.scrollY - scrollY;
  const distance = window.innerHeight * 0.42;
  return clamp((window.innerHeight * 0.88 - virtualTop) / distance);
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
      item.style.setProperty('--reveal-opacity', '1');
      item.style.setProperty('--reveal-y', '0px');
    });
    renderedScrollY = window.scrollY;
    animationFramePending = false;
    return;
  }

  if (reversibleReveal) {
    revealEntries.forEach(({ item, delay }) => {
      const rawProgress = elementProgress(item, renderedScrollY);
      const progress = easeOut(clamp((rawProgress - delay) / Math.max(1 - delay, 0.1)));
      item.style.setProperty('--reveal-opacity', progress.toFixed(3));
      item.style.setProperty('--reveal-y', `${((1 - progress) * 34).toFixed(2)}px`);
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
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let currentX = cursorX;
  let currentY = cursorY;

  const renderCursor = () => {
    currentX += (cursorX - currentX) * 0.11;
    currentY += (cursorY - currentY) * 0.11;
    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;
    requestAnimationFrame(renderCursor);
  };

  window.addEventListener('mousemove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursor.style.opacity = '1';
  });
  document.documentElement.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.querySelectorAll('[data-cursor]').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      cursor.querySelector('span').textContent = item.dataset.cursor;
    });
    item.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
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
  requestAnimationFrame(renderCursor);
}

const projectData = {
  '01': {
    title: '관사 오브젝트',
    year: '2026',
    type: '2분할 몰드',
    service: '3D 모델링 · 몰드 제작 · 테스트',
    image: 'assets/portfolio-01.svg',
    second: 'assets/portfolio-03.svg',
    third: 'assets/portfolio-04.svg',
    kicker: '손에 닿는 곡선을 정확하게 구현합니다.',
    description: '유기적인 곡면과 안정적인 분할선을 함께 고려해 설계한 2분할 석고몰드입니다. 실제 슬립캐스팅 테스트를 통해 주입과 탈형 과정의 사용성을 검증했습니다.'
  },
  '02': {
    title: '조형 화기',
    year: '2025',
    type: '마스터 몰드',
    service: '원형 제작 · 분할 설계 · 표면 정리',
    image: 'assets/portfolio-02.svg',
    second: 'assets/portfolio-05.svg',
    third: 'assets/portfolio-01.svg',
    kicker: '복잡한 조형을 안정적인 구조로 정리합니다.',
    description: '높이감 있는 조형의 무게 중심과 탈형 방향을 고려해 제작한 마스터 몰드입니다. 형태의 인상이 유지되도록 분할선과 접합 구조를 세밀하게 조정했습니다.'
  },
  '03': {
    title: '데일리 컵 시리즈',
    year: '2025',
    type: '생산용 몰드',
    service: '반복 생산 테스트 · 내구성 검토',
    image: 'assets/portfolio-03.svg',
    second: 'assets/portfolio-04.svg',
    third: 'assets/portfolio-06.svg',
    kicker: '반복 생산에서도 같은 리듬을 유지합니다.',
    description: '매일 사용하는 컵의 미세한 곡률과 림의 촉감을 안정적으로 구현했습니다. 반복 주입을 고려해 내구성과 작업 효율을 함께 높였습니다.'
  },
  '04': {
    title: '표면 연구 04',
    year: '2024',
    type: '프로토타입',
    service: '재료 테스트 · 표면 샘플 제작',
    image: 'assets/portfolio-04.svg',
    second: 'assets/portfolio-01.svg',
    third: 'assets/portfolio-03.svg',
    kicker: '단순한 형태일수록 더 자세하게 봅니다.',
    description: '표면에 남는 부드러운 곡면과 굽 구조를 탐색한 프로토타입입니다. 재료 변화와 수축률을 반영해 안정적인 결과를 만들었습니다.'
  },
  '05': {
    title: '조업 작품',
    year: '2024',
    type: '다분할 몰드',
    service: '복합 형태 분할 · 제작 일정 관리',
    image: 'assets/portfolio-05.svg',
    second: 'assets/portfolio-02.svg',
    third: 'assets/portfolio-04.svg',
    kicker: '아이디어를 작품으로 완성하는 과정입니다.',
    description: '복잡한 조업 작품의 원형을 여러 파트로 분할하고 결합 정확도를 높인 프로젝트입니다. 제작 일정에 맞춰 테스트와 수정을 함께 진행했습니다.'
  },
  '06': {
    title: '맞춤형 몰드 연구',
    year: '2023',
    type: '스튜디오 연구',
    service: '구조 리서치 · 제작 방식 실험',
    image: 'assets/portfolio-06.svg',
    second: 'assets/portfolio-05.svg',
    third: 'assets/portfolio-02.svg',
    kicker: '좋은 작업 방식을 계속 연구합니다.',
    description: '스튜디오에서 진행한 몰드 구조와 소재 관련 연구입니다. 다양한 원형과 분할 방식을 실험하며 실제 제작에 적용할 기준을 만들었습니다.'
  }
};

const detailPage = document.querySelector('[data-project-detail]');
if (detailPage) {
  const id = new URLSearchParams(window.location.search).get('id') || '01';
  const keys = Object.keys(projectData);
  const safeId = projectData[id] ? id : '01';
  const data = projectData[safeId];
  const nextId = keys[(keys.indexOf(safeId) + 1) % keys.length];
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };
  const setImage = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.src = value;
  };

  setText('[data-project-number]', safeId);
  setText('[data-project-title]', data.title);
  setText('[data-project-year]', data.year);
  setText('[data-project-type]', data.type);
  setText('[data-project-service]', data.service);
  setText('[data-project-kicker]', data.kicker);
  setText('[data-project-description]', data.description);
  setImage('[data-project-image]', data.image);
  setImage('[data-project-image-secondary]', data.second);
  setImage('[data-project-image-tertiary]', data.third);

  const nextProject = document.querySelector('[data-next-project]');
  if (nextProject) {
    nextProject.href = `project.html?id=${nextId}`;
    nextProject.setAttribute('aria-label', `다음 프로젝트: ${projectData[nextId].title}`);
  }
  document.title = `${data.title} | 어울림`;
}

const backLink = document.querySelector('[data-back-link]');
if (backLink) {
  backLink.addEventListener('click', (event) => {
    const hasPreviousPage = window.history.length > 1 && document.referrer;
    if (!hasPreviousPage) return;

    event.preventDefault();
    window.history.back();
  });
}
