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

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          userId: user.id,
          plan: "free",
          active: true,
          hasSubscription: false,
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
