/**
 * DesignGrab — Verify License Edge Function
 * Validates a user's JWT and returns their current plan from the profiles table.
 * Called by the extension on startup to sync plan status.
 *
 * Deploy: supabase functions deploy verify-license
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated", plan: "free", active: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");

    // Verify the JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token", plan: "free", active: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch plan from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .single();

    const userPlan = profile?.plan || "free";

    // Fetch plan limits from plans table (editable in Supabase Dashboard)
    const { data: planConfig } = await supabase
      .from("plans")
      .select("downloads_limit, code_exports_limit, design_systems_limit, ai_exports_limit, features")
      .eq("id", userPlan)
      .eq("is_active", true)
      .single();

    // Fallback limits if plans table not populated
    const defaultLimits: Record<string, any> = {
      free:     { downloads: 15, codeExports: 5,  designSystems: 3,  aiExports: 0 },
      pro:      { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50 },
      lifetime: { downloads: 2000, codeExports: -1, designSystems: -1, aiExports: 50 },
    };

    const limits = planConfig
      ? {
          downloads: planConfig.downloads_limit,
          codeExports: planConfig.code_exports_limit,
          designSystems: planConfig.design_systems_limit,
          aiExports: planConfig.ai_exports_limit,
        }
      : defaultLimits[userPlan] || defaultLimits.free;

    if (!profile) {
      return new Response(
        JSON.stringify({
          userId: user.id,
          plan: "free",
          active: true,
          hasSubscription: false,
          limits,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current month usage counts
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usageLogs } = await supabase
      .from("usage_logs")
      .select("action")
      .eq("user_id", user.id)
      .gte("created_at", monthStart);

    const usage: Record<string, number> = {};
    if (usageLogs) {
      for (const log of usageLogs) {
        usage[log.action] = (usage[log.action] || 0) + 1;
      }
    }

    return new Response(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        plan: profile.plan,
        active: true,
        hasSubscription: !!profile.stripe_subscription_id,
        limits,
        usage: {
          downloads: usage["download"] || 0,
          codeExports: usage["code_export"] || 0,
          designSystems: usage["design_system"] || 0,
          aiExports: usage["ai_export"] || 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, plan: "free", active: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
