import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { saveToLibrary } from './LibraryTab.jsx';

export function FontsTab() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedFont, setSavedFont] = useState(null);

    const analyzeFonts = () => {
        setIsLoading(true);
        setError(null);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'ANALYZE_FONTS' }, (response) => {
                setIsLoading(false);
                if (chrome.runtime.lastError) {
                    setError('Could not connect to page. Try refreshing.');
                } else if (response && response.success) {
                    setData(response.data);
                } else {
                    setError(response?.error || 'Failed to analyze fonts.');
                }
            });
        });
    };

    useEffect(() => {
        analyzeFonts();
    }, []);

    if (isLoading) {
        return (
            <div className="panel-loading">
                <div className="spinner"></div>
                <p>Scanning typography...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel-error">
                <p>{error}</p>
                <button className="panel-btn" onClick={analyzeFonts}>Retry</button>
            </div>
        );
    }

    const handleSaveFont = (font) => {
        saveToLibrary({
            type: 'font',
            name: font.family,
            data: { family: font.family, weights: font.weights, source: font.source },
            sourceUrl: '',
        }).then(res => {
            if (res.saved) {
                setSavedFont(font.family);
                setTimeout(() => setSavedFont(null), 1500);
            }
        });
    };

    if (!data) return null;

    return (
        <div className="fonts-tab fade-in">
            <div className="panel-sticky-header">
                <div className="stats-row">
                    <span>{data.fonts.length} font families detected</span>
                    <button className="icon-btn" onClick={analyzeFonts} title="Refresh">
                        ↻
                    </button>
                </div>
            </div>

            <div className="panel-scroll-content">
                <div className="font-section">
                    <h3 className="section-title">Font Families</h3>
                    <div className="font-list">
                        {data.fonts.map((font, i) => (
                            <div key={i} className="font-card">
                                <div className="font-header">
                                    <span className="font-name" style={{ fontFamily: font.family }}>{font.family}</span>
                                    <div className="font-header-actions">
                                        <span className={`font-badge tag-${font.source}`}>{font.source}</span>
                                        <button
                                            className="save-btn"
                                            onClick={() => handleSaveFont(font)}
                                            title="Save to Library"
                                        >
                                            {savedFont === font.family ? '✓' : '♡'}
                                        </button>
                                    </div>
                                </div>

                                <div className="font-metrics">
                                    <div className="metric-group">
                                        <span className="metric-label">Weights</span>
                                        <span className="metric-value">{font.weights.join(', ')}</span>
                                    </div>
                                    <div className="metric-group">
                                        <span className="metric-label">Usage</span>
                                        <span className="metric-value">
                                            {[
                                                font.usage.headings && 'Headings',
                                                font.usage.body && 'Body',
                                                font.usage.code && 'Code'
                                            ].filter(Boolean).join(', ') || 'Various'} ({font.usage.count} elements)
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="font-preview-text"
                                    style={{
                                        fontFamily: font.family,
                                        fontWeight: font.weights.includes(400) ? 400 : font.weights[0]
                                    }}
                                >
                                    The quick brown fox jumps over the lazy dog
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {Object.keys(data.fontScale).length > 0 && (
                    <div className="font-section">
                        <h3 className="section-title">Typography Scale</h3>
                        <div className="scale-list">
                            {['h1', 'h2', 'h3', 'h4', 'body', 'small', 'code'].map(tag => {
                                if (!data.fontScale[tag]) return null;
                                const [size, weight] = data.fontScale[tag].split(' / ');
                                return (
                                    <div key={tag} className="scale-row">
                                        <span className="scale-tag">{tag}</span>
                                        <span className="scale-size">{size}</span>
                                        <span className="scale-weight">{weight}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
