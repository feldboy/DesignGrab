/**
 * Code Exporter — extracts a section as clean HTML+CSS
 * Cleans up framework artifacts, resolves URLs, formats output.
 */

/**
 * Export a selected element as clean HTML + CSS
 */
export function exportCode(element, options = {}) {
    const { mode = 'html-css' } = options; // 'html-css' | 'html-tailwind'

    // Deep clone the element
    const clone = element.cloneNode(true);

    // Collect computed styles for the element and all descendants
    const styleMap = new Map();
    collectStyles(element, clone, styleMap);

    // Clean the HTML
    cleanElement(clone);

    // Resolve relative URLs
    resolveUrls(clone);

    if (mode === 'html-tailwind') {
        // Convert to inline Tailwind classes
        applyTailwindClasses(clone, styleMap);
        const html = formatHTML(clone.outerHTML);
        return { html, css: null, mode: 'html-tailwind' };
    }

    // Default: HTML + CSS
    const { html, css } = generateHTMLCSS(clone, styleMap);
    return { html, css, mode: 'html-css' };
}

/**
 * Collect computed styles for an element tree
 */
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

/**
 * Extract only the important/non-default CSS properties
 * Comprehensive list to ensure Figma and other tools get pixel-perfect output
 */
function extractImportantStyles(computed, element) {
    const props = {};
    const important = [
        // Display & position
        'display', 'position', 'top', 'right', 'bottom', 'left',
        'z-index', 'float', 'clear',
        // Box model
        'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
        'box-sizing', 'aspect-ratio',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        // Border
        'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
        'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-left-radius', 'border-bottom-right-radius',
        // Background
        'background-color', 'background-image', 'background-size',
        'background-position', 'background-repeat', 'background-clip',
        // Typography
        'color', 'font-family', 'font-size', 'font-weight', 'font-style',
        'line-height', 'letter-spacing', 'word-spacing',
        'text-align', 'text-transform', 'text-decoration',
        'text-indent', 'text-overflow', 'vertical-align',
        // Flexbox
        'flex-direction', 'flex-wrap', 'align-items', 'align-content',
        'justify-content', 'gap', 'row-gap', 'column-gap',
        'flex-grow', 'flex-shrink', 'flex-basis', 'align-self', 'order',
        // Grid
        'grid-template-columns', 'grid-template-rows',
        'grid-column', 'grid-row', 'grid-auto-flow',
        // Visual
        'box-shadow', 'opacity', 'overflow', 'overflow-x', 'overflow-y',
        'transform', 'transition', 'cursor',
        'list-style-type', 'white-space', 'word-break', 'overflow-wrap',
        'object-fit', 'object-position',
        // Clip & mask
        'clip-path', 'mask-image',
        // Mix
        'mix-blend-mode', 'filter', 'backdrop-filter',
    ];

    // Very conservative defaults — only skip truly default/unset values
    const skipValues = new Set([
        '', 'none', 'normal', 'auto', 'static', 'visible',
        '0px', '0%', '0', '0px 0px', '0px 0px 0px 0px',
        'rgba(0, 0, 0, 0)', 'transparent',
        'start', 'baseline',
        'medium none', 'currentcolor',
        'stretch', 'content-box',
        'scroll', 'border-box',
    ]);

    // Properties where some "skip" values are actually meaningful
    const keepAlways = new Set([
        'display', 'position', 'flex-direction', 'flex-wrap',
        'align-items', 'justify-content', 'text-align',
        'overflow', 'overflow-x', 'overflow-y',
        'white-space', 'font-weight', 'font-family', 'font-size',
        'line-height', 'color', 'background-color',
    ]);

    for (const prop of important) {
        const value = computed.getPropertyValue(prop);
        if (!value) continue;

        // For key layout/typography properties, keep them more aggressively
        if (keepAlways.has(prop)) {
            // Only skip truly empty or irrelevant
            if (value === '' || value === 'rgba(0, 0, 0, 0)' || value === 'transparent') {
                // For background-color, transparent is meaningful — skip only for color
                if (prop === 'background-color') continue;
                if (prop === 'color' && value === 'rgba(0, 0, 0, 0)') continue;
            }
            // Skip default display:block for divs, display:inline for spans
            if (prop === 'display') {
                const tag = element?.tagName?.toLowerCase();
                if (value === 'block' && (!tag || ['div', 'p', 'section', 'header', 'footer', 'main', 'article', 'nav', 'aside', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'form', 'fieldset', 'figure'].includes(tag))) continue;
                if (value === 'inline' && tag === 'span') continue;
            }
            if (prop === 'position' && value === 'static') continue;
            props[prop] = value;
            continue;
        }

        if (skipValues.has(value)) continue;

        // Skip default border styles
        if (prop.includes('border') && prop.includes('style') && value === 'none') continue;
        if (prop.includes('border') && prop.includes('width') && value === '0px') continue;

        props[prop] = value;
    }

    // Also capture bounding rect dimensions for accurate sizing
    if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && !props['width']) {
            props['width'] = Math.round(rect.width) + 'px';
        }
        if (rect.height > 0 && !props['height']) {
            props['height'] = Math.round(rect.height) + 'px';
        }
    }

    return props;
}

/**
 * Clean an element: remove data-*, event handlers, tracking attributes
 */
function cleanElement(el) {
    // Remove data-* attributes
    Array.from(el.attributes || []).forEach(attr => {
        if (attr.name.startsWith('data-') ||
            attr.name.startsWith('aria-') ||
            attr.name.startsWith('on') ||
            ['jsaction', 'jsname', 'jscontroller', 'jsmodel', 'role'].includes(attr.name)) {
            el.removeAttribute(attr.name);
        }
    });

    // Clean class names (remove framework hashes)
    if (el.classList) {
        const cleaned = Array.from(el.classList)
            .filter(c => !c.match(/^(css-|sc-|_|__|jsx-|svelte-|ng-|v-|chakra-|MuiBox|MuiTypography)/))
            .filter(c => !c.match(/^[a-z]{1,2}[A-Z]/)) // Remove minified classes like aB, cDe
            .filter(c => c.length > 2); // Remove very short generated classes

        el.className = cleaned.join(' ');
        if (el.className === '') el.removeAttribute('class');
    }

    // Remove script elements
    el.querySelectorAll('script, noscript, style').forEach(s => s.remove());

    // Recurse
    for (const child of el.children) {
        cleanElement(child);
    }
}

/**
 * Resolve relative URLs to absolute
 */
function resolveUrls(el) {
    el.querySelectorAll('[src], [href], [poster]').forEach(node => {
        ['src', 'href', 'poster'].forEach(attr => {
            const val = node.getAttribute(attr);
            if (val && !val.startsWith('http') && !val.startsWith('data:') && !val.startsWith('#')) {
                try {
                    node.setAttribute(attr, new URL(val, window.location.href).href);
                } catch (e) { }
            }
        });
    });
}

/**
 * Generate clean HTML + CSS from element and style map
 */
function generateHTMLCSS(clone, styleMap) {
    let classCounter = 1;
    const cssRules = [];

    // Assign clean class names and generate CSS
    function processElement(el) {
        const styles = styleMap.get(el);
        if (styles && Object.keys(styles).length > 0) {
            const className = `dg-${el.tagName.toLowerCase()}-${classCounter++}`;
            el.classList.add(className);

            const declarations = Object.entries(styles)
                .map(([prop, value]) => `  ${prop}: ${value};`)
                .join('\n');
            cssRules.push(`.${className} {\n${declarations}\n}`);
        }

        for (const child of el.children) {
            processElement(child);
        }
    }

    processElement(clone);

    const html = formatHTML(clone.outerHTML);
    const css = cssRules.join('\n\n');

    return { html, css };
}

/**
 * Apply Tailwind-like classes to elements
 */
function applyTailwindClasses(el, styleMap) {
    const styles = styleMap.get(el);
    if (styles) {
        const twClasses = cssToTailwind(styles);
        if (twClasses.length > 0) {
            el.className = (el.className ? el.className + ' ' : '') + twClasses.join(' ');
        }
    }

    for (const child of el.children) {
        applyTailwindClasses(child, styleMap);
    }
}

/**
 * Convert CSS properties to approximate Tailwind classes
 */
function cssToTailwind(styles) {
    const classes = [];

    // Display
    if (styles['display'] === 'flex') classes.push('flex');
    if (styles['display'] === 'grid') classes.push('grid');
    if (styles['display'] === 'inline-flex') classes.push('inline-flex');
    if (styles['display'] === 'inline-block') classes.push('inline-block');
    if (styles['display'] === 'inline') classes.push('inline');

    // Flex
    if (styles['flex-direction'] === 'column') classes.push('flex-col');
    if (styles['flex-wrap'] === 'wrap') classes.push('flex-wrap');
    if (styles['align-items'] === 'center') classes.push('items-center');
    if (styles['justify-content'] === 'center') classes.push('justify-center');
    if (styles['justify-content'] === 'space-between') classes.push('justify-between');

    // Spacing
    const pxToClass = (px, prefix) => {
        const val = parseFloat(px);
        if (!val) return null;
        const map = { 4: '1', 8: '2', 12: '3', 16: '4', 20: '5', 24: '6', 32: '8', 40: '10', 48: '12', 64: '16' };
        const sorted = Object.keys(map).map(Number);
        let closest = sorted.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a);
        return `${prefix}-${map[closest] || Math.round(val / 4)}`;
    };

    if (styles['gap']) { const c = pxToClass(styles['gap'], 'gap'); if (c) classes.push(c); }
    if (styles['padding-top']) { const c = pxToClass(styles['padding-top'], 'pt'); if (c) classes.push(c); }
    if (styles['padding-bottom']) { const c = pxToClass(styles['padding-bottom'], 'pb'); if (c) classes.push(c); }
    if (styles['padding-left']) { const c = pxToClass(styles['padding-left'], 'pl'); if (c) classes.push(c); }
    if (styles['padding-right']) { const c = pxToClass(styles['padding-right'], 'pr'); if (c) classes.push(c); }

    // Typography
    if (styles['text-align'] === 'center') classes.push('text-center');
    if (styles['font-weight'] === '700' || styles['font-weight'] === 'bold') classes.push('font-bold');
    if (styles['font-weight'] === '600') classes.push('font-semibold');
    if (styles['font-weight'] === '500') classes.push('font-medium');

    // Border radius
    if (styles['border-radius']) {
        const r = parseFloat(styles['border-radius']);
        if (r >= 9999) classes.push('rounded-full');
        else if (r >= 12) classes.push('rounded-xl');
        else if (r >= 8) classes.push('rounded-lg');
        else if (r >= 6) classes.push('rounded-md');
        else if (r >= 4) classes.push('rounded');
        else if (r >= 2) classes.push('rounded-sm');
    }

    // Overflow
    if (styles['overflow'] === 'hidden') classes.push('overflow-hidden');

    // Position
    if (styles['position'] === 'relative') classes.push('relative');
    if (styles['position'] === 'absolute') classes.push('absolute');
    if (styles['position'] === 'fixed') classes.push('fixed');

    return classes;
}

/**
 * Export element as SVG for direct Figma paste (Cmd+V).
 * Walks the live DOM, reads bounding rects + computed styles,
 * and builds an SVG with <rect>, <text>, <image> elements
 * that Figma converts to native layers.
 * Images are embedded as base64 data URIs so Figma renders them correctly.
 */
export async function exportForFigma(element) {
    // Pre-resolve all images to base64 data URIs before building SVG
    const imageCache = new Map();
    await collectImages(element, imageCache);

    const rootRect = element.getBoundingClientRect();
    const W = Math.round(rootRect.width);
    const H = Math.round(rootRect.height);

    const defs = [];
    const body = [];
    let clipId = 0;
    let filterId = 0;
    let gradientId = 0;
    const groupIdMap = new Map(); // element → groupId (for interaction CSS)

    function walkElement(el, depth) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const x = Math.round(rect.left - rootRect.left);
        const y = Math.round(rect.top - rootRect.top);
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);

        const cs = window.getComputedStyle(el);
        const tag = el.tagName.toLowerCase();

        // Build a group id from tag + class/id
        const elId = el.id ? el.id : (el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : '');
        const groupId = elId ? `${tag}-${elId}`.replace(/[^a-zA-Z0-9_-]/g, '') : `${tag}-d${depth}`;
        groupIdMap.set(el, groupId);

        // Determine if we need clipping (overflow hidden)
        const overflow = cs.overflow || cs.overflowX || cs.overflowY;
        const needsClip = overflow === 'hidden' || overflow === 'clip';
        let clipRef = '';
        if (needsClip) {
            const cid = `clip-${clipId++}`;
            const rtl = parseFloat(cs.borderTopLeftRadius) || 0;
            const rtr = parseFloat(cs.borderTopRightRadius) || 0;
            const rMax = Math.max(rtl, rtr);
            defs.push(`<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rMax}" ry="${rMax}"/></clipPath>`);
            clipRef = ` clip-path="url(#${cid})"`;
        }

        body.push(`<g id="${esc(groupId)}"${clipRef}>`);

        // --- All 4 border-radius corners ---
        const rTL = parseFloat(cs.borderTopLeftRadius) || 0;
        const rTR = parseFloat(cs.borderTopRightRadius) || 0;
        const rBR = parseFloat(cs.borderBottomRightRadius) || 0;
        const rBL = parseFloat(cs.borderBottomLeftRadius) || 0;
        const allSameRadius = rTL === rTR && rTR === rBR && rBR === rBL;
        const hasCustomRadius = !allSameRadius && (rTL > 0 || rTR > 0 || rBR > 0 || rBL > 0);

        // Helper: build rounded rect path with per-corner radii
        function roundedRectPath(rx, ry, rw, rh, tl, tr, br, bl) {
            tl = Math.min(tl, rw / 2, rh / 2);
            tr = Math.min(tr, rw / 2, rh / 2);
            br = Math.min(br, rw / 2, rh / 2);
            bl = Math.min(bl, rw / 2, rh / 2);
            return `M${rx + tl},${ry} L${rx + rw - tr},${ry} Q${rx + rw},${ry} ${rx + rw},${ry + tr} L${rx + rw},${ry + rh - br} Q${rx + rw},${ry + rh} ${rx + rw - br},${ry + rh} L${rx + bl},${ry + rh} Q${rx},${ry + rh} ${rx},${ry + rh - bl} L${rx},${ry + tl} Q${rx},${ry} ${rx + tl},${ry} Z`;
        }

        // --- Background (color or gradient) ---
        const bgColor = cs.backgroundColor;
        const hasBg = bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
        const bgImage = cs.backgroundImage;
        const hasGradient = bgImage && bgImage !== 'none' && (bgImage.includes('linear-gradient') || bgImage.includes('radial-gradient'));

        let bgFillAttr = '';
        if (hasGradient) {
            const gid = `grad-${gradientId++}`;
            const gradDef = parseGradientToDef(bgImage, gid);
            if (gradDef) {
                defs.push(gradDef);
                bgFillAttr = `fill="url(#${gid})"`;
            } else if (hasBg) {
                const fill = rgbaToSvg(bgColor);
                bgFillAttr = `fill="${fill.color}"${fill.opacity < 1 ? ` opacity="${fill.opacity}"` : ''}`;
            }
        } else if (hasBg) {
            const fill = rgbaToSvg(bgColor);
            bgFillAttr = `fill="${fill.color}"${fill.opacity < 1 ? ` opacity="${fill.opacity}"` : ''}`;
        }

        if (bgFillAttr) {
            if (hasCustomRadius) {
                body.push(`  <path d="${roundedRectPath(x, y, w, h, rTL, rTR, rBR, rBL)}" ${bgFillAttr}/>`);
            } else {
                body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rTL}" ry="${rTL}" ${bgFillAttr}/>`);
            }
        }

        // --- Border ---
        const bw = parseFloat(cs.borderTopWidth) || 0;
        if (bw > 0 && cs.borderTopStyle !== 'none') {
            const bc = rgbaToSvg(cs.borderTopColor || '#000');
            if (hasCustomRadius) {
                body.push(`  <path d="${roundedRectPath(x, y, w, h, rTL, rTR, rBR, rBL)}" fill="none" stroke="${bc.color}" stroke-width="${bw}"/>`);
            } else {
                body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rTL}" ry="${rTL}" fill="none" stroke="${bc.color}" stroke-width="${bw}"/>`);
            }
        }

        // --- Box shadow ---
        const shadow = cs.boxShadow;
        if (shadow && shadow !== 'none') {
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
                    body.splice(body.length - (bw > 0 ? 2 : 1), 0,
                        `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rTL}" ry="${rTL}" fill="${fill.color}" filter="url(#${fid})"/>`);
                }
            }
        }

        // --- Image ---
        if (tag === 'img') {
            const src = el.currentSrc || el.src;
            if (src) {
                const resolved = imageCache.get(src) || src;
                body.push(`  <image href="${esc(resolved)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
            }
        }

        // --- SVG (inline) ---
        if (tag === 'svg') {
            const svgClone = el.cloneNode(true);
            svgClone.setAttribute('x', x);
            svgClone.setAttribute('y', y);
            svgClone.setAttribute('width', w);
            svgClone.setAttribute('height', h);
            body.push(`  ${svgClone.outerHTML}`);
            body.push('</g>');
            return;
        }

        // --- Video poster / canvas placeholder ---
        if (tag === 'video') {
            const poster = el.poster;
            if (poster) {
                body.push(`  <image href="${esc(poster)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
            } else {
                body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#333"/>`);
            }
            body.push('</g>');
            return;
        }

        // --- Text ---
        const directText = getDirectText(el);
        if (directText) {
            const fontSize = parseFloat(cs.fontSize) || 16;
            const fontWeight = cs.fontWeight || '400';
            const fontFamily = cs.fontFamily || 'sans-serif';
            const fontStyle = cs.fontStyle === 'italic' ? ' font-style="italic"' : '';
            const color = rgbaToSvg(cs.color || '#000');
            const letterSpacing = parseFloat(cs.letterSpacing) || 0;
            const lsAttr = letterSpacing ? ` letter-spacing="${letterSpacing}"` : '';
            const textTransform = cs.textTransform;
            const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
            const textAlign = cs.textAlign;

            let displayText = directText;
            if (textTransform === 'uppercase') displayText = displayText.toUpperCase();
            else if (textTransform === 'lowercase') displayText = displayText.toLowerCase();
            else if (textTransform === 'capitalize') displayText = displayText.replace(/\b\w/g, c => c.toUpperCase());

            const words = displayText.split(/\s+/);
            const paddingLeft = parseFloat(cs.paddingLeft) || 0;
            const paddingRight = parseFloat(cs.paddingRight) || 0;
            const paddingTop = parseFloat(cs.paddingTop) || 0;
            const innerW = w - paddingLeft - paddingRight;

            // Use foreignObject for complex multi-line text (>20 words)
            if (words.length > 20 && innerW > 0) {
                body.push(`  <foreignObject x="${x}" y="${y}" width="${w}" height="${h}">`);
                body.push(`    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:${esc(fontFamily)};font-size:${fontSize}px;font-weight:${fontWeight};${cs.fontStyle === 'italic' ? 'font-style:italic;' : ''}color:${color.color};line-height:${lineHeight}px;text-align:${textAlign};padding:${paddingTop}px ${paddingRight}px 0 ${paddingLeft}px;${letterSpacing ? `letter-spacing:${letterSpacing}px;` : ''}${textTransform && textTransform !== 'none' ? `text-transform:${textTransform};` : ''}">${esc(displayText)}</div>`);
                body.push(`  </foreignObject>`);
            } else if (words.length > 0 && innerW > 0) {
                let anchor = 'start';
                let textX = x + paddingLeft;
                if (textAlign === 'center') {
                    anchor = 'middle';
                    textX = x + w / 2;
                } else if (textAlign === 'right' || textAlign === 'end') {
                    anchor = 'end';
                    textX = x + w - paddingRight;
                }

                const textY = y + paddingTop + fontSize * 0.85;
                const avgCharWidth = fontSize * 0.55;
                const maxChars = Math.floor(innerW / avgCharWidth);
                const lines = [];
                let currentLine = '';

                for (const word of words) {
                    if (currentLine.length + word.length + 1 > maxChars && currentLine.length > 0) {
                        lines.push(currentLine.trim());
                        currentLine = word;
                    } else {
                        currentLine += (currentLine ? ' ' : '') + word;
                    }
                }
                if (currentLine) lines.push(currentLine.trim());

                body.push(`  <text x="${textX}" y="${textY}" font-family="${esc(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}"${fontStyle}${lsAttr} fill="${color.color}" text-anchor="${anchor}">`);
                lines.forEach((line, i) => {
                    body.push(`    <tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`);
                });
                body.push('  </text>');
            }
        }

        // --- Background image (CSS, non-gradient) ---
        if (bgImage && bgImage !== 'none' && !hasGradient) {
            const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
            if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:image/svg')) {
                const resolved = imageCache.get(urlMatch[1]) || urlMatch[1];
                body.push(`  <image href="${esc(resolved)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
            }
        }

        // Recurse children (skip img/svg/video — already handled)
        if (tag !== 'img' && tag !== 'video') {
            for (let i = 0; i < el.children.length; i++) {
                walkElement(el.children[i], depth + 1);
            }
        }

        body.push('</g>');
    }

    walkElement(element, 0);

    // Build CSS interaction styles embedded in SVG
    const interactions = extractInteractions(element);
    const cssRules = [];

    if (interactions.states.length > 0) {
        for (const item of interactions.states) {
            // Map CSS selectors to SVG group IDs
            const baseSelector = item.selector.replace(/:hover|:focus-visible|:focus|:active/g, '').trim();
            const pseudoClass = item.selector.match(/:hover|:focus-visible|:focus|:active/)?.[0] || '';
            let targetGroupId = null;

            // Find matching element and its SVG group ID
            for (const [el, gid] of groupIdMap) {
                try {
                    if (!baseSelector || el.matches(baseSelector)) {
                        targetGroupId = gid;
                        break;
                    }
                } catch (e) { /* invalid selector */ }
            }

            if (targetGroupId && pseudoClass) {
                const props = Object.entries(item.properties)
                    .map(([prop, val]) => {
                        // Map CSS properties to SVG-compatible properties
                        if (prop === 'background-color') return `fill: ${rgbaToSvg(val).color}`;
                        if (prop === 'color') return `fill: ${rgbaToSvg(val).color}`;
                        if (prop === 'border-color') return `stroke: ${rgbaToSvg(val).color}`;
                        if (prop === 'opacity') return `opacity: ${val}`;
                        if (prop === 'transform') return `transform: ${val}`;
                        return null;
                    })
                    .filter(Boolean);

                if (props.length > 0) {
                    cssRules.push(`#${targetGroupId}${pseudoClass} rect { ${props.join('; ')}; cursor: pointer; }`);
                    cssRules.push(`#${targetGroupId}${pseudoClass} text { ${props.filter(p => p.startsWith('fill') || p.startsWith('opacity')).join('; ')}; }`);
                }
            }
        }

        // Add transition rules for interactive elements
        if (interactions.transitions.length > 0) {
            const transitionGroupIds = new Set();
            for (const item of interactions.states) {
                const baseSelector = item.selector.replace(/:hover|:focus-visible|:focus|:active/g, '').trim();
                for (const [el, gid] of groupIdMap) {
                    try {
                        if (!baseSelector || el.matches(baseSelector)) {
                            transitionGroupIds.add(gid);
                        }
                    } catch (e) { /* invalid selector */ }
                }
            }
            for (const gid of transitionGroupIds) {
                cssRules.push(`#${gid} rect, #${gid} text { transition: fill 0.2s ease, opacity 0.2s ease, transform 0.2s ease; cursor: pointer; }`);
            }
        }
    }

    // Build defs block with optional style
    let defsContent = defs.join('\n');
    if (cssRules.length > 0) {
        defsContent += (defsContent ? '\n' : '') + `<style>\n${cssRules.join('\n')}\n</style>`;
    }
    const defsBlock = defsContent ? `<defs>\n${defsContent}\n</defs>\n` : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n${defsBlock}${body.join('\n')}\n</svg>`;

    return { svg, width: W, height: H, mode: 'figma-svg', interactions };
}

/**
 * Parse CSS gradient to SVG gradient def
 */
function parseGradientToDef(bgImage, id) {
    // Linear gradient
    const linearMatch = bgImage.match(/linear-gradient\(([^)]+(?:\([^)]*\))*[^)]*)\)/);
    if (linearMatch) {
        const content = linearMatch[1];
        // Parse direction
        let x1 = '0%', y1 = '0%', x2 = '0%', y2 = '100%';
        const dirMatch = content.match(/^(to\s+\w+(?:\s+\w+)?|\d+deg)/);
        if (dirMatch) {
            const dir = dirMatch[1];
            if (dir.includes('to right')) { x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '0%'; }
            else if (dir.includes('to left')) { x1 = '100%'; y1 = '0%'; x2 = '0%'; y2 = '0%'; }
            else if (dir.includes('to top')) { x1 = '0%'; y1 = '100%'; x2 = '0%'; y2 = '0%'; }
            else if (dir.includes('to bottom right')) { x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '100%'; }
            else if (dir.includes('to bottom left')) { x1 = '100%'; y1 = '0%'; x2 = '0%'; y2 = '100%'; }
            else if (dir.includes('to top right')) { x1 = '0%'; y1 = '100%'; x2 = '100%'; y2 = '0%'; }
            else if (dir.includes('to top left')) { x1 = '100%'; y1 = '100%'; x2 = '0%'; y2 = '0%'; }
            else if (dir.endsWith('deg')) {
                const angle = parseFloat(dir) * Math.PI / 180;
                x1 = `${Math.round(50 - 50 * Math.sin(angle))}%`;
                y1 = `${Math.round(50 + 50 * Math.cos(angle))}%`;
                x2 = `${Math.round(50 + 50 * Math.sin(angle))}%`;
                y2 = `${Math.round(50 - 50 * Math.cos(angle))}%`;
            }
        }

        // Parse color stops
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
        // Auto-distribute offsets
        colorStops.forEach((stop, i) => {
            if (!stop.offset) stop.offset = `${Math.round(i / (colorStops.length - 1) * 100)}%`;
        });

        const stops = colorStops.map(s =>
            `<stop offset="${s.offset}" stop-color="${s.color}"${s.opacity < 1 ? ` stop-opacity="${s.opacity}"` : ''}/>`
        ).join('');
        return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
    }

    // Radial gradient
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
        const stops = colorStops.map(s =>
            `<stop offset="${s.offset}" stop-color="${s.color}"${s.opacity < 1 ? ` stop-opacity="${s.opacity}"` : ''}/>`
        ).join('');
        return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`;
    }

    return null;
}

/**
 * Recursively collect all image URLs in an element tree and resolve
 * them to base64 data URIs, storing results in imageCache.
 */
async function collectImages(el, imageCache) {
    const tag = el.tagName.toLowerCase();

    if (tag === 'img') {
        const src = el.currentSrc || el.src;
        if (src && !imageCache.has(src)) {
            imageCache.set(src, await imgToDataUrl(el, src));
        }
    }

    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
        if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
            const url = urlMatch[1];
            if (!imageCache.has(url)) {
                imageCache.set(url, await imgToDataUrl(null, url));
            }
        }
    }

    // Recurse (skip leaf tags that have no meaningful children)
    if (tag !== 'img' && tag !== 'video' && tag !== 'svg') {
        for (const child of el.children) {
            await collectImages(child, imageCache);
        }
    }
}

/**
 * Convert an image to a base64 data URI.
 * Tries canvas first (fast for already-loaded <img>), then fetch+FileReader.
 * Falls back to the original src on any error (CORS, network, etc.).
 */
async function imgToDataUrl(imgEl, src) {
    if (!src || src.startsWith('data:')) return src;

    // Fast path: img element already loaded — draw to canvas
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = imgEl.naturalWidth;
            canvas.height = imgEl.naturalHeight;
            canvas.getContext('2d').drawImage(imgEl, 0, 0);
            return canvas.toDataURL('image/png');
        } catch (e) { /* tainted canvas (CORS) — fall through to fetch */ }
    }

    // Fetch path: works for same-origin and CORS-enabled resources
    try {
        const resp = await fetch(src, { mode: 'cors', credentials: 'omit' });
        if (!resp.ok) return src;
        const blob = await resp.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(src);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return src; // network/CORS failure — use original URL as best-effort
    }
}

/**
 * Extract hover/focus/active interaction states and CSS transitions
 * for all elements within the given root element.
 */
function extractInteractions(rootElement) {
    const interactionMap = new Map(); // selector → { state, properties }
    const STATE_PATTERNS = [
        { pattern: ':hover', state: 'Hover' },
        { pattern: ':focus', state: 'Focus' },
        { pattern: ':focus-visible', state: 'Focus visible' },
        { pattern: ':active', state: 'Active' },
    ];

    for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules || sheet.rules; } catch (e) { continue; }
        if (!rules) continue;

        for (const rule of rules) {
            if (!rule.selectorText || !rule.style) continue;
            const sel = rule.selectorText;

            const matchedState = STATE_PATTERNS.find(s => sel.includes(s.pattern));
            if (!matchedState) continue;

            // Derive the base selector by stripping pseudo-class
            const baseSelector = sel
                .replace(/:hover|:focus-visible|:focus|:active/g, '')
                .trim();

            let matches = false;
            try {
                matches = !baseSelector
                    || rootElement.matches(baseSelector)
                    || !!rootElement.querySelector(baseSelector);
            } catch (e) { /* invalid selector */ }

            if (!matches) continue;

            const props = {};
            const INTERESTING = ['color', 'background-color', 'border-color', 'opacity',
                'box-shadow', 'transform', 'text-decoration', 'outline'];
            for (const prop of INTERESTING) {
                const val = rule.style.getPropertyValue(prop);
                if (val) props[prop] = val;
            }
            if (Object.keys(props).length === 0) continue;

            const key = `${matchedState.state}|${sel}`;
            interactionMap.set(key, { state: matchedState.state, selector: sel, properties: props });
        }
    }

    // Collect transition info from computed styles
    const transitions = new Set();
    const allEls = [rootElement, ...rootElement.querySelectorAll('*')];
    for (const el of allEls) {
        const cs = window.getComputedStyle(el);
        const t = cs.transition;
        if (t && t !== 'none' && t !== 'all 0s ease 0s') {
            transitions.add(t);
        }
    }

    return {
        states: [...interactionMap.values()],
        transitions: [...transitions],
    };
}

/**
 * Export element as responsive HTML+CSS with flexbox/grid, relative units, and media queries
 */
export function exportResponsiveHTML(element) {
    const clone = element.cloneNode(true);
    const styleMap = new Map();
    collectStyles(element, clone, styleMap);
    cleanElement(clone);
    resolveUrls(clone);

    let classCounter = 1;
    const cssRules = [];
    const colorsUsed = new Set();
    const fontsUsed = new Set();
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
            // Track design tokens
            if (prop.includes('color') || prop === 'background-color') {
                colorsUsed.add(value);
            }
            if (prop === 'font-family') {
                fontsUsed.add(value.split(',')[0].trim().replace(/['"]/g, ''));
            }

            // Convert absolute widths to responsive
            if (prop === 'width') {
                const px = parseFloat(value);
                if (px > 0 && rootWidth > 0 && px < rootWidth) {
                    const pct = Math.round((px / rootWidth) * 100);
                    if (pct >= 10 && pct <= 100) {
                        responsive['width'] = `${pct}%`;
                        responsive['max-width'] = value;
                        continue;
                    }
                }
            }

            responsive[prop] = value;
        }

        const declarations = Object.entries(responsive)
            .map(([prop, value]) => `  ${prop}: ${value};`)
            .join('\n');
        cssRules.push(`.${className} {\n${declarations}\n}`);

        for (let i = 0; i < el.children.length && i < (originalEl?.children.length || 0); i++) {
            processElement(el.children[i], originalEl?.children[i]);
        }
    }

    processElement(clone, element);

    // Scan stylesheets for media queries matching elements
    const mediaRules = collectMediaQueries(element);
    let mediaCss = '';
    if (mediaRules.length > 0) {
        mediaCss = '\n\n/* Responsive Breakpoints */\n' + mediaRules.join('\n\n');
    }

    // Design tokens comment header
    const tokenHeader = [
        '/* === Design Tokens ===',
        ` * Colors: ${[...colorsUsed].slice(0, 10).join(', ')}`,
        ` * Fonts: ${[...fontsUsed].join(', ')}`,
        ' * =========================== */',
    ].join('\n');

    const css = tokenHeader + '\n\n' + cssRules.join('\n\n') + mediaCss;
    const html = formatHTML(clone.outerHTML);

    return {
        html,
        css,
        mode: 'responsive-html',
        tokensUsed: { colors: [...colorsUsed], fonts: [...fontsUsed] },
    };
}

/**
 * Collect @media rules from stylesheets that apply to the element
 */
function collectMediaQueries(element) {
    const results = [];
    const seen = new Set();

    for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules || sheet.rules; } catch (e) { continue; }
        if (!rules) continue;

        for (const rule of rules) {
            if (!(rule instanceof CSSMediaRule)) continue;
            const media = rule.conditionText || rule.media?.mediaText || '';
            if (!media) continue;

            for (const innerRule of rule.cssRules) {
                if (!innerRule.selectorText || !innerRule.style) continue;
                const sel = innerRule.selectorText;
                try {
                    if (element.matches(sel) || element.querySelector(sel)) {
                        const key = `${media}|${innerRule.cssText}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            if (!results.some(r => r.media === media)) {
                                results.push({ media, rules: [] });
                            }
                            results.find(r => r.media === media).rules.push(innerRule.cssText);
                        }
                    }
                } catch (e) { /* invalid selector */ }
            }
        }
    }

    return results.map(r => `@media ${r.media} {\n${r.rules.map(rule => '  ' + rule).join('\n')}\n}`);
}

/** Get only direct text content of an element (not from children) */
function getDirectText(el) {
    let text = '';
    for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        }
    }
    return text.trim();
}

/** Convert rgba/rgb CSS color to SVG-friendly { color, opacity } */
function rgbaToSvg(cssColor) {
    if (!cssColor) return { color: '#000000', opacity: 1 };
    const rgbaMatch = cssColor.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgbaMatch) {
        const r = Math.round(parseFloat(rgbaMatch[1]));
        const g = Math.round(parseFloat(rgbaMatch[2]));
        const b = Math.round(parseFloat(rgbaMatch[3]));
        const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        return { color: hex, opacity: a };
    }
    // Already hex or named
    return { color: cssColor, opacity: 1 };
}

/** Escape special chars for SVG/XML */
function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Format HTML with proper indentation
 */
function formatHTML(html) {
    let formatted = '';
    let indent = 0;

    // Simple HTML formatter
    const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

    tokens.forEach(token => {
        const isClosing = token.match(/^<\//);
        const isSelfClosing = token.match(/\/\s*>$/) || token.match(/^<(img|br|hr|input|meta|link)/i);

        if (isClosing) indent--;
        formatted += '  '.repeat(Math.max(0, indent)) + token.trim() + '\n';
        if (!isClosing && !isSelfClosing && token.match(/^</)) indent++;
    });

    return formatted.trim();
}
