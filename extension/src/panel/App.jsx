import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { InspectorTab } from './components/InspectorTab.jsx';
import { AssetsTab } from './components/AssetsTab.jsx';
import { ColorsTab } from './components/ColorsTab.jsx';
import { FontsTab } from './components/FontsTab.jsx';
import { CodeTab } from './components/CodeTab.jsx';
import { LayoutTab } from './components/LayoutTab.jsx';
import { LibraryTab } from './components/LibraryTab.jsx';
import { AnimationsTab } from './components/AnimationsTab.jsx';
import { SettingsTab } from './components/SettingsTab.jsx';
import { getAuthState, signInWithGoogle } from '../lib/auth.js';

const TABS = [
    { id: 'figma', label: 'Figma', icon: '🎯', highlight: true },
    { id: 'inspector', label: 'Inspector', icon: '🔍' },
    { id: 'assets', label: 'Assets', icon: '🖼' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'fonts', label: 'Fonts', icon: '🔤' },
    { id: 'code', label: 'Code', icon: '⟨/⟩' },
    { id: 'layout', label: 'Layout', icon: '⊞' },
    { id: 'anims', label: 'Anims', icon: '✦' },
    { id: 'library', label: 'Library', icon: '♡' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
];

function App() {
    const [activeTab, setActiveTab] = useState('figma');
    const [pinnedElement, setPinnedElement] = useState(null);
    const [assets, setAssets] = useState(null);
    const [isInspecting, setIsInspecting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    // Check for openTab request from popup
    useEffect(() => {
        chrome.storage.local.get(['openTab'], (data) => {
            if (data.openTab) {
                setActiveTab(data.openTab);
                chrome.storage.local.remove(['openTab']);
            }
        });
    }, []);

    // Check auth state on mount
    useEffect(() => {
        getAuthState().then(({ plan, isLoggedIn: loggedIn }) => {
            setIsLoggedIn(loggedIn);
            setAuthChecked(true);
            console.log('[DesignGrab] Plan:', plan);
        }).catch(() => { setAuthChecked(true); });
    }, []);

    // Listen for auth changes via storage
    useEffect(() => {
        const listener = (changes) => {
            if (changes.userId) {
                getAuthState().then(({ isLoggedIn: loggedIn }) => {
                    setIsLoggedIn(loggedIn);
                }).catch(() => {});
            }
        };
        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    useEffect(() => {
        // Listen for messages from content script via background
        const handleMessage = (message) => {
            const { type, payload } = message;
            switch (type) {
                case 'ELEMENT_PINNED':
                    setPinnedElement(payload);
                    setActiveTab('inspector');
                    break;
                case 'INSPECT_MODE_CHANGED':
                    setIsInspecting(payload.active);
                    break;
                case 'ASSETS_EXTRACTED':
                    setAssets(payload);
                    setActiveTab('assets');
                    break;
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        // Check for stored assets from popup
        chrome.storage.local.get(['lastExtractedAssets'], (data) => {
            if (data.lastExtractedAssets) {
                setAssets(data.lastExtractedAssets);
                chrome.storage.local.remove(['lastExtractedAssets']);
            }
        });

        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    const handleStartInspect = () => {
        chrome.runtime.sendMessage({ type: 'START_INSPECT' }, (res) => {
            if (res?.active) setIsInspecting(true);
        });
    };

    const handleStopInspect = () => {
        chrome.runtime.sendMessage({ type: 'STOP_INSPECT' }, (res) => {
            setIsInspecting(false);
        });
    };

    const handleExtractAssets = () => {
        chrome.runtime.sendMessage({ type: 'EXTRACT_ASSETS' }, (res) => {
            if (res?.success) {
                setAssets(res.assets);
                setActiveTab('assets');
            }
        });
    };

    const handleSignIn = async () => {
        setAuthLoading(true);
        const result = await signInWithGoogle();
        setAuthLoading(false);
        if (!result.error) {
            const state = await getAuthState();
            setIsLoggedIn(state.isLoggedIn);
        }
    };

    // Show auth wall for non-settings tabs when not logged in
    const requiresAuth = !isLoggedIn && activeTab !== 'settings';

    return (
        <div class="panel">
            {/* Header */}
            <div class="panel-header">
                <div class="panel-logo">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect width="20" height="20" rx="5" fill="url(#grad)" />
                        <path d="M6 7L10 10L6 13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <line x1="11" y1="13" x2="15" y2="13" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                        <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="20" y2="20">
                                <stop stop-color="#6366f1" />
                                <stop offset="1" stop-color="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span class="panel-title">DesignGrab</span>
                </div>
                <div class="panel-actions">
                    <button
                        class={`panel-inspect-btn ${isInspecting ? 'active' : ''}`}
                        onClick={isInspecting ? handleStopInspect : handleStartInspect}
                    >
                        {isInspecting ? '⬛ Stop' : '🔍 Inspect'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div class="panel-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        class={`panel-tab ${activeTab === tab.id ? 'active' : ''} ${tab.highlight ? 'figma-tab' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.label}
                    >
                        <span class="tab-icon">{tab.icon}</span>
                        <span class="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div class="panel-content">
                {requiresAuth ? (
                    <div className="auth-wall fade-in">
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', height: '100%', padding: '32px 24px', textAlign: 'center'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '16px', opacity: 0.6 }}>
                                <rect x="12" y="20" width="24" height="20" rx="3" stroke="#6366f1" stroke-width="2" />
                                <path d="M18 20V14C18 10.686 20.686 8 24 8C27.314 8 30 10.686 30 14V20" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
                                <circle cx="24" cy="30" r="2" fill="#6366f1" />
                            </svg>
                            <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Sign in to continue
                            </h3>
                            <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Sign in with Google to use DesignGrab features and track your usage.
                            </p>
                            <button
                                className="panel-btn google-signin-btn"
                                onClick={handleSignIn}
                                disabled={authLoading}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '8px', width: '100%', maxWidth: '260px', padding: '10px 16px',
                                    background: '#fff', color: '#3c4043', border: '1px solid #dadce0',
                                    borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                                    cursor: authLoading ? 'wait' : 'pointer', opacity: authLoading ? 0.7 : 1,
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                {authLoading ? 'Signing in...' : 'Sign in with Google'}
                            </button>
                            <button
                                className="panel-btn outline"
                                onClick={() => setActiveTab('settings')}
                                style={{ marginTop: '8px', maxWidth: '260px', width: '100%' }}
                            >
                                Go to Settings
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'figma' && (
                            <CodeTab pinnedElement={pinnedElement} initialMode="figma" />
                        )}
                        {activeTab === 'inspector' && (
                            <InspectorTab
                                element={pinnedElement}
                                isInspecting={isInspecting}
                                onStartInspect={handleStartInspect}
                            />
                        )}
                        {activeTab === 'assets' && (
                            <AssetsTab
                                assets={assets}
                                onExtract={handleExtractAssets}
                            />
                        )}
                        {activeTab === 'colors' && (
                            <ColorsTab />
                        )}
                        {activeTab === 'fonts' && (
                            <FontsTab />
                        )}
                        {activeTab === 'layout' && (
                            <LayoutTab pinnedElement={pinnedElement} />
                        )}
                        {activeTab === 'code' && (
                            <CodeTab pinnedElement={pinnedElement} />
                        )}
                        {activeTab === 'anims' && (
                            <AnimationsTab
                                assets={assets}
                                onExtract={handleExtractAssets}
                                pinnedElement={pinnedElement}
                                onStartInspect={handleStartInspect}
                            />
                        )}
                        {activeTab === 'library' && (
                            <LibraryTab />
                        )}
                        {activeTab === 'settings' && (
                            <SettingsTab />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

render(<App />, document.getElementById('app'));
