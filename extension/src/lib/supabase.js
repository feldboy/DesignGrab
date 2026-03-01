/**
 * DesignGrab — Supabase Client
 * Initialize Supabase with Chrome extension storage adapter.
 *
 * To activate: replace the placeholder values below with your Supabase project credentials.
 * You can also set them via chrome.storage.sync under the key 'supabaseConfig'.
 */

// Placeholder — replace with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://lgueqndrxxkcssjclyxp.supabase.co';
const SUPABASE_ANON_KEY = '***REMOVED_SUPABASE_ANON_KEY***';

let supabaseClient = null;

/**
 * Check if Supabase is configured (not using placeholder values)
 */
export function isSupabaseConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

/**
 * Get or create the Supabase client.
 * Returns null if @supabase/supabase-js is not installed or not configured.
 */
export async function getSupabase() {
    if (!isSupabaseConfigured()) return null;
    if (supabaseClient) return supabaseClient;

    try {
        const { createClient } = await import('@supabase/supabase-js');

        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                storage: {
                    getItem: (key) => new Promise((resolve) => {
                        chrome.storage.local.get([key], (data) => resolve(data[key] || null));
                    }),
                    setItem: (key, value) => new Promise((resolve) => {
                        chrome.storage.local.set({ [key]: value }, resolve);
                    }),
                    removeItem: (key) => new Promise((resolve) => {
                        chrome.storage.local.remove([key], resolve);
                    }),
                },
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
            },
        });

        return supabaseClient;
    } catch (err) {
        console.warn('[DesignGrab] Supabase not available:', err.message);
        return null;
    }
}
