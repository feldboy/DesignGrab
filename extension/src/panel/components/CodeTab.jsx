import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { copyToClipboard, downloadTextFile } from '../../lib/downloadUtils';
import { checkLimit, recordUsage } from '../../lib/usageTracker.js';
import { startUpgrade } from '../../lib/billing.js';
import { getAuthState } from '../../lib/auth.js';

function buildUltraPrompt(context) {
    let prompt = `I want to recreate this web component/page exactly 1:1. Here is the complete extracted context from the original site:\n\n`;

    if (context.html) {
        prompt += `## 1. Structure (HTML)\n\`\`\`html\n${context.html}\n\`\`\`\n\n`;
    }
    if (context.css) {
        prompt += `## 2. Styling (CSS)\n\`\`\`css\n${context.css}\n\`\`\`\n\n`;
    }
    if (context.colors || context.fonts) {
        prompt += `## 3. Design Tokens\n`;
        if (context.colors) {
            prompt += `### Colors\n`;
            if (context.colors.backgrounds?.length) prompt += `- Backgrounds: ${context.colors.backgrounds.join(', ')}\n`;
            if (context.colors.textColors?.length) prompt += `- Text Colors: ${context.colors.textColors.join(', ')}\n`;
            if (context.colors.accentColors?.length) prompt += `- Accent Colors: ${context.colors.accentColors.join(', ')}\n`;
            prompt += `\n`;
        }
        if (context.fonts?.fonts?.length) {
            prompt += `### Typography\n`;
            context.fonts.fonts.forEach(f => {
                prompt += `- ${f.family} (Weights: ${f.weights.join(', ')})\n`;
            });
            prompt += `\n`;
        }
    }
    if (context.animations) {
        prompt += `## 4. Animations\n`;
        if (context.animations.keyframesCSS) prompt += `\`\`\`css\n${context.animations.keyframesCSS}\n\`\`\`\n`;
        if (context.animations.items?.length) {
            context.animations.items.forEach(a => {
                prompt += `- [${a.type}] on \`${a.element}\`: ${a.transition || a.name}\n`;
            });
            prompt += `\n`;
        }
    }
    if (context.assets) {
        prompt += `## 5. Assets (SVGs & Images)\n`;
        if (context.assets.svgs?.length) {
            prompt += `### SVGs\n`;
            context.assets.svgs.forEach((svg, i) => {
                prompt += `SVG ${i + 1}:\n\`\`\`html\n${svg.html}\n\`\`\`\n\n`;
            });
        }
        if (context.assets.images?.length) {
            prompt += `### Images\n`;
            context.assets.images.forEach(img => {
                prompt += `- URL: ${img.url} (Type: ${img.type}, Size: ${img.size || 'unknown'})\n`;
            });
            prompt += `\n`;
        }
    }

    prompt += `Please perfectly recreate this component. Focus on 1:1 pixel perfection for structure, colors, fonts, SVGs, and animations. Use React and Tailwind CSS (or whichever tool/framework applies).`;
    return prompt;
}

export function CodeTab({ pinnedElement, initialMode = 'html-css' }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(initialMode);
    const [figmaSubMode, setFigmaSubMode] = useState('svg'); // 'svg' | 'responsive' | 'ai-prompt'
    const [copied, setCopied] = useState(false);
    const [usageBlock, setUsageBlock] = useState(null);
    const [childElements, setChildElements] = useState([]);
    const [selectedDiv, setSelectedDiv] = useState('root');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const codeRef = useRef(null);

    const isAIMode = mode === 'react' || mode === 'vue';
    const isFigmaMode = mode === 'figma';
    const isAIPromptSubMode = isFigmaMode && figmaSubMode === 'ai-prompt';

    // Check auth state
    useEffect(() => {
        getAuthState().then((state) => setIsLoggedIn(state.isLoggedIn)).catch(() => { });
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
        // Gate AI exports: require sign-in and check usage limits
        if (isAIMode || isAIPromptSubMode) {
            if (!isLoggedIn) {
                setError('Sign in with Google in the Settings tab to use AI exports.');
                return;
            }
            const limit = await checkLimit('ai_export');
            if (!limit.allowed) {
                setUsageBlock(limit);
                return;
            }
        } else if (!isFigmaMode) {
            const limit = await checkLimit('code_export');
            if (!limit.allowed) {
                setUsageBlock(limit);
                return;
            }
        }

        setIsLoading(true);
        setError(null);
        setUsageBlock(null);

        if (isFigmaMode && figmaSubMode === 'svg') {
            // SVG export
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
        } else if (isFigmaMode && figmaSubMode === 'responsive') {
            // Responsive HTML+CSS export
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'EXPORT_RESPONSIVE_HTML',
                    payload: { childIndex: selectedDiv === 'root' ? null : parseInt(selectedDiv) }
                }, async (response) => {
                    setIsLoading(false);
                    if (chrome.runtime.lastError) {
                        setError('Could not connect to page. Try pinning an element first.');
                    } else if (response && response.success) {
                        setData(response.data);
                    } else {
                        setError(response?.error || 'Failed to export responsive HTML.');
                    }
                });
            });
        } else if (isFigmaMode && figmaSubMode === 'ai-prompt') {
            // AI Prompt description
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs[0]) {
                    setIsLoading(false);
                    setError('No active tab found. Try again.');
                    return;
                }
                chrome.tabs.sendMessage(tabs[0].id, { type: 'EXPORT_FULL_CONTEXT' }, async (response) => {
                    if (chrome.runtime.lastError || !response?.success) {
                        setIsLoading(false);
                        setError('Could not connect to page. Try pinning an element first.');
                        return;
                    }
                    let didRespond = false;
                    const timeoutId = setTimeout(() => {
                        if (!didRespond) {
                            didRespond = true;
                            setIsLoading(false);
                            setError('AI description timed out. Please try again.');
                        }
                    }, 60000);
                    chrome.runtime.sendMessage({
                        type: 'AI_DESCRIBE_COMPONENT',
                        payload: { context: response.context }
                    }, async (aiData) => {
                        if (didRespond) return;
                        didRespond = true;
                        clearTimeout(timeoutId);
                        setIsLoading(false);
                        if (chrome.runtime.lastError) {
                            setError('AI description failed: could not reach service worker.');
                            return;
                        }
                        if (aiData?.error) {
                            setError(aiData.error);
                        } else {
                            setData({ mode: 'ai-prompt', description: aiData.description });
                            await recordUsage('ai_export');
                        }
                    });
                });
            });
        } else if (mode === 'ultra') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'EXPORT_FULL_CONTEXT' }, async (response) => {
                    setIsLoading(false);
                    if (chrome.runtime.lastError || !response?.success) {
                        setError('Could not connect to page. Try pinning an element first.');
                        return;
                    }
                    const prompt = buildUltraPrompt(response.context);
                    setData({ mode: 'ultra', prompt });
                    await recordUsage('code_export');
                });
            });
        } else if (isAIMode) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs[0]) {
                    setIsLoading(false);
                    setError('No active tab found. Try again.');
                    return;
                }
                chrome.tabs.sendMessage(tabs[0].id, { type: 'EXPORT_FULL_CONTEXT' }, async (response) => {
                    if (chrome.runtime.lastError || !response?.success) {
                        setIsLoading(false);
                        setError('Could not connect to page. Try pinning an element first.');
                        return;
                    }
                    let didRespond = false;
                    const timeoutId = setTimeout(() => {
                        if (!didRespond) {
                            didRespond = true;
                            setIsLoading(false);
                            setError('AI export timed out. Please try again.');
                        }
                    }, 60000);
                    chrome.runtime.sendMessage({
                        type: 'AI_EXPORT',
                        payload: { context: response.context, framework: mode }
                    }, async (aiData) => {
                        if (didRespond) return;
                        didRespond = true;
                        clearTimeout(timeoutId);
                        setIsLoading(false);
                        if (chrome.runtime.lastError) {
                            setError('AI export failed: could not reach service worker.');
                            return;
                        }
                        if (aiData?.error) {
                            setError(aiData.error);
                        } else {
                            setData({ mode: `ai-${mode}`, code: aiData.code, framework: aiData.framework });
                            await recordUsage('ai_export');
                        }
                    });
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

    const switchFigmaSubMode = (subMode) => {
        setFigmaSubMode(subMode);
        setData(null);
        setError(null);
        setUsageBlock(null);
    };

    // Export button label
    const getExportLabel = () => {
        if (isLoading) {
            if (isAIMode || isAIPromptSubMode) return 'AI generating...';
            return 'Exporting...';
        }
        if (isFigmaMode) {
            if (figmaSubMode === 'svg') return pinnedElement ? `Export SVG <${pinnedElement.tagName}>` : 'Export SVG';
            if (figmaSubMode === 'responsive') return pinnedElement ? `Export HTML <${pinnedElement.tagName}>` : 'Export HTML+CSS';
            if (figmaSubMode === 'ai-prompt') return pinnedElement ? `Describe <${pinnedElement.tagName}>` : 'AI Describe';
        }
        if (pinnedElement) return `${isAIMode ? 'AI ' : ''}Export <${pinnedElement.tagName}>`;
        if (isAIMode) return 'AI Export';
        if (mode === 'ultra') return 'Generate Mega-Prompt';
        return 'Export Code';
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
                        <button className={mode === 'ultra' ? 'active' : ''} onClick={() => switchMode('ultra')}>Ultra ⚡️</button>
                    </div>
                </div>

                {/* Figma sub-mode selector */}
                {isFigmaMode && (
                    <div className="code-actions-row" style={{ paddingTop: '4px' }}>
                        <div className="segmented-control figma-sub-control" style={{ fontSize: '11px' }}>
                            <button className={figmaSubMode === 'svg' ? 'active' : ''} onClick={() => switchFigmaSubMode('svg')}>SVG</button>
                            <button className={figmaSubMode === 'responsive' ? 'active' : ''} onClick={() => switchFigmaSubMode('responsive')}>HTML+CSS</button>
                            <button className={figmaSubMode === 'ai-prompt' ? 'active' : ''} onClick={() => switchFigmaSubMode('ai-prompt')}>AI Prompt</button>
                        </div>
                    </div>
                )}

                {/* Figma div picker */}
                {isFigmaMode && figmaSubMode !== 'ai-prompt' && childElements.length > 0 && (
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
                        {getExportLabel()}
                    </button>
                    {!isAIMode && !isFigmaMode && mode !== 'ultra' && (
                        <button className="panel-btn outline" onClick={generateTailwindConfig} style={{ flexShrink: 0 }}>Config</button>
                    )}
                </div>

                {isAIMode && (
                    <div className={`ai-mode-hint ${!isLoggedIn ? 'ai-mode-warning' : ''}`}>
                        {isLoggedIn
                            ? `Powered by Gemini — generates a ${mode === 'react' ? 'React TSX' : 'Vue SFC'} component with Tailwind`
                            : 'Sign in with Google in Settings to use AI exports'}
                    </div>
                )}

                {isAIPromptSubMode && (
                    <div className={`ai-mode-hint ${!isLoggedIn ? 'ai-mode-warning' : ''}`}>
                        {isLoggedIn
                            ? 'Powered by Gemini — generates a detailed recreation prompt for this component'
                            : 'Sign in with Google in Settings to use AI features'}
                    </div>
                )}

                {isFigmaMode && figmaSubMode === 'responsive' && (
                    <div className="ai-mode-hint">
                        Generates responsive HTML+CSS with flexbox/grid, relative units, and design tokens
                    </div>
                )}
            </div>

            <div className="panel-scroll-content">
                {usageBlock && (
                    <div className="usage-limit-banner">
                        <div className="usage-limit-text">
                            {usageBlock.requiresAuth
                                ? 'Sign in with Google in Settings to use exports'
                                : <>You've used <strong>{usageBlock.current}/{usageBlock.limit}</strong> free {isAIMode || isAIPromptSubMode ? 'AI' : 'code'} exports this month</>
                            }
                        </div>
                        {!usageBlock.requiresAuth && (
                            <button className="upgrade-btn" onClick={() => startUpgrade('pro')}>Upgrade to Pro</button>
                        )}
                    </div>
                )}

                {error && <div className="panel-error"><p>{error}</p></div>}

                {isLoading && (isAIMode || isAIPromptSubMode) && (
                    <div className="panel-loading">
                        <div className="spinner"></div>
                        <p>{isAIPromptSubMode ? 'Generating component description...' : `Generating ${mode === 'react' ? 'React' : 'Vue'} component...`}</p>
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
                            Copy the SVG above, then paste into Figma (Cmd+V / Ctrl+V). Figma will convert it to native layers, text, and frames. Hover/focus/active states are embedded as CSS in the SVG.
                        </div>
                    </div>
                )}

                {/* Interactions panel — hover/focus/active states & transitions */}
                {data?.mode === 'figma-svg' && data.interactions && (
                    data.interactions.states.length > 0 || data.interactions.transitions.length > 0
                ) && (
                        <div className="code-block-wrapper" style={{ marginTop: '10px' }}>
                            <div className="code-header">
                                <span>
                                    Interactions
                                    <span className="code-badge">
                                        {data.interactions.states.length} state{data.interactions.states.length !== 1 ? 's' : ''}
                                    </span>
                                </span>
                            </div>
                            <div style={{ padding: '8px 12px', fontSize: '11px', lineHeight: 1.6 }}>
                                {data.interactions.transitions.length > 0 && (
                                    <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ fontWeight: 600, opacity: 0.6, marginBottom: '3px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Transitions</div>
                                        {data.interactions.transitions.map((t, i) => (
                                            <div key={i} style={{ fontFamily: 'monospace', opacity: 0.85, marginBottom: '2px' }}>{t}</div>
                                        ))}
                                    </div>
                                )}
                                {data.interactions.states.map((item, i) => (
                                    <div key={i} style={{ marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <span style={{
                                                background: item.state === 'Hover' ? '#3b82f6' : item.state === 'Active' ? '#ef4444' : '#8b5cf6',
                                                color: '#fff', borderRadius: '3px', padding: '1px 6px', fontSize: '10px', fontWeight: 600
                                            }}>{item.state}</span>
                                            <span style={{ opacity: 0.5, fontFamily: 'monospace', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.selector}</span>
                                        </div>
                                        {Object.entries(item.properties).map(([prop, val]) => (
                                            <div key={prop} style={{ display: 'flex', gap: '8px', paddingLeft: '8px', marginBottom: '2px' }}>
                                                <span style={{ opacity: 0.55, minWidth: '120px', fontFamily: 'monospace' }}>{prop}</span>
                                                <span style={{ fontFamily: 'monospace', opacity: 0.9 }}>
                                                    {(prop.includes('color') || prop === 'box-shadow') && (
                                                        <span style={{
                                                            display: 'inline-block', width: '10px', height: '10px',
                                                            background: val, borderRadius: '2px', border: '1px solid rgba(128,128,128,0.3)',
                                                            marginRight: '4px', verticalAlign: 'middle'
                                                        }} />
                                                    )}
                                                    {val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                {/* Responsive HTML+CSS */}
                {data?.mode === 'responsive-html' && (
                    <div className="code-blocks">
                        <div className="code-block-wrapper">
                            <div className="code-header">
                                <span>
                                    Responsive HTML
                                    <span className="code-badge">Flexbox/Grid</span>
                                </span>
                                <button onClick={() => handleCopy(data.html)}>{copied ? 'Copied!' : 'Copy'}</button>
                            </div>
                            <pre className="code-content"><code>{data.html}</code></pre>
                        </div>
                        <div className="code-block-wrapper mt-3">
                            <div className="code-header">
                                <span>
                                    CSS
                                    <span className="code-badge">
                                        {data.tokensUsed?.colors?.length || 0} colors, {data.tokensUsed?.fonts?.length || 0} fonts
                                    </span>
                                </span>
                                <button onClick={() => handleCopy(data.css)}>{copied ? 'Copied!' : 'Copy'}</button>
                            </div>
                            <pre className="code-content"><code>{data.css}</code></pre>
                        </div>
                        <div style={{ padding: '8px 12px', fontSize: '11px', opacity: 0.7, lineHeight: 1.5, borderTop: '1px solid var(--border)' }}>
                            Self-contained responsive HTML+CSS snippet. Preserves flexbox/grid layout, exact colors, and responsive units.
                        </div>
                    </div>
                )}

                {/* AI Prompt description */}
                {data?.mode === 'ai-prompt' && (
                    <div className="code-block-wrapper">
                        <div className="code-header">
                            <span>
                                Component Description
                                <span className="code-badge">AI Generated</span>
                            </span>
                            <button onClick={() => handleCopy(data.description)}>{copied ? 'Copied!' : 'Copy'}</button>
                        </div>
                        <div className="code-content" style={{ padding: '12px 16px', fontSize: '12px', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {data.description}
                        </div>
                        <div style={{ padding: '8px 12px', fontSize: '11px', opacity: 0.7, lineHeight: 1.5, borderTop: '1px solid var(--border)' }}>
                            Copy this description and use it as a prompt for any AI or designer to recreate this component.
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

                {/* Ultra Mode Prompt display */}
                {data?.mode === 'ultra' && (
                    <div className="code-block-wrapper">
                        <div className="code-header">
                            <span>
                                AI Mega-Prompt ⚡️
                                <span className="code-badge">Copy All Ultra</span>
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => downloadTextFile(data.prompt, 'designgrab-ultra-prompt.md', 'text/markdown')}>Download .md</button>
                                <button onClick={() => handleCopy(data.prompt)}>{copied ? 'Copied!' : 'Copy Prompt'}</button>
                            </div>
                        </div>
                        <div className="code-content" style={{ padding: '12px 16px', fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '400px', overflowY: 'auto' }}>
                            {data.prompt}
                        </div>
                        <div style={{ padding: '8px 12px', fontSize: '11px', opacity: 0.7, lineHeight: 1.5, borderTop: '1px solid var(--border)' }}>
                            Paste this massive prompt into any AI coding assistant (Antigravity, Cursor, Lovable) to reconstruct the entire component 1:1. It includes HTML, CSS, fonts, exact colors, extracted animations, and inline SVG assets.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
