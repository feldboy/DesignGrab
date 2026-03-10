/**
 * DesignGrab — Auth Module
 * Handles user authentication via Google Sign-In + Supabase.
 * Uses Supabase OAuth flow via chrome.identity.launchWebAuthFlow.
 */

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import storage from './storage.js';
import { syncPlanLimits } from './usageTracker.js';

const PROD_EXTENSION_ID = 'higkjddpoecdlhmecmadknihbnahjmib';
const IS_LOCAL_DEV = chrome.runtime.id !== PROD_EXTENSION_ID;

/**
 * Get current auth state
 */
export async function getAuthState() {
    const state = await storage.getState();

    if (IS_LOCAL_DEV) {
        await storage.set({ userId: 'local-dev-user', plan: 'lifetime' });
        return { user: { id: 'local-dev-user', email: 'local@dev.com', user_metadata: { full_name: 'Local Developer' } }, plan: 'lifetime', isLoggedIn: true, cloudEnabled: true };
    }

    if (!isSupabaseConfigured()) {
        return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
    }

    const supabase = await getSupabase();
    if (!supabase) {
        return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
    }

    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.warn('[DesignGrab] Session error:', sessionError.message);
        }

        if (session?.user) {
            const user = session.user;
            const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
            const plan = profile?.plan || state.plan;
            await storage.set({ userId: user.id, plan });
            syncPlanLimits(supabase).catch(() => { });
            return { user, plan, isLoggedIn: true, cloudEnabled: true };
        }
    } catch (err) {
        console.warn('[DesignGrab] Auth check failed:', err.message);
    }

    return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
}

/**
 * Sign in with Google via Supabase OAuth flow.
 *
 * Flow: Extension → Supabase /authorize → Google → Supabase /callback → Extension redirect URL
 * Supabase handles all the OAuth complexity. We just open the URL and capture the result.
 */
export async function signInWithGoogle() {
    // Persistent debug log — survives popup close
    const debugLog = [];
    const log = (msg) => {
        console.log('[DesignGrab Auth]', msg);
        debugLog.push(`${new Date().toISOString().slice(11, 23)} ${msg}`);
        chrome.storage.local.set({ _authDebug: debugLog.join('\n') });
    };

    log(`START | extId=${chrome.runtime.id} | IS_LOCAL_DEV=${IS_LOCAL_DEV}`);

    if (IS_LOCAL_DEV) {
        log('Local dev → fake user');
        await storage.set({ userId: 'local-dev-user', plan: 'lifetime' });
        return { user: { id: 'local-dev-user', email: 'local@dev.com', user_metadata: { full_name: 'Local Developer' } }, error: null };
    }

    const supabase = await getSupabase();
    if (!supabase) {
        log('ERROR: getSupabase() returned null');
        return { error: 'Cloud features not configured' };
    }
    log('Supabase client OK');

    try {
        const redirectURL = chrome.identity.getRedirectURL();
        log(`redirectURL: ${redirectURL}`);

        // Ask Supabase to generate the full OAuth URL
        // Supabase uses its own Google Client ID from the Dashboard config
        const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectURL,
                skipBrowserRedirect: true,
                queryParams: {
                    prompt: 'select_account',
                },
            },
        });

        if (oauthError || !oauthData?.url) {
            log(`ERROR signInWithOAuth: ${oauthError?.message || 'no URL returned'}`);
            return { error: oauthError?.message || 'Failed to generate auth URL' };
        }

        log(`Auth URL generated (${oauthData.url.length} chars)`);
        log('Opening launchWebAuthFlow...');

        // Open Supabase's auth URL in Chrome's managed auth window
        const responseURL = await new Promise((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                { url: oauthData.url, interactive: true },
                (callbackURL) => {
                    if (chrome.runtime.lastError) {
                        log(`ERROR launchWebAuthFlow: ${chrome.runtime.lastError.message}`);
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (!callbackURL) {
                        log('ERROR: callbackURL is empty/undefined');
                        reject(new Error('No callback URL received'));
                    } else {
                        log(`Callback received (${callbackURL.length} chars)`);
                        resolve(callbackURL);
                    }
                }
            );
        });

        // Try extracting tokens from the URL fragment (implicit flow)
        // Supabase returns: #access_token=...&refresh_token=...&token_type=bearer&...
        const hashIndex = responseURL.indexOf('#');
        if (hashIndex !== -1) {
            const hashStr = responseURL.substring(hashIndex + 1);
            const hashParams = new URLSearchParams(hashStr);
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            log(`Fragment tokens: access=${!!accessToken} refresh=${!!refreshToken}`);

            if (accessToken) {
                log('Setting Supabase session from tokens...');
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (sessionError) {
                    log(`ERROR setSession: ${sessionError.message}`);
                    return { error: 'Session error: ' + sessionError.message };
                }

                const user = sessionData?.user || sessionData?.session?.user;
                if (user) {
                    log(`SUCCESS: ${user.email}`);
                    await storage.set({ userId: user.id });
                    try {
                        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
                        if (profile?.plan) await storage.set({ plan: profile.plan });
                    } catch (e) {
                        log(`Profile fetch failed (non-fatal): ${e.message}`);
                    }
                    syncPlanLimits(supabase).catch(() => { });
                    return { user, error: null };
                }
                log('ERROR: setSession succeeded but no user object');
            }
        }

        // Try extracting code from query string (PKCE flow)
        const url = new URL(responseURL.split('#')[0]);
        const code = url.searchParams.get('code');
        if (code) {
            log(`Got auth code, exchanging for session...`);
            const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
            if (sessionError) {
                log(`ERROR exchangeCodeForSession: ${sessionError.message}`);
                return { error: 'Code exchange error: ' + sessionError.message };
            }
            const user = sessionData?.user || sessionData?.session?.user;
            if (user) {
                log(`SUCCESS (PKCE): ${user.email}`);
                await storage.set({ userId: user.id });
                return { user, error: null };
            }
        }

        // Check for error in callback
        const errorParam = new URL(responseURL.replace('#', '?')).searchParams.get('error');
        const errorDesc = new URL(responseURL.replace('#', '?')).searchParams.get('error_description');
        if (errorParam) {
            log(`ERROR from callback: ${errorParam} - ${errorDesc}`);
            return { error: `Auth error: ${errorParam} - ${errorDesc}` };
        }

        log(`ERROR: Could not extract tokens or code from callback. URL starts with: ${responseURL.substring(0, 100)}`);
        return { error: 'No tokens received from auth flow' };
    } catch (err) {
        log(`EXCEPTION: ${err.message}`);
        return { error: err.message };
    }
}

/**
 * Sign out — clears Supabase session
 */
export async function signOut() {
    if (IS_LOCAL_DEV) {
        await storage.set({ userId: null, plan: 'free', usage: null });
        return { error: null };
    }

    const supabase = await getSupabase();
    if (supabase) {
        await supabase.auth.signOut();
    }
    await storage.set({ userId: null, plan: 'free', usage: null });
    return { error: null };
}
