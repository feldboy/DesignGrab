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
import { getAuthState } from '../lib/auth.js';

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

    // Check for openTab request from popup
    useEffect(() => {
        chrome.storage.local.get(['openTab'], (data) => {
            if (data.openTab) {
                setActiveTab(data.openTab);
                chrome.storage.local.remove(['openTab']);
            }
        });
    }, []);

    // Check license / sync plan from Supabase on mount
    useEffect(() => {
        getAuthState().then(({ plan }) => {
            // plan is synced to local storage inside getAuthState
            console.log('[DesignGrab] Plan:', plan);
        }).catch(() => {});
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
                    />
                )}
                {activeTab === 'library' && (
                    <LibraryTab />
                )}
                {activeTab === 'settings' && (
                    <SettingsTab />
                )}
            </div>
        </div>
    );
}

render(<App />, document.getElementById('app'));
