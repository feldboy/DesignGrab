/**
 * Tailwind Config Generator — creates tailwind.config.js from design tokens
 */

import { toHex, hexToRgb, rgbToHsl } from '../lib/colorUtils.js';

/**
 * Generate a tailwind.config.js from analyzed colors, fonts, and page styles
 */
export function generateTailwindConfig(colorData, fontData) {
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

/**
 * Build color tokens from analyzed palette
 */
function buildColorTokens(colorData) {
    if (!colorData) return {};
    const colors = {};

    // Primary color — most used accent/saturated color
    const accent = colorData.accentColors?.[0];
    if (accent) {
        colors.primary = generateColorScale(accent);
    }

    // Secondary
    if (colorData.accentColors?.[1]) {
        colors.secondary = generateColorScale(colorData.accentColors[1]);
    }

    // Accent
    if (colorData.accentColors?.[2]) {
        colors.accent = colorData.accentColors[2];
    }

    // Background
    if (colorData.backgrounds?.length > 0) {
        colors.background = colorData.backgrounds[0];
        if (colorData.backgrounds[1]) {
            colors['background-alt'] = colorData.backgrounds[1];
        }
    }

    // Text
    if (colorData.textColors?.length > 0) {
        colors.text = {
            primary: colorData.textColors[0],
            ...(colorData.textColors[1] ? { secondary: colorData.textColors[1] } : {}),
            ...(colorData.textColors[2] ? { muted: colorData.textColors[2] } : {})
        };
    }

    return colors;
}

/**
 * Generate a color scale (50-950) from a base color
 */
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
    h /= 360; s /= 100; l /= 100;

    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHexVal = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHexVal(r)}${toHexVal(g)}${toHexVal(b)}`;
}

/**
 * Build font family tokens
 */
function buildFontFamilies(fontData) {
    if (!fontData?.fonts) return {};
    const families = {};

    fontData.fonts.forEach(font => {
        if (font.usage.headings) {
            families.heading = [font.family, 'sans-serif'];
        }
        if (font.usage.body) {
            families.body = [font.family, 'sans-serif'];
        }
        if (font.usage.code) {
            families.code = [font.family, 'monospace'];
        }
    });

    return families;
}

/**
 * Build font size tokens from font scale
 */
function buildFontSizes(fontData) {
    if (!fontData?.fontScale) return {};
    const sizes = {};

    Object.entries(fontData.fontScale).forEach(([key, value]) => {
        const [size, weight] = value.split(' / ');
        sizes[key] = [size, { lineHeight: '1.5', fontWeight: weight }];
    });

    return sizes;
}

/**
 * Scan page for common border-radius values
 */
function buildBorderRadius() {
    const radii = new Map();
    document.querySelectorAll('*').forEach(el => {
        const r = window.getComputedStyle(el).borderRadius;
        if (r && r !== '0px') {
            radii.set(r, (radii.get(r) || 0) + 1);
        }
    });

    const sorted = Array.from(radii.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const result = {};
    const names = ['card', 'button', 'input', 'badge'];
    sorted.forEach(([value], i) => {
        result[names[i] || `r${i}`] = value;
    });

    return result;
}

/**
 * Scan page for common box-shadow values
 */
function buildBoxShadows() {
    const shadows = new Map();
    document.querySelectorAll('*').forEach(el => {
        const s = window.getComputedStyle(el).boxShadow;
        if (s && s !== 'none') {
            shadows.set(s, (shadows.get(s) || 0) + 1);
        }
    });

    const sorted = Array.from(shadows.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const result = {};
    const names = ['card', 'elevated', 'overlay'];
    sorted.forEach(([value], i) => {
        result[names[i] || `s${i}`] = value;
    });

    return result;
}

/**
 * Detect common spacing values
 */
function buildSpacing() {
    const spacings = new Map();

    document.querySelectorAll('section, [class*="container"], main, article, .wrapper').forEach(el => {
        const computed = window.getComputedStyle(el);
        ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'gap'].forEach(prop => {
            const val = computed[prop];
            if (val && val !== '0px' && val !== 'normal') {
                const px = parseFloat(val);
                if (px >= 16) {
                    spacings.set(val, (spacings.get(val) || 0) + 1);
                }
            }
        });
    });

    const sorted = Array.from(spacings.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const result = {};
    const names = ['section', 'card-padding', 'element-gap'];
    sorted.forEach(([value], i) => {
        result[names[i] || `sp${i}`] = value;
    });

    return result;
}

/**
 * Format the config object as a pretty JS module string
 */
function formatConfig(config) {
    return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2)
            .replace(/"([^"]+)":/g, '$1:')          // Remove quotes from keys
            .replace(/"/g, "'")                       // Single quotes for values
        }`;
}
