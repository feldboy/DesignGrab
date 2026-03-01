/**
 * Color utility functions — RGB ↔ HEX ↔ HSL conversions
 */

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function hslToRgb(h, s, l) {
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
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Parse any CSS color string to { r, g, b, a }
 */
export function parseColor(colorStr) {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'none') return null;

    // HEX
    if (colorStr.startsWith('#')) {
        const rgb = hexToRgb(colorStr);
        return rgb ? { ...rgb, a: 1 } : null;
    }

    // rgb() / rgba()
    const rgbaMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1]),
            g: parseInt(rgbaMatch[2]),
            b: parseInt(rgbaMatch[3]),
            a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
        };
    }

    return null;
}

/**
 * Convert any color to HEX string
 */
export function toHex(colorStr) {
    const c = parseColor(colorStr);
    if (!c) return null;
    return rgbToHex(c.r, c.g, c.b);
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export function getContrastRatio(color1, color2) {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color) {
    const c = parseColor(color);
    if (!c) return 0;
    const [rs, gs, bs] = [c.r, c.g, c.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate CIE76 Delta-E (color difference in LAB space)
 */
export function deltaE(color1, color2) {
    const lab1 = rgbToLab(color1);
    const lab2 = rgbToLab(color2);
    if (!lab1 || !lab2) return Infinity;
    return Math.sqrt(
        Math.pow(lab2.l - lab1.l, 2) +
        Math.pow(lab2.a - lab1.a, 2) +
        Math.pow(lab2.b - lab1.b, 2)
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
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

    return {
        l: (116 * y) - 16,
        a: 500 * (x - y),
        b: 200 * (y - z)
    };
}

/**
 * Generate a human-readable color name
 */
export function getColorName(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'Unknown';
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (hsl.s < 10) {
        if (hsl.l < 15) return 'Black';
        if (hsl.l < 30) return 'Dark Gray';
        if (hsl.l < 60) return 'Gray';
        if (hsl.l < 85) return 'Light Gray';
        return 'White';
    }

    const hueNames = [
        [15, 'Red'], [35, 'Orange'], [55, 'Yellow'], [80, 'Yellow Green'],
        [150, 'Green'], [185, 'Teal'], [220, 'Blue'], [260, 'Indigo'],
        [290, 'Purple'], [330, 'Pink'], [360, 'Red']
    ];

    let name = 'Red';
    for (const [hue, hueName] of hueNames) {
        if (hsl.h <= hue) { name = hueName; break; }
    }

    if (hsl.l < 30) return 'Dark ' + name;
    if (hsl.l > 70) return 'Light ' + name;
    return name;
}
