/**
 * Inspector module — hover inspection and element pinning
 * Listens for mousemove when inspect mode is active,
 * uses getComputedStyle() for accurate property extraction.
 */

import { showOverlay, hideOverlay } from './overlay.js';
import { getElementData, getRawCSS } from '../lib/cssUtils.js';

let isInspecting = false;
let pinnedElement = null;
let lastHoveredElement = null;
let currentTarget = null; // tracks the currently highlighted element (may differ from hovered after arrow/scroll navigation)
let shadowRoot = null;

/**
 * Initialize inspector with shadow root reference
 */
export function initInspector(shadow) {
    shadowRoot = shadow;
}

/**
 * Start inspect mode
 */
export function startInspecting() {
    if (isInspecting) return;
    isInspecting = true;

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onElementClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('wheel', onWheel, { capture: true, passive: false });

    document.body.style.cursor = 'crosshair';

    // Notify panel that inspect mode started
    chrome.runtime.sendMessage({ type: 'INSPECT_MODE_CHANGED', payload: { active: true } });
}

/**
 * Stop inspect mode
 */
export function stopInspecting() {
    if (!isInspecting) return;
    isInspecting = false;

    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onElementClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('wheel', onWheel, true);

    document.body.style.cursor = '';
    hideOverlay();
    lastHoveredElement = null;
    currentTarget = null;

    chrome.runtime.sendMessage({ type: 'INSPECT_MODE_CHANGED', payload: { active: false } });
}

/**
 * Toggle inspect mode
 */
export function toggleInspecting() {
    if (isInspecting) {
        stopInspecting();
    } else {
        startInspecting();
    }
    return isInspecting;
}

/**
 * Handle mouse movement during inspect mode
 */
function onMouseMove(e) {
    if (!isInspecting) return;

    const target = e.target;

    // Skip our own overlay elements
    if (isDesignGrabElement(target)) return;

    // Skip if same element
    if (target === lastHoveredElement) return;
    lastHoveredElement = target;
    currentTarget = target; // reset to hovered element on mouse move

    showOverlay(target);
}

/**
 * Handle element click during inspect mode — "pin" the element
 */
function onElementClick(e) {
    if (!isInspecting) return;

    const target = currentTarget || e.target;
    if (isDesignGrabElement(target)) return;

    // Prevent default click behavior
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // Pin the element and send data
    pinElement(target);

    // Stop inspecting after pin
    stopInspecting();
}

/**
 * Pin an element — extract data and notify panel
 * Reusable for both click-pin and programmatic select (e.g. Select Page)
 */
export function pinElement(target) {
    pinnedElement = target;

    // Collect element data
    const data = getElementData(target);
    data.rawCSS = getRawCSS(target);
    data.selectorPath = getSelectorPath(target);

    // Send data to panel
    chrome.runtime.sendMessage({
        type: 'ELEMENT_PINNED',
        payload: data
    });

    // Show overlay on pinned element
    showOverlay(target);

    return data;
}

/**
 * Handle keyboard shortcuts
 */
function onKeyDown(e) {
    if (e.key === 'Escape') {
        stopInspecting();
        return;
    }

    // Arrow Up — select parent element
    if (e.key === 'ArrowUp' && currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        const parent = currentTarget.parentElement;
        if (parent && parent !== document.documentElement && !isDesignGrabElement(parent)) {
            currentTarget = parent;
            showOverlay(currentTarget);
        }
        return;
    }

    // Arrow Down — select first child element
    if (e.key === 'ArrowDown' && currentTarget) {
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

/**
 * Handle scroll wheel during inspect mode — navigate parent/child
 * Scroll up = select parent, scroll down = select child
 */
function onWheel(e) {
    if (!isInspecting || !currentTarget) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY < 0) {
        // Scroll up — go to parent
        const parent = currentTarget.parentElement;
        if (parent && parent !== document.documentElement && !isDesignGrabElement(parent)) {
            currentTarget = parent;
            showOverlay(currentTarget);
        }
    } else if (e.deltaY > 0) {
        // Scroll down — go to child
        const firstChild = currentTarget.children[0];
        if (firstChild && !isDesignGrabElement(firstChild)) {
            currentTarget = firstChild;
            showOverlay(currentTarget);
        }
    }
}

/**
 * Check if an element belongs to DesignGrab
 */
function isDesignGrabElement(el) {
    let current = el;
    while (current) {
        if (current.tagName && current.tagName.toLowerCase() === 'designgrab-root') {
            return true;
        }
        current = current.parentElement;
    }
    return false;
}

/**
 * Generate a CSS selector path for an element
 */
export function getSelectorPath(el) {
    const parts = [];
    let current = el;

    while (current && current !== document.body && current !== document.documentElement) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
            selector += `#${current.id}`;
            parts.unshift(selector);
            break; // ID is unique enough
        }

        if (current.classList.length > 0) {
            const meaningful = Array.from(current.classList)
                .filter(c => !c.match(/^(css-|sc-|_|__)/)) // Remove framework hashes
                .slice(0, 2);
            if (meaningful.length > 0) {
                selector += '.' + meaningful.join('.');
            }
        }

        parts.unshift(selector);
        current = current.parentElement;
    }

    return parts.join(' > ');
}

/**
 * Get the currently pinned element
 */
export function getPinnedElement() {
    return pinnedElement;
}

/**
 * Clear pinned element
 */
export function clearPinned() {
    pinnedElement = null;
    hideOverlay();
}
