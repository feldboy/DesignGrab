import { walkAllElements, makeAbsolute, describeElement } from '../lib/domUtils.js';
import { extractUrlsFromCSS } from '../lib/cssUtils.js';

import { walkAllElements, makeAbsolute, describeElement } from '../lib/domUtils.js';
import { extractUrlsFromCSS } from '../lib/cssUtils.js';

/**
 * Asset extractor — scans page for images, SVGs, videos
 */

/**
 * Extract all assets from the current page
 */
export function extractAssets() {
    return {
        images: extractImages(),
        svgs: extractSVGs(),
        videos: extractVideos(),
        lotties: extractLotties(),
        animations: extractCSSAnimations()
    };
}

/**
 * Extract all images from the page
 */
function extractImages() {
    const images = [];
    const seenSrcs = new Set();

    // 1. <img> tags
    document.querySelectorAll('img').forEach(img => {
        const src = img.currentSrc || img.src;
        if (!src || seenSrcs.has(src) || src.startsWith('data:image/svg')) return;
        seenSrcs.add(src);

        images.push({
            src: makeAbsolute(src),
            alt: img.alt || '',
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            format: getImageFormat(src),
            size: estimateImageSize(img.naturalWidth, img.naturalHeight),
            location: 'img-tag',
            element: img
        });
    });

    // 2. <picture> <source> tags
    document.querySelectorAll('picture source').forEach(source => {
        const srcset = source.srcset;
        if (!srcset) return;
        const srcs = parseSrcset(srcset);
        srcs.forEach(({ url }) => {
            if (seenSrcs.has(url)) return;
            seenSrcs.add(url);
            images.push({
                src: makeAbsolute(url),
                alt: '',
                width: 0,
                height: 0,
                format: getImageFormat(url),
                size: '—',
                location: 'picture',
                element: source.parentElement
            });
        });
    });

    // 3. CSS background-image
    walkAllElements(document, (el) => {
        const computed = window.getComputedStyle(el);
        const bgImage = computed.backgroundImage;
        if (!bgImage || bgImage === 'none') return;

        const urls = extractUrlsFromCSS(bgImage);
        urls.forEach(url => {
            if (seenSrcs.has(url) || url.startsWith('data:image/svg')) return;
            seenSrcs.add(url);
            images.push({
                src: makeAbsolute(url),
                alt: '',
                width: 0,
                height: 0,
                format: getImageFormat(url),
                size: '—',
                location: 'bg-image',
                element: el
            });
        });
    });

    // 4. Favicon / Apple Touch Icon
    document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach(link => {
        const href = link.href;
        if (!href || seenSrcs.has(href)) return;
        seenSrcs.add(href);
        images.push({
            src: makeAbsolute(href),
            alt: 'Favicon',
            width: parseInt(link.sizes?.value?.split('x')[0]) || 32,
            height: parseInt(link.sizes?.value?.split('x')[1]) || 32,
            format: getImageFormat(href),
            size: '—',
            location: 'favicon',
            element: null
        });
    });

    // 5. Open Graph images
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(meta => {
        const content = meta.content;
        if (!content || seenSrcs.has(content)) return;
        seenSrcs.add(content);
        images.push({
            src: makeAbsolute(content),
            alt: 'OG Image',
            width: 0,
            height: 0,
            format: getImageFormat(content),
            size: '—',
            location: 'og-image',
            element: null
        });
    });

    return images;
}

/**
 * Extract all SVGs from the page
 */
function extractSVGs() {
    const svgs = [];
    const seenSVGs = new Set();

    // 1. Inline <svg> elements
    document.querySelectorAll('svg').forEach(svg => {
        // Skip tiny decorative SVGs (likely bullets or spacers)
        const rect = svg.getBoundingClientRect();
        if (rect.width < 4 && rect.height < 4) return;

        const code = svg.outerHTML;
        const hash = simpleHash(code);
        if (seenSVGs.has(hash)) return;
        seenSVGs.add(hash);

        svgs.push({
            code,
            viewBox: svg.getAttribute('viewBox') || '',
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            id: svg.id || null,
            location: 'inline',
            element: svg
        });
    });

    // 2. <img src="*.svg">
    document.querySelectorAll('img[src$=".svg"], img[src*=".svg?"]').forEach(img => {
        const src = img.currentSrc || img.src;
        if (!src || seenSVGs.has(src)) return;
        seenSVGs.add(src);

        svgs.push({
            code: null, // Need to fetch
            src: makeAbsolute(src),
            viewBox: '',
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            id: img.id || null,
            location: 'external',
            element: img
        });
    });

    // 3. CSS url() referencing .svg
    walkAllElements(document, (el) => {
        const computed = window.getComputedStyle(el);
        const bgImage = computed.backgroundImage;
        if (!bgImage || bgImage === 'none') return;

        const urls = extractUrlsFromCSS(bgImage);
        urls.forEach(url => {
            if (!url.includes('.svg') || seenSVGs.has(url)) return;
            seenSVGs.add(url);
            svgs.push({
                code: null,
                src: makeAbsolute(url),
                viewBox: '',
                width: 0,
                height: 0,
                id: null,
                location: 'css-bg',
                element: el
            });
        });
    });

    return svgs;
}

/**
 * Extract videos from the page
 */
function extractVideos() {
    const videos = [];
    const seenSrcs = new Set();

    // <video> tags
    document.querySelectorAll('video').forEach(video => {
        const src = video.currentSrc || video.src;
        const sources = video.querySelectorAll('source');

        if (src && !seenSrcs.has(src)) {
            seenSrcs.add(src);
            videos.push({
                src: makeAbsolute(src),
                type: video.type || 'video/mp4',
                poster: video.poster ? makeAbsolute(video.poster) : null,
                width: video.videoWidth || video.width,
                height: video.videoHeight || video.height,
                element: video
            });
        }

        sources.forEach(source => {
            const sSrc = source.src;
            if (!sSrc || seenSrcs.has(sSrc)) return;
            seenSrcs.add(sSrc);
            videos.push({
                src: makeAbsolute(sSrc),
                type: source.type || 'video/mp4',
                poster: video.poster ? makeAbsolute(video.poster) : null,
                width: 0,
                height: 0,
                element: video
            });
        });
    });

    // YouTube/Vimeo embeds (URL only)
    document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"]').forEach(iframe => {
        const src = iframe.src;
        if (seenSrcs.has(src)) return;
        seenSrcs.add(src);
        videos.push({
            src,
            type: 'embed',
            poster: null,
            width: iframe.width || 0,
            height: iframe.height || 0,
            element: iframe
        });
    });

    return videos;
}

/**
 * Extract Lottie animations from the page
 */
function extractLotties() {
    const lotties = [];
    const seenSrcs = new Set();

    // 1. <lottie-player> elements
    document.querySelectorAll('lottie-player').forEach(player => {
        const src = player.getAttribute('src');
        if (src && !seenSrcs.has(src)) {
            seenSrcs.add(src);
            lotties.push({
                src: makeAbsolute(src),
                name: getNameFromUrl(src) || 'lottie-animation',
                playerType: 'lottie-player',
                autoplay: player.hasAttribute('autoplay'),
                loop: player.hasAttribute('loop'),
                width: player.offsetWidth || 0,
                height: player.offsetHeight || 0,
            });
        }
    });

    // 2. <dotlottie-player> elements
    document.querySelectorAll('dotlottie-player').forEach(player => {
        const src = player.getAttribute('src');
        if (src && !seenSrcs.has(src)) {
            seenSrcs.add(src);
            lotties.push({
                src: makeAbsolute(src),
                name: getNameFromUrl(src) || 'dotlottie-animation',
                playerType: 'dotlottie-player',
                autoplay: player.hasAttribute('autoplay'),
                loop: player.hasAttribute('loop'),
                width: player.offsetWidth || 0,
                height: player.offsetHeight || 0,
            });
        }
    });

    // 3. Elements with data-* attributes pointing to .json lottie files
    document.querySelectorAll('[data-animation-path], [data-anim-path], [data-lottie]').forEach(el => {
        const src = el.getAttribute('data-animation-path') ||
                    el.getAttribute('data-anim-path') ||
                    el.getAttribute('data-lottie');
        if (src && !seenSrcs.has(src)) {
            seenSrcs.add(src);
            lotties.push({
                src: makeAbsolute(src),
                name: getNameFromUrl(src) || 'lottie-data-attr',
                playerType: 'bodymovin',
                autoplay: false,
                loop: false,
                width: el.offsetWidth || 0,
                height: el.offsetHeight || 0,
            });
        }
    });

    // 4. <script> tags or inline scripts loading lottie JSON
    document.querySelectorAll('script:not([src])').forEach(script => {
        const text = script.textContent || '';
        // Match common patterns: loadAnimation({path: '...'}), animationData: fetch('...')
        const pathMatches = text.matchAll(/['"](https?:\/\/[^'"]*\.json)['"]/g);
        for (const match of pathMatches) {
            const url = match[1];
            if (url && !seenSrcs.has(url) && (url.includes('lottie') || url.includes('anim') || url.includes('bodymovin'))) {
                seenSrcs.add(url);
                lotties.push({
                    src: url,
                    name: getNameFromUrl(url) || 'script-lottie',
                    playerType: 'script',
                    autoplay: false,
                    loop: false,
                    width: 0,
                    height: 0,
                });
            }
        }
    });

    // 5. Rive animations (<canvas data-rive-*> or <rive-canvas>)
    document.querySelectorAll('canvas[data-rive-src], rive-canvas').forEach(el => {
        const src = el.getAttribute('data-rive-src') || el.getAttribute('src');
        if (src && !seenSrcs.has(src)) {
            seenSrcs.add(src);
            lotties.push({
                src: makeAbsolute(src),
                name: getNameFromUrl(src) || 'rive-animation',
                playerType: 'rive',
                autoplay: true,
                loop: true,
                width: el.offsetWidth || 0,
                height: el.offsetHeight || 0,
            });
        }
    });

    return lotties;
}

/**
 * Extract CSS animations and transitions from the page
 */
function extractCSSAnimations() {
    const animations = [];
    const seenNames = new Set();
    const keyframesMap = {};

    // 1. Collect all @keyframes from stylesheets
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
                                    style: kf.cssText,
                                });
                            }
                            keyframesMap[name] = {
                                name,
                                css: rule.cssText,
                                frames,
                            };
                        }
                    }
                }
            } catch (e) {
                // CORS-restricted stylesheet, skip
            }
        }
    } catch (e) {
        // Stylesheet access blocked
    }

    // 2. Scan elements for animation/transition properties
    const scannedElements = document.querySelectorAll('*');
    const MAX_SCAN = 3000;
    const limit = Math.min(scannedElements.length, MAX_SCAN);

    for (let i = 0; i < limit; i++) {
        const el = scannedElements[i];
        const computed = window.getComputedStyle(el);
        const animName = computed.animationName;
        const animDuration = computed.animationDuration;
        const transition = computed.transition;

        // CSS animations
        if (animName && animName !== 'none') {
            const names = animName.split(',').map(n => n.trim());
            const durations = animDuration.split(',').map(d => d.trim());

            names.forEach((name, idx) => {
                if (name === 'none' || seenNames.has(name)) return;
                seenNames.add(name);

                const keyframes = keyframesMap[name] || null;
                animations.push({
                    type: 'keyframe',
                    name,
                    duration: durations[idx] || durations[0] || '0s',
                    timingFunction: computed.animationTimingFunction || 'ease',
                    iterationCount: computed.animationIterationCount || '1',
                    delay: computed.animationDelay || '0s',
                    keyframeCSS: keyframes?.css || null,
                    frames: keyframes?.frames || [],
                    element: describeElement(el),
                });
            });
        }

        // CSS transitions (only notable ones)
        if (transition && transition !== 'all 0s ease 0s' && transition !== 'none') {
            const key = `transition:${transition}`;
            if (!seenNames.has(key)) {
                seenNames.add(key);
                const tProperty = computed.transitionProperty || 'all';
                const tDuration = computed.transitionDuration || '0s';
                const tTiming = computed.transitionTimingFunction || 'ease';
                const tDelay = computed.transitionDelay || '0s';
                animations.push({
                    type: 'transition',
                    name: null,
                    transition,
                    transitionProperty: tProperty,
                    transitionDuration: tDuration,
                    transitionTimingFunction: tTiming,
                    transitionDelay: tDelay,
                    element: describeElement(el),
                });
            }
        }
    }

    // 3. Check for scroll-driven / AOS / GSAP markers
    document.querySelectorAll('[data-aos], [data-scroll], [data-gsap], [data-sal]').forEach(el => {
        const aoType = el.getAttribute('data-aos') || el.getAttribute('data-sal') || 'scroll-animation';
        const key = `aos:${aoType}:${describeElement(el)}`;
        if (seenNames.has(key)) return;
        seenNames.add(key);

        animations.push({
            type: 'scroll-library',
            name: aoType,
            library: el.hasAttribute('data-aos') ? 'AOS' :
                     el.hasAttribute('data-sal') ? 'SAL' :
                     el.hasAttribute('data-gsap') ? 'GSAP' : 'scroll',
            duration: el.getAttribute('data-aos-duration') || el.getAttribute('data-sal-duration') || null,
            delay: el.getAttribute('data-aos-delay') || el.getAttribute('data-sal-delay') || null,
            element: describeElement(el),
        });
    });

    return animations;
}

function describeElement(el) {
    const tag = el.tagName?.toLowerCase() || 'unknown';
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList?.length > 0 ? `.${Array.from(el.classList).slice(0, 2).join('.')}` : '';
    return `${tag}${id}${cls}`;
}

function getNameFromUrl(url) {
    try {
        const pathname = new URL(url).pathname;
        const filename = pathname.split('/').pop();
        return filename?.replace(/\.(json|lottie|riv)$/i, '') || null;
    } catch {
        return null;
    }
}

// --- Helpers ---

function walkAllElements(root, callback) {
    const elements = root.querySelectorAll('*');
    elements.forEach(el => {
        callback(el);
        if (el.shadowRoot) walkAllElements(el.shadowRoot, callback);
    });
}

function makeAbsolute(url) {
    if (!url) return url;
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    try {
        return new URL(url, window.location.href).href;
    } catch {
        return url;
    }
}

function getImageFormat(url) {
    if (!url) return 'unknown';
    const clean = url.split('?')[0].split('#')[0].toLowerCase();
    if (clean.endsWith('.webp')) return 'webp';
    if (clean.endsWith('.png')) return 'png';
    if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'jpg';
    if (clean.endsWith('.gif')) return 'gif';
    if (clean.endsWith('.svg')) return 'svg';
    if (clean.endsWith('.avif')) return 'avif';
    if (clean.endsWith('.ico')) return 'ico';
    return 'unknown';
}

function estimateImageSize(w, h) {
    if (!w || !h) return '—';
    // Rough estimate: 3 bytes per pixel for JPG-like compression
    const bytes = w * h * 0.5;
    if (bytes > 1024 * 1024) return Math.round(bytes / (1024 * 1024)) + ' MB';
    if (bytes > 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
}

function extractUrlsFromCSS(value) {
    const urls = [];
    const regex = /url\(["']?(.*?)["']?\)/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
        if (match[1] && !match[1].startsWith('data:')) {
            urls.push(match[1]);
        }
    }
    return urls;
}

function parseSrcset(srcset) {
    return srcset.split(',').map(s => {
        const parts = s.trim().split(/\s+/);
        return { url: parts[0], descriptor: parts[1] || '' };
    }).filter(s => s.url);
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(36);
}
