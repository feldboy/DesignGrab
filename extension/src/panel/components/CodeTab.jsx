import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { copyToClipboard } from '../../lib/downloadUtils';
import { checkLimit, recordUsage } from '../../lib/usageTracker.js';
import { startUpgrade } from '../../lib/billing.js';

export function CodeTab({ pinnedElement, initialMode = 'html-css' }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(initialMode);
    const [copied, setCopied] = useState(false);
    const [usageBlock, setUsageBlock] = useState(null);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [childElements, setChildElements] = useState([]);
    const [selectedDiv, setSelectedDiv] = useState('root');
    const codeRef = useRef(null);

    const isAIMode = mode === 'react' || mode === 'vue';
    const isFigmaMode = mode === 'figma';

    useEffect(() => {
        chrome.storage.local.get(['anthropic_api_key'], (data) => {
            setHasApiKey(!!data.anthropic_api_key);
        });
        const listener = (changes) => {
            if (changes.anthropic_api_key) {
                setHasApiKey(!!changes.anthropic_api_key.newValue);
            }
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    // Fetch child divs when entering Figma mode
    useEffect(() => {
        if (isFigmaMode) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs[0]) return;
                chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_CHILD_ELEMENTS' }, (response) => {
                    if (chrome.runtime.lastError || !response?.success) return;
                    setChildElements(response.children || []);
                    setSelectedDiv('root');
                });
            });
        }
    }, [isFigmaMode, pinnedElement]);

    const exportElement = async () => {
        if (isAIMode && !hasApiKey) {
            setError('Set your Anthropic API key in the Settings tab to use AI export.');
            return;
        }

        if (!(isAIMode && hasApiKey) && !isFigmaMode) {
            const action = isAIMode ? 'ai_export' : 'code_export';
            const limit = await checkLimit(action);
            if (!limit.allowed) {
                setUsageBlock(limit);
                return;
            }
        }

        setIsLoading(true);
        setError(null);
        setUsageBlock(null);

        if (isFigmaMode) {
            // Generate SVG directly from DOM — no AI
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'EXPORT_FIGMA_SVG',
                    payload: { childIndex: selectedDiv === 'root' ? null : parseInt(selectedDiv) }
                }, async (response) => {
                    setIsLoading(false);
                    if (chrome.runtime.lastError) {
                        setError('Could not connect to page. Try pinning an element first.');
                    } else if (response && response.success) {
                        setData(response.data);
                    } else {
                        setError(response?.error || 'Failed to export SVG for Figma.');
                    }
                });
            });
        } else if (isAIMode) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'EXPORT_FULL_CONTEXT' }, async (response) => {
                    if (chrome.runtime.lastError || !response?.success) {
                        setIsLoading(false);
                        setError('Could not connect to page. Try pinning an element first.');
                        return;
                    }
                    try {
                        chrome.runtime.sendMessage({
                            type: 'AI_EXPORT',
                            payload: { context: response.context, framework: mode }
                        }, async (aiData) => {
                            setIsLoading(false);
                            if (chrome.runtime.lastError) {
                                setError('AI export failed: could not reach service worker.');
                                return;
                            }
                            if (aiData?.error) {
                                setError(aiData.error === 'NO_API_KEY'
                                    ? 'Set your Anthropic API key in the Settings tab to use AI export.'
                                    : aiData.error);
                            } else {
                                setData({ mode: `ai-${mode}`, code: aiData.code, framework: aiData.framework });
                                await recordUsage('ai_export');
                            }
                        });
                    } catch (err) {
                        setIsLoading(false);
                        setError(`AI export failed: ${err.message}`);
                    }
                });
            });
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'EXPORT_CODE', payload: { mode } }, async (response) => {
                    setIsLoading(false);
                    if (chrome.runtime.lastError) {
                        setError('Could not connect to page. Try pinning an element first.');
                    } else if (response && response.success) {
                        setData(response.data);
                        await recordUsage('code_export');
                    } else {
                        setError(response?.error || 'Failed to export code.');
                    }
                });
            });
        }
    };

    const generateTailwindConfig = () => {
        setIsLoading(true);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'GENERATE_TAILWIND' }, (response) => {
                setIsLoading(false);
                if (response && response.success) {
                    setData({ mode: 'tailwind-config', config: response.data });
                } else {
                    setError(response?.error || 'Failed to generate config.');
                }
            });
        });
    };

    const handleCopy = (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) { /* silent */ }
        textarea.remove();
    };

    const handleSelectAll = () => {
        const el = codeRef.current;
        if (!el) return;
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setData(null);
        setError(null);
        setUsageBlock(null);
        setChildElements([]);
        setSelectedDiv('root');
    };

    return (
        <div className="code-tab fade-in">
            <div className="panel-sticky-header">
                <div className="code-actions-row">
                    <div className="segmented-control">
                        <button className={mode === 'html-css' ? 'active' : ''} onClick={() => switchMode('html-css')}>HTML+CSS</button>
                        <button className={mode === 'html-tailwind' ? 'active' : ''} onClick={() => switchMode('html-tailwind')}>Tailwind</button>
                        <button className={mode === 'react' ? 'active' : ''} onClick={() => switchMode('react')}>React</button>
                        <button className={mode === 'vue' ? 'active' : ''} onClick={() => switchMode('vue')}>Vue</button>
                        <button className={mode === 'figma' ? 'active' : ''} onClick={() => switchMode('figma')}>Figma</button>
                    </div>
                </div>

                {/* Figma div picker */}
                {isFigmaMode && childElements.length > 0 && (
                    <div className="code-actions-row" style={{ paddingTop: '4px' }}>
                        <label style={{ fontSize: '11px', opacity: 0.8, marginRight: '6px', whiteSpace: 'nowrap' }}>Target:</label>
                        <select
                            value={selectedDiv}
                            onChange={(e) => setSelectedDiv(e.target.value)}
                            style={{
                                flex: 1, padding: '4px 8px', fontSize: '11px',
                                border: '1px solid var(--border)', borderRadius: '4px',
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="root">Entire pinned element</option>
                            {childElements.map((child, i) => (
                                <option key={i} value={i}>
                                    {child.tag}{child.id ? `#${child.id}` : ''}{child.classes ? `.${child.classes}` : ''} — {child.text || `${child.childCount} children`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="code-actions-row">
                    <button className="export-btn" onClick={exportElement} disabled={isLoading}>
                        {isLoading
                            ? (isAIMode ? 'AI generating...' : 'Exporting...')
                            : (pinnedElement
                                ? `${isAIMode ? 'AI ' : ''}Export <${pinnedElement.tagName}>`
                                : (isAIMode ? 'AI Export' : (isFigmaMode ? 'Export SVG for Figma' : 'Export Code')))}
                    </button>
                    {!isAIMode && !isFigmaMode && (
                        <button className="panel-btn outline" onClick={generateTailwindConfig} style={{ flexShrink: 0 }}>Config</button>
                    )}
                </div>

                {isAIMode && (
                    <div className={`ai-mode-hint ${!hasApiKey ? 'ai-mode-warning' : ''}`}>
                        {hasApiKey
                            ? `Powered by Claude — generates a ${mode === 'react' ? 'React TSX' : 'Vue SFC'} component with Tailwind`
                            : 'Set your Anthropic API key in Settings to enable AI export'}
                    </div>
                )}
            </div>

            <div className="panel-scroll-content">
                {usageBlock && (
                    <div className="usage-limit-banner">
                        <div className="usage-limit-text">
                            You've used <strong>{usageBlock.current}/{usageBlock.limit}</strong> free {isAIMode ? 'AI' : 'code'} exports this month
                        </div>
                        <button className="upgrade-btn" onClick={() => startUpgrade('pro')}>Upgrade to Pro</button>
                    </div>
                )}

                {error && <div className="panel-error"><p>{error}</p></div>}

                {isLoading && isAIMode && (
                    <div className="panel-loading">
                        <div className="spinner"></div>
                        <p>{`Generating ${mode === 'react' ? 'React' : 'Vue'} component...`}</p>
                        <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>This may take 10-20 seconds</p>
                    </div>
                )}

                {!data && !error && !isLoading && (
                    <div className="code-empty-state">
                        <div className="empty-icon">{'</>'}</div>
                        <p className="empty-text">Pin an element on the page using the Inspector, then click Export.</p>
                    </div>
                )}

                {/* HTML+CSS mode */}
                {data?.mode === 'html-css' && (
                    <div className="code-blocks">
                        <div className="code-block-wrapper">
                            <div className="code-header">
                                <span>HTML</span>
                                <button onClick={() => handleCopy(data.html)}>{copied ? 'Copied!' : 'Copy'}</button>
                            </div>
                            <pre className="code-content"><code>{data.html}</code></pre>
                        </div>
                        <div className="code-block-wrapper mt-3">
                            <div className="code-header">
                                <span>CSS</span>
                                <button onClick={() => handleCopy(data.css)}>{copied ? 'Copied!' : 'Copy'}</button>
                            </div>
                            <pre className="code-content"><code>{data.css}</code></pre>
                        </div>
                    </div>
                )}

                {/* Tailwind mode */}
                {data?.mode === 'html-tailwind' && (
                    <div className="code-block-wrapper">
                        <div className="code-header">
                            <span>Tailwind HTML</span>
                            <button onClick={() => handleCopy(data.html)}>{copied ? 'Copied!' : 'Copy'}</button>
                        </div>
                        <pre className="code-content"><code>{data.html}</code></pre>
                    </div>
                )}

                {/* AI React/Vue */}
                {(data?.mode === 'ai-react' || data?.mode === 'ai-vue') && (
                    <div className="code-block-wrapper">
                        <div className="code-header">
                            <span>
                                {data.framework === 'react' ? 'Component.tsx' : 'Component.vue'}
                                <span className="code-badge">AI Generated</span>
                            </span>
                            <button onClick={() => handleCopy(data.code)}>{copied ? 'Copied!' : 'Copy'}</button>
                        </div>
                        <pre className="code-content"><code>{data.code}</code></pre>
                    </div>
                )}

                {/* Figma SVG — Copy and paste directly into Figma with Cmd+V */}
                {data?.mode === 'figma-svg' && (
                    <div className="code-block-wrapper">
                        <div className="code-header">
                            <span>
                                Figma SVG
                                <span className="code-badge">{data.width}x{data.height}</span>
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={handleSelectAll}>Select All</button>
                                <button onClick={() => handleCopy(data.svg)}>{copied ? 'Copied!' : 'Copy'}</button>
                            </div>
                        </div>
                        <pre className="code-content"><code ref={codeRef}>{data.svg}</code></pre>
                        <div style={{ padding: '8px 12px', fontSize: '11px', opacity: 0.7, lineHeight: 1.5, borderTop: '1px solid var(--border)' }}>
                            Copy the SVG above, then paste into Figma (Cmd+V / Ctrl+V). Figma will convert it to native layers, text, and frames.
                        </div>
                    </div>
                )}

                {/* Tailwind config */}
                {data?.mode === 'tailwind-config' && (
                    <div className="code-block-wrapper">
                        <div className="code-header">
                            <span>
                                tailwind.config.js
                                <span className="code-badge">Auto-generated</span>
                            </span>
                            <button onClick={() => handleCopy(data.config)}>{copied ? 'Copied!' : 'Copy'}</button>
                        </div>
                        <pre className="code-content"><code>{data.config}</code></pre>
                    </div>
                )}
            </div>
        </div>
    );
}
