let overlayElements = null;
function initOverlay(shadowRoot2) {
  const marginBox = createElement("dg-margin-box");
  const borderBox = createElement("dg-border-box");
  const paddingBox = createElement("dg-padding-box");
  const contentBox = createElement("dg-content-box");
  const tooltip = createElement("dg-tooltip");
  const guideH = createElement("dg-guide-h");
  const guideV = createElement("dg-guide-v");
  const container = shadowRoot2.querySelector("#dg-overlay");
  container.appendChild(marginBox);
  container.appendChild(borderBox);
  container.appendChild(paddingBox);
  container.appendChild(contentBox);
  container.appendChild(tooltip);
  container.appendChild(guideH);
  container.appendChild(guideV);
  overlayElements = { marginBox, borderBox, paddingBox, contentBox, tooltip, guideH, guideV };
  return overlayElements;
}
function createElement(className) {
  const el = document.createElement("div");
  el.className = className;
  return el;
}
function showOverlay(element) {
  if (!overlayElements) return;
  const rect = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);
  const margin = {
    top: parseFloat(computed.marginTop) || 0,
    right: parseFloat(computed.marginRight) || 0,
    bottom: parseFloat(computed.marginBottom) || 0,
    left: parseFloat(computed.marginLeft) || 0
  };
  const padding = {
    top: parseFloat(computed.paddingTop) || 0,
    right: parseFloat(computed.paddingRight) || 0,
    bottom: parseFloat(computed.paddingBottom) || 0,
    left: parseFloat(computed.paddingLeft) || 0
  };
  const border = {
    top: parseFloat(computed.borderTopWidth) || 0,
    right: parseFloat(computed.borderRightWidth) || 0,
    bottom: parseFloat(computed.borderBottomWidth) || 0,
    left: parseFloat(computed.borderLeftWidth) || 0
  };
  setBox(overlayElements.marginBox, {
    top: rect.top - margin.top,
    left: rect.left - margin.left,
    width: rect.width + margin.left + margin.right,
    height: rect.height + margin.top + margin.bottom
  });
  setBox(overlayElements.borderBox, {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  });
  setBox(overlayElements.paddingBox, {
    top: rect.top + border.top,
    left: rect.left + border.left,
    width: rect.width - border.left - border.right,
    height: rect.height - border.top - border.bottom
  });
  setBox(overlayElements.contentBox, {
    top: rect.top + border.top + padding.top,
    left: rect.left + border.left + padding.left,
    width: rect.width - border.left - border.right - padding.left - padding.right,
    height: rect.height - border.top - border.bottom - padding.top - padding.bottom
  });
  overlayElements.guideH.style.cssText = `
    position: fixed; left: 0; right: 0;
    top: ${rect.top}px; height: ${rect.height}px;
    pointer-events: none; z-index: 2147483645;
    border-top: 1px dashed rgba(59, 130, 246, 0.3);
    border-bottom: 1px dashed rgba(59, 130, 246, 0.3);
    display: block;
  `;
  overlayElements.guideV.style.cssText = `
    position: fixed; top: 0; bottom: 0;
    left: ${rect.left}px; width: ${rect.width}px;
    pointer-events: none; z-index: 2147483645;
    border-left: 1px dashed rgba(59, 130, 246, 0.3);
    border-right: 1px dashed rgba(59, 130, 246, 0.3);
    display: block;
  `;
  showTooltip(element, rect, computed);
  overlayElements.marginBox.style.display = "block";
  overlayElements.borderBox.style.display = "block";
  overlayElements.paddingBox.style.display = "block";
  overlayElements.contentBox.style.display = "block";
}
function setBox(el, { top, left, width, height }) {
  el.style.cssText = `
    position: fixed;
    top: ${top}px;
    left: ${left}px;
    width: ${Math.max(0, width)}px;
    height: ${Math.max(0, height)}px;
    pointer-events: none;
    z-index: 2147483646;
    display: block;
    box-sizing: border-box;
  `;
}
function showTooltip(element, rect, computed) {
  if (!overlayElements) return;
  const tooltip = overlayElements.tooltip;
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes = element.classList.length > 0 ? "." + Array.from(element.classList).slice(0, 3).join(".") : "";
  const dims = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  const display = computed.display;
  const fontSize = computed.fontSize;
  computed.color;
  const bg = computed.backgroundColor;
  let info = `<div class="dg-tooltip-tag">&lt;${tag}${id}${classes}&gt;</div>`;
  info += `<div class="dg-tooltip-dims">${dims}</div>`;
  info += `<div class="dg-tooltip-props">`;
  info += `<span>display: ${display}</span>`;
  if (fontSize !== "0px") info += `<span>font: ${fontSize}</span>`;
  if (bg !== "rgba(0, 0, 0, 0)") info += `<span>bg: ${bg}</span>`;
  info += `</div>`;
  tooltip.innerHTML = info;
  let tooltipTop = rect.top - 70;
  let tooltipLeft = rect.left;
  if (tooltipTop < 10) {
    tooltipTop = rect.bottom + 10;
  }
  if (tooltipLeft + 260 > window.innerWidth) {
    tooltipLeft = window.innerWidth - 270;
  }
  if (tooltipLeft < 10) tooltipLeft = 10;
  tooltip.style.cssText = `
    position: fixed;
    top: ${tooltipTop}px;
    left: ${tooltipLeft}px;
    z-index: 2147483647;
    pointer-events: none;
    display: block;
  `;
}
function hideOverlay() {
  if (!overlayElements) return;
  Object.values(overlayElements).forEach((el) => {
    el.style.display = "none";
  });
}
function getElementData(element) {
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    // Element info
    tagName: element.tagName.toLowerCase(),
    classList: Array.from(element.classList),
    id: element.id || null,
    // Dimensions
    dimensions: {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    // Box model
    box: {
      margin: {
        top: parseFloat(computed.marginTop) || 0,
        right: parseFloat(computed.marginRight) || 0,
        bottom: parseFloat(computed.marginBottom) || 0,
        left: parseFloat(computed.marginLeft) || 0
      },
      padding: {
        top: parseFloat(computed.paddingTop) || 0,
        right: parseFloat(computed.paddingRight) || 0,
        bottom: parseFloat(computed.paddingBottom) || 0,
        left: parseFloat(computed.paddingLeft) || 0
      },
      border: {
        top: parseFloat(computed.borderTopWidth) || 0,
        right: parseFloat(computed.borderRightWidth) || 0,
        bottom: parseFloat(computed.borderBottomWidth) || 0,
        left: parseFloat(computed.borderLeftWidth) || 0
      }
    },
    // Typography (only if element has text content)
    typography: hasTextContent(element) ? {
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
      letterSpacing: computed.letterSpacing,
      color: computed.color,
      textAlign: computed.textAlign,
      textTransform: computed.textTransform,
      textDecoration: computed.textDecoration
    } : null,
    // Visual
    visual: {
      backgroundColor: computed.backgroundColor,
      backgroundImage: computed.backgroundImage,
      borderRadius: computed.borderRadius,
      borderColor: computed.borderColor,
      borderStyle: computed.borderStyle,
      boxShadow: computed.boxShadow !== "none" ? computed.boxShadow : null,
      opacity: computed.opacity,
      overflow: computed.overflow,
      cursor: computed.cursor
    },
    // Layout (differentiator — Layout DNA)
    layout: {
      display: computed.display,
      ...computed.display === "flex" || computed.display === "inline-flex" ? {
        flexDirection: computed.flexDirection,
        flexWrap: computed.flexWrap,
        alignItems: computed.alignItems,
        justifyContent: computed.justifyContent,
        gap: computed.gap
      } : {},
      ...computed.display === "grid" || computed.display === "inline-grid" ? {
        gridTemplateColumns: computed.gridTemplateColumns,
        gridTemplateRows: computed.gridTemplateRows,
        gridGap: computed.gap || computed.gridGap,
        alignItems: computed.alignItems,
        justifyItems: computed.justifyItems
      } : {}
    },
    // Position
    position: {
      type: computed.position,
      top: computed.top,
      right: computed.right,
      bottom: computed.bottom,
      left: computed.left,
      zIndex: computed.zIndex
    },
    // Element rect (for overlay positioning)
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right
    }
  };
}
function hasTextContent(element) {
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
      return true;
    }
  }
  return false;
}
function getRawCSS(element) {
  const computed = window.getComputedStyle(element);
  const important = [
    "display",
    "position",
    "width",
    "height",
    "max-width",
    "max-height",
    "min-width",
    "min-height",
    "margin",
    "padding",
    "border",
    "border-radius",
    "background-color",
    "background-image",
    "background-size",
    "background-position",
    "color",
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "letter-spacing",
    "text-align",
    "text-transform",
    "text-decoration",
    "box-shadow",
    "opacity",
    "overflow",
    "cursor",
    "z-index",
    "flex-direction",
    "flex-wrap",
    "align-items",
    "justify-content",
    "gap",
    "grid-template-columns",
    "grid-template-rows",
    "transition",
    "transform"
  ];
  const lines = [];
  for (const prop of important) {
    const value = computed.getPropertyValue(prop);
    if (value && value !== "none" && value !== "normal" && value !== "auto" && value !== "0px" && value !== "rgba(0, 0, 0, 0)" && value !== "static") {
      lines.push(`  ${prop}: ${value};`);
    }
  }
  return `{
${lines.join("\n")}
}`;
}
function extractUrlsFromCSS(value) {
  if (!value || value === "none") return [];
  const urls = [];
  const regex = /url\(["']?(.*?)["']?\)/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    if (match[1] && !match[1].startsWith("data:")) {
      urls.push(match[1]);
    }
  }
  return urls;
}
let isInspecting = false;
let pinnedElement = null;
let lastHoveredElement = null;
let currentTarget = null;
function startInspecting() {
  if (isInspecting) return;
  isInspecting = true;
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("click", onElementClick, true);
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("wheel", onWheel, { capture: true, passive: false });
  document.body.style.cursor = "crosshair";
  chrome.runtime.sendMessage({ type: "INSPECT_MODE_CHANGED", payload: { active: true } });
}
function stopInspecting() {
  if (!isInspecting) return;
  isInspecting = false;
  document.removeEventListener("mousemove", onMouseMove, true);
  document.removeEventListener("click", onElementClick, true);
  document.removeEventListener("keydown", onKeyDown, true);
  document.removeEventListener("wheel", onWheel, true);
  document.body.style.cursor = "";
  hideOverlay();
  lastHoveredElement = null;
  currentTarget = null;
  chrome.runtime.sendMessage({ type: "INSPECT_MODE_CHANGED", payload: { active: false } });
}
function toggleInspecting() {
  if (isInspecting) {
    stopInspecting();
  } else {
    startInspecting();
  }
  return isInspecting;
}
function onMouseMove(e) {
  if (!isInspecting) return;
  const target = e.target;
  if (isDesignGrabElement(target)) return;
  if (target === lastHoveredElement) return;
  lastHoveredElement = target;
  currentTarget = target;
  showOverlay(target);
}
function onElementClick(e) {
  if (!isInspecting) return;
  const target = currentTarget || e.target;
  if (isDesignGrabElement(target)) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  pinnedElement = target;
  const data = getElementData(target);
  data.rawCSS = getRawCSS(target);
  data.selectorPath = getSelectorPath(target);
  chrome.runtime.sendMessage({
    type: "ELEMENT_PINNED",
    payload: data
  });
  stopInspecting();
  showOverlay(target);
}
function onKeyDown(e) {
  if (e.key === "Escape") {
    stopInspecting();
    return;
  }
  if (e.key === "ArrowUp" && currentTarget) {
    e.preventDefault();
    e.stopPropagation();
    const parent = currentTarget.parentElement;
    if (parent && parent !== document.documentElement && !isDesignGrabElement(parent)) {
      currentTarget = parent;
      showOverlay(currentTarget);
    }
    return;
  }
  if (e.key === "ArrowDown" && currentTarget) {
    e.preventDefault();
    e.stopPropagation();
    const firstChild = currentTarget.children[0];
    if (firstChild && !isDesignGrabElement(firstChild)) {
      currentTarget = firstChild;
      showOverlay(currentTarget);
    }
    return;
  }
}
function onWheel(e) {
  if (!isInspecting || !currentTarget) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.deltaY < 0) {
    const parent = currentTarget.parentElement;
    if (parent && parent !== document.documentElement && !isDesignGrabElement(parent)) {
      currentTarget = parent;
      showOverlay(currentTarget);
    }
  } else if (e.deltaY > 0) {
    const firstChild = currentTarget.children[0];
    if (firstChild && !isDesignGrabElement(firstChild)) {
      currentTarget = firstChild;
      showOverlay(currentTarget);
    }
  }
}
function isDesignGrabElement(el) {
  let current = el;
  while (current) {
    if (current.tagName && current.tagName.toLowerCase() === "designgrab-root") {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}
function getSelectorPath(el) {
  const parts = [];
  let current = el;
  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
      parts.unshift(selector);
      break;
    }
    if (current.classList.length > 0) {
      const meaningful = Array.from(current.classList).filter((c) => !c.match(/^(css-|sc-|_|__)/)).slice(0, 2);
      if (meaningful.length > 0) {
        selector += "." + meaningful.join(".");
      }
    }
    parts.unshift(selector);
    current = current.parentElement;
  }
  return parts.join(" > ");
}
function getPinnedElement() {
  return pinnedElement;
}
function walkAllElements(root, callback) {
  const elements = root.querySelectorAll("*");
  elements.forEach((el) => {
    callback(el);
    if (el.shadowRoot) walkAllElements(el.shadowRoot, callback);
  });
}
function makeAbsolute(url) {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http")) return url;
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}
function describeElement(el) {
  const tag = el.tagName?.toLowerCase() || "unknown";
  const id = el.id ? `#${el.id}` : "";
  const cls = el.classList?.length > 0 ? `.${Array.from(el.classList).slice(0, 2).join(".")}` : "";
  return `${tag}${id}${cls}`;
}
function extractAssets() {
  return {
    images: extractImages(),
    svgs: extractSVGs(),
    videos: extractVideos(),
    lotties: extractLotties(),
    animations: extractCSSAnimations()
  };
}
function extractImages() {
  const images = [];
  const seenSrcs = /* @__PURE__ */ new Set();
  document.querySelectorAll("img").forEach((img) => {
    const src = img.currentSrc || img.src;
    if (!src || seenSrcs.has(src) || src.startsWith("data:image/svg")) return;
    seenSrcs.add(src);
    images.push({
      src: makeAbsolute(src),
      alt: img.alt || "",
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      format: getImageFormat(src),
      size: estimateImageSize(img.naturalWidth, img.naturalHeight),
      location: "img-tag",
      element: img
    });
  });
  document.querySelectorAll("picture source").forEach((source) => {
    const srcset = source.srcset;
    if (!srcset) return;
    const srcs = parseSrcset(srcset);
    srcs.forEach(({ url }) => {
      if (seenSrcs.has(url)) return;
      seenSrcs.add(url);
      images.push({
        src: makeAbsolute(url),
        alt: "",
        width: 0,
        height: 0,
        format: getImageFormat(url),
        size: "—",
        location: "picture",
        element: source.parentElement
      });
    });
  });
  walkAllElements(document, (el) => {
    const computed = window.getComputedStyle(el);
    const bgImage = computed.backgroundImage;
    if (!bgImage || bgImage === "none") return;
    const urls = extractUrlsFromCSS(bgImage);
    urls.forEach((url) => {
      if (seenSrcs.has(url) || url.startsWith("data:image/svg")) return;
      seenSrcs.add(url);
      images.push({
        src: makeAbsolute(url),
        alt: "",
        width: 0,
        height: 0,
        format: getImageFormat(url),
        size: "—",
        location: "bg-image",
        element: el
      });
    });
  });
  document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
    const href = link.href;
    if (!href || seenSrcs.has(href)) return;
    seenSrcs.add(href);
    images.push({
      src: makeAbsolute(href),
      alt: "Favicon",
      width: parseInt(link.sizes?.value?.split("x")[0]) || 32,
      height: parseInt(link.sizes?.value?.split("x")[1]) || 32,
      format: getImageFormat(href),
      size: "—",
      location: "favicon",
      element: null
    });
  });
  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => {
    const content = meta.content;
    if (!content || seenSrcs.has(content)) return;
    seenSrcs.add(content);
    images.push({
      src: makeAbsolute(content),
      alt: "OG Image",
      width: 0,
      height: 0,
      format: getImageFormat(content),
      size: "—",
      location: "og-image",
      element: null
    });
  });
  return images;
}
function extractSVGs() {
  const svgs = [];
  const seenSVGs = /* @__PURE__ */ new Set();
  document.querySelectorAll("svg").forEach((svg) => {
    const rect = svg.getBoundingClientRect();
    if (rect.width < 4 && rect.height < 4) return;
    const code = svg.outerHTML;
    const hash = simpleHash(code);
    if (seenSVGs.has(hash)) return;
    seenSVGs.add(hash);
    svgs.push({
      code,
      viewBox: svg.getAttribute("viewBox") || "",
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      id: svg.id || null,
      location: "inline",
      element: svg
    });
  });
  document.querySelectorAll('img[src$=".svg"], img[src*=".svg?"]').forEach((img) => {
    const src = img.currentSrc || img.src;
    if (!src || seenSVGs.has(src)) return;
    seenSVGs.add(src);
    svgs.push({
      code: null,
      // Need to fetch
      src: makeAbsolute(src),
      viewBox: "",
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      id: img.id || null,
      location: "external",
      element: img
    });
  });
  walkAllElements(document, (el) => {
    const computed = window.getComputedStyle(el);
    const bgImage = computed.backgroundImage;
    if (!bgImage || bgImage === "none") return;
    const urls = extractUrlsFromCSS(bgImage);
    urls.forEach((url) => {
      if (!url.includes(".svg") || seenSVGs.has(url)) return;
      seenSVGs.add(url);
      svgs.push({
        code: null,
        src: makeAbsolute(url),
        viewBox: "",
        width: 0,
        height: 0,
        id: null,
        location: "css-bg",
        element: el
      });
    });
  });
  return svgs;
}
function extractVideos() {
  const videos = [];
  const seenSrcs = /* @__PURE__ */ new Set();
  document.querySelectorAll("video").forEach((video) => {
    const src = video.currentSrc || video.src;
    const sources = video.querySelectorAll("source");
    if (src && !seenSrcs.has(src)) {
      seenSrcs.add(src);
      videos.push({
        src: makeAbsolute(src),
        type: video.type || "video/mp4",
        poster: video.poster ? makeAbsolute(video.poster) : null,
        width: video.videoWidth || video.width,
        height: video.videoHeight || video.height,
        element: video
      });
    }
    sources.forEach((source) => {
      const sSrc = source.src;
      if (!sSrc || seenSrcs.has(sSrc)) return;
      seenSrcs.add(sSrc);
      videos.push({
        src: makeAbsolute(sSrc),
        type: source.type || "video/mp4",
        poster: video.poster ? makeAbsolute(video.poster) : null,
        width: 0,
        height: 0,
        element: video
      });
    });
  });
  document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"]').forEach((iframe) => {
    const src = iframe.src;
    if (seenSrcs.has(src)) return;
    seenSrcs.add(src);
    videos.push({
      src,
      type: "embed",
      poster: null,
      width: iframe.width || 0,
      height: iframe.height || 0,
      element: iframe
    });
  });
  return videos;
}
function extractLotties() {
  const lotties = [];
  const seenSrcs = /* @__PURE__ */ new Set();
  document.querySelectorAll("lottie-player").forEach((player) => {
    const src = player.getAttribute("src");
    if (src && !seenSrcs.has(src)) {
      seenSrcs.add(src);
      lotties.push({
        src: makeAbsolute(src),
        name: getNameFromUrl(src) || "lottie-animation",
        playerType: "lottie-player",
        autoplay: player.hasAttribute("autoplay"),
        loop: player.hasAttribute("loop"),
        width: player.offsetWidth || 0,
        height: player.offsetHeight || 0
      });
    }
  });
  document.querySelectorAll("dotlottie-player").forEach((player) => {
    const src = player.getAttribute("src");
    if (src && !seenSrcs.has(src)) {
      seenSrcs.add(src);
      lotties.push({
        src: makeAbsolute(src),
        name: getNameFromUrl(src) || "dotlottie-animation",
        playerType: "dotlottie-player",
        autoplay: player.hasAttribute("autoplay"),
        loop: player.hasAttribute("loop"),
        width: player.offsetWidth || 0,
        height: player.offsetHeight || 0
      });
    }
  });
  document.querySelectorAll("[data-animation-path], [data-anim-path], [data-lottie]").forEach((el) => {
    const src = el.getAttribute("data-animation-path") || el.getAttribute("data-anim-path") || el.getAttribute("data-lottie");
    if (src && !seenSrcs.has(src)) {
      seenSrcs.add(src);
      lotties.push({
        src: makeAbsolute(src),
        name: getNameFromUrl(src) || "lottie-data-attr",
        playerType: "bodymovin",
        autoplay: false,
        loop: false,
        width: el.offsetWidth || 0,
        height: el.offsetHeight || 0
      });
    }
  });
  document.querySelectorAll("script:not([src])").forEach((script) => {
    const text = script.textContent || "";
    const pathMatches = text.matchAll(/['"](https?:\/\/[^'"]*\.json)['"]/g);
    for (const match of pathMatches) {
      const url = match[1];
      if (url && !seenSrcs.has(url) && (url.includes("lottie") || url.includes("anim") || url.includes("bodymovin"))) {
        seenSrcs.add(url);
        lotties.push({
          src: url,
          name: getNameFromUrl(url) || "script-lottie",
          playerType: "script",
          autoplay: false,
          loop: false,
          width: 0,
          height: 0
        });
      }
    }
  });
  document.querySelectorAll("canvas[data-rive-src], rive-canvas").forEach((el) => {
    const src = el.getAttribute("data-rive-src") || el.getAttribute("src");
    if (src && !seenSrcs.has(src)) {
      seenSrcs.add(src);
      lotties.push({
        src: makeAbsolute(src),
        name: getNameFromUrl(src) || "rive-animation",
        playerType: "rive",
        autoplay: true,
        loop: true,
        width: el.offsetWidth || 0,
        height: el.offsetHeight || 0
      });
    }
  });
  return lotties;
}
function extractCSSAnimations() {
  const animations = [];
  const seenNames = /* @__PURE__ */ new Set();
  const keyframesMap = {};
  try {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule instanceof CSSKeyframesRule) {
            const name = rule.name;
            if (!keyframesMap[name]) {
              const frames = [];
              for (const kf of rule.cssRules) {
                frames.push({
                  offset: kf.keyText,
                  style: kf.cssText
                });
              }
              keyframesMap[name] = {
                name,
                css: rule.cssText,
                frames
              };
            }
          }
        }
      } catch (e) {
      }
    }
  } catch (e) {
  }
  const scannedElements = document.querySelectorAll("*");
  const MAX_SCAN = 3e3;
  const limit = Math.min(scannedElements.length, MAX_SCAN);
  for (let i = 0; i < limit; i++) {
    const el = scannedElements[i];
    const computed = window.getComputedStyle(el);
    const animName = computed.animationName;
    const animDuration = computed.animationDuration;
    const transition = computed.transition;
    if (animName && animName !== "none") {
      const names = animName.split(",").map((n) => n.trim());
      const durations = animDuration.split(",").map((d) => d.trim());
      names.forEach((name, idx) => {
        if (name === "none" || seenNames.has(name)) return;
        seenNames.add(name);
        const keyframes = keyframesMap[name] || null;
        animations.push({
          type: "keyframe",
          name,
          duration: durations[idx] || durations[0] || "0s",
          timingFunction: computed.animationTimingFunction || "ease",
          iterationCount: computed.animationIterationCount || "1",
          delay: computed.animationDelay || "0s",
          keyframeCSS: keyframes?.css || null,
          frames: keyframes?.frames || [],
          element: describeElement(el)
        });
      });
    }
    if (transition && transition !== "all 0s ease 0s" && transition !== "none") {
      const key = `transition:${transition}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        const tProperty = computed.transitionProperty || "all";
        const tDuration = computed.transitionDuration || "0s";
        const tTiming = computed.transitionTimingFunction || "ease";
        const tDelay = computed.transitionDelay || "0s";
        animations.push({
          type: "transition",
          name: null,
          transition,
          transitionProperty: tProperty,
          transitionDuration: tDuration,
          transitionTimingFunction: tTiming,
          transitionDelay: tDelay,
          element: describeElement(el)
        });
      }
    }
  }
  document.querySelectorAll("[data-aos], [data-scroll], [data-gsap], [data-sal]").forEach((el) => {
    const aoType = el.getAttribute("data-aos") || el.getAttribute("data-sal") || "scroll-animation";
    const key = `aos:${aoType}:${describeElement(el)}`;
    if (seenNames.has(key)) return;
    seenNames.add(key);
    animations.push({
      type: "scroll-library",
      name: aoType,
      library: el.hasAttribute("data-aos") ? "AOS" : el.hasAttribute("data-sal") ? "SAL" : el.hasAttribute("data-gsap") ? "GSAP" : "scroll",
      duration: el.getAttribute("data-aos-duration") || el.getAttribute("data-sal-duration") || null,
      delay: el.getAttribute("data-aos-delay") || el.getAttribute("data-sal-delay") || null,
      element: describeElement(el)
    });
  });
  return animations;
}
function getNameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop();
    return filename?.replace(/\.(json|lottie|riv)$/i, "") || null;
  } catch {
    return null;
  }
}
function getImageFormat(url) {
  if (!url) return "unknown";
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  if (clean.endsWith(".webp")) return "webp";
  if (clean.endsWith(".png")) return "png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "jpg";
  if (clean.endsWith(".gif")) return "gif";
  if (clean.endsWith(".svg")) return "svg";
  if (clean.endsWith(".avif")) return "avif";
  if (clean.endsWith(".ico")) return "ico";
  return "unknown";
}
function estimateImageSize(w, h) {
  if (!w || !h) return "—";
  const bytes = w * h * 0.5;
  if (bytes > 1024 * 1024) return Math.round(bytes / (1024 * 1024)) + " MB";
  if (bytes > 1024) return Math.round(bytes / 1024) + " KB";
  return bytes + " B";
}
function parseSrcset(srcset) {
  return srcset.split(",").map((s) => {
    const parts = s.trim().split(/\s+/);
    return { url: parts[0], descriptor: parts[1] || "" };
  }).filter((s) => s.url);
}
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
function parseColor(colorStr) {
  if (!colorStr || colorStr === "transparent" || colorStr === "none") return null;
  if (colorStr.startsWith("#")) {
    const rgb = hexToRgb(colorStr);
    return rgb ? { ...rgb, a: 1 } : null;
  }
  const rgbaMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] !== void 0 ? parseFloat(rgbaMatch[4]) : 1
    };
  }
  return null;
}
function toHex(colorStr) {
  const c = parseColor(colorStr);
  if (!c) return null;
  return rgbToHex(c.r, c.g, c.b);
}
function getContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}
function getRelativeLuminance(color) {
  const c = parseColor(color);
  if (!c) return 0;
  const [rs, gs, bs] = [c.r, c.g, c.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function deltaE(color1, color2) {
  const lab1 = rgbToLab(color1);
  const lab2 = rgbToLab(color2);
  if (!lab1 || !lab2) return Infinity;
  return Math.sqrt(
    Math.pow(lab2.l - lab1.l, 2) + Math.pow(lab2.a - lab1.a, 2) + Math.pow(lab2.b - lab1.b, 2)
  );
}
function rgbToLab(colorStr) {
  const c = parseColor(colorStr);
  if (!c) return null;
  let r = c.r / 255, g = c.g / 255, b = c.b / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 8856e-6 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 8856e-6 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  };
}
function getColorName(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "Unknown";
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (hsl.s < 10) {
    if (hsl.l < 15) return "Black";
    if (hsl.l < 30) return "Dark Gray";
    if (hsl.l < 60) return "Gray";
    if (hsl.l < 85) return "Light Gray";
    return "White";
  }
  const hueNames = [
    [15, "Red"],
    [35, "Orange"],
    [55, "Yellow"],
    [80, "Yellow Green"],
    [150, "Green"],
    [185, "Teal"],
    [220, "Blue"],
    [260, "Indigo"],
    [290, "Purple"],
    [330, "Pink"],
    [360, "Red"]
  ];
  let name = "Red";
  for (const [hue, hueName] of hueNames) {
    if (hsl.h <= hue) {
      name = hueName;
      break;
    }
  }
  if (hsl.l < 30) return "Dark " + name;
  if (hsl.l > 70) return "Light " + name;
  return name;
}
function analyzeColors() {
  const colorMap = /* @__PURE__ */ new Map();
  const contrastIssues = [];
  const elements = document.querySelectorAll("*");
  const total = elements.length;
  elements.forEach((el) => {
    const computed = window.getComputedStyle(el);
    const colorProps = [
      { prop: "color", source: "text" },
      { prop: "backgroundColor", source: "background" },
      { prop: "borderTopColor", source: "border" },
      { prop: "borderRightColor", source: "border" },
      { prop: "borderBottomColor", source: "border" },
      { prop: "borderLeftColor", source: "border" },
      { prop: "outlineColor", source: "outline" },
      { prop: "textDecorationColor", source: "decoration" }
    ];
    colorProps.forEach(({ prop, source }) => {
      const value = computed[prop];
      if (!value) return;
      const hex = toHex(value);
      if (!hex) return;
      addColor(colorMap, hex, source);
    });
    const boxShadow = computed.boxShadow;
    if (boxShadow && boxShadow !== "none") {
      const shadowColors = extractColorsFromShadow(boxShadow);
      shadowColors.forEach((hex) => addColor(colorMap, hex, "shadow"));
    }
    const textColor = computed.color;
    const bgColor = findEffectiveBackground(el);
    if (textColor && bgColor) {
      const ratio = getContrastRatio(textColor, bgColor);
      const fontSize = parseFloat(computed.fontSize);
      const fontWeight = parseInt(computed.fontWeight);
      const isLargeText = fontSize >= 24 || fontSize >= 18.66 && fontWeight >= 700;
      if (ratio < 4.5) {
        const fgHex = toHex(textColor);
        const bgHex = toHex(bgColor);
        if (fgHex && bgHex && fgHex !== bgHex) {
          contrastIssues.push({
            fg: fgHex,
            bg: bgHex,
            ratio: Math.round(ratio * 100) / 100,
            passes: {
              AA: isLargeText ? ratio >= 3 : ratio >= 4.5,
              AAA: isLargeText ? ratio >= 4.5 : ratio >= 7,
              AALarge: ratio >= 3
            },
            element: el.tagName.toLowerCase(),
            text: el.textContent?.trim().substring(0, 30) || ""
          });
        }
      }
    }
  });
  let palette = Array.from(colorMap.entries()).map(([hex, data]) => {
    const rgb = parseColor(hex);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 };
    return {
      hex,
      rgb: rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "",
      hsl: `${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
      count: data.count,
      sources: Array.from(data.sources),
      name: getColorName(hex)
    };
  });
  palette.sort((a, b) => b.count - a.count);
  palette = groupSimilarColors(palette);
  const categorized = categorizeColors(palette);
  const uniqueIssues = deduplicateIssues(contrastIssues);
  return {
    palette: palette.slice(0, 50),
    // Top 50 colors
    backgrounds: categorized.backgrounds,
    textColors: categorized.textColors,
    accentColors: categorized.accents,
    contrastIssues: uniqueIssues.slice(0, 20),
    totalElements: total,
    uniqueColors: palette.length
  };
}
function addColor(map, hex, source) {
  if (hex === "#000000") {
    return;
  }
  hex = hex.toLowerCase();
  if (map.has(hex)) {
    const entry = map.get(hex);
    entry.count++;
    entry.sources.add(source);
  } else {
    map.set(hex, { count: 1, sources: /* @__PURE__ */ new Set([source]) });
  }
}
function extractColorsFromShadow(shadow) {
  const colors = [];
  const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/g;
  let match;
  while ((match = rgbRegex.exec(shadow)) !== null) {
    const hex = toHex(match[0]);
    if (hex) colors.push(hex);
  }
  return colors;
}
function findEffectiveBackground(el) {
  let current = el;
  while (current && current !== document.documentElement) {
    const bg = window.getComputedStyle(current).backgroundColor;
    const parsed = parseColor(bg);
    if (parsed && parsed.a > 0.1) {
      return bg;
    }
    current = current.parentElement;
  }
  return "rgb(255, 255, 255)";
}
function groupSimilarColors(palette) {
  const groups = [];
  const used = /* @__PURE__ */ new Set();
  for (let i = 0; i < palette.length; i++) {
    if (used.has(i)) continue;
    const group = { ...palette[i] };
    used.add(i);
    for (let j = i + 1; j < palette.length; j++) {
      if (used.has(j)) continue;
      const diff = deltaE(palette[i].hex, palette[j].hex);
      if (diff < 5) {
        group.count += palette[j].count;
        used.add(j);
      }
    }
    groups.push(group);
  }
  return groups.sort((a, b) => b.count - a.count);
}
function categorizeColors(palette) {
  const backgrounds = [];
  const textColors = [];
  const accents = [];
  palette.forEach((color) => {
    const hsl = parseHSL(color.hsl);
    if (color.sources.includes("background")) {
      if (hsl.l > 85 || hsl.l < 15) {
        backgrounds.push(color.hex);
      }
    }
    if (color.sources.includes("text")) {
      textColors.push(color.hex);
    }
    if (hsl.s > 40 && hsl.l > 20 && hsl.l < 80 && color.count < 50) {
      accents.push(color.hex);
    }
  });
  return {
    backgrounds: [...new Set(backgrounds)].slice(0, 5),
    textColors: [...new Set(textColors)].slice(0, 5),
    accents: [...new Set(accents)].slice(0, 5)
  };
}
function parseHSL(hslStr) {
  const parts = hslStr.split(",").map((s) => parseInt(s));
  return { h: parts[0] || 0, s: parts[1] || 0, l: parts[2] || 0 };
}
function deduplicateIssues(issues) {
  const seen = /* @__PURE__ */ new Set();
  return issues.filter((issue) => {
    const key = `${issue.fg}-${issue.bg}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function analyzeFonts() {
  const fontMap = /* @__PURE__ */ new Map();
  const fontScale = {};
  const elements = document.querySelectorAll("*");
  elements.forEach((el) => {
    const computed = window.getComputedStyle(el);
    const family = cleanFontFamily(computed.fontFamily);
    if (!family) return;
    const weight = computed.fontWeight;
    const style = computed.fontStyle;
    const fontSize = computed.fontSize;
    computed.lineHeight;
    const tag = el.tagName.toLowerCase();
    if (!fontMap.has(family)) {
      fontMap.set(family, {
        weights: /* @__PURE__ */ new Set(),
        styles: /* @__PURE__ */ new Set(),
        count: 0,
        usage: { headings: false, body: false, code: false },
        sizes: /* @__PURE__ */ new Map()
      });
    }
    const entry = fontMap.get(family);
    entry.weights.add(weight);
    entry.styles.add(style);
    entry.count++;
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      entry.usage.headings = true;
    }
    if (["p", "span", "li", "td", "a", "label", "div"].includes(tag)) {
      entry.usage.body = true;
    }
    if (["code", "pre", "kbd", "samp", "tt"].includes(tag)) {
      entry.usage.code = true;
    }
    const sizeKey = `${fontSize} / ${weight}`;
    entry.sizes.set(sizeKey, (entry.sizes.get(sizeKey) || 0) + 1);
    if (tag === "h1" && !fontScale.h1) fontScale.h1 = `${fontSize} / ${weight}`;
    if (tag === "h2" && !fontScale.h2) fontScale.h2 = `${fontSize} / ${weight}`;
    if (tag === "h3" && !fontScale.h3) fontScale.h3 = `${fontSize} / ${weight}`;
    if (tag === "h4" && !fontScale.h4) fontScale.h4 = `${fontSize} / ${weight}`;
    if (tag === "p" && !fontScale.body) fontScale.body = `${fontSize} / ${weight}`;
    if (tag === "small" && !fontScale.small) fontScale.small = `${fontSize} / ${weight}`;
    if ((tag === "code" || tag === "pre") && !fontScale.code) fontScale.code = `${fontSize} / ${weight}`;
  });
  const fontSources = detectFontSources();
  const fonts = Array.from(fontMap.entries()).map(([family, data]) => {
    const source = fontSources.get(family) || detectSystemFont(family);
    return {
      family,
      weights: Array.from(data.weights).sort((a, b) => parseInt(a) - parseInt(b)),
      styles: Array.from(data.styles),
      source: source.type,
      loadUrl: source.url || null,
      usage: {
        headings: data.usage.headings,
        body: data.usage.body,
        code: data.usage.code,
        count: data.count
      }
    };
  }).sort((a, b) => b.usage.count - a.usage.count);
  return { fonts, fontScale };
}
function cleanFontFamily(fontFamily) {
  if (!fontFamily) return null;
  const first = fontFamily.split(",")[0].trim();
  return first.replace(/['"]/g, "");
}
function detectFontSources() {
  const sources = /* @__PURE__ */ new Map();
  document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((link) => {
    const href = link.href;
    const familyMatch = href.match(/family=([^&:]+)/);
    if (familyMatch) {
      const families = familyMatch[1].split("|");
      families.forEach((f) => {
        const name = decodeURIComponent(f.split(":")[0].replace(/\+/g, " "));
        sources.set(name, { type: "google-fonts", url: href });
      });
    }
  });
  document.querySelectorAll('link[href*="use.typekit.net"]').forEach((link) => {
    sources.set("__adobe__", { type: "adobe", url: link.href });
  });
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          if (rule instanceof CSSFontFaceRule) {
            const family = rule.style.fontFamily?.replace(/['"]/g, "");
            const src = rule.style.src;
            if (family && !sources.has(family)) {
              const urlMatch = src?.match(/url\(["']?([^"')]+)/);
              sources.set(family, {
                type: "self-hosted",
                url: urlMatch ? urlMatch[1] : null
              });
            }
          }
        }
      } catch (e) {
      }
    }
  } catch (e) {
  }
  if (document.fonts) {
    document.fonts.forEach((font) => {
      const family = font.family.replace(/['"]/g, "");
      if (!sources.has(family)) {
        sources.set(family, { type: "loaded", url: null });
      }
    });
  }
  return sources;
}
function detectSystemFont(family) {
  const systemFonts = [
    "Arial",
    "Helvetica",
    "Helvetica Neue",
    "Times New Roman",
    "Times",
    "Georgia",
    "Verdana",
    "Courier New",
    "Courier",
    "Impact",
    "Comic Sans MS",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "sans-serif",
    "serif",
    "monospace",
    "cursive",
    "fantasy"
  ];
  if (systemFonts.some((f) => f.toLowerCase() === family.toLowerCase())) {
    return { type: "system", url: null };
  }
  return { type: "unknown", url: null };
}
function analyzeLayout(element) {
  if (!element) return null;
  const tree = buildLayoutTree(element, 0);
  const structuralHTML = generateStructuralHTML(tree, 0);
  const tailwindStructure = getTailwindClasses(tree);
  return {
    tree,
    structuralHTML,
    tailwindStructure,
    ascii: generateASCII(tree, 0)
  };
}
function buildLayoutTree(element, depth) {
  if (depth > 8) return null;
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const display = computed.display;
  const tag = element.tagName.toLowerCase();
  if (rect.width < 2 && rect.height < 2) return null;
  if (display === "none") return null;
  const node = {
    tag,
    type: getLayoutType(display),
    display,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    classes: getCleanClasses(element)
  };
  if (display === "flex" || display === "inline-flex") {
    node.direction = computed.flexDirection;
    node.wrap = computed.flexWrap;
    node.align = computed.alignItems;
    node.justify = computed.justifyContent;
    node.gap = computed.gap !== "normal" ? computed.gap : null;
  }
  if (display === "grid" || display === "inline-grid") {
    node.columns = computed.gridTemplateColumns;
    node.rows = computed.gridTemplateRows;
    node.gap = computed.gap !== "normal" ? computed.gap : null;
    node.align = computed.alignItems;
    node.justifyItems = computed.justifyItems;
  }
  const widthPercent = getWidthPercentage(element);
  if (widthPercent) node.widthHint = widthPercent;
  const children = [];
  for (const child of element.children) {
    const childNode = buildLayoutTree(child, depth + 1);
    if (childNode) children.push(childNode);
  }
  if (children.length > 0) {
    node.children = children;
  }
  return node;
}
function getLayoutType(display) {
  if (display === "flex" || display === "inline-flex") return "flex";
  if (display === "grid" || display === "inline-grid") return "grid";
  if (display === "inline" || display === "inline-block") return "inline";
  return "block";
}
function getCleanClasses(element) {
  return Array.from(element.classList).filter((c) => !c.match(/^(css-|sc-|_|__|jsx-|svelte-)/)).slice(0, 3);
}
function getWidthPercentage(element) {
  const parent = element.parentElement;
  if (!parent) return null;
  const parentWidth = parent.getBoundingClientRect().width;
  const childWidth = element.getBoundingClientRect().width;
  if (parentWidth === 0) return null;
  const ratio = childWidth / parentWidth;
  if (ratio > 0.95) return "100%";
  if (Math.abs(ratio - 0.5) < 0.05) return "50%";
  if (Math.abs(ratio - 0.333) < 0.05) return "33%";
  if (Math.abs(ratio - 0.667) < 0.05) return "67%";
  if (Math.abs(ratio - 0.25) < 0.05) return "25%";
  if (Math.abs(ratio - 0.75) < 0.05) return "75%";
  return null;
}
function generateStructuralHTML(node, indent) {
  if (!node) return "";
  const pad = "  ".repeat(indent);
  const classes = nodeToTailwind(node);
  const classStr = classes.length > 0 ? ` class="${classes.join(" ")}"` : "";
  if (!node.children || node.children.length === 0) {
    if (["img", "input", "br", "hr"].includes(node.tag)) {
      return `${pad}<${node.tag}${classStr} />
`;
    }
    return `${pad}<${node.tag}${classStr}>...</${node.tag}>
`;
  }
  let html = `${pad}<${node.tag}${classStr}>
`;
  node.children.forEach((child) => {
    html += generateStructuralHTML(child, indent + 1);
  });
  html += `${pad}</${node.tag}>
`;
  return html;
}
function nodeToTailwind(node) {
  const classes = [];
  if (node.type === "flex") {
    classes.push("flex");
    if (node.direction === "column") classes.push("flex-col");
    if (node.direction === "row-reverse") classes.push("flex-row-reverse");
    if (node.direction === "column-reverse") classes.push("flex-col-reverse");
    if (node.wrap === "wrap") classes.push("flex-wrap");
    const alignMap = { "center": "items-center", "flex-start": "items-start", "flex-end": "items-end", "stretch": "items-stretch", "baseline": "items-baseline" };
    if (alignMap[node.align]) classes.push(alignMap[node.align]);
    const justifyMap = { "center": "justify-center", "flex-start": "justify-start", "flex-end": "justify-end", "space-between": "justify-between", "space-around": "justify-around", "space-evenly": "justify-evenly" };
    if (justifyMap[node.justify]) classes.push(justifyMap[node.justify]);
  }
  if (node.type === "grid") {
    classes.push("grid");
    if (node.columns) {
      const colCount = node.columns.split(" ").filter((c) => c !== "").length;
      if (colCount > 0) classes.push(`grid-cols-${colCount}`);
    }
  }
  if (node.gap) {
    const gapPx = parseFloat(node.gap);
    if (gapPx > 0) {
      const gapClass = pxToTailwindSpacing(gapPx);
      classes.push(`gap-${gapClass}`);
    }
  }
  if (node.widthHint) {
    const widthMap = { "100%": "w-full", "50%": "w-1/2", "33%": "w-1/3", "67%": "w-2/3", "25%": "w-1/4", "75%": "w-3/4" };
    if (widthMap[node.widthHint]) classes.push(widthMap[node.widthHint]);
  }
  return classes;
}
function getTailwindClasses(node) {
  if (!node) return "";
  return nodeToTailwind(node).join(" ");
}
function pxToTailwindSpacing(px) {
  const map = { 0: "0", 1: "px", 2: "0.5", 4: "1", 6: "1.5", 8: "2", 10: "2.5", 12: "3", 14: "3.5", 16: "4", 20: "5", 24: "6", 28: "7", 32: "8", 36: "9", 40: "10", 44: "11", 48: "12", 56: "14", 64: "16" };
  const sorted = Object.keys(map).map(Number).sort((a, b) => a - b);
  let closest = sorted[0];
  for (const val of sorted) {
    if (Math.abs(val - px) < Math.abs(closest - px)) {
      closest = val;
    }
  }
  return map[closest] || Math.round(px / 4);
}
function generateASCII(node, depth) {
  if (!node) return "";
  const indent = "│ ".repeat(depth);
  const prefix = depth === 0 ? "" : "├─ ";
  let line = `${indent}${prefix}<${node.tag}>`;
  if (node.type !== "block") line += ` [${node.type}]`;
  if (node.direction) line += ` ${node.direction}`;
  if (node.gap) line += ` gap:${node.gap}`;
  if (node.widthHint) line += ` ${node.widthHint}`;
  line += ` (${node.width}×${node.height})`;
  line += "\n";
  if (node.children) {
    node.children.forEach((child) => {
      line += generateASCII(child, depth + 1);
    });
  }
  return line;
}
function exportCode(element, options = {}) {
  const { mode = "html-css" } = options;
  const clone = element.cloneNode(true);
  const styleMap = /* @__PURE__ */ new Map();
  collectStyles(element, clone, styleMap);
  cleanElement(clone);
  resolveUrls(clone);
  if (mode === "html-tailwind") {
    applyTailwindClasses(clone, styleMap);
    const html2 = formatHTML(clone.outerHTML);
    return { html: html2, css: null, mode: "html-tailwind" };
  }
  const { html, css } = generateHTMLCSS(clone, styleMap);
  return { html, css, mode: "html-css" };
}
function collectStyles(original, clone, styleMap) {
  const computed = window.getComputedStyle(original);
  const styles = extractImportantStyles(computed, original);
  styleMap.set(clone, styles);
  const origChildren = original.children;
  const cloneChildren = clone.children;
  for (let i = 0; i < origChildren.length && i < cloneChildren.length; i++) {
    collectStyles(origChildren[i], cloneChildren[i], styleMap);
  }
}
function extractImportantStyles(computed, element) {
  const props = {};
  const important = [
    // Display & position
    "display",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "z-index",
    "float",
    "clear",
    // Box model
    "width",
    "height",
    "min-width",
    "max-width",
    "min-height",
    "max-height",
    "box-sizing",
    "aspect-ratio",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    // Border
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
    "border-top-style",
    "border-right-style",
    "border-bottom-style",
    "border-left-style",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    // Background
    "background-color",
    "background-image",
    "background-size",
    "background-position",
    "background-repeat",
    "background-clip",
    // Typography
    "color",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "line-height",
    "letter-spacing",
    "word-spacing",
    "text-align",
    "text-transform",
    "text-decoration",
    "text-indent",
    "text-overflow",
    "vertical-align",
    // Flexbox
    "flex-direction",
    "flex-wrap",
    "align-items",
    "align-content",
    "justify-content",
    "gap",
    "row-gap",
    "column-gap",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "align-self",
    "order",
    // Grid
    "grid-template-columns",
    "grid-template-rows",
    "grid-column",
    "grid-row",
    "grid-auto-flow",
    // Visual
    "box-shadow",
    "opacity",
    "overflow",
    "overflow-x",
    "overflow-y",
    "transform",
    "transition",
    "cursor",
    "list-style-type",
    "white-space",
    "word-break",
    "overflow-wrap",
    "object-fit",
    "object-position",
    // Clip & mask
    "clip-path",
    "mask-image",
    // Mix
    "mix-blend-mode",
    "filter",
    "backdrop-filter"
  ];
  const skipValues = /* @__PURE__ */ new Set([
    "",
    "none",
    "normal",
    "auto",
    "static",
    "visible",
    "0px",
    "0%",
    "0",
    "0px 0px",
    "0px 0px 0px 0px",
    "rgba(0, 0, 0, 0)",
    "transparent",
    "start",
    "baseline",
    "medium none",
    "currentcolor",
    "stretch",
    "content-box",
    "scroll",
    "border-box"
  ]);
  const keepAlways = /* @__PURE__ */ new Set([
    "display",
    "position",
    "flex-direction",
    "flex-wrap",
    "align-items",
    "justify-content",
    "text-align",
    "overflow",
    "overflow-x",
    "overflow-y",
    "white-space",
    "font-weight",
    "font-family",
    "font-size",
    "line-height",
    "color",
    "background-color"
  ]);
  for (const prop of important) {
    const value = computed.getPropertyValue(prop);
    if (!value) continue;
    if (keepAlways.has(prop)) {
      if (value === "" || value === "rgba(0, 0, 0, 0)" || value === "transparent") {
        if (prop === "background-color") continue;
        if (prop === "color" && value === "rgba(0, 0, 0, 0)") continue;
      }
      if (prop === "display") {
        const tag = element?.tagName?.toLowerCase();
        if (value === "block" && (!tag || ["div", "p", "section", "header", "footer", "main", "article", "nav", "aside", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "form", "fieldset", "figure"].includes(tag))) continue;
        if (value === "inline" && tag === "span") continue;
      }
      if (prop === "position" && value === "static") continue;
      props[prop] = value;
      continue;
    }
    if (skipValues.has(value)) continue;
    if (prop.includes("border") && prop.includes("style") && value === "none") continue;
    if (prop.includes("border") && prop.includes("width") && value === "0px") continue;
    props[prop] = value;
  }
  if (element) {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && !props["width"]) {
      props["width"] = Math.round(rect.width) + "px";
    }
    if (rect.height > 0 && !props["height"]) {
      props["height"] = Math.round(rect.height) + "px";
    }
  }
  return props;
}
function cleanElement(el) {
  Array.from(el.attributes || []).forEach((attr) => {
    if (attr.name.startsWith("data-") || attr.name.startsWith("aria-") || attr.name.startsWith("on") || ["jsaction", "jsname", "jscontroller", "jsmodel", "role"].includes(attr.name)) {
      el.removeAttribute(attr.name);
    }
  });
  if (el.classList) {
    const cleaned = Array.from(el.classList).filter((c) => !c.match(/^(css-|sc-|_|__|jsx-|svelte-|ng-|v-|chakra-|MuiBox|MuiTypography)/)).filter((c) => !c.match(/^[a-z]{1,2}[A-Z]/)).filter((c) => c.length > 2);
    el.className = cleaned.join(" ");
    if (el.className === "") el.removeAttribute("class");
  }
  el.querySelectorAll("script, noscript, style").forEach((s) => s.remove());
  for (const child of el.children) {
    cleanElement(child);
  }
}
function resolveUrls(el) {
  el.querySelectorAll("[src], [href], [poster]").forEach((node) => {
    ["src", "href", "poster"].forEach((attr) => {
      const val = node.getAttribute(attr);
      if (val && !val.startsWith("http") && !val.startsWith("data:") && !val.startsWith("#")) {
        try {
          node.setAttribute(attr, new URL(val, window.location.href).href);
        } catch (e) {
        }
      }
    });
  });
}
function generateHTMLCSS(clone, styleMap) {
  let classCounter = 1;
  const cssRules = [];
  function processElement(el) {
    const styles = styleMap.get(el);
    if (styles && Object.keys(styles).length > 0) {
      const className = `dg-${el.tagName.toLowerCase()}-${classCounter++}`;
      el.classList.add(className);
      const declarations = Object.entries(styles).map(([prop, value]) => `  ${prop}: ${value};`).join("\n");
      cssRules.push(`.${className} {
${declarations}
}`);
    }
    for (const child of el.children) {
      processElement(child);
    }
  }
  processElement(clone);
  const html = formatHTML(clone.outerHTML);
  const css = cssRules.join("\n\n");
  return { html, css };
}
function applyTailwindClasses(el, styleMap) {
  const styles = styleMap.get(el);
  if (styles) {
    const twClasses = cssToTailwind(styles);
    if (twClasses.length > 0) {
      el.className = (el.className ? el.className + " " : "") + twClasses.join(" ");
    }
  }
  for (const child of el.children) {
    applyTailwindClasses(child, styleMap);
  }
}
function cssToTailwind(styles) {
  const classes = [];
  if (styles["display"] === "flex") classes.push("flex");
  if (styles["display"] === "grid") classes.push("grid");
  if (styles["display"] === "inline-flex") classes.push("inline-flex");
  if (styles["display"] === "inline-block") classes.push("inline-block");
  if (styles["display"] === "inline") classes.push("inline");
  if (styles["flex-direction"] === "column") classes.push("flex-col");
  if (styles["flex-wrap"] === "wrap") classes.push("flex-wrap");
  if (styles["align-items"] === "center") classes.push("items-center");
  if (styles["justify-content"] === "center") classes.push("justify-center");
  if (styles["justify-content"] === "space-between") classes.push("justify-between");
  const pxToClass = (px, prefix) => {
    const val = parseFloat(px);
    if (!val) return null;
    const map = { 4: "1", 8: "2", 12: "3", 16: "4", 20: "5", 24: "6", 32: "8", 40: "10", 48: "12", 64: "16" };
    const sorted = Object.keys(map).map(Number);
    let closest = sorted.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a);
    return `${prefix}-${map[closest] || Math.round(val / 4)}`;
  };
  if (styles["gap"]) {
    const c = pxToClass(styles["gap"], "gap");
    if (c) classes.push(c);
  }
  if (styles["padding-top"]) {
    const c = pxToClass(styles["padding-top"], "pt");
    if (c) classes.push(c);
  }
  if (styles["padding-bottom"]) {
    const c = pxToClass(styles["padding-bottom"], "pb");
    if (c) classes.push(c);
  }
  if (styles["padding-left"]) {
    const c = pxToClass(styles["padding-left"], "pl");
    if (c) classes.push(c);
  }
  if (styles["padding-right"]) {
    const c = pxToClass(styles["padding-right"], "pr");
    if (c) classes.push(c);
  }
  if (styles["text-align"] === "center") classes.push("text-center");
  if (styles["font-weight"] === "700" || styles["font-weight"] === "bold") classes.push("font-bold");
  if (styles["font-weight"] === "600") classes.push("font-semibold");
  if (styles["font-weight"] === "500") classes.push("font-medium");
  if (styles["border-radius"]) {
    const r = parseFloat(styles["border-radius"]);
    if (r >= 9999) classes.push("rounded-full");
    else if (r >= 12) classes.push("rounded-xl");
    else if (r >= 8) classes.push("rounded-lg");
    else if (r >= 6) classes.push("rounded-md");
    else if (r >= 4) classes.push("rounded");
    else if (r >= 2) classes.push("rounded-sm");
  }
  if (styles["overflow"] === "hidden") classes.push("overflow-hidden");
  if (styles["position"] === "relative") classes.push("relative");
  if (styles["position"] === "absolute") classes.push("absolute");
  if (styles["position"] === "fixed") classes.push("fixed");
  return classes;
}
async function exportForFigma(element) {
  const imageCache = /* @__PURE__ */ new Map();
  await collectImages(element, imageCache);
  const rootRect = element.getBoundingClientRect();
  const W = Math.round(rootRect.width);
  const H = Math.round(rootRect.height);
  const defs = [];
  const body = [];
  let clipId = 0;
  let filterId = 0;
  let gradientId = 0;
  const groupIdMap = /* @__PURE__ */ new Map();
  function walkElement(el, depth) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    const x = Math.round(rect.left - rootRect.left);
    const y = Math.round(rect.top - rootRect.top);
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const cs = window.getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const elId = el.id ? el.id : el.className && typeof el.className === "string" ? el.className.split(" ")[0] : "";
    const groupId = elId ? `${tag}-${elId}`.replace(/[^a-zA-Z0-9_-]/g, "") : `${tag}-d${depth}`;
    groupIdMap.set(el, groupId);
    const overflow = cs.overflow || cs.overflowX || cs.overflowY;
    const needsClip = overflow === "hidden" || overflow === "clip";
    let clipRef = "";
    if (needsClip) {
      const cid = `clip-${clipId++}`;
      const rtl = parseFloat(cs.borderTopLeftRadius) || 0;
      const rtr = parseFloat(cs.borderTopRightRadius) || 0;
      const rMax = Math.max(rtl, rtr);
      defs.push(`<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rMax}" ry="${rMax}"/></clipPath>`);
      clipRef = ` clip-path="url(#${cid})"`;
    }
    body.push(`<g id="${esc(groupId)}"${clipRef}>`);
    const rTL = parseFloat(cs.borderTopLeftRadius) || 0;
    const rTR = parseFloat(cs.borderTopRightRadius) || 0;
    const rBR = parseFloat(cs.borderBottomRightRadius) || 0;
    const rBL = parseFloat(cs.borderBottomLeftRadius) || 0;
    const allSameRadius = rTL === rTR && rTR === rBR && rBR === rBL;
    const hasCustomRadius = !allSameRadius && (rTL > 0 || rTR > 0 || rBR > 0 || rBL > 0);
    function roundedRectPath(rx, ry, rw, rh, tl, tr, br, bl) {
      tl = Math.min(tl, rw / 2, rh / 2);
      tr = Math.min(tr, rw / 2, rh / 2);
      br = Math.min(br, rw / 2, rh / 2);
      bl = Math.min(bl, rw / 2, rh / 2);
      return `M${rx + tl},${ry} L${rx + rw - tr},${ry} Q${rx + rw},${ry} ${rx + rw},${ry + tr} L${rx + rw},${ry + rh - br} Q${rx + rw},${ry + rh} ${rx + rw - br},${ry + rh} L${rx + bl},${ry + rh} Q${rx},${ry + rh} ${rx},${ry + rh - bl} L${rx},${ry + tl} Q${rx},${ry} ${rx + tl},${ry} Z`;
    }
    const bgColor = cs.backgroundColor;
    const hasBg = bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent";
    const bgImage = cs.backgroundImage;
    const hasGradient = bgImage && bgImage !== "none" && (bgImage.includes("linear-gradient") || bgImage.includes("radial-gradient"));
    let bgFillAttr = "";
    if (hasGradient) {
      const gid = `grad-${gradientId++}`;
      const gradDef = parseGradientToDef(bgImage, gid);
      if (gradDef) {
        defs.push(gradDef);
        bgFillAttr = `fill="url(#${gid})"`;
      } else if (hasBg) {
        const fill = rgbaToSvg(bgColor);
        bgFillAttr = `fill="${fill.color}"${fill.opacity < 1 ? ` opacity="${fill.opacity}"` : ""}`;
      }
    } else if (hasBg) {
      const fill = rgbaToSvg(bgColor);
      bgFillAttr = `fill="${fill.color}"${fill.opacity < 1 ? ` opacity="${fill.opacity}"` : ""}`;
    }
    if (bgFillAttr) {
      if (hasCustomRadius) {
        body.push(`  <path d="${roundedRectPath(x, y, w, h, rTL, rTR, rBR, rBL)}" ${bgFillAttr}/>`);
      } else {
        body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rTL}" ry="${rTL}" ${bgFillAttr}/>`);
      }
    }
    const bw = parseFloat(cs.borderTopWidth) || 0;
    if (bw > 0 && cs.borderTopStyle !== "none") {
      const bc = rgbaToSvg(cs.borderTopColor || "#000");
      if (hasCustomRadius) {
        body.push(`  <path d="${roundedRectPath(x, y, w, h, rTL, rTR, rBR, rBL)}" fill="none" stroke="${bc.color}" stroke-width="${bw}"/>`);
      } else {
        body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rTL}" ry="${rTL}" fill="none" stroke="${bc.color}" stroke-width="${bw}"/>`);
      }
    }
    const shadow = cs.boxShadow;
    if (shadow && shadow !== "none") {
      const sm = shadow.match(/rgba?\([^)]+\)\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px/);
      if (sm) {
        const fid = `shadow-${filterId++}`;
        const dx = parseFloat(sm[1]) || 0;
        const dy = parseFloat(sm[2]) || 0;
        const blur = parseFloat(sm[3]) || 0;
        const sc = rgbaToSvg(sm[0].match(/rgba?\([^)]+\)/)[0]);
        defs.push(`<filter id="${fid}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur / 2}" flood-color="${sc.color}" flood-opacity="${sc.opacity}"/></filter>`);
        if (bgFillAttr) {
          const fill = rgbaToSvg(bgColor);
          body.splice(
            body.length - (bw > 0 ? 2 : 1),
            0,
            `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rTL}" ry="${rTL}" fill="${fill.color}" filter="url(#${fid})"/>`
          );
        }
      }
    }
    if (tag === "img") {
      const src = el.currentSrc || el.src;
      if (src) {
        const resolved = imageCache.get(src) || src;
        body.push(`  <image href="${esc(resolved)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
      }
    }
    if (tag === "svg") {
      const svgClone = el.cloneNode(true);
      svgClone.setAttribute("x", x);
      svgClone.setAttribute("y", y);
      svgClone.setAttribute("width", w);
      svgClone.setAttribute("height", h);
      body.push(`  ${svgClone.outerHTML}`);
      body.push("</g>");
      return;
    }
    if (tag === "video") {
      const poster = el.poster;
      if (poster) {
        body.push(`  <image href="${esc(poster)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
      } else {
        body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#333"/>`);
      }
      body.push("</g>");
      return;
    }
    const directText = getDirectText(el);
    if (directText) {
      const fontSize = parseFloat(cs.fontSize) || 16;
      const fontWeight = cs.fontWeight || "400";
      const fontFamily = cs.fontFamily || "sans-serif";
      const fontStyle = cs.fontStyle === "italic" ? ' font-style="italic"' : "";
      const color = rgbaToSvg(cs.color || "#000");
      const letterSpacing = parseFloat(cs.letterSpacing) || 0;
      const lsAttr = letterSpacing ? ` letter-spacing="${letterSpacing}"` : "";
      const textTransform = cs.textTransform;
      const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
      const textAlign = cs.textAlign;
      let displayText = directText;
      if (textTransform === "uppercase") displayText = displayText.toUpperCase();
      else if (textTransform === "lowercase") displayText = displayText.toLowerCase();
      else if (textTransform === "capitalize") displayText = displayText.replace(/\b\w/g, (c) => c.toUpperCase());
      const words = displayText.split(/\s+/);
      const paddingLeft = parseFloat(cs.paddingLeft) || 0;
      const paddingRight = parseFloat(cs.paddingRight) || 0;
      const paddingTop = parseFloat(cs.paddingTop) || 0;
      const innerW = w - paddingLeft - paddingRight;
      if (words.length > 20 && innerW > 0) {
        body.push(`  <foreignObject x="${x}" y="${y}" width="${w}" height="${h}">`);
        body.push(`    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:${esc(fontFamily)};font-size:${fontSize}px;font-weight:${fontWeight};${cs.fontStyle === "italic" ? "font-style:italic;" : ""}color:${color.color};line-height:${lineHeight}px;text-align:${textAlign};padding:${paddingTop}px ${paddingRight}px 0 ${paddingLeft}px;${letterSpacing ? `letter-spacing:${letterSpacing}px;` : ""}${textTransform && textTransform !== "none" ? `text-transform:${textTransform};` : ""}">${esc(displayText)}</div>`);
        body.push(`  </foreignObject>`);
      } else if (words.length > 0 && innerW > 0) {
        let anchor = "start";
        let textX = x + paddingLeft;
        if (textAlign === "center") {
          anchor = "middle";
          textX = x + w / 2;
        } else if (textAlign === "right" || textAlign === "end") {
          anchor = "end";
          textX = x + w - paddingRight;
        }
        const textY = y + paddingTop + fontSize * 0.85;
        const avgCharWidth = fontSize * 0.55;
        const maxChars = Math.floor(innerW / avgCharWidth);
        const lines = [];
        let currentLine = "";
        for (const word of words) {
          if (currentLine.length + word.length + 1 > maxChars && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = word;
          } else {
            currentLine += (currentLine ? " " : "") + word;
          }
        }
        if (currentLine) lines.push(currentLine.trim());
        body.push(`  <text x="${textX}" y="${textY}" font-family="${esc(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}"${fontStyle}${lsAttr} fill="${color.color}" text-anchor="${anchor}">`);
        lines.forEach((line, i) => {
          body.push(`    <tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`);
        });
        body.push("  </text>");
      }
    }
    if (bgImage && bgImage !== "none" && !hasGradient) {
      const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
      if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith("data:image/svg")) {
        const resolved = imageCache.get(urlMatch[1]) || urlMatch[1];
        body.push(`  <image href="${esc(resolved)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
      }
    }
    if (tag !== "img" && tag !== "video") {
      for (let i = 0; i < el.children.length; i++) {
        walkElement(el.children[i], depth + 1);
      }
    }
    body.push("</g>");
  }
  walkElement(element, 0);
  const interactions = extractInteractions(element);
  const cssRules = [];
  if (interactions.states.length > 0) {
    for (const item of interactions.states) {
      const baseSelector = item.selector.replace(/:hover|:focus-visible|:focus|:active/g, "").trim();
      const pseudoClass = item.selector.match(/:hover|:focus-visible|:focus|:active/)?.[0] || "";
      let targetGroupId = null;
      for (const [el, gid] of groupIdMap) {
        try {
          if (!baseSelector || el.matches(baseSelector)) {
            targetGroupId = gid;
            break;
          }
        } catch (e) {
        }
      }
      if (targetGroupId && pseudoClass) {
        const props = Object.entries(item.properties).map(([prop, val]) => {
          if (prop === "background-color") return `fill: ${rgbaToSvg(val).color}`;
          if (prop === "color") return `fill: ${rgbaToSvg(val).color}`;
          if (prop === "border-color") return `stroke: ${rgbaToSvg(val).color}`;
          if (prop === "opacity") return `opacity: ${val}`;
          if (prop === "transform") return `transform: ${val}`;
          return null;
        }).filter(Boolean);
        if (props.length > 0) {
          cssRules.push(`#${targetGroupId}${pseudoClass} rect { ${props.join("; ")}; cursor: pointer; }`);
          cssRules.push(`#${targetGroupId}${pseudoClass} text { ${props.filter((p) => p.startsWith("fill") || p.startsWith("opacity")).join("; ")}; }`);
        }
      }
    }
    if (interactions.transitions.length > 0) {
      const transitionGroupIds = /* @__PURE__ */ new Set();
      for (const item of interactions.states) {
        const baseSelector = item.selector.replace(/:hover|:focus-visible|:focus|:active/g, "").trim();
        for (const [el, gid] of groupIdMap) {
          try {
            if (!baseSelector || el.matches(baseSelector)) {
              transitionGroupIds.add(gid);
            }
          } catch (e) {
          }
        }
      }
      for (const gid of transitionGroupIds) {
        cssRules.push(`#${gid} rect, #${gid} text { transition: fill 0.2s ease, opacity 0.2s ease, transform 0.2s ease; cursor: pointer; }`);
      }
    }
  }
  let defsContent = defs.join("\n");
  if (cssRules.length > 0) {
    defsContent += (defsContent ? "\n" : "") + `<style>
${cssRules.join("\n")}
</style>`;
  }
  const defsBlock = defsContent ? `<defs>
${defsContent}
</defs>
` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${defsBlock}${body.join("\n")}
</svg>`;
  return { svg, width: W, height: H, mode: "figma-svg", interactions };
}
function parseGradientToDef(bgImage, id) {
  const linearMatch = bgImage.match(/linear-gradient\(([^)]+(?:\([^)]*\))*[^)]*)\)/);
  if (linearMatch) {
    const content = linearMatch[1];
    let x1 = "0%", y1 = "0%", x2 = "0%", y2 = "100%";
    const dirMatch = content.match(/^(to\s+\w+(?:\s+\w+)?|\d+deg)/);
    if (dirMatch) {
      const dir = dirMatch[1];
      if (dir.includes("to right")) {
        x1 = "0%";
        y1 = "0%";
        x2 = "100%";
        y2 = "0%";
      } else if (dir.includes("to left")) {
        x1 = "100%";
        y1 = "0%";
        x2 = "0%";
        y2 = "0%";
      } else if (dir.includes("to top")) {
        x1 = "0%";
        y1 = "100%";
        x2 = "0%";
        y2 = "0%";
      } else if (dir.includes("to bottom right")) {
        x1 = "0%";
        y1 = "0%";
        x2 = "100%";
        y2 = "100%";
      } else if (dir.includes("to bottom left")) {
        x1 = "100%";
        y1 = "0%";
        x2 = "0%";
        y2 = "100%";
      } else if (dir.includes("to top right")) {
        x1 = "0%";
        y1 = "100%";
        x2 = "100%";
        y2 = "0%";
      } else if (dir.includes("to top left")) {
        x1 = "100%";
        y1 = "100%";
        x2 = "0%";
        y2 = "0%";
      } else if (dir.endsWith("deg")) {
        const angle = parseFloat(dir) * Math.PI / 180;
        x1 = `${Math.round(50 - 50 * Math.sin(angle))}%`;
        y1 = `${Math.round(50 + 50 * Math.cos(angle))}%`;
        x2 = `${Math.round(50 + 50 * Math.sin(angle))}%`;
        y2 = `${Math.round(50 - 50 * Math.cos(angle))}%`;
      }
    }
    const colorStops = [];
    const stopRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|\w+)\s*(\d+%)?/g;
    let match;
    const colorsStr = dirMatch ? content.slice(dirMatch[0].length) : content;
    while ((match = stopRegex.exec(colorsStr)) !== null) {
      const color = rgbaToSvg(match[1]);
      const offset = match[2] || null;
      colorStops.push({ color: color.color, opacity: color.opacity, offset });
    }
    if (colorStops.length < 2) return null;
    colorStops.forEach((stop, i) => {
      if (!stop.offset) stop.offset = `${Math.round(i / (colorStops.length - 1) * 100)}%`;
    });
    const stops = colorStops.map(
      (s) => `<stop offset="${s.offset}" stop-color="${s.color}"${s.opacity < 1 ? ` stop-opacity="${s.opacity}"` : ""}/>`
    ).join("");
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
  }
  const radialMatch = bgImage.match(/radial-gradient\(([^)]+(?:\([^)]*\))*[^)]*)\)/);
  if (radialMatch) {
    const content = radialMatch[1];
    const colorStops = [];
    const stopRegex = /(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|\w+)\s*(\d+%)?/g;
    let match;
    while ((match = stopRegex.exec(content)) !== null) {
      const color = rgbaToSvg(match[1]);
      const offset = match[2] || null;
      colorStops.push({ color: color.color, opacity: color.opacity, offset });
    }
    if (colorStops.length < 2) return null;
    colorStops.forEach((stop, i) => {
      if (!stop.offset) stop.offset = `${Math.round(i / (colorStops.length - 1) * 100)}%`;
    });
    const stops = colorStops.map(
      (s) => `<stop offset="${s.offset}" stop-color="${s.color}"${s.opacity < 1 ? ` stop-opacity="${s.opacity}"` : ""}/>`
    ).join("");
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`;
  }
  return null;
}
async function collectImages(el, imageCache) {
  const tag = el.tagName.toLowerCase();
  if (tag === "img") {
    const src = el.currentSrc || el.src;
    if (src && !imageCache.has(src)) {
      imageCache.set(src, await imgToDataUrl(el, src));
    }
  }
  const bgImage = window.getComputedStyle(el).backgroundImage;
  if (bgImage && bgImage !== "none") {
    const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
    if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith("data:")) {
      const url = urlMatch[1];
      if (!imageCache.has(url)) {
        imageCache.set(url, await imgToDataUrl(null, url));
      }
    }
  }
  if (tag !== "img" && tag !== "video" && tag !== "svg") {
    for (const child of el.children) {
      await collectImages(child, imageCache);
    }
  }
}
async function imgToDataUrl(imgEl, src) {
  if (!src || src.startsWith("data:")) return src;
  if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      canvas.getContext("2d").drawImage(imgEl, 0, 0);
      return canvas.toDataURL("image/png");
    } catch (e) {
    }
  }
  try {
    const resp = await fetch(src, { mode: "cors", credentials: "omit" });
    if (!resp.ok) return src;
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return src;
  }
}
function extractInteractions(rootElement) {
  const interactionMap = /* @__PURE__ */ new Map();
  const STATE_PATTERNS = [
    { pattern: ":hover", state: "Hover" },
    { pattern: ":focus", state: "Focus" },
    { pattern: ":focus-visible", state: "Focus visible" },
    { pattern: ":active", state: "Active" }
  ];
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules || sheet.rules;
    } catch (e) {
      continue;
    }
    if (!rules) continue;
    for (const rule of rules) {
      if (!rule.selectorText || !rule.style) continue;
      const sel = rule.selectorText;
      const matchedState = STATE_PATTERNS.find((s) => sel.includes(s.pattern));
      if (!matchedState) continue;
      const baseSelector = sel.replace(/:hover|:focus-visible|:focus|:active/g, "").trim();
      let matches = false;
      try {
        matches = !baseSelector || rootElement.matches(baseSelector) || !!rootElement.querySelector(baseSelector);
      } catch (e) {
      }
      if (!matches) continue;
      const props = {};
      const INTERESTING = [
        "color",
        "background-color",
        "border-color",
        "opacity",
        "box-shadow",
        "transform",
        "text-decoration",
        "outline"
      ];
      for (const prop of INTERESTING) {
        const val = rule.style.getPropertyValue(prop);
        if (val) props[prop] = val;
      }
      if (Object.keys(props).length === 0) continue;
      const key = `${matchedState.state}|${sel}`;
      interactionMap.set(key, { state: matchedState.state, selector: sel, properties: props });
    }
  }
  const transitions = /* @__PURE__ */ new Set();
  const allEls = [rootElement, ...rootElement.querySelectorAll("*")];
  for (const el of allEls) {
    const cs = window.getComputedStyle(el);
    const t = cs.transition;
    if (t && t !== "none" && t !== "all 0s ease 0s") {
      transitions.add(t);
    }
  }
  return {
    states: [...interactionMap.values()],
    transitions: [...transitions]
  };
}
function exportResponsiveHTML(element) {
  const clone = element.cloneNode(true);
  const styleMap = /* @__PURE__ */ new Map();
  collectStyles(element, clone, styleMap);
  cleanElement(clone);
  resolveUrls(clone);
  let classCounter = 1;
  const cssRules = [];
  const colorsUsed = /* @__PURE__ */ new Set();
  const fontsUsed = /* @__PURE__ */ new Set();
  const rootRect = element.getBoundingClientRect();
  const rootWidth = rootRect.width;
  function processElement(el, originalEl) {
    const styles = styleMap.get(el);
    if (!styles || Object.keys(styles).length === 0) {
      for (let i = 0; i < el.children.length && i < (originalEl?.children.length || 0); i++) {
        processElement(el.children[i], originalEl?.children[i]);
      }
      return;
    }
    const className = `dg-${el.tagName.toLowerCase()}-${classCounter++}`;
    el.classList.add(className);
    const responsive = {};
    for (const [prop, value] of Object.entries(styles)) {
      if (prop.includes("color") || prop === "background-color") {
        colorsUsed.add(value);
      }
      if (prop === "font-family") {
        fontsUsed.add(value.split(",")[0].trim().replace(/['"]/g, ""));
      }
      if (prop === "width") {
        const px = parseFloat(value);
        if (px > 0 && rootWidth > 0 && px < rootWidth) {
          const pct = Math.round(px / rootWidth * 100);
          if (pct >= 10 && pct <= 100) {
            responsive["width"] = `${pct}%`;
            responsive["max-width"] = value;
            continue;
          }
        }
      }
      responsive[prop] = value;
    }
    const declarations = Object.entries(responsive).map(([prop, value]) => `  ${prop}: ${value};`).join("\n");
    cssRules.push(`.${className} {
${declarations}
}`);
    for (let i = 0; i < el.children.length && i < (originalEl?.children.length || 0); i++) {
      processElement(el.children[i], originalEl?.children[i]);
    }
  }
  processElement(clone, element);
  const mediaRules = collectMediaQueries(element);
  let mediaCss = "";
  if (mediaRules.length > 0) {
    mediaCss = "\n\n/* Responsive Breakpoints */\n" + mediaRules.join("\n\n");
  }
  const tokenHeader = [
    "/* === Design Tokens ===",
    ` * Colors: ${[...colorsUsed].slice(0, 10).join(", ")}`,
    ` * Fonts: ${[...fontsUsed].join(", ")}`,
    " * =========================== */"
  ].join("\n");
  const css = tokenHeader + "\n\n" + cssRules.join("\n\n") + mediaCss;
  const html = formatHTML(clone.outerHTML);
  return {
    html,
    css,
    mode: "responsive-html",
    tokensUsed: { colors: [...colorsUsed], fonts: [...fontsUsed] }
  };
}
function collectMediaQueries(element) {
  const results = [];
  const seen = /* @__PURE__ */ new Set();
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules || sheet.rules;
    } catch (e) {
      continue;
    }
    if (!rules) continue;
    for (const rule of rules) {
      if (!(rule instanceof CSSMediaRule)) continue;
      const media = rule.conditionText || rule.media?.mediaText || "";
      if (!media) continue;
      for (const innerRule of rule.cssRules) {
        if (!innerRule.selectorText || !innerRule.style) continue;
        const sel = innerRule.selectorText;
        try {
          if (element.matches(sel) || element.querySelector(sel)) {
            const key = `${media}|${innerRule.cssText}`;
            if (!seen.has(key)) {
              seen.add(key);
              if (!results.some((r) => r.media === media)) {
                results.push({ media, rules: [] });
              }
              results.find((r) => r.media === media).rules.push(innerRule.cssText);
            }
          }
        } catch (e) {
        }
      }
    }
  }
  return results.map((r) => `@media ${r.media} {
${r.rules.map((rule) => "  " + rule).join("\n")}
}`);
}
function getDirectText(el) {
  let text = "";
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    }
  }
  return text.trim();
}
function rgbaToSvg(cssColor) {
  if (!cssColor) return { color: "#000000", opacity: 1 };
  const rgbaMatch = cssColor.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    const r = Math.round(parseFloat(rgbaMatch[1]));
    const g = Math.round(parseFloat(rgbaMatch[2]));
    const b = Math.round(parseFloat(rgbaMatch[3]));
    const a = rgbaMatch[4] !== void 0 ? parseFloat(rgbaMatch[4]) : 1;
    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    return { color: hex, opacity: a };
  }
  return { color: cssColor, opacity: 1 };
}
function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function formatHTML(html) {
  let formatted = "";
  let indent = 0;
  const tokens = html.replace(/>\s*</g, ">\n<").split("\n");
  tokens.forEach((token) => {
    const isClosing = token.match(/^<\//);
    const isSelfClosing = token.match(/\/\s*>$/) || token.match(/^<(img|br|hr|input|meta|link)/i);
    if (isClosing) indent--;
    formatted += "  ".repeat(Math.max(0, indent)) + token.trim() + "\n";
    if (!isClosing && !isSelfClosing && token.match(/^</)) indent++;
  });
  return formatted.trim();
}
function generateTailwindConfig(colorData, fontData) {
  const config = {
    theme: {
      extend: {
        colors: buildColorTokens(colorData),
        fontFamily: buildFontFamilies(fontData),
        fontSize: buildFontSizes(fontData),
        borderRadius: buildBorderRadius(),
        boxShadow: buildBoxShadows(),
        spacing: buildSpacing()
      }
    }
  };
  return formatConfig(config);
}
function buildColorTokens(colorData) {
  if (!colorData) return {};
  const colors = {};
  const accent = colorData.accentColors?.[0];
  if (accent) {
    colors.primary = generateColorScale(accent);
  }
  if (colorData.accentColors?.[1]) {
    colors.secondary = generateColorScale(colorData.accentColors[1]);
  }
  if (colorData.accentColors?.[2]) {
    colors.accent = colorData.accentColors[2];
  }
  if (colorData.backgrounds?.length > 0) {
    colors.background = colorData.backgrounds[0];
    if (colorData.backgrounds[1]) {
      colors["background-alt"] = colorData.backgrounds[1];
    }
  }
  if (colorData.textColors?.length > 0) {
    colors.text = {
      primary: colorData.textColors[0],
      ...colorData.textColors[1] ? { secondary: colorData.textColors[1] } : {},
      ...colorData.textColors[2] ? { muted: colorData.textColors[2] } : {}
    };
  }
  return colors;
}
function generateColorScale(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    50: hslToHex(hsl.h, Math.max(hsl.s - 20, 10), 97),
    100: hslToHex(hsl.h, Math.max(hsl.s - 15, 15), 93),
    200: hslToHex(hsl.h, Math.max(hsl.s - 10, 20), 85),
    300: hslToHex(hsl.h, Math.max(hsl.s - 5, 25), 73),
    400: hslToHex(hsl.h, hsl.s, 60),
    500: hex,
    600: hslToHex(hsl.h, Math.min(hsl.s + 5, 100), Math.max(hsl.l - 10, 15)),
    700: hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 20, 10)),
    800: hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 30, 8)),
    900: hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 38, 5)),
    950: hslToHex(hsl.h, Math.min(hsl.s + 15, 100), Math.max(hsl.l - 45, 3))
  };
}
function hslToHex(h, s, l) {
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p2, q2, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2) return q2;
      if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHexVal = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHexVal(r)}${toHexVal(g)}${toHexVal(b)}`;
}
function buildFontFamilies(fontData) {
  if (!fontData?.fonts) return {};
  const families = {};
  fontData.fonts.forEach((font) => {
    if (font.usage.headings) {
      families.heading = [font.family, "sans-serif"];
    }
    if (font.usage.body) {
      families.body = [font.family, "sans-serif"];
    }
    if (font.usage.code) {
      families.code = [font.family, "monospace"];
    }
  });
  return families;
}
function buildFontSizes(fontData) {
  if (!fontData?.fontScale) return {};
  const sizes = {};
  Object.entries(fontData.fontScale).forEach(([key, value]) => {
    const [size, weight] = value.split(" / ");
    sizes[key] = [size, { lineHeight: "1.5", fontWeight: weight }];
  });
  return sizes;
}
function buildBorderRadius() {
  const radii = /* @__PURE__ */ new Map();
  document.querySelectorAll("*").forEach((el) => {
    const r = window.getComputedStyle(el).borderRadius;
    if (r && r !== "0px") {
      radii.set(r, (radii.get(r) || 0) + 1);
    }
  });
  const sorted = Array.from(radii.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const result = {};
  const names = ["card", "button", "input", "badge"];
  sorted.forEach(([value], i) => {
    result[names[i] || `r${i}`] = value;
  });
  return result;
}
function buildBoxShadows() {
  const shadows = /* @__PURE__ */ new Map();
  document.querySelectorAll("*").forEach((el) => {
    const s = window.getComputedStyle(el).boxShadow;
    if (s && s !== "none") {
      shadows.set(s, (shadows.get(s) || 0) + 1);
    }
  });
  const sorted = Array.from(shadows.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const result = {};
  const names = ["card", "elevated", "overlay"];
  sorted.forEach(([value], i) => {
    result[names[i] || `s${i}`] = value;
  });
  return result;
}
function buildSpacing() {
  const spacings = /* @__PURE__ */ new Map();
  document.querySelectorAll('section, [class*="container"], main, article, .wrapper').forEach((el) => {
    const computed = window.getComputedStyle(el);
    ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "gap"].forEach((prop) => {
      const val = computed[prop];
      if (val && val !== "0px" && val !== "normal") {
        const px = parseFloat(val);
        if (px >= 16) {
          spacings.set(val, (spacings.get(val) || 0) + 1);
        }
      }
    });
  });
  const sorted = Array.from(spacings.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const result = {};
  const names = ["section", "card-padding", "element-gap"];
  sorted.forEach(([value], i) => {
    result[names[i] || `sp${i}`] = value;
  });
  return result;
}
function formatConfig(config) {
  return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2).replace(/"([^"]+)":/g, "$1:").replace(/"/g, "'")}`;
}
const OVERLAY_STYLES = "/* DesignGrab — Overlay & Tooltip Styles (injected into Shadow DOM) */\n\n/* Box model overlays */\n.dg-margin-box {\n  background-color: rgba(255, 165, 0, 0.15);\n  border: 1px dashed rgba(255, 165, 0, 0.6);\n  display: none;\n}\n\n.dg-border-box {\n  background-color: rgba(255, 215, 0, 0.15);\n  border: 1px solid rgba(255, 215, 0, 0.7);\n  display: none;\n}\n\n.dg-padding-box {\n  background-color: rgba(76, 175, 80, 0.15);\n  border: 1px dashed rgba(76, 175, 80, 0.5);\n  display: none;\n}\n\n.dg-content-box {\n  background-color: rgba(59, 130, 246, 0.12);\n  border: 1px solid rgba(59, 130, 246, 0.6);\n  display: none;\n}\n\n/* Alignment guides */\n.dg-guide-h,\n.dg-guide-v {\n  display: none;\n}\n\n/* Tooltip */\n.dg-tooltip {\n  display: none;\n  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;\n  font-size: 11px;\n  line-height: 1.5;\n  background: rgba(15, 15, 25, 0.94);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  color: #e4e4e7;\n  padding: 8px 12px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),\n              0 0 0 1px rgba(255, 255, 255, 0.05);\n  max-width: 280px;\n  white-space: nowrap;\n  overflow: hidden;\n}\n\n.dg-tooltip-tag {\n  color: #a78bfa;\n  font-weight: 600;\n  margin-bottom: 2px;\n  font-size: 12px;\n}\n\n.dg-tooltip-dims {\n  color: #60a5fa;\n  font-weight: 500;\n  margin-bottom: 4px;\n  padding-bottom: 4px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n\n.dg-tooltip-props {\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.dg-tooltip-props span {\n  color: #a1a1aa;\n  font-size: 10px;\n}\n\n/* Pinned element indicator */\n.dg-pinned-indicator {\n  position: fixed;\n  bottom: 20px;\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 2147483647;\n  background: rgba(15, 15, 25, 0.94);\n  backdrop-filter: blur(12px);\n  color: #a78bfa;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n  font-size: 12px;\n  font-weight: 500;\n  padding: 8px 20px;\n  border-radius: 100px;\n  border: 1px solid rgba(167, 139, 250, 0.2);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n  display: none;\n  pointer-events: none;\n}\n\n/* Inspect mode cursor style (applied to body) */\n.dg-inspecting * {\n  cursor: crosshair !important;\n}\n";
let shadowRoot = null;
let isInitialized = false;
let lastPinnedElement = null;
function initDesignGrab() {
  if (isInitialized) return;
  isInitialized = true;
  const host = document.createElement("designgrab-root");
  host.style.cssText = "all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;";
  shadowRoot = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = OVERLAY_STYLES;
  shadowRoot.appendChild(style);
  const overlay = document.createElement("div");
  overlay.id = "dg-overlay";
  shadowRoot.appendChild(overlay);
  document.documentElement.appendChild(host);
  initOverlay(shadowRoot);
  console.log("[DesignGrab] Initialized");
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;
  switch (type) {
    case "TOGGLE_INSPECT":
      initDesignGrab();
      const isActive = toggleInspecting();
      sendResponse({ active: isActive });
      break;
    case "START_INSPECT":
      initDesignGrab();
      startInspecting();
      sendResponse({ active: true });
      break;
    case "STOP_INSPECT":
      stopInspecting();
      sendResponse({ active: false });
      break;
    case "EXTRACT_ASSETS":
      initDesignGrab();
      try {
        const assets = extractAssets();
        const cleaned = {
          images: assets.images.map(({ element, ...rest }) => rest),
          svgs: assets.svgs.map(({ element, ...rest }) => rest),
          videos: assets.videos.map(({ element, ...rest }) => rest),
          lotties: assets.lotties || [],
          animations: assets.animations || []
        };
        sendResponse({ success: true, assets: cleaned });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "ANALYZE_COLORS":
      initDesignGrab();
      try {
        const colorData = analyzeColors();
        sendResponse({ success: true, data: colorData });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "ANALYZE_FONTS":
      initDesignGrab();
      try {
        const fontData = analyzeFonts();
        sendResponse({ success: true, data: fontData });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "ANALYZE_LAYOUT":
      initDesignGrab();
      try {
        const target = getPinnedElement() || lastPinnedElement || document.querySelector("main") || document.body;
        const layoutData = analyzeLayout(target);
        sendResponse({ success: true, data: layoutData });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "EXPORT_CODE":
      initDesignGrab();
      try {
        const el = getPinnedElement() || lastPinnedElement || document.querySelector("main") || document.body.children[0];
        const mode = payload?.mode || "html-css";
        const codeData = exportCode(el, { mode });
        sendResponse({ success: true, data: codeData });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "EXPORT_FULL_CONTEXT":
      initDesignGrab();
      try {
        const ctxEl = getPinnedElement() || lastPinnedElement || document.querySelector("main") || document.body.children[0];
        const htmlCssData = exportCode(ctxEl, { mode: "html-css" });
        const layoutData = analyzeLayout(ctxEl);
        const colorData = analyzeColors();
        const fontData = analyzeFonts();
        const twConfig = generateTailwindConfig(colorData, fontData);
        const animations = [];
        const animEls = [ctxEl, ...ctxEl.querySelectorAll("*")];
        for (const el of animEls) {
          const cs = getComputedStyle(el);
          if (cs.animationName && cs.animationName !== "none") {
            animations.push({
              type: "keyframe",
              name: cs.animationName,
              duration: cs.animationDuration,
              timingFunction: cs.animationTimingFunction,
              iterationCount: cs.animationIterationCount,
              element: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "")
            });
          }
          if (cs.transition && cs.transition !== "all 0s ease 0s" && cs.transition !== "none") {
            animations.push({
              type: "transition",
              transition: cs.transition,
              element: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "")
            });
          }
        }
        const keyframeNames = new Set(animations.filter((a) => a.type === "keyframe").map((a) => a.name));
        let keyframesCSS = "";
        if (keyframeNames.size > 0) {
          try {
            for (const sheet of document.styleSheets) {
              try {
                for (const rule of sheet.cssRules) {
                  if (rule instanceof CSSKeyframesRule && keyframeNames.has(rule.name)) {
                    keyframesCSS += rule.cssText + "\n\n";
                  }
                }
              } catch (_e) {
              }
            }
          } catch (_e) {
          }
        }
        sendResponse({
          success: true,
          context: {
            html: htmlCssData.html,
            css: htmlCssData.css,
            layout: {
              structuralHTML: layoutData.structuralHTML,
              tailwindStructure: layoutData.tailwindStructure,
              ascii: layoutData.ascii
            },
            colors: {
              palette: colorData.palette.slice(0, 20),
              backgrounds: colorData.backgrounds,
              textColors: colorData.textColors,
              accentColors: colorData.accentColors
            },
            fonts: {
              fonts: fontData.fonts,
              fontScale: fontData.fontScale
            },
            tailwindConfig: twConfig,
            animations: animations.length > 0 ? { items: animations.slice(0, 10), keyframesCSS } : null
          }
        });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "EXPORT_FIGMA_SVG":
      initDesignGrab();
      (async () => {
        try {
          let figmaEl = getPinnedElement() || lastPinnedElement || document.querySelector("main") || document.body.children[0];
          if (payload?.childIndex != null && figmaEl.children[payload.childIndex]) {
            figmaEl = figmaEl.children[payload.childIndex];
          }
          const figmaData = await exportForFigma(figmaEl);
          sendResponse({ success: true, data: figmaData });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true;
    case "EXPORT_RESPONSIVE_HTML":
      initDesignGrab();
      try {
        let responsiveEl = getPinnedElement() || lastPinnedElement || document.querySelector("main") || document.body.children[0];
        if (payload?.childIndex != null && responsiveEl.children[payload.childIndex]) {
          responsiveEl = responsiveEl.children[payload.childIndex];
        }
        const responsiveData = exportResponsiveHTML(responsiveEl);
        sendResponse({ success: true, data: responsiveData });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "GET_CHILD_ELEMENTS":
      initDesignGrab();
      try {
        const parentEl = getPinnedElement() || lastPinnedElement || document.querySelector("main") || document.body.children[0];
        const children = [];
        if (parentEl) {
          for (let i = 0; i < parentEl.children.length && i < 30; i++) {
            const child = parentEl.children[i];
            const tag = child.tagName.toLowerCase();
            const id = child.id || "";
            const classes = Array.from(child.classList).slice(0, 2).join(".");
            const textContent = child.textContent?.trim().slice(0, 40) || "";
            const childCount = child.children.length;
            children.push({ tag, id, classes, text: textContent, childCount });
          }
        }
        sendResponse({ success: true, children });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "GENERATE_TAILWIND":
      initDesignGrab();
      try {
        const colors = analyzeColors();
        const fonts = analyzeFonts();
        const config = generateTailwindConfig(colors, fonts);
        sendResponse({ success: true, data: config });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      break;
    case "ELEMENT_PINNED_INTERNAL":
      lastPinnedElement = payload?.element || null;
      break;
    case "PING":
      sendResponse({ status: "alive", initialized: isInitialized });
      break;
  }
  return true;
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyE") {
    e.preventDefault();
    e.stopPropagation();
    initDesignGrab();
    const isActive = toggleInspecting();
    chrome.runtime.sendMessage({ type: "INSPECT_MODE_CHANGED", payload: { active: isActive } }).catch(() => {
    });
  }
  if (e.key === "Escape" && isInitialized) {
    stopInspecting();
    hideOverlay();
    chrome.runtime.sendMessage({ type: "INSPECT_MODE_CHANGED", payload: { active: false } }).catch(() => {
    });
  }
});
if (document.readyState === "complete" || document.readyState === "interactive") ;
else {
  document.addEventListener("DOMContentLoaded", () => {
  });
}
