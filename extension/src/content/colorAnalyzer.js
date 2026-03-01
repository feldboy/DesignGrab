/**
 * Color Analyzer — extracts full color palette from any page
 * Groups similar colors, sorts by frequency, categorizes, and checks WCAG contrast.
 */

import { parseColor, toHex, rgbToHsl, getContrastRatio, deltaE, getColorName } from '../lib/colorUtils.js';

/**
 * Analyze all colors on the current page
 */
export function analyzeColors() {
    const colorMap = new Map(); // hex → { count, sources }
    const contrastIssues = [];

    // Walk all elements
    const elements = document.querySelectorAll('*');
    const total = elements.length;
    let processed = 0;

    elements.forEach(el => {
        const computed = window.getComputedStyle(el);

        // Extract colors from various properties
        const colorProps = [
            { prop: 'color', source: 'text' },
            { prop: 'backgroundColor', source: 'background' },
            { prop: 'borderTopColor', source: 'border' },
            { prop: 'borderRightColor', source: 'border' },
            { prop: 'borderBottomColor', source: 'border' },
            { prop: 'borderLeftColor', source: 'border' },
            { prop: 'outlineColor', source: 'outline' },
            { prop: 'textDecorationColor', source: 'decoration' },
        ];

        colorProps.forEach(({ prop, source }) => {
            const value = computed[prop];
            if (!value) return;
            const hex = toHex(value);
            if (!hex) return;

            addColor(colorMap, hex, source);
        });

        // Extract colors from box-shadow
        const boxShadow = computed.boxShadow;
        if (boxShadow && boxShadow !== 'none') {
            const shadowColors = extractColorsFromShadow(boxShadow);
            shadowColors.forEach(hex => addColor(colorMap, hex, 'shadow'));
        }

        // Check contrast of text vs background
        const textColor = computed.color;
        const bgColor = findEffectiveBackground(el);
        if (textColor && bgColor) {
            const ratio = getContrastRatio(textColor, bgColor);
            const fontSize = parseFloat(computed.fontSize);
            const fontWeight = parseInt(computed.fontWeight);
            const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);

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
                        text: el.textContent?.trim().substring(0, 30) || ''
                    });
                }
            }
        }

        processed++;
    });

    // Convert map to sorted array
    let palette = Array.from(colorMap.entries()).map(([hex, data]) => {
        const rgb = parseColor(hex);
        const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 };
        return {
            hex,
            rgb: rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '',
            hsl: `${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
            count: data.count,
            sources: Array.from(data.sources),
            name: getColorName(hex)
        };
    });

    // Sort by frequency
    palette.sort((a, b) => b.count - a.count);

    // Group similar colors (ΔE < 5)
    palette = groupSimilarColors(palette);

    // Categorize colors
    const categorized = categorizeColors(palette);

    // Deduplicate contrast issues
    const uniqueIssues = deduplicateIssues(contrastIssues);

    return {
        palette: palette.slice(0, 50), // Top 50 colors
        backgrounds: categorized.backgrounds,
        textColors: categorized.textColors,
        accentColors: categorized.accents,
        contrastIssues: uniqueIssues.slice(0, 20),
        totalElements: total,
        uniqueColors: palette.length
    };
}

function addColor(map, hex, source) {
    // Skip fully transparent
    if (hex === '#000000') {
        // Check if it's actually transparent
        return;
    }

    hex = hex.toLowerCase();

    if (map.has(hex)) {
        const entry = map.get(hex);
        entry.count++;
        entry.sources.add(source);
    } else {
        map.set(hex, { count: 1, sources: new Set([source]) });
    }
}

function extractColorsFromShadow(shadow) {
    const colors = [];
    // Match rgba/rgb colors in box-shadow
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
    return 'rgb(255, 255, 255)'; // Default to white
}

function groupSimilarColors(palette) {
    const groups = [];
    const used = new Set();

    for (let i = 0; i < palette.length; i++) {
        if (used.has(i)) continue;

        const group = { ...palette[i] };
        used.add(i);

        for (let j = i + 1; j < palette.length; j++) {
            if (used.has(j)) continue;

            const diff = deltaE(palette[i].hex, palette[j].hex);
            if (diff < 5) {
                group.count += palette[j].count;
                // Keep the more frequent one
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

    palette.forEach(color => {
        const hsl = parseHSL(color.hsl);

        if (color.sources.includes('background')) {
            if (hsl.l > 85 || hsl.l < 15) {
                backgrounds.push(color.hex);
            }
        }

        if (color.sources.includes('text')) {
            textColors.push(color.hex);
        }

        // Accent = saturated, not too dark/light, used sparingly
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
    const parts = hslStr.split(',').map(s => parseInt(s));
    return { h: parts[0] || 0, s: parts[1] || 0, l: parts[2] || 0 };
}

function deduplicateIssues(issues) {
    const seen = new Set();
    return issues.filter(issue => {
        const key = `${issue.fg}-${issue.bg}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
