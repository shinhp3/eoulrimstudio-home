/**
 * 모든 페이지 공통 헤더·푸터 렌더링
 *
 * HTML 사용법:
 *   <div data-site-header data-nav="work|about" data-header-variant="inner|hero"></div>
 *   <div data-site-footer data-footer="inner|contact|light"></div>
 */
const CONTACT_URL = "https://claymaker.eoulrimstudio.com/";

const FOOTER_SOCIAL_ICONS = {
  dark: {
    instagram: "assets/object/instagram_logo.svg",
    naver: "assets/object/naver_logo.svg",
  },
  light: {
    instagram: "assets/object/insta_black_logo.svg",
    naver: "assets/object/naver_black_logo.svg",
  },
};

const NAV_ITEMS = [
  { id: "work", href: "index.html", label: "작업" },
  { id: "about", href: "about.html", label: "소개", aboutHref: "#top" },
  { id: "process", href: "about.html#process", label: "제작 과정" },
  {
    id: "contact",
    href: CONTACT_URL,
    label: "문의하기",
    mobileOnly: true,
  },
];

function navHref(item, onAboutPage) {
  if (onAboutPage && item.aboutHref) return item.aboutHref;
  return item.href;
}

function renderSiteHeader({
  current = "work",
  variant = "inner",
  contactHref = CONTACT_URL,
} = {}) {
  const onAboutPage = current === "about" || current === "process";
  const headerClass = [
    "site-header",
    variant === "inner" ? "scrolled inner-header" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const desktopLinks = NAV_ITEMS.filter((item) => !item.mobileOnly)
    .map((item) => {
      const href = navHref(item, onAboutPage);
      const currentAttr = item.id === current ? ' aria-current="page"' : "";
      return `<a href="${href}"${currentAttr}>${item.label}</a>`;
    })
    .join("");

  const mobileLinks = NAV_ITEMS.map((item) => {
    const href = item.id === "contact" ? contactHref : navHref(item, onAboutPage);
    const currentAttr = item.id === current ? ' aria-current="page"' : "";
    const externalAttr =
      item.id === "contact" ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${href}"${currentAttr}${externalAttr}>${item.label}</a>`;
  }).join("");

  return `
<header class="${headerClass}" data-header>
  <a class="brand" href="index.html" aria-label="어울림 홈">
    <img class="brand-logo brand-logo-black" src="assets/object/logo-black.png" alt="" width="325" height="68">
    <img class="brand-logo brand-logo-white" src="assets/object/logo-white.png" alt="" width="325" height="68">
  </a>
  <nav class="desktop-nav" aria-label="주요 메뉴">${desktopLinks}</nav>
  <a class="header-contact" href="${contactHref}" target="_blank" rel="noopener noreferrer">문의하기 <span aria-hidden="true">↗</span></a>
  <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu">
    <span class="sr-only">메뉴 열기</span><i></i><i></i>
  </button>
  <nav class="mobile-menu" id="mobile-menu" aria-label="모바일 메뉴">${mobileLinks}</nav>
</header>`.trim();
}

function renderInnerFooter({
  topHref = "#top",
  linkLabel = null,
  linkHref = "#top",
} = {}) {
  const footerLink =
    linkLabel != null && linkLabel !== ""
      ? `<a href="${linkHref}">${linkLabel}</a>`
      : "";

  return `
<footer class="inner-footer${footerLink ? "" : " inner-footer--compact"}">
  <a class="brand" href="index.html" aria-label="어울림 홈">
    <img class="brand-logo brand-logo-black" src="assets/object/logo-black.png" alt="" width="325" height="68">
    <img class="brand-logo brand-logo-white" src="assets/object/logo-white.png" alt="" width="325" height="68">
  </a>
  <p>© 2026 어울림.</p>
  ${footerLink}
</footer>`.trim();
}

function renderSocialFooter({ theme = "dark" } = {}) {
  const isLight = theme === "light";
  const icons = FOOTER_SOCIAL_ICONS[theme] || FOOTER_SOCIAL_ICONS.dark;
  const brandClass = isLight ? "brand" : "brand brand-light";
  const copyright = isLight
    ? "© 2026 어울림."
    : "© 2026 어울림. 모든 권리 보유.";

  return `
<footer class="site-footer site-footer--${theme}">
  <a class="${brandClass}" href="index.html" aria-label="어울림 홈">
    <img class="brand-logo brand-logo-black" src="assets/object/logo-black.png" alt="" width="325" height="68">
    <img class="brand-logo brand-logo-white" src="assets/object/logo-white.png" alt="" width="325" height="68">
  </a>
  <p>${copyright}</p>
  <div class="footer-social">
    <a class="footer-social-link" href="https://www.instagram.com/eoulrimstudio/" target="_blank" rel="noopener noreferrer" aria-label="인스타그램">
      <img src="${icons.instagram}" alt="" width="22" height="22">
    </a>
    <a class="footer-social-link" href="https://smartstore.naver.com/eoulrimstudio" target="_blank" rel="noopener noreferrer" aria-label="네이버 스마트스토어">
      <img src="${icons.naver}" alt="" width="22" height="22">
    </a>
  </div>
</footer>`.trim();
}

function renderContactFooter() {
  return renderSocialFooter({ theme: "dark" });
}

function mountCustomCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (document.querySelector(".cursor")) return;

  const progress = document.querySelector(".page-progress");
  const markup = '<div class="cursor" aria-hidden="true"><span>보기</span></div>';

  if (progress) {
    progress.insertAdjacentHTML("afterend", markup);
  } else {
    document.body.insertAdjacentHTML("afterbegin", markup);
  }
}

function mountLayout() {
  const headerSlot = document.querySelector("[data-site-header]");
  const footerSlot = document.querySelector("[data-site-footer]");

  if (headerSlot) {
    const current = headerSlot.dataset.nav || "work";
    const variant = headerSlot.dataset.headerVariant || "inner";
    const contactHref = headerSlot.dataset.contactHref || CONTACT_URL;
    headerSlot.outerHTML = renderSiteHeader({ current, variant, contactHref });
  }

  if (footerSlot) {
    const kind = footerSlot.dataset.footer || "inner";
    const hasLink = footerSlot.hasAttribute("data-link-label");
    footerSlot.outerHTML =
      kind === "contact"
        ? renderContactFooter()
        : kind === "light"
          ? renderSocialFooter({ theme: "light" })
          : renderInnerFooter({
              linkLabel: hasLink ? footerSlot.dataset.linkLabel || "맨 위로 ↑" : null,
              linkHref: footerSlot.dataset.linkHref || "#top",
            });
  }
}

mountCustomCursor();
mountLayout();
