import { useState } from 'preact/hooks';

/**
 * Inspector Tab — displays pinned element's CSS properties
 */
export function InspectorTab({ element, isInspecting, onStartInspect, onSelectPage }) {
    const [copiedKey, setCopiedKey] = useState(null);

    if (!element && !isInspecting) {
        return (
            <div class="inspector-empty">
                <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" stroke="#3f3f46" stroke-width="2" stroke-dasharray="4 4" />
                        <circle cx="20" cy="20" r="8" stroke="#6366f1" stroke-width="2" />
                        <line x1="26" y1="26" x2="34" y2="34" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
                <h3 class="empty-title">No element selected</h3>
                <p class="empty-text">Click "Inspect" and hover over any element on the page, then click to pin it.</p>
                <div class="empty-actions">
                    <button class="empty-btn" onClick={onStartInspect}>
                        🔍 Start Inspecting
                    </button>
                    <button class="empty-btn secondary" onClick={onSelectPage}>
                        📄 Select Page
                    </button>
                </div>
            </div>
        );
    }

    if (isInspecting && !element) {
        return (
            <div class="inspector-active">
                <div class="pulse-ring"></div>
                <p class="active-text">Inspect mode active</p>
                <p class="active-sub">Hover over any element and click to inspect it</p>
            </div>
        );
    }

    const copyValue = (key, value) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 1500);
        });
    };

    const renderSection = (title, items) => {
        if (!items || Object.keys(items).length === 0) return null;
        return (
            <div class="inspector-section">
                <h4 class="section-title">{title}</h4>
                <div class="section-props">
                    {Object.entries(items).map(([key, value]) => {
                        if (value === null || value === undefined || value === '' || value === 'none' || value === 'normal') return null;
                        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                        const isCopied = copiedKey === `${title}-${key}`;

                        return (
                            <div
                                class={`prop-row ${isCopied ? 'copied' : ''}`}
                                key={key}
                                onClick={() => copyValue(`${title}-${key}`, displayValue)}
                                title="Click to copy"
                            >
                                <span class="prop-key">{formatKey(key)}</span>
                                <span class="prop-value">
                                    {isColorValue(key, displayValue) && (
                                        <span class="color-swatch" style={{ backgroundColor: displayValue }}></span>
                                    )}
                                    {isCopied ? '✓ Copied!' : truncate(displayValue, 40)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div class="inspector-content">
            {/* Element header */}
            <div class="inspector-element-header">
                <code class="element-tag">
                    {'<'}{element.tagName}
                    {element.id && <span class="tag-id">#{element.id}</span>}
                    {element.classList?.length > 0 && (
                        <span class="tag-class">.{element.classList.slice(0, 3).join('.')}</span>
                    )}
                    {'>'}
                </code>
                <span class="element-dims">{element.dimensions?.width} × {element.dimensions?.height}</span>
                <button class="select-page-btn" onClick={onSelectPage} title="Select entire page">
                    📄 Page
                </button>
            </div>

            {/* Selector path */}
            {element.selectorPath && (
                <div class="inspector-selector" onClick={() => copyValue('selector', element.selectorPath)}>
                    <span class="selector-label">Selector</span>
                    <code class="selector-value">{element.selectorPath}</code>
                </div>
            )}

            {/* Box Model Visual */}
            <div class="box-model-visual">
                <div class="box-margin-label">margin</div>
                <div class="box-margin">
                    <span class="box-val top">{element.box?.margin?.top || 0}</span>
                    <div class="box-border">
                        <span class="box-val left-outer">{element.box?.margin?.left || 0}</span>
                        <div class="box-border-label">border</div>
                        <div class="box-padding">
                            <span class="box-val top">{element.box?.padding?.top || 0}</span>
                            <div class="box-content">
                                <span class="box-val left-inner">{element.box?.padding?.left || 0}</span>
                                <span class="box-content-size">
                                    {element.dimensions?.width} × {element.dimensions?.height}
                                </span>
                                <span class="box-val right-inner">{element.box?.padding?.right || 0}</span>
                            </div>
                            <span class="box-val bottom">{element.box?.padding?.bottom || 0}</span>
                        </div>
                        <span class="box-val right-outer">{element.box?.margin?.right || 0}</span>
                    </div>
                    <span class="box-val bottom">{element.box?.margin?.bottom || 0}</span>
                </div>
            </div>

            {/* Property sections */}
            {renderSection('Typography', element.typography)}
            {renderSection('Visual', element.visual)}
            {renderSection('Layout', element.layout)}
            {renderSection('Position', element.position)}

            {/* Raw CSS */}
            {element.rawCSS && (
                <div class="inspector-section">
                    <h4 class="section-title">
                        Raw CSS
                        <button class="copy-all-btn" onClick={() => copyValue('rawCSS', element.rawCSS)}>
                            {copiedKey === 'rawCSS' ? '✓' : '📋'} Copy All
                        </button>
                    </h4>
                    <pre class="raw-css">{element.rawCSS}</pre>
                </div>
            )}
        </div>
    );
}

function formatKey(key) {
    return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function isColorValue(key, value) {
    const colorKeys = ['color', 'backgroundColor', 'borderColor', 'background'];
    return colorKeys.some(k => key.toLowerCase().includes(k.toLowerCase())) &&
        (value.startsWith('#') || value.startsWith('rgb'));
}

function truncate(str, max) {
    if (str.length <= max) return str;
    return str.substring(0, max - 3) + '...';
}
