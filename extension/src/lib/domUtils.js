/**
 * DOM manipulation and traversal utilities
 */

/**
 * Walk all elements in a tree, including shadow roots
 */
export function walkAllElements(root, callback) {
    const elements = root.querySelectorAll('*');
    elements.forEach(el => {
        callback(el);
        if (el.shadowRoot) walkAllElements(el.shadowRoot, callback);
    });
}

/**
 * Convert a URL to an absolute URL based on the current page
 */
export function makeAbsolute(url) {
    if (!url) return url;
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http')) return url;
    try {
        return new URL(url, window.location.href).href;
    } catch {
        return url;
    }
}

/**
 * Resolve relative URLs in an element's attributes (src, href, poster)
 */
export function resolveUrls(el) {
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
 * Clean an element by removing framework-specific attributes and classes
 */
export function cleanElement(el) {
    // Remove data-*, aria-*, and event handler attributes
    Array.from(el.attributes || []).forEach(attr => {
        if (attr.name.startsWith('data-') ||
            attr.name.startsWith('aria-') ||
            attr.name.startsWith('on') ||
            ['jsaction', 'jsname', 'jscontroller', 'jsmodel', 'role'].includes(attr.name)) {
            el.removeAttribute(attr.name);
        }
    });

    // Clean class names (remove framework hashes)
    if (el.classList && el.classList.length > 0) {
        const cleaned = Array.from(el.classList)
            .filter(c => !c.match(/^(css-|sc-|_|__|jsx-|svelte-|ng-|v-|chakra-|MuiBox|MuiTypography)/))
            .filter(c => !c.match(/^[a-z]{1,2}[A-Z]/)) // Remove minified classes like aB, cDe
            .filter(c => c.length > 2); // Remove very short generated classes

        if (cleaned.length > 0) {
            el.className = cleaned.join(' ');
        } else {
            el.removeAttribute('class');
        }
    }

    // Remove script, style, and noscript elements
    el.querySelectorAll('script, noscript, style').forEach(s => s.remove());

    // Recurse
    for (const child of el.children) {
        cleanElement(child);
    }
}

/**
 * Get a simple description of an element (tag#id.class)
 */
export function describeElement(el) {
    const tag = el.tagName?.toLowerCase() || 'unknown';
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList?.length > 0 ? `.${Array.from(el.classList).slice(0, 2).join('.')}` : '';
    return `${tag}${id}${cls}`;
}

/**
 * Get only direct text content of an element (not from children)
 */
export function getDirectText(el) {
    let text = '';
    for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        }
    }
    return text.trim();
}

/**
 * Escape special chars for SVG/XML
 */
export function escapeXml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
