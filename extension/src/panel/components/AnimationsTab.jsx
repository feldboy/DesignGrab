import { h } from 'preact';
import { useState } from 'preact/hooks';
import { copyToClipboard } from '../../lib/downloadUtils';

export function AnimationsTab({ assets, onExtract }) {
    const [copiedId, setCopiedId] = useState(null);
    const [filter, setFilter] = useState('all');

    const lotties = assets?.lotties || [];
    const animations = assets?.animations || [];
    const keyframes = animations.filter(a => a.type === 'keyframe');
    const transitions = animations.filter(a => a.type === 'transition');
    const scrollAnims = animations.filter(a => a.type === 'scroll-library');

    const total = lotties.length + animations.length;

    const handleCopy = (text, id) => {
        copyToClipboard(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleCopyAll = () => {
        const parts = [];
        if ((filter === 'all' || filter === 'lottie') && lotties.length > 0) {
            parts.push('/* Lottie / Rive Animations */');
            lotties.forEach(l => parts.push(l.src));
        }
        if ((filter === 'all' || filter === 'keyframe') && keyframes.length > 0) {
            parts.push('/* CSS Keyframe Animations */');
            keyframes.forEach(a => { if (a.keyframeCSS) parts.push(a.keyframeCSS); });
        }
        if ((filter === 'all' || filter === 'scroll') && scrollAnims.length > 0) {
            parts.push('/* Scroll-Triggered Animations */');
            scrollAnims.forEach(a => parts.push(`/* ${a.name} (${a.library}) on ${a.element} */`));
        }
        if ((filter === 'all' || filter === 'transition') && transitions.length > 0) {
            parts.push('/* CSS Transitions */');
            transitions.forEach(a => parts.push(`transition: ${a.transition};`));
        }
        handleCopy(parts.join('\n\n'), 'copy-all');
    };

    const handleDownloadLottie = (lottie) => {
        chrome.runtime.sendMessage({
            type: 'DOWNLOAD_FILE',
            payload: { url: lottie.src, filename: `${lottie.name || 'animation'}.json` }
        });
    };

    if (!assets) {
        return (
            <div className="code-empty-state fade-in">
                <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="18" stroke="#3f3f46" stroke-width="2" stroke-dasharray="4 4" />
                        <path d="M18 24l4 4 8-8" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <p className="empty-text">Extract assets first to detect Lottie animations, CSS keyframes, and scroll-triggered effects.</p>
                <button className="empty-btn" onClick={onExtract}>Scan Page</button>
            </div>
        );
    }

    if (total === 0) {
        return (
            <div className="code-empty-state fade-in">
                <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="18" stroke="#3f3f46" stroke-width="2" />
                        <path d="M20 20l8 8M28 20l-8 8" stroke="#52525b" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
                <p className="empty-text">No animations detected on this page.</p>
                <button className="panel-btn outline" onClick={onExtract}>Re-scan</button>
            </div>
        );
    }

    return (
        <div className="animations-tab fade-in">
            <div className="panel-sticky-header">
                <div className="stats-row">
                    <span>{total} animations found</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button className="panel-btn outline small" onClick={handleCopyAll}>
                            {copiedId === 'copy-all' ? '✓ Copied' : 'Copy All'}
                        </button>
                        <button className="icon-btn" onClick={onExtract} title="Re-scan">&#x21bb;</button>
                    </div>
                </div>
                <div className="assets-filters">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        All ({total})
                    </button>
                    {lotties.length > 0 && (
                        <button className={`filter-btn ${filter === 'lottie' ? 'active' : ''}`} onClick={() => setFilter('lottie')}>
                            Lottie ({lotties.length})
                        </button>
                    )}
                    {keyframes.length > 0 && (
                        <button className={`filter-btn ${filter === 'keyframe' ? 'active' : ''}`} onClick={() => setFilter('keyframe')}>
                            Keyframes ({keyframes.length})
                        </button>
                    )}
                    {scrollAnims.length > 0 && (
                        <button className={`filter-btn ${filter === 'scroll' ? 'active' : ''}`} onClick={() => setFilter('scroll')}>
                            Scroll ({scrollAnims.length})
                        </button>
                    )}
                    {transitions.length > 0 && (
                        <button className={`filter-btn ${filter === 'transition' ? 'active' : ''}`} onClick={() => setFilter('transition')}>
                            Transitions ({transitions.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="panel-scroll-content">
                {/* Lottie Animations */}
                {(filter === 'all' || filter === 'lottie') && lotties.length > 0 && (
                    <div className="anim-section">
                        {filter === 'all' && <h3 className="section-title">Lottie / Rive Animations</h3>}
                        <div className="anim-list">
                            {lotties.map((lottie, i) => (
                                <div key={`l-${i}`} className="anim-card">
                                    <div className="anim-card-header">
                                        <span className="anim-card-name">{lottie.name}</span>
                                        <span className="anim-card-badge lottie">{lottie.playerType}</span>
                                    </div>
                                    <div className="anim-card-meta">
                                        {lottie.width > 0 && <span>{lottie.width}x{lottie.height}</span>}
                                        {lottie.loop && <span>Loop</span>}
                                        {lottie.autoplay && <span>Autoplay</span>}
                                    </div>
                                    <div className="anim-card-url" title={lottie.src}>
                                        {lottie.src}
                                    </div>
                                    <div className="anim-card-actions">
                                        <button className="asset-btn download" onClick={() => handleDownloadLottie(lottie)}>
                                            Download JSON
                                        </button>
                                        <button className="asset-btn copy" onClick={() => handleCopy(lottie.src, `lottie-${i}`)}>
                                            {copiedId === `lottie-${i}` ? '✓ Copied' : 'Copy URL'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CSS Keyframe Animations */}
                {(filter === 'all' || filter === 'keyframe') && keyframes.length > 0 && (
                    <div className="anim-section">
                        {filter === 'all' && <h3 className="section-title">CSS Keyframe Animations</h3>}
                        <div className="anim-list">
                            {keyframes.map((anim, i) => (
                                <div key={`k-${i}`} className="anim-card">
                                    <div className="anim-card-header">
                                        <span className="anim-card-name">{anim.name}</span>
                                        <span className="anim-card-badge keyframe">@keyframes</span>
                                    </div>
                                    <div className="anim-card-meta">
                                        <span>{anim.duration}</span>
                                        <span>{anim.timingFunction}</span>
                                        {anim.iterationCount === 'infinite' && <span>Infinite</span>}
                                        {anim.delay !== '0s' && <span>Delay: {anim.delay}</span>}
                                    </div>
                                    <div className="anim-card-element">On: <code>{anim.element}</code></div>
                                    {anim.keyframeCSS && (
                                        <div className="anim-card-code">
                                            <pre className="code-content"><code>{anim.keyframeCSS}</code></pre>
                                            <button
                                                className="anim-copy-btn"
                                                onClick={() => handleCopy(anim.keyframeCSS, `kf-${i}`)}
                                            >
                                                {copiedId === `kf-${i}` ? '✓' : 'Copy'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Scroll-Triggered Animations */}
                {(filter === 'all' || filter === 'scroll') && scrollAnims.length > 0 && (
                    <div className="anim-section">
                        {filter === 'all' && <h3 className="section-title">Scroll-Triggered Animations</h3>}
                        <div className="anim-list">
                            {scrollAnims.map((anim, i) => (
                                <div key={`s-${i}`} className="anim-card">
                                    <div className="anim-card-header">
                                        <span className="anim-card-name">{anim.name}</span>
                                        <span className="anim-card-badge scroll">{anim.library}</span>
                                    </div>
                                    <div className="anim-card-meta">
                                        {anim.duration && <span>{anim.duration}ms</span>}
                                        {anim.delay && <span>Delay: {anim.delay}ms</span>}
                                    </div>
                                    <div className="anim-card-element">On: <code>{anim.element}</code></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transitions */}
                {(filter === 'all' || filter === 'transition') && transitions.length > 0 && (
                    <div className="anim-section">
                        {filter === 'all' && <h3 className="section-title">CSS Transitions</h3>}
                        <div className="anim-list">
                            {transitions.map((anim, i) => {
                                const fullCSS = [
                                    `transition-property: ${anim.transitionProperty || 'all'};`,
                                    `transition-duration: ${anim.transitionDuration || '0s'};`,
                                    `transition-timing-function: ${anim.transitionTimingFunction || 'ease'};`,
                                    `transition-delay: ${anim.transitionDelay || '0s'};`,
                                ].join('\n');
                                const shorthand = `transition: ${anim.transition};`;
                                return (
                                    <div key={`t-${i}`} className="anim-card">
                                        <div className="anim-card-header">
                                            <span className="anim-card-name">transition</span>
                                            <span className="anim-card-badge transition">CSS</span>
                                        </div>
                                        <div className="anim-card-meta">
                                            <span>{anim.transitionProperty || 'all'}</span>
                                            <span>{anim.transitionDuration || '0s'}</span>
                                            <span>{anim.transitionTimingFunction || 'ease'}</span>
                                            {anim.transitionDelay && anim.transitionDelay !== '0s' && (
                                                <span>Delay: {anim.transitionDelay}</span>
                                            )}
                                        </div>
                                        <div className="anim-card-element">On: <code>{anim.element}</code></div>
                                        <div className="anim-card-code">
                                            <pre className="code-content"><code>{fullCSS}</code></pre>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    className="anim-copy-btn"
                                                    onClick={() => handleCopy(fullCSS, `tr-full-${i}`)}
                                                >
                                                    {copiedId === `tr-full-${i}` ? '✓' : 'Copy'}
                                                </button>
                                                <button
                                                    className="anim-copy-btn"
                                                    onClick={() => handleCopy(shorthand, `tr-short-${i}`)}
                                                >
                                                    {copiedId === `tr-short-${i}` ? '✓' : 'Shorthand'}
                                                </button>
                                            </div>
                                        </div>
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
