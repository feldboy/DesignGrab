import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { copyToClipboard } from '../../lib/downloadUtils';
import { saveToLibrary } from './LibraryTab.jsx';

export function ColorsTab() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copiedHex, setCopiedHex] = useState(null);
    const [savedHex, setSavedHex] = useState(null);

    const analyzeColors = () => {
        setIsLoading(true);
        setError(null);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'ANALYZE_COLORS' }, (response) => {
                setIsLoading(false);
                if (chrome.runtime.lastError) {
                    setError('Could not connect to page. Try refreshing.');
                } else if (response && response.success) {
                    setData(response.data);
                } else {
                    setError(response?.error || 'Failed to analyze colors.');
                }
            });
        });
    };

    useEffect(() => {
        analyzeColors();
    }, []);

    const handleCopy = (hex) => {
        copyToClipboard(hex);
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 1500);
    };

    if (isLoading) {
        return (
            <div className="panel-loading">
                <div className="spinner"></div>
                <p>Analyzing page colors...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel-error">
                <p>{error}</p>
                <button className="panel-btn" onClick={analyzeColors}>Retry</button>
            </div>
        );
    }

    if (!data) return null;

    const handleSaveColor = (hex, name) => {
        saveToLibrary({
            type: 'color',
            name: name || hex,
            data: { hex },
            sourceUrl: '',
        }).then(res => {
            if (res.saved) {
                setSavedHex(hex);
                setTimeout(() => setSavedHex(null), 1500);
            }
        });
    };

    const ColorSwatch = ({ hex, name }) => (
        <div className="color-card">
            <div className="color-card-swatch" style={{ backgroundColor: hex }} onClick={() => handleCopy(hex)}>
                {copiedHex === hex && <span className="copy-feedback">Copied</span>}
            </div>
            <div className="color-card-info" onClick={() => handleCopy(hex)}>
                <span className="color-hex">{hex}</span>
                <span className="color-name">{name || 'Color'}</span>
            </div>
            <button
                className="save-btn"
                onClick={(e) => { e.stopPropagation(); handleSaveColor(hex, name); }}
                title="Save to Library"
            >
                {savedHex === hex ? '✓' : '♡'}
            </button>
        </div>
    );

    return (
        <div className="colors-tab fade-in">
            <div className="panel-sticky-header">
                <div className="stats-row">
                    <span>{data.uniqueColors} unique colors</span>
                    <button className="icon-btn" onClick={analyzeColors} title="Refresh">
                        ↻
                    </button>
                </div>
            </div>

            <div className="panel-scroll-content">
                {data.backgrounds.length > 0 && (
                    <div className="color-section">
                        <h3 className="section-title">Backgrounds</h3>
                        <div className="color-grid">
                            {data.backgrounds.map(hex => (
                                <ColorSwatch key={hex} hex={hex} name="Background" />
                            ))}
                        </div>
                    </div>
                )}

                {data.textColors.length > 0 && (
                    <div className="color-section">
                        <h3 className="section-title">Text Colors</h3>
                        <div className="color-grid">
                            {data.textColors.map(hex => (
                                <ColorSwatch key={hex} hex={hex} name="Text" />
                            ))}
                        </div>
                    </div>
                )}

                {data.accentColors.length > 0 && (
                    <div className="color-section">
                        <h3 className="section-title">Accents</h3>
                        <div className="color-grid">
                            {data.accentColors.map(hex => (
                                <ColorSwatch key={hex} hex={hex} name="Accent" />
                            ))}
                        </div>
                    </div>
                )}

                {data.contrastIssues.length > 0 && (
                    <div className="color-section">
                        <h3 className="section-title text-orange">Accessibility Issues ({data.contrastIssues.length})</h3>
                        <div className="contrast-list">
                            {data.contrastIssues.map((issue, i) => (
                                <div key={i} className="contrast-card">
                                    <div className="contrast-preview" style={{ backgroundColor: issue.bg, color: issue.fg }}>
                                        Aa
                                    </div>
                                    <div className="contrast-info">
                                        <div className="contrast-ratio"><span className="text-red">Fail</span> — Ratio: {issue.ratio}:1</div>
                                        <div className="contrast-hexes">{issue.fg} on {issue.bg}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="color-section">
                    <h3 className="section-title">Full Palette</h3>
                    <div className="palette-grid">
                        {data.palette.map(({ hex, count }) => (
                            <div
                                key={hex}
                                className="palette-swatch"
                                style={{ backgroundColor: hex }}
                                title={`${hex} (${count} uses)`}
                                onClick={() => handleCopy(hex)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
