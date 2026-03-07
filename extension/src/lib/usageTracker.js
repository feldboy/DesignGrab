/**
 * DesignGrab — Usage Tracker
 * Tracks monthly feature usage and enforces plan limits.
 * Fetches limits from Supabase plans table (editable in Dashboard).
 * Falls back to hardcoded defaults when offline.
 */

import storage from './storage.js';
import { getSupabase } from './supabase.js';

// Fallback limits (used when Supabase is unavailable)
// PixelForge limits are PER DAY, everything else is per month
const DEFAULT_LIMITS = {
    free:     { downloads: 15, codeExports: 5,  designSystems: 3,  aiExports: 0, pixelforgeAnalyses: 1 },
    pro:      { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50, pixelforgeAnalyses: 10 },
    lifetime: { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50, pixelforgeAnalyses: 10 },
};

// Actions that use daily limits instead of monthly
const DAILY_LIMIT_ACTIONS = new Set(['pixelforge_analysis']);

/**
 * Get the active limits for a plan.
 * Merges cached Supabase limits with defaults so new fields (like pixelforgeAnalyses)
 * always have a value even if the cache is stale.
 */
async function getLimitsForPlan(plan) {
    const defaults = DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.free;
    const cached = await storage.get(['planLimits']);
    if (cached.planLimits && cached.planLimits[plan]) {
        return { ...defaults, ...cached.planLimits[plan] };
    }
    return defaults;
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
                pixelforgeAnalyses: p.pixelforge_analyses_limit,
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
 * Get today's usage count for a specific action from Supabase.
 * Used for daily-limited actions like pixelforge_analysis.
 */
async function getDailyUsageFromSupabase(action) {
    const state = await storage.getState();
    if (!state.userId) return null;

    const supabase = await getSupabase();
    if (!supabase) return null;

    try {
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        const { data, error } = await supabase
            .from('usage_logs')
            .select('id')
            .eq('user_id', state.userId)
            .eq('action', action)
            .gte('created_at', dayStart);

        if (error) {
            console.warn('[DesignGrab] Daily usage fetch error:', error.message);
            return null;
        }

        return data ? data.length : 0;
    } catch (e) {
        console.warn('[DesignGrab] Failed to fetch daily usage:', e.message);
        return null;
    }
}

/**
 * Get today's usage count from local storage for daily-limited actions.
 * Falls back when Supabase is unavailable.
 */
async function getDailyUsageLocal(action) {
    const field = ACTION_MAP[action];
    const cached = await storage.get(['dailyUsage']);
    const daily = cached.dailyUsage || {};
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    // Reset if it's a new day
    if (daily.day !== todayKey) {
        return 0;
    }
    return daily[field] || 0;
}

/**
 * Increment daily usage in local storage.
 */
async function incrementDailyUsageLocal(action) {
    const field = ACTION_MAP[action];
    const cached = await storage.get(['dailyUsage']);
    const daily = cached.dailyUsage || {};
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    // Reset if new day
    if (daily.day !== todayKey) {
        const fresh = { day: todayKey, [field]: 1 };
        await storage.set({ dailyUsage: fresh });
        return;
    }

    daily[field] = (daily[field] || 0) + 1;
    await storage.set({ dailyUsage: daily });
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
 * Daily-limited actions (pixelforge_analysis) check today's count instead of monthly.
 * @param {string} action - 'download' | 'code_export' | 'design_system' | 'ai_export' | 'pixelforge_analysis'
 * @returns {{ allowed: boolean, current: number, limit: number, plan: string, requiresAuth?: boolean, isDaily?: boolean }}
 */
async function checkLimit(action) {
    const state = await storage.getState();
    if (!state.userId) {
        return { allowed: false, current: 0, limit: 0, plan: 'free', requiresAuth: true };
    }

    const { plan } = await getUsage();
    const limits = await getLimitsForPlan(plan);
    const field = ACTION_MAP[action];
    const limit = limits[field] ?? 0;
    const isDaily = DAILY_LIMIT_ACTIONS.has(action);

    let current;
    if (isDaily) {
        // Try Supabase first, fall back to local
        const supabaseCount = await getDailyUsageFromSupabase(action);
        current = supabaseCount !== null ? supabaseCount : await getDailyUsageLocal(action);
    } else {
        const { usage } = await getUsage();
        current = usage[field] || 0;
    }

    // -1 means unlimited
    const allowed = limit === -1 || current < limit;

    return { allowed, current, limit, plan, isDaily };
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
    usage[field] = (usage[field] || 0) + 1;
    await storage.set({ usage });

    // Also update daily local cache for daily-limited actions
    if (DAILY_LIMIT_ACTIONS.has(action)) {
        await incrementDailyUsageLocal(action);
    }

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

    // Get daily count for PixelForge
    const pfDaily = await getDailyUsageFromSupabase('pixelforge_analysis');
    const pfCurrent = pfDaily !== null ? pfDaily : await getDailyUsageLocal('pixelforge_analysis');

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
            {
                label: 'PixelForge Analyses',
                action: 'pixelforge_analysis',
                current: pfCurrent,
                limit: limits.pixelforgeAnalyses,
                unlimited: limits.pixelforgeAnalyses === -1,
                isDaily: true,
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
