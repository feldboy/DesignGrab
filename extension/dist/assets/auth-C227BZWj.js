import { _ as __vitePreload } from "./preload-helper-CyNIpbXk.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env-BLrtva26.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let supabaseClient = null;
async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  try {
    const { createClient } = await __vitePreload(async () => {
      const { createClient: createClient2 } = await import("./index-BFhGuIUI.js");
      return { createClient: createClient2 };
    }, true ? [] : void 0, import.meta.url);
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
          })
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    return supabaseClient;
  } catch (err) {
    console.warn("[DesignGrab] Supabase not available:", err.message);
    return null;
  }
}
const storage = {
  /**
   * Get values from chrome.storage.local
   */
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  },
  /**
   * Set values in chrome.storage.local
   */
  async set(items) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, resolve);
    });
  },
  /**
   * Remove keys from chrome.storage.local
   */
  async remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  },
  /**
   * Get values from chrome.storage.sync (for cross-device data)
   */
  async syncGet(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  },
  /**
   * Set values in chrome.storage.sync
   */
  async syncSet(items) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(items, resolve);
    });
  },
  /**
   * Get the full extension state
   */
  async getState() {
    const data = await storage.get(["usage", "plan", "userId", "library", "settings"]);
    return {
      usage: data.usage || {
        month: (/* @__PURE__ */ new Date()).getMonth() + 1,
        year: (/* @__PURE__ */ new Date()).getFullYear(),
        downloads: 0,
        codeExports: 0,
        designSystems: 0,
        aiExports: 0
      },
      plan: data.plan || "free",
      userId: data.userId || null,
      library: data.library || [],
      settings: data.settings || {
        theme: "dark",
        inspectOnHover: true,
        showTooltip: true
      }
    };
  }
};
const DEFAULT_LIMITS = {
  free: { downloads: 15, codeExports: 5, designSystems: 3, aiExports: 0, pixelforgeAnalyses: 1 },
  pro: { downloads: 2e3, codeExports: -1, designSystems: -1, aiExports: 50, pixelforgeAnalyses: 10 },
  lifetime: { downloads: 2e3, codeExports: -1, designSystems: -1, aiExports: 50, pixelforgeAnalyses: 10 }
};
const DAILY_LIMIT_ACTIONS = /* @__PURE__ */ new Set(["pixelforge_analysis"]);
async function getLimitsForPlan(plan) {
  const defaults = DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.free;
  const cached = await storage.get(["planLimits"]);
  if (cached.planLimits && cached.planLimits[plan]) {
    return { ...defaults, ...cached.planLimits[plan] };
  }
  return defaults;
}
async function syncPlanLimits(supabase) {
  try {
    const { data: plans, error } = await supabase.from("plans").select("id, downloads_limit, code_exports_limit, design_systems_limit, ai_exports_limit, pixelforge_analyses_limit").eq("is_active", true);
    if (error || !plans) return;
    const limitsMap = {};
    for (const p of plans) {
      limitsMap[p.id] = {
        downloads: p.downloads_limit,
        codeExports: p.code_exports_limit,
        designSystems: p.design_systems_limit,
        aiExports: p.ai_exports_limit,
        pixelforgeAnalyses: p.pixelforge_analyses_limit
      };
    }
    await storage.set({ planLimits: limitsMap });
  } catch (e) {
    console.warn("[DesignGrab] Could not sync plan limits:", e.message);
  }
}
const ACTION_MAP = {
  download: "downloads",
  code_export: "codeExports",
  design_system: "designSystems",
  ai_export: "aiExports",
  pixelforge_analysis: "pixelforgeAnalyses"
};
async function getUsageFromSupabase() {
  const state = await storage.getState();
  if (!state.userId) return null;
  const supabase = await getSupabase();
  if (!supabase) return null;
  try {
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data, error } = await supabase.from("usage_logs").select("action").eq("user_id", state.userId).gte("created_at", monthStart);
    if (error) {
      console.warn("[DesignGrab] Supabase usage fetch error:", error.message);
      return null;
    }
    const counts = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      downloads: 0,
      codeExports: 0,
      designSystems: 0,
      aiExports: 0,
      pixelforgeAnalyses: 0
    };
    for (const row of data) {
      const field = ACTION_MAP[row.action];
      if (field) counts[field]++;
    }
    await storage.set({ usage: counts });
    return counts;
  } catch (e) {
    console.warn("[DesignGrab] Failed to fetch usage from Supabase:", e.message);
    return null;
  }
}
async function getDailyUsageFromSupabase(action) {
  const state = await storage.getState();
  if (!state.userId) return null;
  const supabase = await getSupabase();
  if (!supabase) return null;
  try {
    const now = /* @__PURE__ */ new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const { data, error } = await supabase.from("usage_logs").select("id").eq("user_id", state.userId).eq("action", action).gte("created_at", dayStart);
    if (error) {
      console.warn("[DesignGrab] Daily usage fetch error:", error.message);
      return null;
    }
    return data ? data.length : 0;
  } catch (e) {
    console.warn("[DesignGrab] Failed to fetch daily usage:", e.message);
    return null;
  }
}
async function getDailyUsageLocal(action) {
  const field = ACTION_MAP[action];
  const cached = await storage.get(["dailyUsage"]);
  const daily = cached.dailyUsage || {};
  const now = /* @__PURE__ */ new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (daily.day !== todayKey) {
    return 0;
  }
  return daily[field] || 0;
}
async function incrementDailyUsageLocal(action) {
  const field = ACTION_MAP[action];
  const cached = await storage.get(["dailyUsage"]);
  const daily = cached.dailyUsage || {};
  const now = /* @__PURE__ */ new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (daily.day !== todayKey) {
    const fresh = { day: todayKey, [field]: 1 };
    await storage.set({ dailyUsage: fresh });
    return;
  }
  daily[field] = (daily[field] || 0) + 1;
  await storage.set({ dailyUsage: daily });
}
async function getUsage() {
  const supabaseUsage = await getUsageFromSupabase();
  if (supabaseUsage) {
    const state2 = await storage.getState();
    return { usage: supabaseUsage, plan: state2.plan };
  }
  const state = await storage.getState();
  const now = /* @__PURE__ */ new Date();
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
      pixelforgeAnalyses: 0
    };
    await storage.set({ usage: fresh });
    return { usage: fresh, plan: state.plan };
  }
  return { usage: state.usage, plan: state.plan };
}
async function checkLimit(action) {
  const state = await storage.getState();
  if (!state.userId) {
    return { allowed: false, current: 0, limit: 0, plan: "free", requiresAuth: true };
  }
  const { plan } = await getUsage();
  const limits = await getLimitsForPlan(plan);
  const field = ACTION_MAP[action];
  const limit = limits[field] ?? 0;
  const isDaily = DAILY_LIMIT_ACTIONS.has(action);
  let current;
  if (isDaily) {
    const supabaseCount = await getDailyUsageFromSupabase(action);
    current = supabaseCount !== null ? supabaseCount : await getDailyUsageLocal(action);
  } else {
    const { usage } = await getUsage();
    current = usage[field] || 0;
  }
  const allowed = limit === -1 || current < limit;
  return { allowed, current, limit, plan, isDaily };
}
async function recordUsage(action) {
  const check = await checkLimit(action);
  if (!check.allowed) return check;
  const state = await storage.getState();
  const field = ACTION_MAP[action];
  if (state.userId) {
    const supabase = await getSupabase();
    if (supabase) {
      try {
        await supabase.from("usage_logs").insert({
          user_id: state.userId,
          action
        });
      } catch (e) {
        console.warn("[DesignGrab] Failed to log usage to Supabase:", e.message);
      }
    }
  }
  const newCount = check.current + 1;
  const usage = (await storage.get(["usage"])).usage || {};
  usage[field] = (usage[field] || 0) + 1;
  await storage.set({ usage });
  if (DAILY_LIMIT_ACTIONS.has(action)) {
    await incrementDailyUsageLocal(action);
  }
  return {
    allowed: true,
    current: newCount,
    limit: check.limit,
    plan: check.plan
  };
}
async function getUsageSummary() {
  const { usage, plan } = await getUsage();
  const limits = await getLimitsForPlan(plan);
  const pfDaily = await getDailyUsageFromSupabase("pixelforge_analysis");
  const pfCurrent = pfDaily !== null ? pfDaily : await getDailyUsageLocal("pixelforge_analysis");
  return {
    plan,
    month: usage.month,
    year: usage.year,
    items: [
      {
        label: "Downloads",
        action: "download",
        current: usage.downloads,
        limit: limits.downloads,
        unlimited: limits.downloads === -1
      },
      {
        label: "Code Exports",
        action: "code_export",
        current: usage.codeExports,
        limit: limits.codeExports,
        unlimited: limits.codeExports === -1
      },
      {
        label: "Design Systems",
        action: "design_system",
        current: usage.designSystems,
        limit: limits.designSystems,
        unlimited: limits.designSystems === -1
      },
      {
        label: "AI Exports",
        action: "ai_export",
        current: usage.aiExports,
        limit: limits.aiExports,
        unlimited: limits.aiExports === -1
      },
      {
        label: "PixelForge Analyses",
        action: "pixelforge_analysis",
        current: pfCurrent,
        limit: limits.pixelforgeAnalyses,
        unlimited: limits.pixelforgeAnalyses === -1,
        isDaily: true
      }
    ]
  };
}
const GOOGLE_CLIENT_ID = "783180663354-idjnv92nubl3e1dbe5ufm7jq8ll6m1pd.apps.googleusercontent.com";
async function getAuthState() {
  const state = await storage.getState();
  const supabase = await getSupabase();
  if (!supabase) {
    return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
      const plan = profile?.plan || state.plan;
      await storage.set({ userId: user.id, plan });
      syncPlanLimits(supabase).catch(() => {
      });
      return { user, plan, isLoggedIn: true, cloudEnabled: true };
    }
  } catch (err) {
    console.warn("[DesignGrab] Auth check failed:", err.message);
  }
  return { user: null, plan: state.plan, isLoggedIn: false, cloudEnabled: false };
}
async function signInWithGoogle() {
  const supabase = await getSupabase();
  if (!supabase) return { error: "Cloud features not configured" };
  try {
    const redirectURL = chrome.identity.getRedirectURL();
    const rawNonce = crypto.randomUUID();
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawNonce));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authURL.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authURL.searchParams.set("response_type", "id_token token");
    authURL.searchParams.set("redirect_uri", redirectURL);
    authURL.searchParams.set("scope", "openid email profile");
    authURL.searchParams.set("nonce", hashedNonce);
    authURL.searchParams.set("prompt", "select_account");
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
    const urlFragment = new URL(responseURL.replace("#", "?"));
    const idToken = urlFragment.searchParams.get("id_token");
    const accessToken = urlFragment.searchParams.get("access_token");
    if (!idToken) {
      return { error: "No ID token received from Google" };
    }
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
      nonce: rawNonce,
      access_token: accessToken
    });
    if (error) {
      return { error: error.message };
    }
    if (data?.user) {
      await storage.set({ userId: data.user.id });
      const { data: profile } = await supabase.from("profiles").select("plan").eq("id", data.user.id).single();
      if (profile?.plan) await storage.set({ plan: profile.plan });
      syncPlanLimits(supabase).catch(() => {
      });
    }
    return { user: data?.user, error: null };
  } catch (err) {
    return { error: err.message };
  }
}
async function signOut() {
  const supabase = await getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  await storage.set({ userId: null, plan: "free", usage: null });
  return { error: null };
}
export {
  getAuthState as a,
  getUsageSummary as b,
  checkLimit as c,
  signOut as d,
  signInWithGoogle as e,
  syncPlanLimits as f,
  getSupabase as g,
  recordUsage as r,
  storage as s
};
