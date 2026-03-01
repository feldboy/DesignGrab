/**
 * DesignGrab — Usage Tracker
 * Tracks monthly feature usage and enforces plan limits.
 * Local-first: works without Supabase, syncs when available.
 */

import storage from './storage.js';

const LIMITS = {
    free:     { downloads: 15, codeExports: 5,  designSystems: 3,  aiExports: 0 },
    starter:  { downloads: 150, codeExports: 30, designSystems: 20, aiExports: 0 },
    pro:      { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50 },
    lifetime: { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50 },
};

const ACTION_MAP = {
    download: 'downloads',
    code_export: 'codeExports',
    design_system: 'designSystems',
    ai_export: 'aiExports',
};

/**
 * Get current usage, resetting if month changed
 */
async function getUsage() {
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
        };
        await storage.set({ usage: fresh });
        return { usage: fresh, plan: state.plan };
    }

    return { usage: state.usage, plan: state.plan };
}

/**
 * Check if an action is allowed under the current plan
 * @param {string} action - 'download' | 'code_export' | 'design_system' | 'ai_export'
 * @returns {{ allowed: boolean, current: number, limit: number, plan: string }}
 */
async function checkLimit(action) {
    const { usage, plan } = await getUsage();
    const field = ACTION_MAP[action];
    const limit = LIMITS[plan]?.[field] ?? 0;
    const current = usage[field] || 0;

    // -1 means unlimited
    const allowed = limit === -1 || current < limit;

    return { allowed, current, limit, plan };
}

/**
 * Record a usage event. Returns false if limit exceeded.
 * @param {string} action - 'download' | 'code_export' | 'design_system' | 'ai_export'
 * @returns {{ allowed: boolean, current: number, limit: number, plan: string }}
 */
async function recordUsage(action) {
    const check = await checkLimit(action);
    if (!check.allowed) return check;

    const { usage } = await getUsage();
    const field = ACTION_MAP[action];
    usage[field] = (usage[field] || 0) + 1;
    await storage.set({ usage });

    return {
        allowed: true,
        current: usage[field],
        limit: check.limit,
        plan: check.plan,
    };
}

/**
 * Get full usage summary for display
 */
async function getUsageSummary() {
    const { usage, plan } = await getUsage();
    const limits = LIMITS[plan] || LIMITS.free;

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
function getPlanLimits(plan) {
    return LIMITS[plan] || LIMITS.free;
}

export { checkLimit, recordUsage, getUsage, getUsageSummary, getPlanLimits, LIMITS };
