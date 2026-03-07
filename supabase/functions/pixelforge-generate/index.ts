/**
 * PixelForge — Generate Edge Function
 * Takes a DesignTree JSON and generates code in the requested format.
 *
 * Deploy: supabase functions deploy pixelforge-generate
 * Requires: ANTHROPIC_API_KEY set in Supabase secrets
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const CLAUDE_MODEL = "claude-sonnet-4-6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FORMAT_PROMPTS: Record<string, string> = {
  html: `Convert this DesignTree into a single, self-contained HTML file with inline CSS.

Requirements:
- Use semantic HTML5 elements
- All styles inline or in a <style> tag — no external dependencies
- Use the exact colors, fonts, sizes, and positions from the DesignTree
- Make it responsive with CSS media queries
- Include Google Fonts <link> tags for any detected fonts
- Use placeholder images with correct dimensions (via placeholder.com or similar)
- Output ONLY the complete HTML file, no explanations`,

  react: `Convert this DesignTree into a production-ready React + TypeScript component using Tailwind CSS.

Requirements:
- Single .tsx file with a default export
- Use Tailwind CSS utility classes for all styling
- Match the exact colors, fonts, sizes, and layout from the DesignTree
- Make text content configurable via props with defaults
- Make images configurable via props
- Use semantic HTML and proper accessibility (aria labels)
- Responsive design (mobile-first)
- Output ONLY the component code, no explanations`,

  figma: `Convert this DesignTree into a Figma plugin-compatible JSON structure that can recreate the design.

Requirements:
- Output a JSON object with a "nodes" array
- Each node should have: type (FRAME, TEXT, RECTANGLE, etc.), name, x, y, width, height
- Include fills (colors), strokes, effects (shadows), and text properties
- Maintain the parent-child hierarchy from the DesignTree
- Use Figma's color format (r, g, b values from 0-1)
- Output ONLY valid JSON, no explanations`,

  canva: `Convert this DesignTree into a Canva-compatible design specification.

Requirements:
- Output a JSON structure representing Canva design elements
- Include page dimensions, background color
- Each element: type, position (left, top), dimensions (width, height)
- Text elements: content, fontFamily, fontSize, fontWeight, color, textAlign
- Shape elements: fill, stroke, borderRadius
- Image elements: placeholder URLs with correct dimensions
- Output ONLY valid JSON, no explanations`,

  svg: `Convert this DesignTree into a clean, optimized SVG file.

Requirements:
- Use proper SVG elements: <rect>, <text>, <image>, <g>, <circle>, etc.
- Set viewBox based on the canvas dimensions
- Use the exact colors, fonts, and positions from the DesignTree
- Group related elements with <g> tags matching the hierarchy
- Include font-family attributes for text elements
- Use placeholder <rect> elements with labels for images
- Optimize: no unnecessary attributes, clean structure
- Output ONLY the SVG markup, no explanations`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { designTree, format = "html" } = await req.json();

    if (!designTree) {
      return new Response(
        JSON.stringify({ error: "Missing designTree parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const formatPrompt = FORMAT_PROMPTS[format];
    if (!formatPrompt) {
      return new Response(
        JSON.stringify({
          error: `Unsupported format: ${format}. Supported: ${Object.keys(FORMAT_PROMPTS).join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `${formatPrompt}

Here is the DesignTree JSON:

${JSON.stringify(designTree, null, 2)}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({
          error: `Claude API error: ${response.status}`,
          details: errText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const code = data.content?.[0]?.text || "";

    return new Response(
      JSON.stringify({ code, format, model: CLAUDE_MODEL, usage: data.usage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
