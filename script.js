const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const sectionNavLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-menu a')];
const processSection = document.querySelector('#process');

const progressBar = document.querySelector('.page-progress i');
const hero = document.querySelector('.hero');
const cursor = document.querySelector('.cursor');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const updateHeader = (scrollY = window.scrollY) => {
  header.classList.toggle('scrolled', window.scrollY > 40 || document.body.classList.contains('inner-page'));
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollable > 0 ? scrollY / scrollable : 0})`;
};

const updateSectionNavigation = () => {
  if (!processSection) return;

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

const revealItems = [...document.querySelectorAll('.reveal')];
const projects = [...document.querySelectorAll('.project')];
const counters = [...document.querySelectorAll('[data-count]')];
const studioImage = document.querySelector('.studio-image');
let animationFramePending = false;
let renderedScrollY = window.scrollY;
let previousFrameTime = performance.now();

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeOut = (value) => 1 - Math.pow(1 - value, 3);

const elementProgress = (element, scrollY = window.scrollY) => {
  const rect = element.getBoundingClientRect();
  const virtualTop = rect.top + window.scrollY - scrollY;
  const distance = window.innerHeight * 0.34;
  return clamp((window.innerHeight * 0.9 - virtualTop) / distance);
};

const renderScrollAnimations = (time = performance.now()) => {
  const elapsed = Math.min(time - previousFrameTime, 32);
  const smoothing = reduceMotion ? 1 : 1 - Math.exp(-elapsed / 95);
  const scrollDifference = window.scrollY - renderedScrollY;
  renderedScrollY += scrollDifference * smoothing;
  previousFrameTime = time;
  updateHeader(renderedScrollY);
  updateSectionNavigation();

  if (reduceMotion) {
    counters.forEach((counter) => { counter.textContent = counter.dataset.count; });
    renderedScrollY = window.scrollY;
    animationFramePending = false;
    return;
  }

  revealItems.forEach((item) => {
    const progress = easeOut(elementProgress(item, renderedScrollY));
    item.style.setProperty('--reveal-opacity', progress.toFixed(3));
    item.style.setProperty('--reveal-y', `${((1 - progress) * 42).toFixed(2)}px`);
    item.classList.toggle('visible', progress > 0.02);
  });

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

  if (Math.abs(window.scrollY - renderedScrollY) > 0.08) {
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
    currentX += (cursorX - currentX) * 0.14;
    currentY += (cursorY - currentY) * 0.14;
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
  '01': { title: '괄사 오브젝트', year: '2026', type: '2분할 몰드', image: 'assets/portfolio-01.svg', second: 'assets/portfolio-03.svg', third: 'assets/portfolio-04.svg', kicker: '손에 닿는 곡선을\n정확하게 구현합니다.', description: '유기적인 곡면과 안정적인 분할선을 함께 고려해 설계한 2분할 석고몰드입니다. 실제 슬립캐스팅 테스트를 통해 주입과 탈형 과정의 사용성을 검증했습니다.' },
  '02': { title: '조형 화기', year: '2025', type: '마스터 몰드', image: 'assets/portfolio-02.svg', second: 'assets/portfolio-05.svg', third: 'assets/portfolio-01.svg', kicker: '복잡한 조형을\n안정적인 구조로.', description: '세로로 긴 조형 작품의 무게 중심과 탈형 방향을 고려한 마스터 몰드입니다. 원형의 인상을 유지하면서 반복 제작에 적합한 구조를 설계했습니다.' },
  '03': { title: '데일리 컵 시리즈', year: '2025', type: '생산용 몰드', image: 'assets/portfolio-03.svg', second: 'assets/portfolio-04.svg', third: 'assets/portfolio-06.svg', kicker: '반복 생산에서도\n같은 품질을.', description: '매일 사용하는 컵의 미세한 곡률과 림 두께를 정밀하게 구현했습니다. 반복 주입을 고려해 내구성과 작업 효율을 함께 높였습니다.' },
  '04': { title: '사발 연구 04', year: '2024', type: '시제품', image: 'assets/portfolio-04.svg', second: 'assets/portfolio-01.svg', third: 'assets/portfolio-03.svg', kicker: '단순한 형태일수록\n더 섬세하게.', description: '사발의 부드러운 곡면과 굽 구조를 연구한 시제품 프로젝트입니다. 두께 변화와 수축률을 반영해 안정적인 결과를 만들었습니다.' },
  '05': { title: '졸업 작품', year: '2024', type: '다분할 몰드', image: 'assets/portfolio-05.svg', second: 'assets/portfolio-02.svg', third: 'assets/portfolio-04.svg', kicker: '아이디어를 작품으로\n완성하는 과정.', description: '복잡한 졸업작품 원형을 여러 파트로 분할하고 결합 정밀도를 높인 프로젝트입니다. 제작 일정에 맞춰 테스트와 수정을 함께 진행했습니다.' },
  '06': { title: '맞춤형 몰드 연구', year: '2023', type: '스튜디오 연구', image: 'assets/portfolio-06.svg', second: 'assets/portfolio-05.svg', third: 'assets/portfolio-02.svg', kicker: '더 나은 작업 방식을\n계속 연구합니다.', description: '스튜디오에서 진행한 몰드 구조와 소재에 관한 연구입니다. 다양한 원형과 분할 방식을 실험하며 실제 제작에 적용할 기준을 만들었습니다.' }
};

const detailPage = document.querySelector('[data-project-detail]');
if (detailPage) {
  const id = new URLSearchParams(window.location.search).get('id') || '01';
  const keys = Object.keys(projectData);
  const safeId = projectData[id] ? id : '01';
  const data = projectData[safeId];
  const nextId = keys[(keys.indexOf(safeId) + 1) % keys.length];
  const setText = (selector, value) => { document.querySelector(selector).textContent = value; };
  const setImage = (selector, value) => { document.querySelector(selector).src = value; };

  setText('[data-project-number]', safeId);
  setText('[data-project-title]', data.title);
  setText('[data-project-year]', data.year);
  setText('[data-project-type]', data.type);
  setText('[data-project-kicker]', data.kicker);
  setText('[data-project-description]', data.description);
  setImage('[data-project-image]', data.image);
  setImage('[data-project-image-secondary]', data.second);
  setImage('[data-project-image-tertiary]', data.third);
  document.querySelector('[data-next-project]').href = `project.html?id=${nextId}`;
  setText('[data-next-title]', projectData[nextId].title);
  document.title = `${data.title} — 어울림`;
}
