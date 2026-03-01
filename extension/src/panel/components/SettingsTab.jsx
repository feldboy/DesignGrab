import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getAuthState, signIn, signUp, signOut } from '../../lib/auth.js';
import { getUsageSummary } from '../../lib/usageTracker.js';
import { startUpgrade } from '../../lib/billing.js';

export function SettingsTab() {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Auth state
    const [authState, setAuthState] = useState({ user: null, plan: 'free', isLoggedIn: false });
    const [authMode, setAuthMode] = useState(null); // null | 'signin' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // Usage
    const [usage, setUsage] = useState(null);

    useEffect(() => {
        // Load API key
        chrome.storage.local.get(['anthropic_api_key'], (data) => {
            if (data.anthropic_api_key) setApiKey(data.anthropic_api_key);
            setLoaded(true);
        });

        // Load auth state & usage
        getAuthState().then(setAuthState).catch(() => {});
        getUsageSummary().then(setUsage).catch(() => {});
    }, []);

    const handleSaveKey = () => {
        const trimmed = apiKey.trim();
        if (trimmed) {
            chrome.storage.local.set({ anthropic_api_key: trimmed });
        } else {
            chrome.storage.local.remove(['anthropic_api_key']);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClearKey = () => {
        setApiKey('');
        chrome.storage.local.remove(['anthropic_api_key']);
        setSaved(false);
    };

    const handleAuth = async () => {
        setAuthError('');
        setAuthLoading(true);
        const fn = authMode === 'signup' ? signUp : signIn;
        const result = await fn(email, password);
        setAuthLoading(false);

        if (result.error) {
            setAuthError(result.error);
        } else {
            setAuthMode(null);
            setEmail('');
            setPassword('');
            const state = await getAuthState();
            setAuthState(state);
            getUsageSummary().then(setUsage);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        setAuthState({ user: null, plan: 'free', isLoggedIn: false });
    };

    const maskedKey = apiKey
        ? apiKey.slice(0, 7) + '\u2022'.repeat(Math.max(0, apiKey.length - 11)) + apiKey.slice(-4)
        : '';

    const planLabels = { free: 'Free', starter: 'Starter', pro: 'Pro', lifetime: 'Lifetime' };

    if (!loaded) return null;

    return (
        <div className="settings-tab fade-in">
            {/* Account Section */}
            <div className="settings-section">
                <h3 className="settings-heading">Account</h3>
                {authState.isLoggedIn ? (
                    <div className="settings-account">
                        <div className="settings-account-row">
                            <span className="settings-account-email">{authState.user?.email}</span>
                            <span className={`settings-plan-badge ${authState.plan}`}>{planLabels[authState.plan] || 'Free'}</span>
                        </div>
                        {authState.plan === 'free' && (
                            <button className="panel-btn primary" style={{ marginTop: '8px' }} onClick={() => startUpgrade('pro')}>
                                Upgrade to Pro
                            </button>
                        )}
                        <button className="panel-btn outline" style={{ marginTop: '8px' }} onClick={handleSignOut}>
                            Sign Out
                        </button>
                    </div>
                ) : authMode ? (
                    <div className="settings-auth-form">
                        <input
                            type="email"
                            className="settings-input"
                            placeholder="Email"
                            value={email}
                            onInput={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            className="settings-input"
                            placeholder="Password"
                            value={password}
                            onInput={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                        />
                        {authError && <p className="settings-auth-error">{authError}</p>}
                        <div className="settings-actions">
                            <button className="panel-btn primary" onClick={handleAuth} disabled={authLoading}>
                                {authLoading ? 'Loading...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                            </button>
                            <button className="panel-btn outline" onClick={() => { setAuthMode(null); setAuthError(''); }}>
                                Cancel
                            </button>
                        </div>
                        <p className="settings-auth-toggle">
                            {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                            <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }}>
                                {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                            </a>
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="settings-description">Sign in to sync your library across devices and manage your subscription.</p>
                        <div className="settings-actions">
                            <button className="panel-btn primary" onClick={() => setAuthMode('signin')}>Sign In</button>
                            <button className="panel-btn outline" onClick={() => setAuthMode('signup')}>Create Account</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Usage Section */}
            {usage && (
                <div className="settings-section">
                    <h3 className="settings-heading">Usage This Month</h3>
                    <div className="settings-usage-grid">
                        {usage.items.map((item) => (
                            <div key={item.action} className="settings-usage-item">
                                <div className="settings-usage-label">{item.label}</div>
                                <div className="settings-usage-bar">
                                    <div
                                        className="settings-usage-fill"
                                        style={{
                                            width: item.unlimited ? '10%' : `${Math.min(100, (item.current / item.limit) * 100)}%`,
                                            background: item.unlimited || item.current < item.limit * 0.8 ? '#6366f1' : '#f87171',
                                        }}
                                    />
                                </div>
                                <div className="settings-usage-count">
                                    {item.current} / {item.unlimited ? '\u221E' : item.limit}
                                </div>
                            </div>
                        ))}
                    </div>
                    {usage.plan === 'free' && (
                        <button className="panel-btn primary" style={{ marginTop: '12px', width: '100%' }} onClick={() => startUpgrade('pro')}>
                            Upgrade for More
                        </button>
                    )}
                </div>
            )}

            {/* AI Export Section */}
            <div className="settings-section">
                <h3 className="settings-heading">AI Export</h3>
                <p className="settings-description">
                    Enter your Anthropic API key to enable AI-powered React and Vue component generation.
                    Your key is stored locally and never sent to any server except Anthropic's API.
                </p>

                <label className="settings-label">Anthropic API Key</label>
                <div className="settings-key-row">
                    <input
                        type={showKey ? 'text' : 'password'}
                        className="settings-input"
                        placeholder="sk-ant-..."
                        value={showKey ? apiKey : (apiKey ? maskedKey : '')}
                        onInput={(e) => {
                            setShowKey(true);
                            setApiKey(e.target.value);
                            setSaved(false);
                        }}
                        onFocus={() => {
                            if (apiKey && !showKey) setShowKey(true);
                        }}
                    />
                    <button
                        className="settings-toggle-btn"
                        onClick={() => setShowKey(!showKey)}
                        title={showKey ? 'Hide key' : 'Show key'}
                    >
                        {showKey ? '\uD83D\uDE48' : '\uD83D\uDC41'}
                    </button>
                </div>

                <div className="settings-actions">
                    <button className="panel-btn primary" onClick={handleSaveKey}>
                        {saved ? 'Saved!' : 'Save Key'}
                    </button>
                    {apiKey && (
                        <button className="panel-btn outline" onClick={handleClearKey}>
                            Clear
                        </button>
                    )}
                </div>

                <a
                    className="settings-link"
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Get an API key at console.anthropic.com &rarr;
                </a>
            </div>

            {/* About */}
            <div className="settings-section">
                <h3 className="settings-heading">About</h3>
                <p className="settings-description">
                    DesignGrab v1.0.0 — Inspect, extract, and export design tokens from any website.
                </p>
                <div className="settings-about-links">
                    <a href="https://designgrab.app" target="_blank" rel="noopener noreferrer" className="settings-link">Website</a>
                    <a href="https://designgrab.app/privacy" target="_blank" rel="noopener noreferrer" className="settings-link">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
