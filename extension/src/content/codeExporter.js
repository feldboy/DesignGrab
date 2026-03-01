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
 */
export function exportForFigma(element) {
    const rootRect = element.getBoundingClientRect();
    const W = Math.round(rootRect.width);
    const H = Math.round(rootRect.height);

    const defs = [];
    const body = [];
    let clipId = 0;
    let filterId = 0;

    function walkElement(el, depth) {
        const rect = el.getBoundingClientRect();
        // Skip elements outside the root or invisible
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

        // Determine if we need clipping (overflow hidden)
        const overflow = cs.overflow || cs.overflowX || cs.overflowY;
        const needsClip = overflow === 'hidden' || overflow === 'clip';
        let clipRef = '';
        if (needsClip) {
            const cid = `clip-${clipId++}`;
            const r = parseFloat(cs.borderTopLeftRadius) || 0;
            defs.push(`<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}"/></clipPath>`);
            clipRef = ` clip-path="url(#${cid})"`;
        }

        body.push(`<g id="${esc(groupId)}"${clipRef}>`);

        // --- Background rect ---
        const bgColor = cs.backgroundColor;
        const hasBg = bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
        const borderRadius = parseFloat(cs.borderTopLeftRadius) || 0;

        if (hasBg) {
            const fill = rgbaToSvg(bgColor);
            const opacity = fill.opacity < 1 ? ` opacity="${fill.opacity}"` : '';
            body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${borderRadius}" ry="${borderRadius}" fill="${fill.color}"${opacity}/>`);
        }

        // --- Border ---
        const bw = parseFloat(cs.borderTopWidth) || 0;
        if (bw > 0 && cs.borderTopStyle !== 'none') {
            const bc = rgbaToSvg(cs.borderTopColor || '#000');
            body.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${borderRadius}" ry="${borderRadius}" fill="none" stroke="${bc.color}" stroke-width="${bw}"/>`);
        }

        // --- Box shadow (simple drop shadow) ---
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
                // Re-draw bg rect with shadow filter
                if (hasBg) {
                    const fill = rgbaToSvg(bgColor);
                    body.splice(body.length - (bw > 0 ? 2 : 1), 0,
                        `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${borderRadius}" ry="${borderRadius}" fill="${fill.color}" filter="url(#${fid})"/>`);
                }
            }
        }

        // --- Image ---
        if (tag === 'img') {
            const src = el.currentSrc || el.src;
            if (src) {
                body.push(`  <image href="${esc(src)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
            }
        }

        // --- SVG (inline) ---
        if (tag === 'svg') {
            // Embed the SVG as a nested <svg> at the right position
            const svgClone = el.cloneNode(true);
            svgClone.setAttribute('x', x);
            svgClone.setAttribute('y', y);
            svgClone.setAttribute('width', w);
            svgClone.setAttribute('height', h);
            body.push(`  ${svgClone.outerHTML}`);
            body.push('</g>');
            return; // Don't recurse into SVG children
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

            // Apply text-transform
            let displayText = directText;
            if (textTransform === 'uppercase') displayText = displayText.toUpperCase();
            else if (textTransform === 'lowercase') displayText = displayText.toLowerCase();
            else if (textTransform === 'capitalize') displayText = displayText.replace(/\b\w/g, c => c.toUpperCase());

            // Calculate text anchor based on text-align
            let anchor = 'start';
            let textX = x + (parseFloat(cs.paddingLeft) || 0);
            if (textAlign === 'center') {
                anchor = 'middle';
                textX = x + w / 2;
            } else if (textAlign === 'right' || textAlign === 'end') {
                anchor = 'end';
                textX = x + w - (parseFloat(cs.paddingRight) || 0);
            }

            const textY = y + (parseFloat(cs.paddingTop) || 0) + fontSize * 0.85;

            // Split into lines for multiline text
            const words = displayText.split(/\s+/);
            if (words.length > 0 && w > 0) {
                // Simple word-wrap: estimate chars per line
                const avgCharWidth = fontSize * 0.55;
                const maxChars = Math.floor((w - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)) / avgCharWidth);
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
                    if (i === 0) {
                        body.push(`    <tspan x="${textX}" dy="0">${esc(line)}</tspan>`);
                    } else {
                        body.push(`    <tspan x="${textX}" dy="${lineHeight}">${esc(line)}</tspan>`);
                    }
                });
                body.push('  </text>');
            }
        }

        // --- Background image (CSS) ---
        const bgImage = cs.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
            if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:image/svg')) {
                body.push(`  <image href="${esc(urlMatch[1])}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
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

    const defsBlock = defs.length > 0 ? `<defs>\n${defs.join('\n')}\n</defs>\n` : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n${defsBlock}${body.join('\n')}\n</svg>`;

    return { svg, width: W, height: H, mode: 'figma-svg' };
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
