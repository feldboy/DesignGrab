import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { copyToClipboard } from '../../lib/downloadUtils';

export function LayoutTab({ pinnedElement }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const analyzeLayout = () => {
        setIsLoading(true);
        setError(null);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'ANALYZE_LAYOUT' }, (response) => {
                setIsLoading(false);
                if (chrome.runtime.lastError) {
                    setError('Could not connect to page. Try pinning an element first.');
                } else if (response && response.success) {
                    setData(response.data);
                } else {
                    setError(response?.error || 'Failed to analyze layout.');
                }
            });
        });
    };

    useEffect(() => {
        if (pinnedElement) {
            analyzeLayout();
        }
    }, [pinnedElement]);

    const handleCopy = (text) => {
        copyToClipboard(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="panel-loading">
                <div className="spinner"></div>
                <p>Analyzing structure...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel-error">
                <p>{error}</p>
                <button className="panel-btn" onClick={analyzeLayout}>Retry</button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="code-empty-state">
                <div className="empty-icon">⬚</div>
                <p className="empty-text">Pin an element to reverse-engineer its Flex/Grid layout DNA.</p>
                <button className="panel-btn" onClick={analyzeLayout}>Analyze Current Page</button>
            </div>
        );
    }

    return (
        <div className="layout-tab fade-in">
            <div className="panel-sticky-header">
                <div className="stats-row">
                    <span>Layout DNA Analyzer</span>
                    <button className="icon-btn" onClick={analyzeLayout} title="Refresh">
                        ↻
                    </button>
                </div>
            </div>

            <div className="panel-scroll-content">
                <div className="layout-summary">
                    <div className="layout-badge">
                        Root: {data.tree?.type.toUpperCase() || 'BLOCK'}
                    </div>
                    <div className="layout-desc">
                        {data.tree?.type === 'flex' ? `Flex ${data.tree?.direction || 'row'} • ${data.tree?.align || ''} • ${data.tree?.justify || ''}` : ''}
                        {data.tree?.type === 'grid' ? `Grid ${data.tree?.columns ? 'columns' : 'rows'} • gap: ${data.tree?.gap || '0'}` : ''}
                    </div>
                </div>

                <div className="code-block-wrapper mt-3">
                    <div className="code-header">
                        <span>Tailwind Structural HTML</span>
                        <button onClick={() => handleCopy(data.structuralHTML)}>{copied ? 'Copied!' : 'Copy'}</button>
                    </div>
                    <pre className="code-content"><code>{data.structuralHTML}</code></pre>
                </div>

                <div className="code-block-wrapper mt-3">
                    <div className="code-header">
                        <span>ASCII Layout Tree</span>
                        <button onClick={() => handleCopy(data.ascii)}>Copy</button>
                    </div>
                    <pre className="code-content ascii-tree"><code>{data.ascii}</code></pre>
                </div>
            </div>
        </div>
    );
}
