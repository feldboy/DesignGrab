/**
 * Font Analyzer — detects all fonts, weights, styles, sources, and usage
 */

/**
 * Analyze all fonts on the current page
 */
export function analyzeFonts() {
    const fontMap = new Map(); // family → { weights, styles, count, elements, usage }
    const fontScale = {};

    // 1. Scan all elements for computed fontFamily
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        const family = cleanFontFamily(computed.fontFamily);
        if (!family) return;

        const weight = computed.fontWeight;
        const style = computed.fontStyle;
        const fontSize = computed.fontSize;
        const lineHeight = computed.lineHeight;
        const tag = el.tagName.toLowerCase();

        if (!fontMap.has(family)) {
            fontMap.set(family, {
                weights: new Set(),
                styles: new Set(),
                count: 0,
                usage: { headings: false, body: false, code: false },
                sizes: new Map()
            });
        }

        const entry = fontMap.get(family);
        entry.weights.add(weight);
        entry.styles.add(style);
        entry.count++;

        // Track usage type
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
            entry.usage.headings = true;
        }
        if (['p', 'span', 'li', 'td', 'a', 'label', 'div'].includes(tag)) {
            entry.usage.body = true;
        }
        if (['code', 'pre', 'kbd', 'samp', 'tt'].includes(tag)) {
            entry.usage.code = true;
        }

        // Track font sizes
        const sizeKey = `${fontSize} / ${weight}`;
        entry.sizes.set(sizeKey, (entry.sizes.get(sizeKey) || 0) + 1);

        // Build font scale from headings and common elements
        if (tag === 'h1' && !fontScale.h1) fontScale.h1 = `${fontSize} / ${weight}`;
        if (tag === 'h2' && !fontScale.h2) fontScale.h2 = `${fontSize} / ${weight}`;
        if (tag === 'h3' && !fontScale.h3) fontScale.h3 = `${fontSize} / ${weight}`;
        if (tag === 'h4' && !fontScale.h4) fontScale.h4 = `${fontSize} / ${weight}`;
        if (tag === 'p' && !fontScale.body) fontScale.body = `${fontSize} / ${weight}`;
        if (tag === 'small' && !fontScale.small) fontScale.small = `${fontSize} / ${weight}`;
        if ((tag === 'code' || tag === 'pre') && !fontScale.code) fontScale.code = `${fontSize} / ${weight}`;
    });

    // 2. Detect font sources
    const fontSources = detectFontSources();

    // 3. Build final font list
    const fonts = Array.from(fontMap.entries())
        .map(([family, data]) => {
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
        })
        .sort((a, b) => b.usage.count - a.usage.count);

    return { fonts, fontScale };
}

/**
 * Clean font family string
 */
function cleanFontFamily(fontFamily) {
    if (!fontFamily) return null;
    // Get the first (primary) font
    const first = fontFamily.split(',')[0].trim();
    // Remove quotes
    return first.replace(/['"]/g, '');
}

/**
 * Detect font sources from <link> tags and @font-face rules
 */
function detectFontSources() {
    const sources = new Map(); // family → { type, url }

    // 1. Google Fonts <link> tags
    document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
        const href = link.href;
        const familyMatch = href.match(/family=([^&:]+)/);
        if (familyMatch) {
            const families = familyMatch[1].split('|');
            families.forEach(f => {
                const name = decodeURIComponent(f.split(':')[0].replace(/\+/g, ' '));
                sources.set(name, { type: 'google-fonts', url: href });
            });
        }
    });

    // 2. Adobe Fonts (Typekit)
    document.querySelectorAll('link[href*="use.typekit.net"]').forEach(link => {
        sources.set('__adobe__', { type: 'adobe', url: link.href });
    });

    // 3. @font-face rules from stylesheets
    try {
        for (const sheet of document.styleSheets) {
            try {
                const rules = sheet.cssRules || sheet.rules;
                if (!rules) continue;

                for (const rule of rules) {
                    if (rule instanceof CSSFontFaceRule) {
                        const family = rule.style.fontFamily?.replace(/['"]/g, '');
                        const src = rule.style.src;
                        if (family && !sources.has(family)) {
                            const urlMatch = src?.match(/url\(["']?([^"')]+)/);
                            sources.set(family, {
                                type: 'self-hosted',
                                url: urlMatch ? urlMatch[1] : null
                            });
                        }
                    }
                }
            } catch (e) {
                // CORS may block access to cross-origin stylesheets
            }
        }
    } catch (e) {
        // Stylesheet access error
    }

    // 4. document.fonts API
    if (document.fonts) {
        document.fonts.forEach(font => {
            const family = font.family.replace(/['"]/g, '');
            if (!sources.has(family)) {
                sources.set(family, { type: 'loaded', url: null });
            }
        });
    }

    return sources;
}

/**
 * Detect if a font is a system font
 */
function detectSystemFont(family) {
    const systemFonts = [
        'Arial', 'Helvetica', 'Helvetica Neue', 'Times New Roman', 'Times',
        'Georgia', 'Verdana', 'Courier New', 'Courier', 'Impact', 'Comic Sans MS',
        'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
        'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'
    ];

    if (systemFonts.some(f => f.toLowerCase() === family.toLowerCase())) {
        return { type: 'system', url: null };
    }
    return { type: 'unknown', url: null };
}
