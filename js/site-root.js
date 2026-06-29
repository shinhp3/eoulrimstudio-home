(function () {
  const PROJECT_DIR = "eoulrimstudio-home";

  function getSiteRootHref() {
    const { protocol, hostname, pathname } = window.location;

    if (protocol === "file:") {
      const parts = decodeURIComponent(pathname).split("/").filter(Boolean);
      const rootIdx = parts.findIndex(
        (part) => part.toLowerCase() === PROJECT_DIR.toLowerCase(),
      );

      if (rootIdx >= 0) {
        const rootParts = parts.slice(0, rootIdx + 1);
        if (/^[a-zA-Z]:$/.test(rootParts[0])) {
          return `file:///${rootParts.join("/")}/`;
        }
        return `file://${rootParts.join("/")}/`;
      }

      const htmlIdx = parts.findIndex((part) => /\.html?$/i.test(part));
      if (htmlIdx > 0) {
        const dirParts = parts.slice(0, htmlIdx);
        if (/^[a-zA-Z]:$/.test(dirParts[0])) {
          return `file:///${dirParts.join("/")}/`;
        }
        return `file://${dirParts.join("/")}/`;
      }

      return "./";
    }

    if (hostname.endsWith("github.io")) {
      const repo = pathname.split("/").filter(Boolean)[0];
      return repo ? `/${repo}/` : "/";
    }

    return "/";
  }

  function pageUrl(path) {
    if (!path || path.startsWith("#") || /^https?:\/\//i.test(path)) return path;

    if (location.protocol !== "file:") return path;

    const [pathAndQuery, hash = ""] = path.split("#");
    const [folder, query = ""] = pathAndQuery.split("?");
    let trimmed = folder.replace(/\/$/, "");

    if (trimmed === "." || trimmed === "") trimmed = "";

    if (trimmed && /\.html?$/i.test(trimmed)) return path;

    const filePath = trimmed ? `${trimmed}/index.html` : "index.html";
    return `${filePath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
  }

  const href = getSiteRootHref();
  const base = document.createElement("base");
  base.href = href;

  const charset = document.querySelector("meta[charset]");
  if (charset?.nextSibling) {
    charset.parentNode.insertBefore(base, charset.nextSibling);
  } else {
    document.head.prepend(base);
  }

  window.__SITE_ROOT__ = href;
  window.pageUrl = pageUrl;

  function fixFileLinks() {
    if (location.protocol !== "file:") return;

    document.querySelectorAll("a[href]").forEach((anchor) => {
      const link = anchor.getAttribute("href");
      if (!link || link.startsWith("#") || /^https?:/i.test(link)) return;
      anchor.setAttribute("href", pageUrl(link));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixFileLinks);
  } else {
    fixFileLinks();
  }
})();
