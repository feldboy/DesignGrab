/**
 * Overlay renderer — visual box model overlay in Shadow DOM
 * Renders margin (orange), padding (green), border (yellow), content (blue)
 */

let overlayElements = null;

/**
 * Initialize overlay inside shadow root
 */
export function initOverlay(shadowRoot) {
    // Margin overlay (orange)
    const marginBox = createElement('dg-margin-box');
    // Border overlay (yellow)
    const borderBox = createElement('dg-border-box');
    // Padding overlay (green)
    const paddingBox = createElement('dg-padding-box');
    // Content overlay (blue)
    const contentBox = createElement('dg-content-box');
    // Tooltip
    const tooltip = createElement('dg-tooltip');
    // Guidelines
    const guideH = createElement('dg-guide-h');
    const guideV = createElement('dg-guide-v');

    const container = shadowRoot.querySelector('#dg-overlay');
    container.appendChild(marginBox);
    container.appendChild(borderBox);
    container.appendChild(paddingBox);
    container.appendChild(contentBox);
    container.appendChild(tooltip);
    container.appendChild(guideH);
    container.appendChild(guideV);

    overlayElements = { marginBox, borderBox, paddingBox, contentBox, tooltip, guideH, guideV };
    return overlayElements;
}

function createElement(className) {
    const el = document.createElement('div');
    el.className = className;
    return el;
}

/**
 * Show overlay for a hovered element
 */
export function showOverlay(element) {
    if (!overlayElements) return;

    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);

    const margin = {
        top: parseFloat(computed.marginTop) || 0,
        right: parseFloat(computed.marginRight) || 0,
        bottom: parseFloat(computed.marginBottom) || 0,
        left: parseFloat(computed.marginLeft) || 0
    };
    const padding = {
        top: parseFloat(computed.paddingTop) || 0,
        right: parseFloat(computed.paddingRight) || 0,
        bottom: parseFloat(computed.paddingBottom) || 0,
        left: parseFloat(computed.paddingLeft) || 0
    };
    const border = {
        top: parseFloat(computed.borderTopWidth) || 0,
        right: parseFloat(computed.borderRightWidth) || 0,
        bottom: parseFloat(computed.borderBottomWidth) || 0,
        left: parseFloat(computed.borderLeftWidth) || 0
    };

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Margin box (orange) — outermost
    setBox(overlayElements.marginBox, {
        top: rect.top - margin.top,
        left: rect.left - margin.left,
        width: rect.width + margin.left + margin.right,
        height: rect.height + margin.top + margin.bottom
    });

    // Border box (yellow) — same as element rect
    setBox(overlayElements.borderBox, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
    });

    // Padding box (green) — inside border
    setBox(overlayElements.paddingBox, {
        top: rect.top + border.top,
        left: rect.left + border.left,
        width: rect.width - border.left - border.right,
        height: rect.height - border.top - border.bottom
    });

    // Content box (blue) — innermost
    setBox(overlayElements.contentBox, {
        top: rect.top + border.top + padding.top,
        left: rect.left + border.left + padding.left,
        width: rect.width - border.left - border.right - padding.left - padding.right,
        height: rect.height - border.top - border.bottom - padding.top - padding.bottom
    });

    // Guidelines (rulers)
    overlayElements.guideH.style.cssText = `
    position: fixed; left: 0; right: 0;
    top: ${rect.top}px; height: ${rect.height}px;
    pointer-events: none; z-index: 2147483645;
    border-top: 1px dashed rgba(59, 130, 246, 0.3);
    border-bottom: 1px dashed rgba(59, 130, 246, 0.3);
    display: block;
  `;
    overlayElements.guideV.style.cssText = `
    position: fixed; top: 0; bottom: 0;
    left: ${rect.left}px; width: ${rect.width}px;
    pointer-events: none; z-index: 2147483645;
    border-left: 1px dashed rgba(59, 130, 246, 0.3);
    border-right: 1px dashed rgba(59, 130, 246, 0.3);
    display: block;
  `;

    // Show tooltip
    showTooltip(element, rect, computed);

    // Make everything visible
    overlayElements.marginBox.style.display = 'block';
    overlayElements.borderBox.style.display = 'block';
    overlayElements.paddingBox.style.display = 'block';
    overlayElements.contentBox.style.display = 'block';
}

function setBox(el, { top, left, width, height }) {
    el.style.cssText = `
    position: fixed;
    top: ${top}px;
    left: ${left}px;
    width: ${Math.max(0, width)}px;
    height: ${Math.max(0, height)}px;
    pointer-events: none;
    z-index: 2147483646;
    display: block;
    box-sizing: border-box;
  `;
}

/**
 * Show element info tooltip
 */
function showTooltip(element, rect, computed) {
    if (!overlayElements) return;
    const tooltip = overlayElements.tooltip;

    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.classList.length > 0
        ? '.' + Array.from(element.classList).slice(0, 3).join('.')
        : '';
    const dims = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

    const display = computed.display;
    const fontSize = computed.fontSize;
    const color = computed.color;
    const bg = computed.backgroundColor;

    let info = `<div class="dg-tooltip-tag">&lt;${tag}${id}${classes}&gt;</div>`;
    info += `<div class="dg-tooltip-dims">${dims}</div>`;
    info += `<div class="dg-tooltip-props">`;
    info += `<span>display: ${display}</span>`;
    if (fontSize !== '0px') info += `<span>font: ${fontSize}</span>`;
    if (bg !== 'rgba(0, 0, 0, 0)') info += `<span>bg: ${bg}</span>`;
    info += `</div>`;

    tooltip.innerHTML = info;

    // Position tooltip above element, or below if no room
    let tooltipTop = rect.top - 70;
    let tooltipLeft = rect.left;

    if (tooltipTop < 10) {
        tooltipTop = rect.bottom + 10;
    }
    if (tooltipLeft + 260 > window.innerWidth) {
        tooltipLeft = window.innerWidth - 270;
    }
    if (tooltipLeft < 10) tooltipLeft = 10;

    tooltip.style.cssText = `
    position: fixed;
    top: ${tooltipTop}px;
    left: ${tooltipLeft}px;
    z-index: 2147483647;
    pointer-events: none;
    display: block;
  `;
}

/**
 * Hide all overlay elements
 */
export function hideOverlay() {
    if (!overlayElements) return;
    Object.values(overlayElements).forEach(el => {
        el.style.display = 'none';
    });
}
