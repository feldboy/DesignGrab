/**
 * usageTracker.test.js — Unit tests for usage tracking and plan limit enforcement.
 *
 * NOTE: This project doesn't have a test runner set up yet.
 * To run these tests, install vitest:
 *   npm install -D vitest
 * Then add to package.json scripts:
 *   "test": "vitest --run"
 *
 * These tests mock chrome.storage and Supabase to test pure logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock storage module
vi.mock('./storage.js', () => {
  let store = {};
  return {
    default: {
      get: vi.fn(async (keys) => {
        const result = {};
        for (const k of keys) result[k] = store[k] ?? undefined;
        return result;
      }),
      set: vi.fn(async (obj) => { Object.assign(store, obj); }),
      getState: vi.fn(async () => ({
        userId: 'test-user',
        plan: 'free',
        usage: store.usage || { month: new Date().getMonth() + 1, year: new Date().getFullYear(), downloads: 0, codeExports: 0, designSystems: 0, aiExports: 0, pixelforgeAnalyses: 0 },
      })),
      _reset: () => { store = {}; },
    },
  };
});

// Mock supabase module
vi.mock('./supabase.js', () => ({
  getSupabase: vi.fn(async () => null),
}));

import { checkLimit, getUsage, getUsageSummary, getPlanLimits, DEFAULT_LIMITS } from './usageTracker.js';
import storage from './storage.js';

beforeEach(() => {
  vi.clearAllMocks();
  storage._reset();
});

describe('DEFAULT_LIMITS', () => {
  it('includes pixelforgeAnalyses for all plans', () => {
    expect(DEFAULT_LIMITS.free.pixelforgeAnalyses).toBe(1);
    expect(DEFAULT_LIMITS.pro.pixelforgeAnalyses).toBe(10);
    expect(DEFAULT_LIMITS.lifetime.pixelforgeAnalyses).toBe(10);
  });

  it('free plan has expected download and export limits', () => {
    expect(DEFAULT_LIMITS.free.downloads).toBe(15);
    expect(DEFAULT_LIMITS.free.codeExports).toBe(5);
    expect(DEFAULT_LIMITS.free.designSystems).toBe(3);
    expect(DEFAULT_LIMITS.free.aiExports).toBe(0);
  });

  it('pro plan has unlimited code exports and design systems', () => {
    expect(DEFAULT_LIMITS.pro.codeExports).toBe(-1);
    expect(DEFAULT_LIMITS.pro.designSystems).toBe(-1);
  });
});


describe('getPlanLimits', () => {
  it('returns default limits when no cached limits exist', async () => {
    const limits = await getPlanLimits('free');
    expect(limits).toEqual(DEFAULT_LIMITS.free);
  });

  it('falls back to free plan for unknown plan names', async () => {
    const limits = await getPlanLimits('unknown_plan');
    expect(limits).toEqual(DEFAULT_LIMITS.free);
  });
});

describe('getUsage', () => {
  it('returns fresh usage counters including pixelforgeAnalyses', async () => {
    const { usage } = await getUsage();
    expect(usage).toHaveProperty('pixelforgeAnalyses');
    expect(usage.pixelforgeAnalyses).toBe(0);
  });

  it('returns plan from storage state', async () => {
    const { plan } = await getUsage();
    expect(plan).toBe('free');
  });
});

describe('checkLimit', () => {
  it('returns requiresAuth when no userId', async () => {
    storage.getState.mockResolvedValueOnce({ userId: null, plan: 'free', usage: {} });
    const result = await checkLimit('download');
    expect(result.requiresAuth).toBe(true);
    expect(result.allowed).toBe(false);
  });

  it('allows download when under limit', async () => {
    const result = await checkLimit('download');
    expect(result.allowed).toBe(true);
    expect(result.current).toBe(0);
    expect(result.limit).toBe(15);
  });

  it('blocks ai_export on free plan (limit is 0)', async () => {
    const result = await checkLimit('ai_export');
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(0);
  });

  it('allows pixelforge_analysis when under free limit', async () => {
    const result = await checkLimit('pixelforge_analysis');
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(1);
    expect(result.isDaily).toBe(true);
  });

  it('returns isDaily false for non-daily actions', async () => {
    const result = await checkLimit('download');
    expect(result.isDaily).toBe(false);
  });
});

describe('getUsageSummary', () => {
  it('includes PixelForge Analyses in summary items', async () => {
    const summary = await getUsageSummary();
    const pf = summary.items.find(i => i.action === 'pixelforge_analysis');
    expect(pf).toBeDefined();
    expect(pf.label).toBe('PixelForge Analyses');
    expect(pf.limit).toBe(1);
    expect(pf.isDaily).toBe(true);
  });

  it('returns all 5 usage categories', async () => {
    const summary = await getUsageSummary();
    expect(summary.items).toHaveLength(5);
    const actions = summary.items.map(i => i.action);
    expect(actions).toEqual([
      'download', 'code_export', 'design_system', 'ai_export', 'pixelforge_analysis',
    ]);
  });
});
