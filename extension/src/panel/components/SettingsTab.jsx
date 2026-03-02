import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getAuthState, signInWithGoogle, signOut } from '../../lib/auth.js';
import { getUsageSummary } from '../../lib/usageTracker.js';
import { startUpgrade } from '../../lib/billing.js';

export function SettingsTab() {
    const [loaded, setLoaded] = useState(false);

    // Auth state
    const [authState, setAuthState] = useState({ user: null, plan: 'free', isLoggedIn: false });
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    // Usage
    const [usage, setUsage] = useState(null);

    useEffect(() => {
        setLoaded(true);

        // Load auth state & usage
        getAuthState().then(setAuthState).catch(() => {});
        getUsageSummary().then(setUsage).catch(() => {});
    }, []);

    const handleGoogleSignIn = async () => {
        setAuthError('');
        setAuthLoading(true);
        const result = await signInWithGoogle();
        setAuthLoading(false);

        if (result.error) {
            setAuthError(result.error);
        } else {
            const state = await getAuthState();
            setAuthState(state);
            getUsageSummary().then(setUsage);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        setAuthState({ user: null, plan: 'free', isLoggedIn: false });
        getUsageSummary().then(setUsage);
    };

    const planLabels = { free: 'Free', pro: 'Pro', lifetime: 'Lifetime' };

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
                ) : (
                    <div>
                        <p className="settings-description">Sign in with Google to sync your library and unlock AI exports.</p>
                        {authError && <p className="settings-auth-error">{authError}</p>}
                        <button
                            className="panel-btn google-signin-btn"
                            onClick={handleGoogleSignIn}
                            disabled={authLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '10px 16px',
                                marginTop: '8px',
                                background: '#fff',
                                color: '#3c4043',
                                border: '1px solid #dadce0',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: authLoading ? 'wait' : 'pointer',
                                opacity: authLoading ? 0.7 : 1,
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
