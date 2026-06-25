/**
 * 모든 페이지 공통 헤더·푸터 렌더링
 *
 * HTML 사용법:
 *   <div data-site-header data-nav="work|about" data-header-variant="inner|hero"></div>
 *   <div data-site-footer data-footer="inner|contact"></div>
 */
const NAV_ITEMS = [
  { id: "work", href: "index.html", label: "작업" },
  { id: "about", href: "about.html", label: "소개", aboutHref: "#top" },
  { id: "process", href: "about.html#process", label: "제작 과정" },
  {
    id: "contact",
    href: "about.html#contact",
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
  contactHref = "about.html#contact",
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
    const href =
      item.id === "contact"
        ? onAboutPage
          ? "#contact"
          : contactHref
        : navHref(item, onAboutPage);
    const currentAttr = item.id === current ? ' aria-current="page"' : "";
    return `<a href="${href}"${currentAttr}>${item.label}</a>`;
  }).join("");

  return `
<header class="${headerClass}" data-header>
  <a class="brand" href="index.html" aria-label="어울림 홈">
    <img class="brand-logo brand-logo-black" src="assets/object/logo-black.png" alt="" width="325" height="68">
    <img class="brand-logo brand-logo-white" src="assets/object/logo-white.png" alt="" width="325" height="68">
  </a>
  <nav class="desktop-nav" aria-label="주요 메뉴">${desktopLinks}</nav>
  <a class="header-contact" href="${onAboutPage ? "#contact" : contactHref}">문의하기 <span aria-hidden="true">↗</span></a>
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

function renderContactFooter() {
  return `
<footer>
  <a class="brand brand-light" href="index.html" aria-label="어울림 홈">
    <img class="brand-logo brand-logo-black" src="assets/object/logo-black.png" alt="" width="325" height="68">
    <img class="brand-logo brand-logo-white" src="assets/object/logo-white.png" alt="" width="325" height="68">
  </a>
  <p>© 2026 어울림. 모든 권리 보유.</p>
  <div><a href="#">인스타그램</a><a href="#">네이버 블로그</a></div>
</footer>`.trim();
}

function mountLayout() {
  const headerSlot = document.querySelector("[data-site-header]");
  const footerSlot = document.querySelector("[data-site-footer]");

  if (headerSlot) {
    const current = headerSlot.dataset.nav || "work";
    const variant = headerSlot.dataset.headerVariant || "inner";
    const contactHref = headerSlot.dataset.contactHref || "about.html#contact";
    headerSlot.outerHTML = renderSiteHeader({ current, variant, contactHref });
  }

  if (footerSlot) {
    const kind = footerSlot.dataset.footer || "inner";
    const hasLink = footerSlot.hasAttribute("data-link-label");
    footerSlot.outerHTML =
      kind === "contact"
        ? renderContactFooter()
        : renderInnerFooter({
            linkLabel: hasLink ? footerSlot.dataset.linkLabel || "맨 위로 ↑" : null,
            linkHref: footerSlot.dataset.linkHref || "#top",
          });
  }
}

mountLayout();
