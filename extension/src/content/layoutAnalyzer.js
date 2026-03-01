/**
 * Layout Analyzer — DIFFERENTIATOR
 * Detects Flex/Grid structure of any selected section and outputs
 * a layout tree, structural HTML, and Tailwind classes.
 */

/**
 * Analyze the layout structure of an element and its children
 */
export function analyzeLayout(element) {
    if (!element) return null;

    const tree = buildLayoutTree(element, 0);
    const structuralHTML = generateStructuralHTML(tree, 0);
    const tailwindStructure = getTailwindClasses(tree);

    return {
        tree,
        structuralHTML,
        tailwindStructure,
        ascii: generateASCII(tree, 0)
    };
}

/**
 * Recursively build a layout tree from DOM
 */
function buildLayoutTree(element, depth) {
    if (depth > 8) return null; // Prevent too-deep recursion

    const computed = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const display = computed.display;
    const tag = element.tagName.toLowerCase();

    // Skip invisible or tiny elements
    if (rect.width < 2 && rect.height < 2) return null;
    if (display === 'none') return null;

    const node = {
        tag,
        type: getLayoutType(display),
        display,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        classes: getCleanClasses(element)
    };

    // Add flex properties
    if (display === 'flex' || display === 'inline-flex') {
        node.direction = computed.flexDirection;
        node.wrap = computed.flexWrap;
        node.align = computed.alignItems;
        node.justify = computed.justifyContent;
        node.gap = computed.gap !== 'normal' ? computed.gap : null;
    }

    // Add grid properties
    if (display === 'grid' || display === 'inline-grid') {
        node.columns = computed.gridTemplateColumns;
        node.rows = computed.gridTemplateRows;
        node.gap = computed.gap !== 'normal' ? computed.gap : null;
        node.align = computed.alignItems;
        node.justifyItems = computed.justifyItems;
    }

    // Width info
    const widthPercent = getWidthPercentage(element);
    if (widthPercent) node.widthHint = widthPercent;

    // Recurse into children (skip text-only nodes)
    const children = [];
    for (const child of element.children) {
        const childNode = buildLayoutTree(child, depth + 1);
        if (childNode) children.push(childNode);
    }

    if (children.length > 0) {
        node.children = children;
    }

    return node;
}

function getLayoutType(display) {
    if (display === 'flex' || display === 'inline-flex') return 'flex';
    if (display === 'grid' || display === 'inline-grid') return 'grid';
    if (display === 'inline' || display === 'inline-block') return 'inline';
    return 'block';
}

function getCleanClasses(element) {
    return Array.from(element.classList)
        .filter(c => !c.match(/^(css-|sc-|_|__|jsx-|svelte-)/))
        .slice(0, 3);
}

function getWidthPercentage(element) {
    const parent = element.parentElement;
    if (!parent) return null;
    const parentWidth = parent.getBoundingClientRect().width;
    const childWidth = element.getBoundingClientRect().width;
    if (parentWidth === 0) return null;

    const ratio = childWidth / parentWidth;
    if (ratio > 0.95) return '100%';
    if (Math.abs(ratio - 0.5) < 0.05) return '50%';
    if (Math.abs(ratio - 0.333) < 0.05) return '33%';
    if (Math.abs(ratio - 0.667) < 0.05) return '67%';
    if (Math.abs(ratio - 0.25) < 0.05) return '25%';
    if (Math.abs(ratio - 0.75) < 0.05) return '75%';
    return null;
}

/**
 * Generate clean structural HTML with Tailwind layout classes
 */
function generateStructuralHTML(node, indent) {
    if (!node) return '';
    const pad = '  '.repeat(indent);
    const classes = nodeToTailwind(node);
    const classStr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';

    if (!node.children || node.children.length === 0) {
        if (['img', 'input', 'br', 'hr'].includes(node.tag)) {
            return `${pad}<${node.tag}${classStr} />\n`;
        }
        return `${pad}<${node.tag}${classStr}>...</${node.tag}>\n`;
    }

    let html = `${pad}<${node.tag}${classStr}>\n`;
    node.children.forEach(child => {
        html += generateStructuralHTML(child, indent + 1);
    });
    html += `${pad}</${node.tag}>\n`;
    return html;
}

/**
 * Convert a layout node to Tailwind classes
 */
function nodeToTailwind(node) {
    const classes = [];

    if (node.type === 'flex') {
        classes.push('flex');
        if (node.direction === 'column') classes.push('flex-col');
        if (node.direction === 'row-reverse') classes.push('flex-row-reverse');
        if (node.direction === 'column-reverse') classes.push('flex-col-reverse');
        if (node.wrap === 'wrap') classes.push('flex-wrap');

        // Align
        const alignMap = { 'center': 'items-center', 'flex-start': 'items-start', 'flex-end': 'items-end', 'stretch': 'items-stretch', 'baseline': 'items-baseline' };
        if (alignMap[node.align]) classes.push(alignMap[node.align]);

        // Justify
        const justifyMap = { 'center': 'justify-center', 'flex-start': 'justify-start', 'flex-end': 'justify-end', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly' };
        if (justifyMap[node.justify]) classes.push(justifyMap[node.justify]);
    }

    if (node.type === 'grid') {
        classes.push('grid');
        // Detect column count
        if (node.columns) {
            const colCount = node.columns.split(' ').filter(c => c !== '').length;
            if (colCount > 0) classes.push(`grid-cols-${colCount}`);
        }
    }

    // Gap
    if (node.gap) {
        const gapPx = parseFloat(node.gap);
        if (gapPx > 0) {
            const gapClass = pxToTailwindSpacing(gapPx);
            classes.push(`gap-${gapClass}`);
        }
    }

    // Width hint
    if (node.widthHint) {
        const widthMap = { '100%': 'w-full', '50%': 'w-1/2', '33%': 'w-1/3', '67%': 'w-2/3', '25%': 'w-1/4', '75%': 'w-3/4' };
        if (widthMap[node.widthHint]) classes.push(widthMap[node.widthHint]);
    }

    return classes;
}

function getTailwindClasses(node) {
    if (!node) return '';
    return nodeToTailwind(node).join(' ');
}

function pxToTailwindSpacing(px) {
    const map = { 0: '0', 1: 'px', 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5', 12: '3', 14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8', 36: '9', 40: '10', 44: '11', 48: '12', 56: '14', 64: '16' };
    // Find closest
    const sorted = Object.keys(map).map(Number).sort((a, b) => a - b);
    let closest = sorted[0];
    for (const val of sorted) {
        if (Math.abs(val - px) < Math.abs(closest - px)) {
            closest = val;
        }
    }
    return map[closest] || Math.round(px / 4);
}

/**
 * Generate ASCII representation of layout tree
 */
function generateASCII(node, depth) {
    if (!node) return '';
    const indent = '│ '.repeat(depth);
    const prefix = depth === 0 ? '' : '├─ ';

    let line = `${indent}${prefix}<${node.tag}>`;
    if (node.type !== 'block') line += ` [${node.type}]`;
    if (node.direction) line += ` ${node.direction}`;
    if (node.gap) line += ` gap:${node.gap}`;
    if (node.widthHint) line += ` ${node.widthHint}`;
    line += ` (${node.width}×${node.height})`;
    line += '\n';

    if (node.children) {
        node.children.forEach(child => {
            line += generateASCII(child, depth + 1);
        });
    }

    return line;
}
