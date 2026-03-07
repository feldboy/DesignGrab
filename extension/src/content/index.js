/**
 * DesignGrab — Content Script Entry Point
 * Initializes Shadow DOM, sets up message handling, and loads modules.
 */

import { initOverlay, hideOverlay } from './overlay.js';
import { initInspector, startInspecting, stopInspecting, toggleInspecting, getPinnedElement, pinElement } from './inspector.js';
import { extractAssets } from './extractor.js';
import { analyzeColors } from './colorAnalyzer.js';
import { analyzeFonts } from './fontAnalyzer.js';
import { analyzeLayout } from './layoutAnalyzer.js';
import { exportCode, exportForFigma, exportResponsiveHTML } from './codeExporter.js';
import { generateTailwindConfig } from './tailwindGen.js';
import OVERLAY_STYLES from './styles.css?inline';

let shadowRoot = null;
let isInitialized = false;
// lastPinnedElement kept as fallback; prefer getPinnedElement() from inspector
let lastPinnedElement = null;

/**
 * Initialize DesignGrab — creates Shadow DOM container and loads modules
 */
function initDesignGrab() {
    if (isInitialized) return;
    isInitialized = true;

    // Create container with Shadow DOM (closed — not accessible from page scripts)
    const host = document.createElement('designgrab-root');
    host.style.cssText = 'all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;';

    shadowRoot = host.attachShadow({ mode: 'closed' });

    // Inject overlay styles into shadow root
    const style = document.createElement('style');
    style.textContent = OVERLAY_STYLES;
    shadowRoot.appendChild(style);

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'dg-overlay';
    shadowRoot.appendChild(overlay);

    // Append to document
    document.documentElement.appendChild(host);

    // Initialize modules
    initOverlay(shadowRoot);
    initInspector(shadowRoot);

    console.log('[DesignGrab] Initialized');
}

/**
 * Listen for messages from background/popup/panel
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, payload } = message;

    switch (type) {
        case 'TOGGLE_INSPECT':
            initDesignGrab();
            const isActive = toggleInspecting();
            sendResponse({ active: isActive });
            break;

        case 'START_INSPECT':
            initDesignGrab();
            startInspecting();
            sendResponse({ active: true });
            break;

        case 'STOP_INSPECT':
            stopInspecting();
            sendResponse({ active: false });
            break;

        case 'SELECT_PAGE':
            initDesignGrab();
            try {
                const pageData = pinElement(document.body);
                sendResponse({ success: true, data: pageData });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'EXTRACT_ASSETS':
            initDesignGrab();
            try {
                const assets = extractAssets();
                // strip DOM elements before sending
                const cleaned = {
                    images: assets.images.map(({ element, ...rest }) => rest),
                    svgs: assets.svgs.map(({ element, ...rest }) => rest),
                    videos: assets.videos.map(({ element, ...rest }) => rest),
                    lotties: assets.lotties || [],
                    animations: assets.animations || [],
                };
                sendResponse({ success: true, assets: cleaned });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'ANALYZE_COLORS':
            initDesignGrab();
            try {
                const colorData = analyzeColors();
                sendResponse({ success: true, data: colorData });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'ANALYZE_FONTS':
            initDesignGrab();
            try {
                const fontData = analyzeFonts();
                sendResponse({ success: true, data: fontData });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'ANALYZE_LAYOUT':
            initDesignGrab();
            try {
                const target = getPinnedElement() || lastPinnedElement || document.querySelector('main') || document.body;
                const layoutData = analyzeLayout(target);
                sendResponse({ success: true, data: layoutData });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'EXPORT_CODE':
            initDesignGrab();
            try {
                const el = getPinnedElement() || lastPinnedElement || document.querySelector('main') || document.body.children[0];
                const mode = payload?.mode || 'html-css';
                const codeData = exportCode(el, { mode });
                sendResponse({ success: true, data: codeData });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'EXPORT_FULL_CONTEXT':
            initDesignGrab();
            try {
                const ctxEl = getPinnedElement() || lastPinnedElement || document.querySelector('main') || document.body.children[0];

                // Run all analyzers in parallel on the pinned element
                const htmlCssData = exportCode(ctxEl, { mode: 'html-css' });
                const layoutData = analyzeLayout(ctxEl);
                const colorData = analyzeColors();
                const fontData = analyzeFonts();
                const twConfig = generateTailwindConfig(colorData, fontData);
                const rawAssets = extractAssets();
                const assets = {
                    images: rawAssets.images.map(({ element, ...rest }) => rest).slice(0, 15), // cap at 15 for prompt size
                    svgs: rawAssets.svgs.map(({ element, ...rest }) => rest).slice(0, 10)
                };

                // Extract animations from the element and its descendants
                const animations = [];
                const animEls = [ctxEl, ...ctxEl.querySelectorAll('*')];
                for (const el of animEls) {
                    const cs = getComputedStyle(el);
                    if (cs.animationName && cs.animationName !== 'none') {
                        animations.push({
                            type: 'keyframe',
                            name: cs.animationName,
                            duration: cs.animationDuration,
                            timingFunction: cs.animationTimingFunction,
                            iterationCount: cs.animationIterationCount,
                            element: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
                        });
                    }
                    if (cs.transition && cs.transition !== 'all 0s ease 0s' && cs.transition !== 'none') {
                        animations.push({
                            type: 'transition',
                            transition: cs.transition,
                            element: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
                        });
                    }
                }

                // Collect @keyframes CSS from stylesheets
                const keyframeNames = new Set(animations.filter(a => a.type === 'keyframe').map(a => a.name));
                let keyframesCSS = '';
                if (keyframeNames.size > 0) {
                    try {
                        for (const sheet of document.styleSheets) {
                            try {
                                for (const rule of sheet.cssRules) {
                                    if (rule instanceof CSSKeyframesRule && keyframeNames.has(rule.name)) {
                                        keyframesCSS += rule.cssText + '\n\n';
                                    }
                                }
                            } catch (_e) { /* cross-origin stylesheet */ }
                        }
                    } catch (_e) { /* stylesheet access error */ }
                }

                sendResponse({
                    success: true,
                    context: {
                        html: htmlCssData.html,
                        css: htmlCssData.css,
                        layout: {
                            structuralHTML: layoutData.structuralHTML,
                            tailwindStructure: layoutData.tailwindStructure,
                            ascii: layoutData.ascii,
                        },
                        colors: {
                            palette: colorData.palette.slice(0, 20),
                            backgrounds: colorData.backgrounds,
                            textColors: colorData.textColors,
                            accentColors: colorData.accentColors,
                        },
                        fonts: {
                            fonts: fontData.fonts,
                            fontScale: fontData.fontScale,
                        },
                        tailwindConfig: twConfig,
                        animations: animations.length > 0 ? { items: animations.slice(0, 10), keyframesCSS } : null,
                        assets: assets,
                    },
                });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'EXPORT_FIGMA_SVG':
            initDesignGrab();
            (async () => {
                try {
                    let figmaEl = getPinnedElement() || lastPinnedElement || document.querySelector('main') || document.body.children[0];
                    if (payload?.childIndex != null && figmaEl.children[payload.childIndex]) {
                        figmaEl = figmaEl.children[payload.childIndex];
                    }
                    const figmaData = await exportForFigma(figmaEl);
                    sendResponse({ success: true, data: figmaData });
                } catch (err) {
                    sendResponse({ success: false, error: err.message });
                }
            })();
            return true; // keep message channel open for async response

        case 'EXPORT_RESPONSIVE_HTML':
            initDesignGrab();
            try {
                let responsiveEl = getPinnedElement() || lastPinnedElement || document.querySelector('main') || document.body.children[0];
                if (payload?.childIndex != null && responsiveEl.children[payload.childIndex]) {
                    responsiveEl = responsiveEl.children[payload.childIndex];
                }
                const responsiveData = exportResponsiveHTML(responsiveEl);
                sendResponse({ success: true, data: responsiveData });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'GET_CHILD_ELEMENTS':
            initDesignGrab();
            try {
                const parentEl = getPinnedElement() || lastPinnedElement || document.querySelector('main') || document.body.children[0];
                const children = [];
                if (parentEl) {
                    for (let i = 0; i < parentEl.children.length && i < 30; i++) {
                        const child = parentEl.children[i];
                        const tag = child.tagName.toLowerCase();
                        const id = child.id || '';
                        const classes = Array.from(child.classList).slice(0, 2).join('.');
                        const textContent = child.textContent?.trim().slice(0, 40) || '';
                        const childCount = child.children.length;
                        children.push({ tag, id, classes, text: textContent, childCount });
                    }
                }
                sendResponse({ success: true, children });
            } catch (err) {
                sendResponse({ success: false, error: err.message });
            }
            break;

        case 'GENERATE_TAILWIND':
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

        case 'ELEMENT_PINNED_INTERNAL':
            lastPinnedElement = payload?.element || null;
            break;

        case 'PING':
            sendResponse({ status: 'alive', initialized: isInitialized });
            break;

        default:
            break;
    }

    // Return true to indicate async response
    return true;
});

/**
 * Listen for keyboard shortcuts globally
 */
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+E / Cmd+Shift+E — toggle inspect mode (avoids DevTools conflict)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyE') {
        e.preventDefault();
        e.stopPropagation();
        initDesignGrab();
        const isActive = toggleInspecting();
        // Notify panel
        chrome.runtime.sendMessage({ type: 'INSPECT_MODE_CHANGED', payload: { active: isActive } }).catch(() => { });
    }

    // ESC — stop inspecting
    if (e.key === 'Escape' && isInitialized) {
        stopInspecting();
        hideOverlay();
        chrome.runtime.sendMessage({ type: 'INSPECT_MODE_CHANGED', payload: { active: false } }).catch(() => { });
    }
});

// Auto-initialize if the page has already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Don't auto-init, wait for user to activate via popup/shortcut
} else {
    document.addEventListener('DOMContentLoaded', () => {
        // Don't auto-init
    });
}
