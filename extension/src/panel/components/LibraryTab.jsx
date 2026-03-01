import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { copyToClipboard } from '../../lib/downloadUtils';
import { syncLibrary, removeRemoteItem, pushItem } from '../../lib/librarySync';

export function LibraryTab() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');
    const [copiedId, setCopiedId] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    const loadLibrary = () => {
        chrome.storage.local.get(['library'], (data) => {
            setItems(data.library || []);
        });
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const result = await syncLibrary();
            if (result.pulled > 0 || result.pushed > 0) {
                loadLibrary();
                setSyncResult(`Synced: ${result.pulled} pulled, ${result.pushed} pushed`);
            } else if (result.merged > 0) {
                setSyncResult('Already in sync');
            } else {
                setSyncResult('Sign in to sync');
            }
        } catch {
            setSyncResult('Sync failed');
        }
        setSyncing(false);
        setTimeout(() => setSyncResult(null), 3000);
    };

    useEffect(() => {
        loadLibrary();
        // Auto-sync on mount for logged-in users
        handleSync();
        // Listen for library updates from other tabs
        const listener = (changes) => {
            if (changes.library) loadLibrary();
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    const removeItem = (id) => {
        const updated = items.filter(i => i.id !== id);
        chrome.storage.local.set({ library: updated });
        setItems(updated);
        removeRemoteItem(id);
    };

    const handleCopy = (item) => {
        let text = '';
        if (item.type === 'color') text = item.data.hex;
        else if (item.type === 'font') text = item.data.family;
        else if (item.type === 'svg') text = item.data.code;
        else if (item.type === 'image') text = item.data.src;

        copyToClipboard(text);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);
    const counts = {
        all: items.length,
        color: items.filter(i => i.type === 'color').length,
        font: items.filter(i => i.type === 'font').length,
        svg: items.filter(i => i.type === 'svg').length,
        image: items.filter(i => i.type === 'image').length,
    };

    if (items.length === 0) {
        return (
            <div className="library-empty fade-in">
                <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M12 8h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" stroke="#3f3f46" stroke-width="2" />
                        <path d="M16 20h16M16 28h10" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
                        <circle cx="34" cy="34" r="8" fill="#0a0a12" stroke="#6366f1" stroke-width="2" />
                        <path d="M31 34h6M34 31v6" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
                <h3 className="empty-title">Your Library is Empty</h3>
                <p className="empty-text">Save colors, fonts, and assets from any website. They'll appear here.</p>
            </div>
        );
    }

    return (
        <div className="library-tab fade-in">
            <div className="panel-sticky-header">
                <div className="stats-row">
                    <span>{items.length} saved items</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {syncResult && <span style={{ fontSize: '11px', color: '#a1a1aa' }}>{syncResult}</span>}
                        <button
                            className="icon-btn"
                            onClick={handleSync}
                            disabled={syncing}
                            title="Sync with cloud"
                            style={{ opacity: syncing ? 0.5 : 1 }}
                        >
                            {syncing ? '⟳' : '☁'}
                        </button>
                    </div>
                </div>
                <div className="library-filters">
                    {['all', 'color', 'font', 'svg', 'image'].map(f => (
                        counts[f] > 0 || f === 'all' ? (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}s ({counts[f]})
                            </button>
                        ) : null
                    ))}
                </div>
            </div>

            <div className="panel-scroll-content">
                <div className="library-grid">
                    {filtered.map(item => (
                        <div key={item.id} className="library-card">
                            {/* Preview */}
                            <div className="library-preview">
                                {item.type === 'color' && (
                                    <div className="library-color-swatch" style={{ backgroundColor: item.data.hex }} />
                                )}
                                {item.type === 'font' && (
                                    <div className="library-font-preview" style={{ fontFamily: item.data.family }}>
                                        Aa
                                    </div>
                                )}
                                {item.type === 'svg' && item.data.code && (
                                    <div className="library-svg-preview" dangerouslySetInnerHTML={{ __html: item.data.code }} />
                                )}
                                {item.type === 'image' && (
                                    <img src={item.data.src} alt="" loading="lazy" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="library-item-info">
                                <span className="library-item-name">{item.name || item.data.hex || item.data.family || 'Asset'}</span>
                                <span className="library-item-type">{item.type}</span>
                                {item.sourceUrl && (
                                    <span className="library-item-source" title={item.sourceUrl}>
                                        {new URL(item.sourceUrl).hostname}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="library-item-actions">
                                <button
                                    className="asset-btn copy"
                                    onClick={() => handleCopy(item)}
                                    title="Copy"
                                >
                                    {copiedId === item.id ? '✓' : '📋'}
                                </button>
                                <button
                                    className="asset-btn remove"
                                    onClick={() => removeItem(item.id)}
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Save an item to the library (used by other tabs)
 */
export function saveToLibrary(item) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['library'], (data) => {
            const library = data.library || [];
            // Deduplicate by checking type + key data
            const exists = library.some(existing => {
                if (existing.type !== item.type) return false;
                if (item.type === 'color') return existing.data.hex === item.data.hex;
                if (item.type === 'font') return existing.data.family === item.data.family;
                if (item.type === 'svg') return existing.data.code === item.data.code;
                if (item.type === 'image') return existing.data.src === item.data.src;
                return false;
            });

            if (exists) {
                resolve({ saved: false, reason: 'duplicate' });
                return;
            }

            const newItem = {
                id: `lib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                type: item.type,
                name: item.name || '',
                data: item.data,
                sourceUrl: item.sourceUrl || '',
                savedAt: new Date().toISOString(),
            };

            library.unshift(newItem);
            chrome.storage.local.set({ library }, () => {
                // Push to cloud in background for logged-in users
                pushItem(newItem).catch(() => {});
                resolve({ saved: true, item: newItem });
            });
        });
    });
}
