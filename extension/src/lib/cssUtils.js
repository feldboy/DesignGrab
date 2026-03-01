/**
 * CSS parsing and cleaning utilities
 */

/**
 * Get all computed styles for an element, organized by category
 */
export function getElementData(element) {
    const computed = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return {
        // Element info
        tagName: element.tagName.toLowerCase(),
        classList: Array.from(element.classList),
        id: element.id || null,

        // Dimensions
        dimensions: {
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        },

        // Box model
        box: {
            margin: {
                top: parseFloat(computed.marginTop) || 0,
                right: parseFloat(computed.marginRight) || 0,
                bottom: parseFloat(computed.marginBottom) || 0,
                left: parseFloat(computed.marginLeft) || 0
            },
            padding: {
                top: parseFloat(computed.paddingTop) || 0,
                right: parseFloat(computed.paddingRight) || 0,
                bottom: parseFloat(computed.paddingBottom) || 0,
                left: parseFloat(computed.paddingLeft) || 0
            },
            border: {
                top: parseFloat(computed.borderTopWidth) || 0,
                right: parseFloat(computed.borderRightWidth) || 0,
                bottom: parseFloat(computed.borderBottomWidth) || 0,
                left: parseFloat(computed.borderLeftWidth) || 0
            }
        },

        // Typography (only if element has text content)
        typography: hasTextContent(element) ? {
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            lineHeight: computed.lineHeight,
            letterSpacing: computed.letterSpacing,
            color: computed.color,
            textAlign: computed.textAlign,
            textTransform: computed.textTransform,
            textDecoration: computed.textDecoration
        } : null,

        // Visual
        visual: {
            backgroundColor: computed.backgroundColor,
            backgroundImage: computed.backgroundImage,
            borderRadius: computed.borderRadius,
            borderColor: computed.borderColor,
            borderStyle: computed.borderStyle,
            boxShadow: computed.boxShadow !== 'none' ? computed.boxShadow : null,
            opacity: computed.opacity,
            overflow: computed.overflow,
            cursor: computed.cursor
        },

        // Layout (differentiator — Layout DNA)
        layout: {
            display: computed.display,
            ...(computed.display === 'flex' || computed.display === 'inline-flex' ? {
                flexDirection: computed.flexDirection,
                flexWrap: computed.flexWrap,
                alignItems: computed.alignItems,
                justifyContent: computed.justifyContent,
                gap: computed.gap
            } : {}),
            ...(computed.display === 'grid' || computed.display === 'inline-grid' ? {
                gridTemplateColumns: computed.gridTemplateColumns,
                gridTemplateRows: computed.gridTemplateRows,
                gridGap: computed.gap || computed.gridGap,
                alignItems: computed.alignItems,
                justifyItems: computed.justifyItems
            } : {})
        },

        // Position
        position: {
            type: computed.position,
            top: computed.top,
            right: computed.right,
            bottom: computed.bottom,
            left: computed.left,
            zIndex: computed.zIndex
        },

        // Element rect (for overlay positioning)
        rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right
        }
    };
}

/**
 * Check if element directly contains text (not just children)
 */
function hasTextContent(element) {
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
            return true;
        }
    }
    return false;
}

/**
 * Generate raw CSS string from computed styles
 */
export function getRawCSS(element) {
    const computed = window.getComputedStyle(element);
    const important = [
        'display', 'position', 'width', 'height', 'max-width', 'max-height',
        'min-width', 'min-height', 'margin', 'padding', 'border', 'border-radius',
        'background-color', 'background-image', 'background-size', 'background-position',
        'color', 'font-family', 'font-size', 'font-weight', 'line-height',
        'letter-spacing', 'text-align', 'text-transform', 'text-decoration',
        'box-shadow', 'opacity', 'overflow', 'cursor', 'z-index',
        'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'gap',
        'grid-template-columns', 'grid-template-rows',
        'transition', 'transform'
    ];

    const lines = [];
    for (const prop of important) {
        const value = computed.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'normal' && value !== 'auto' &&
            value !== '0px' && value !== 'rgba(0, 0, 0, 0)' && value !== 'static') {
            lines.push(`  ${prop}: ${value};`);
        }
    }

    return `{\n${lines.join('\n')}\n}`;
}

/**
 * Format a CSS value for display (shorten long values)
 */
export function formatCSSValue(value) {
    if (!value) return '—';
    if (value === 'none' || value === 'normal' || value === 'auto') return value;
    if (value.length > 60) return value.substring(0, 57) + '...';
    return value;
}

/**
 * Format box model values as shorthand
 */
export function formatBoxShorthand(values) {
    const { top, right, bottom, left } = values;
    if (top === right && right === bottom && bottom === left) {
        return `${top}px`;
    }
    if (top === bottom && left === right) {
        return `${top}px ${right}px`;
    }
    return `${top}px ${right}px ${bottom}px ${left}px`;
}

/**
 * Extract URLs from a CSS background-image or other property value
 */
export function extractUrlsFromCSS(value) {
    if (!value || value === 'none') return [];
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

/**
 * Format HTML with proper indentation
 */
export function formatHTML(html) {
    if (!html) return '';
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
