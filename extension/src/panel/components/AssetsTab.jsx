import { useState } from 'preact/hooks';
import { saveToLibrary } from './LibraryTab.jsx';
import { checkLimit, recordUsage } from '../../lib/usageTracker.js';
import { startUpgrade } from '../../lib/billing.js';

/**
 * Assets Tab — displays extracted images and SVGs
 */
export function AssetsTab({ assets, onExtract }) {
    const [filter, setFilter] = useState('all');
    const [copiedId, setCopiedId] = useState(null);
    const [savedId, setSavedId] = useState(null);

    const handleSaveAsset = (item, index) => {
        const saveData = item._type === 'svg'
            ? { type: 'svg', name: item.id || `SVG ${index + 1}`, data: { code: item.code, viewBox: item.viewBox } }
            : { type: 'image', name: getFilename(item.src, item._type), data: { src: item.src, width: item.width, height: item.height } };

        saveToLibrary({ ...saveData, sourceUrl: item.src || '' }).then(res => {
            if (res.saved) {
                setSavedId(`save-${index}`);
                setTimeout(() => setSavedId(null), 1500);
            }
        });
    };

    if (!assets) {
        return (
            <div class="assets-empty">
                <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect x="6" y="6" width="16" height="16" rx="3" stroke="#3f3f46" stroke-width="2" />
                        <rect x="26" y="6" width="16" height="16" rx="3" stroke="#3f3f46" stroke-width="2" />
                        <rect x="6" y="26" width="16" height="16" rx="3" stroke="#3f3f46" stroke-width="2" />
                        <rect x="26" y="26" width="16" height="16" rx="3" stroke="#6366f1" stroke-width="2" />
                        <path d="M30 32L34 36L38 30" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
                <h3 class="empty-title">No assets extracted</h3>
                <p class="empty-text">Click "Extract Assets" to scan the current page for images, SVGs, and videos.</p>
                <button class="empty-btn" onClick={onExtract}>
                    🖼 Extract Assets
                </button>
            </div>
        );
    }

    const allImages = assets.images || [];
    const allSvgs = assets.svgs || [];
    const allVideos = assets.videos || [];
    const total = allImages.length + allSvgs.length + allVideos.length;

    const filteredItems = filter === 'all'
        ? [...allImages.map(i => ({ ...i, _type: 'image' })), ...allSvgs.map(s => ({ ...s, _type: 'svg' })), ...allVideos.map(v => ({ ...v, _type: 'video' }))]
        : filter === 'images' ? allImages.map(i => ({ ...i, _type: 'image' }))
            : filter === 'svgs' ? allSvgs.map(s => ({ ...s, _type: 'svg' }))
                : allVideos.map(v => ({ ...v, _type: 'video' }));

    const [downloadBlock, setDownloadBlock] = useState(null);

    const handleDownload = async (item) => {
        const limit = await checkLimit('download');
        if (!limit.allowed) {
            setDownloadBlock(limit);
            return;
        }
        setDownloadBlock(null);

        if (item._type === 'svg' && item.code) {
            const blob = new Blob([item.code], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            chrome.runtime.sendMessage({
                type: 'DOWNLOAD_FILE',
                payload: { url, filename: `${item.id || 'icon'}.svg` }
            });
            URL.revokeObjectURL(url);
        } else if (item.src) {
            const filename = getFilename(item.src, item._type);
            chrome.runtime.sendMessage({
                type: 'DOWNLOAD_FILE',
                payload: { url: item.src, filename }
            });
        }
        await recordUsage('download');
    };

    const handleCopySVG = (svg, index) => {
        navigator.clipboard.writeText(svg.code).then(() => {
            setCopiedId(`svg-${index}`);
            setTimeout(() => setCopiedId(null), 1500);
        });
    };

    return (
        <div class="assets-content">
            {/* Stats bar */}
            <div class="assets-stats">
                <span class="stats-total">{total} assets found</span>
                <button class="refresh-btn" onClick={onExtract} title="Re-scan page">
                    🔄
                </button>
            </div>

            {/* Filter tabs */}
            <div class="assets-filters">
                <button class={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All ({total})
                </button>
                <button class={`filter-btn ${filter === 'images' ? 'active' : ''}`} onClick={() => setFilter('images')}>
                    Images ({allImages.length})
                </button>
                <button class={`filter-btn ${filter === 'svgs' ? 'active' : ''}`} onClick={() => setFilter('svgs')}>
                    SVGs ({allSvgs.length})
                </button>
                {allVideos.length > 0 && (
                    <button class={`filter-btn ${filter === 'videos' ? 'active' : ''}`} onClick={() => setFilter('videos')}>
                        Videos ({allVideos.length})
                    </button>
                )}
            </div>

            {downloadBlock && (
                <div class="usage-limit-banner">
                    <div class="usage-limit-text">
                        You've used <strong>{downloadBlock.current}/{downloadBlock.limit}</strong> free downloads this month
                    </div>
                    <button class="upgrade-btn" onClick={() => startUpgrade('pro')}>
                        Upgrade to Pro
                    </button>
                </div>
            )}

            {/* Asset grid */}
            <div class="assets-grid">
                {filteredItems.map((item, i) => (
                    <div class="asset-card" key={i}>
                        {/* Preview */}
                        <div class="asset-preview">
                            {item._type === 'image' && (
                                <img src={item.src} alt={item.alt || ''} loading="lazy" />
                            )}
                            {item._type === 'svg' && item.code && (
                                <div class="svg-preview" dangerouslySetInnerHTML={{ __html: item.code }} />
                            )}
                            {item._type === 'svg' && !item.code && item.src && (
                                <img src={item.src} alt="" loading="lazy" />
                            )}
                            {item._type === 'video' && (
                                <div class="video-preview">
                                    {item.poster ? <img src={item.poster} alt="" /> : <span class="video-icon">🎬</span>}
                                </div>
                            )}
                            <span class="asset-type-badge">{item._type.toUpperCase()}</span>
                        </div>

                        {/* Info */}
                        <div class="asset-info">
                            {item.width > 0 && item.height > 0 && (
                                <span class="asset-dims">{item.width}×{item.height}</span>
                            )}
                            {item.format && item.format !== 'unknown' && (
                                <span class="asset-format">{item.format}</span>
                            )}
                            {item.size && item.size !== '—' && (
                                <span class="asset-size">{item.size}</span>
                            )}
                            <span class="asset-location">{item.location}</span>
                        </div>

                        {/* Actions */}
                        <div class="asset-actions">
                            <button class="asset-btn download" onClick={() => handleDownload(item)} title="Download">
                                ⬇
                            </button>
                            {item._type === 'svg' && item.code && (
                                <button
                                    class="asset-btn copy"
                                    onClick={() => handleCopySVG(item, i)}
                                    title="Copy SVG code"
                                >
                                    {copiedId === `svg-${i}` ? '✓' : '📋'}
                                </button>
                            )}
                            <button
                                class="asset-btn save"
                                onClick={() => handleSaveAsset(item, i)}
                                title="Save to Library"
                            >
                                {savedId === `save-${i}` ? '✓' : '♡'}
                            </button>
                            {item.src && (
                                <button
                                    class="asset-btn open"
                                    onClick={() => window.open(item.src, '_blank')}
                                    title="Open in new tab"
                                >
                                    ↗
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div class="assets-no-results">
                    <p>No {filter} found on this page.</p>
                </div>
            )}
        </div>
    );
}

function getFilename(url, type) {
    try {
        const pathname = new URL(url).pathname;
        const parts = pathname.split('/');
        const name = parts[parts.length - 1];
        return name || `asset.${type === 'image' ? 'png' : type}`;
    } catch {
        return `asset.${type === 'image' ? 'png' : type}`;
    }
}
