/**
 * DesignGrab — AI Export Edge Function
 * Proxies requests to Claude API to convert HTML+CSS into React/Vue components.
 *
 * Deploy: supabase functions deploy ai-export
 * Requires: ANTHROPIC_API_KEY set in Supabase secrets
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const CLAUDE_MODEL = "claude-sonnet-4-6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { html, css, layout, framework = "react" } = await req.json();

    if (!html) {
      return new Response(
        JSON.stringify({ error: "Missing html parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const frameworkName = framework === "vue" ? "Vue 3 (Composition API)" : "React";
    const fileExt = framework === "vue" ? ".vue" : ".tsx";

    const prompt = `You are a senior ${frameworkName} developer. Convert the following HTML+CSS section into a clean, production-ready ${frameworkName} component.

Requirements:
- ${framework === "react" ? "Use TypeScript with proper prop types" : "Use TypeScript with defineProps"}
- Use Tailwind CSS for all styling (no inline styles or CSS files)
- Make all text content configurable via props with sensible defaults
- Make images configurable via props
- Ensure responsive design (mobile-first)
- Use semantic HTML elements
- Add aria labels for accessibility
- ${framework === "react" ? "Export as default function component" : "Use <script setup lang=\"ts\"> syntax"}
- Output ONLY the component code, no explanations

HTML:
${html.slice(0, 8000)}

CSS:
${(css || "").slice(0, 4000)}

${layout ? `Layout structure:\n${layout.slice(0, 2000)}` : ""}

Output the complete ${fileExt} file:`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `Claude API error: ${response.status}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const code = data.content?.[0]?.text || "";

    return new Response(
      JSON.stringify({ code, framework, model: CLAUDE_MODEL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
