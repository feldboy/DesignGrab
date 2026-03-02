/**
 * DesignGrab — Auth Module
 * Handles user authentication via Google Sign-In + Supabase.
 * Uses chrome.identity.launchWebAuthFlow for OAuth.
 */

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import storage from './storage.js';
import { syncPlanLimits } from './usageTracker.js';

const GOOGLE_CLIENT_ID = '783180663354-idjnv92nubl3e1dbe5ufm7jq8ll6m1pd.apps.googleusercontent.com';

/**
 * Get current auth state
 * @returns {{ user: object|null, plan: string, isLoggedIn: boolean, cloudEnabled: boolean }}
 */
export async function getAuthState() {
    const state = await storage.getState();

    if (!isSupabaseConfigured()) {
        return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
    }

    const supabase = await getSupabase();
    if (!supabase) {
        return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
            const plan = profile?.plan || state.plan;
            await storage.set({ userId: user.id, plan });
            // Sync plan limits from Supabase (picks up Dashboard changes)
            syncPlanLimits(supabase).catch(() => {});
            return { user, plan, isLoggedIn: true, cloudEnabled: true };
        }
    } catch (err) {
        console.warn('[DesignGrab] Auth check failed:', err.message);
    }

    return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
}

/**
 * Sign in with Google using chrome.identity.launchWebAuthFlow
 * This opens a Google sign-in popup and returns an ID token
 * which we use to authenticate with Supabase.
 */
export async function signInWithGoogle() {
    const supabase = await getSupabase();
    if (!supabase) return { error: 'Cloud features not configured' };

    try {
        const redirectURL = chrome.identity.getRedirectURL();

        // Generate nonce: Supabase gets the raw nonce, Google gets the SHA-256 hash
        // Supabase hashes the raw nonce and compares it to the one in the id_token
        const rawNonce = crypto.randomUUID();
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawNonce));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedNonce = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Build Google OAuth URL requesting an id_token
        const authURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authURL.searchParams.set('client_id', GOOGLE_CLIENT_ID);
        authURL.searchParams.set('response_type', 'id_token token');
        authURL.searchParams.set('redirect_uri', redirectURL);
        authURL.searchParams.set('scope', 'openid email profile');
        authURL.searchParams.set('nonce', hashedNonce);
        authURL.searchParams.set('prompt', 'select_account');

        // Launch the auth flow — opens Google sign-in popup
        const responseURL = await new Promise((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                { url: authURL.toString(), interactive: true },
                (callbackURL) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(callbackURL);
                    }
                }
            );
        });

        // Extract tokens from the callback URL fragment
        const urlFragment = new URL(responseURL.replace('#', '?'));
        const idToken = urlFragment.searchParams.get('id_token');
        const accessToken = urlFragment.searchParams.get('access_token');

        if (!idToken) {
            return { error: 'No ID token received from Google' };
        }

        // Sign in to Supabase with the Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
            nonce: rawNonce,
            access_token: accessToken,
        });

        if (error) {
            return { error: error.message };
        }

        if (data?.user) {
            await storage.set({ userId: data.user.id });
            const { data: profile } = await supabase.from('profiles').select('plan').eq('id', data.user.id).single();
            if (profile?.plan) await storage.set({ plan: profile.plan });
            // Sync plan limits from Supabase on fresh login
            syncPlanLimits(supabase).catch(() => {});
        }

        return { user: data?.user, error: null };
    } catch (err) {
        return { error: err.message };
    }
}

/**
 * Sign out — clears Supabase session
 */
export async function signOut() {
    const supabase = await getSupabase();
    if (supabase) {
        await supabase.auth.signOut();
    }
    await storage.set({ userId: null, plan: 'free' });
    return { error: null };
}
