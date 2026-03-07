/**
 * DesignGrab — PixelForge Analyze Edge Function
 * Receives a base64 image, sends it to Gemini Vision API,
 * and returns a DesignTree JSON for the image-to-design pipeline.
 *
 * Deploy: supabase functions deploy pixelforge-analyze
 * Requires: GEMINI_API_KEY set in Supabase secrets
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-3-flash-preview";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are an expert visual design analyzer. Decompose this image into a structured design tree.

APPROACH:
1. First identify the OVERALL LAYOUT — columns, rows, major sections
2. Then identify elements WITHIN each section
3. Use PERCENTAGE-BASED positions (0-100) relative to the full image
4. Prefer fewer accurate elements over many wrong ones

POSITIONING (CRITICAL):
- All x, y, w, h values are PERCENTAGES (0-100) of the canvas
- x=0 means left edge, x=50 means center, x=100 means right edge
- y=0 means top edge, y=100 means bottom edge
- Think in terms of layout: "this element starts at 5% from left, 10% from top, spans 60% width, 8% height"
- NEVER put multiple text blocks at the same x,y position

ELEMENT TYPES:
- "text": Any readable text. Include ALL visible text, even small labels
- "shape": Rectangles, lines, borders, decorative shapes
- "image": Photos, illustrations, headshots
- "container": A visible box/card that groups other elements

TEXT & COPYWRITING (CRITICAL):
- Extract ALL visible text EXACTLY as written — every word, punctuation mark, line break
- For multi-line text, use \\n to preserve line breaks: "Line 1\\nLine 2\\nLine 3"
- Preserve capitalization, quotes, dashes, special characters exactly
- Set "lineCount" to the number of visible lines
- Set "maxWidthPct" to the percentage of canvas width the text occupies
- Set "hierarchy": "hero" (main headline), "heading", "subheading", "body", "caption", "label", "button"
- For buttons/CTAs, mark hierarchy as "button" and include the exact button text
- Don't paraphrase or summarize — copy the EXACT words you see

REGIONS:
- Assign each element a "region" string describing its area: "left-main", "right-sidebar", "top-bar", "bottom-bar", "center", "full-width"
- This helps group related elements together

FONT DETECTION:
- Match to common fonts: Inter, Roboto, Montserrat, Poppins, Open Sans, Playfair Display, Space Mono, JetBrains Mono, Courier, Arial
- For bold condensed all-caps text, consider: Anton, Oswald, Bebas Neue, Impact
- Note the visual style: bold, condensed, monospaced, serif, sans-serif

COLOR ACCURACY (CRITICAL):
- Look at the ACTUAL colors in the image — do NOT default to black (#000000)
- If the background is dark/black, the text is almost certainly WHITE (#FFFFFF) or a light color
- If the background is light/white, the text is almost certainly BLACK (#000000) or a dark color
- For accent colors (red highlights, colored borders), detect the ACTUAL hex value
- Text color MUST contrast with the background — never return same color for both
- Common patterns: white text on black bg, red accent text on dark bg, black text on white bg

Return ONLY valid JSON:
{
  "version": "2.0",
  "canvas": { "width": <image_width_px>, "height": <image_height_px>, "background": "<hex>" },
  "elements": [
    {
      "id": "el_<number>",
      "type": "text|image|shape|container",
      "bounds": { "x": <pct_0_100>, "y": <pct_0_100>, "w": <pct_0_100>, "h": <pct_0_100>, "rotation": 0 },
      "region": "<region_name>",
      "zIndex": <number>,
      "style": { "fill": "<hex>", "stroke": "<hex>", "strokeWidth": <px>, "borderRadius": <px>, "opacity": <0-1> },
      "text": {
        "content": "<exact_text>",
        "fontFamily": "<font>",
        "fontSize": <px>,
        "fontWeight": <100-900>,
        "color": "<hex_MUST_CONTRAST_WITH_BACKGROUND>",
        "align": "left|center|right",
        "textTransform": "none|uppercase|lowercase",
        "lineHeight": <multiplier>,
        "letterSpacing": <px>,
        "maxWidthPct": <pct_of_canvas_width>,
        "lineCount": <number>,
        "hierarchy": "hero|heading|subheading|body|caption|label"
      }
    }
  ],
  "fonts": [
    { "name": "<detected>", "googleFont": "<google_font_name>", "style": "<serif|sans-serif|monospace|display>", "confidence": <0-1> }
  ],
  "colors": [
    { "hex": "<hex>", "rgb": "rgb(r,g,b)", "usage": "<where_used>", "name": "<descriptive_name>" }
  ]
}

QUALITY CHECKS:
- Are text blocks positioned where text actually appears?
- Do percentages add up? (e.g., two side-by-side columns ~50% width each)
- Is the reading order logical (top-to-bottom, left-to-right)?
- No two elements should have identical x,y unless they truly overlap
- Does every text element have the correct hierarchy level?
- CRITICAL: Does text color CONTRAST with background? (white text on black bg, NOT black on black)`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { image, media_type } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing image parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!media_type) {
      return new Response(
        JSON.stringify({ error: "Missing media_type parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: media_type,
                  data: image,
                },
              },
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({
          error: `Gemini API error: ${response.status}`,
          details: errText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      return new Response(
        JSON.stringify({
          error: "Gemini returned empty response",
          raw: JSON.stringify(data).slice(0, 500),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    try {
      const jsonMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawText.trim();
      const designTree = JSON.parse(jsonStr);

      return new Response(
        JSON.stringify({ design_tree: designTree, model: GEMINI_MODEL }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (parseErr) {
      return new Response(
        JSON.stringify({
          error: "Failed to parse DesignTree JSON",
          raw: rawText.slice(0, 500),
          parseError: (parseErr as Error).message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
