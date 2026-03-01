/**
 * DesignGrab — Auth Module
 * Handles user authentication via Supabase.
 * Falls back gracefully to local-only mode if Supabase is not configured.
 */

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import storage from './storage.js';

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
            // Fetch profile/plan from Supabase
            const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
            const plan = profile?.plan || state.plan;
            await storage.set({ userId: user.id, plan });
            return { user, plan, isLoggedIn: true, cloudEnabled: true };
        }
    } catch (err) {
        console.warn('[DesignGrab] Auth check failed:', err.message);
    }

    return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
}

/**
 * Sign up with email/password
 */
export async function signUp(email, password) {
    const supabase = await getSupabase();
    if (!supabase) return { error: 'Cloud features not configured' };

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
        await storage.set({ userId: data.user.id });
    }

    return { user: data.user, error: null };
}

/**
 * Sign in with email/password
 */
export async function signIn(email, password) {
    const supabase = await getSupabase();
    if (!supabase) return { error: 'Cloud features not configured' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
        await storage.set({ userId: data.user.id });
        // Fetch plan
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', data.user.id).single();
        if (profile?.plan) await storage.set({ plan: profile.plan });
    }

    return { user: data.user, error: null };
}

/**
 * Sign out
 */
export async function signOut() {
    const supabase = await getSupabase();
    if (supabase) {
        await supabase.auth.signOut();
    }
    await storage.set({ userId: null });
    return { error: null };
}
