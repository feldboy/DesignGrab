/**
 * DesignGrab — Library Cloud Sync
 * Syncs saved library items to/from Supabase for logged-in users.
 * Local-first: works offline, merges on sync.
 */

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import storage from './storage.js';

/**
 * Push a single item to Supabase saved_items
 * @param {object} item - { id, type, name, data, sourceUrl, savedAt }
 * @returns {boolean} success
 */
export async function pushItem(item) {
    if (!isSupabaseConfigured()) return false;

    const supabase = await getSupabase();
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
        const { error } = await supabase.from('saved_items').upsert({
            id: item.id,
            user_id: user.id,
            type: item.type,
            name: item.name || '',
            data: item.data,
            source_url: item.sourceUrl || '',
            created_at: item.savedAt || new Date().toISOString(),
        }, { onConflict: 'id' });

        if (error) {
            console.warn('[DesignGrab] Sync push error:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('[DesignGrab] Sync push failed:', err.message);
        return false;
    }
}

/**
 * Remove an item from Supabase
 * @param {string} itemId
 */
export async function removeRemoteItem(itemId) {
    if (!isSupabaseConfigured()) return false;

    const supabase = await getSupabase();
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
        await supabase.from('saved_items')
            .delete()
            .eq('id', itemId)
            .eq('user_id', user.id);
        return true;
    } catch {
        return false;
    }
}

/**
 * Pull all items from Supabase and merge with local library.
 * Uses "last write wins" by savedAt/created_at timestamp.
 * @returns {{ merged: number, pulled: number, pushed: number }}
 */
export async function syncLibrary() {
    if (!isSupabaseConfigured()) return { merged: 0, pulled: 0, pushed: 0 };

    const supabase = await getSupabase();
    if (!supabase) return { merged: 0, pulled: 0, pushed: 0 };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { merged: 0, pulled: 0, pushed: 0 };

    try {
        // Fetch remote items
        const { data: remoteItems, error } = await supabase
            .from('saved_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('[DesignGrab] Sync pull error:', error.message);
            return { merged: 0, pulled: 0, pushed: 0 };
        }

        // Get local items
        const storeData = await storage.get(['library']);
        const localItems = storeData.library || [];

        // Build maps by id
        const localMap = new Map(localItems.map(i => [i.id, i]));
        const remoteMap = new Map((remoteItems || []).map(r => [r.id, r]));

        let pulled = 0;
        let pushed = 0;

        // Merge: add remote items that don't exist locally
        for (const remote of (remoteItems || [])) {
            if (!localMap.has(remote.id)) {
                localItems.unshift({
                    id: remote.id,
                    type: remote.type,
                    name: remote.name,
                    data: remote.data,
                    sourceUrl: remote.source_url,
                    savedAt: remote.created_at,
                });
                pulled++;
            }
        }

        // Push: send local items that don't exist remotely
        const toPush = localItems.filter(l => !remoteMap.has(l.id));
        for (const item of toPush) {
            const ok = await pushItem(item);
            if (ok) pushed++;
        }

        // Save merged library locally
        await storage.set({ library: localItems });

        // Store last sync time
        await storage.set({ lastLibrarySync: new Date().toISOString() });

        return { merged: localItems.length, pulled, pushed };
    } catch (err) {
        console.warn('[DesignGrab] Sync failed:', err.message);
        return { merged: 0, pulled: 0, pushed: 0 };
    }
}
