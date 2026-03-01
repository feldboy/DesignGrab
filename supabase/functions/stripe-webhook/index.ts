/**
 * DesignGrab — Stripe Webhook Edge Function
 * Handles checkout.session.completed and subscription events to update user plans.
 *
 * Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
 * Requires secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Minimal Stripe signature verification using Web Crypto
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",").reduce((acc: Record<string, string>, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const sig = parts["v1"];

  if (!timestamp || !sig) return false;

  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === sig;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        await supabase
          .from("profiles")
          .update({
            plan,
            stripe_subscription_id: session.subscription || null,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      // Downgrade to free when subscription is cancelled
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Find user by stripe_customer_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("id", profile.id);
      }
      break;
    }

    case "customer.subscription.updated": {
      // Handle plan changes (upgrade/downgrade)
      const subscription = event.data.object;
      const customerId = subscription.customer;

      if (subscription.status === "active") {
        // Look up which price to determine the plan
        const priceId = subscription.items?.data?.[0]?.price?.id;
        let plan = "starter"; // default

        // Fetch price to check metadata or match against known prices
        const priceRes = await fetch(
          `https://api.stripe.com/v1/prices/${priceId}`,
          {
            headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
          }
        );
        const price = await priceRes.json();
        if (price.metadata?.plan) {
          plan = price.metadata.plan;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ plan })
            .eq("id", profile.id);
        }
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
