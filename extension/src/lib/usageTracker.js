/**
 * DesignGrab — Usage Tracker
 * Tracks monthly feature usage and enforces plan limits.
 * Fetches limits from Supabase plans table (editable in Dashboard).
 * Falls back to hardcoded defaults when offline.
 */

import storage from './storage.js';
import { getSupabase } from './supabase.js';

// Fallback limits (used when Supabase is unavailable)
const DEFAULT_LIMITS = {
    free:     { downloads: 15, codeExports: 5,  designSystems: 3,  aiExports: 0, pixelforgeAnalyses: 1 },
    pro:      { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50, pixelforgeAnalyses: 10 },
    lifetime: { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50, pixelforgeAnalyses: 10 },
};

/**
 * Get the active limits for a plan.
 * Uses cached Supabase limits if available, otherwise falls back to defaults.
 */
async function getLimitsForPlan(plan) {
    const cached = await storage.get(['planLimits']);
    if (cached.planLimits && cached.planLimits[plan]) {
        // Merge with defaults to cover newly added fields (e.g. pixelforgeAnalyses)
        return { ...(DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.free), ...cached.planLimits[plan] };
    }
    return DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.free;
}

/**
 * Sync plan limits from Supabase plans table.
 * Call this on login and periodically to pick up Dashboard changes.
 */
async function syncPlanLimits(supabase) {
    try {
        const { data: plans, error } = await supabase
            .from('plans')
            .select('id, downloads_limit, code_exports_limit, design_systems_limit, ai_exports_limit, pixelforge_analyses_limit')
            .eq('is_active', true);

        if (error || !plans) return;

        const limitsMap = {};
        for (const p of plans) {
            limitsMap[p.id] = {
                downloads: p.downloads_limit,
                codeExports: p.code_exports_limit,
                designSystems: p.design_systems_limit,
                aiExports: p.ai_exports_limit,
                pixelforgeAnalyses: p.pixelforge_analyses_limit ?? 0,
            };
        }
        await storage.set({ planLimits: limitsMap });
    } catch (e) {
        // Offline or plans table doesn't exist yet — use defaults
        console.warn('[DesignGrab] Could not sync plan limits:', e.message);
    }
}

const ACTION_MAP = {
    download: 'downloads',
    code_export: 'codeExports',
    design_system: 'designSystems',
    ai_export: 'aiExports',
    pixelforge_analysis: 'pixelforgeAnalyses',
};

/**
 * Fetch real usage counts from Supabase usage_logs for the current month.
 * Returns null if user is not logged in or Supabase is unavailable.
 */
async function getUsageFromSupabase() {
    const state = await storage.getState();
    if (!state.userId) return null;

    const supabase = await getSupabase();
    if (!supabase) return null;

    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data, error } = await supabase
            .from('usage_logs')
            .select('action')
            .eq('user_id', state.userId)
            .gte('created_at', monthStart);

        if (error) {
            console.warn('[DesignGrab] Supabase usage fetch error:', error.message);
            return null;
        }

        const counts = {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            downloads: 0,
            codeExports: 0,
            designSystems: 0,
            aiExports: 0,
            pixelforgeAnalyses: 0,
        };

        for (const row of data) {
            const field = ACTION_MAP[row.action];
            if (field) counts[field]++;
        }

        await storage.set({ usage: counts });
        return counts;
    } catch (e) {
        console.warn('[DesignGrab] Failed to fetch usage from Supabase:', e.message);
        return null;
    }
}

/**
 * Get current usage, fetching from Supabase when logged in.
 * Falls back to local storage when offline.
 */
async function getUsage() {
    // Try Supabase first for real per-user data
    const supabaseUsage = await getUsageFromSupabase();
    if (supabaseUsage) {
        const state = await storage.getState();
        return { usage: supabaseUsage, plan: state.plan };
    }

    // Fall back to local storage (offline)
    const state = await storage.getState();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (state.usage.month !== currentMonth || state.usage.year !== currentYear) {
        const fresh = {
            month: currentMonth,
            year: currentYear,
            downloads: 0,
            codeExports: 0,
            designSystems: 0,
            aiExports: 0,
            pixelforgeAnalyses: 0,
        };
        await storage.set({ usage: fresh });
        return { usage: fresh, plan: state.plan };
    }

    return { usage: state.usage, plan: state.plan };
}

/**
 * Check if an action is allowed under the current plan.
 * Requires user to be signed in.
 * @param {string} action - 'download' | 'code_export' | 'design_system' | 'ai_export'
 * @returns {{ allowed: boolean, current: number, limit: number, plan: string, requiresAuth?: boolean }}
 */
async function checkLimit(action) {
    const state = await storage.getState();
    if (!state.userId) {
        return { allowed: false, current: 0, limit: 0, plan: 'free', requiresAuth: true };
    }

    const { usage, plan } = await getUsage();
    const limits = await getLimitsForPlan(plan);
    const field = ACTION_MAP[action];
    const limit = limits[field] ?? 0;
    const current = usage[field] || 0;

    // -1 means unlimited
    const allowed = limit === -1 || current < limit;

    return { allowed, current, limit, plan };
}

/**
 * Record a usage event to Supabase and local cache. Returns false if limit exceeded or not signed in.
 * @param {string} action - 'download' | 'code_export' | 'design_system' | 'ai_export'
 * @returns {{ allowed: boolean, current: number, limit: number, plan: string, requiresAuth?: boolean }}
 */
async function recordUsage(action) {
    const check = await checkLimit(action);
    if (!check.allowed) return check;

    const state = await storage.getState();
    const field = ACTION_MAP[action];

    // Write to Supabase
    if (state.userId) {
        const supabase = await getSupabase();
        if (supabase) {
            try {
                await supabase.from('usage_logs').insert({
                    user_id: state.userId,
                    action,
                });
            } catch (e) {
                console.warn('[DesignGrab] Failed to log usage to Supabase:', e.message);
            }
        }
    }

    // Update local cache
    const newCount = check.current + 1;
    const usage = (await storage.get(['usage'])).usage || {};
    usage[field] = newCount;
    await storage.set({ usage });

    return {
        allowed: true,
        current: newCount,
        limit: check.limit,
        plan: check.plan,
    };
}

/**
 * Get full usage summary for display
 */
async function getUsageSummary() {
    const { usage, plan } = await getUsage();
    const limits = await getLimitsForPlan(plan);

    return {
        plan,
        month: usage.month,
        year: usage.year,
        items: [
            {
                label: 'Downloads',
                action: 'download',
                current: usage.downloads,
                limit: limits.downloads,
                unlimited: limits.downloads === -1,
            },
            {
                label: 'Code Exports',
                action: 'code_export',
                current: usage.codeExports,
                limit: limits.codeExports,
                unlimited: limits.codeExports === -1,
            },
            {
                label: 'Design Systems',
                action: 'design_system',
                current: usage.designSystems,
                limit: limits.designSystems,
                unlimited: limits.designSystems === -1,
            },
            {
                label: 'AI Exports',
                action: 'ai_export',
                current: usage.aiExports,
                limit: limits.aiExports,
                unlimited: limits.aiExports === -1,
            },
        ],
    };
}

/**
 * Get plan limits for display
 */
async function getPlanLimits(plan) {
    return await getLimitsForPlan(plan);
}

export { checkLimit, recordUsage, getUsage, getUsageSummary, getPlanLimits, syncPlanLimits, DEFAULT_LIMITS };
