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

const systemPrompt = `You are a design decomposition expert. Analyze this image and identify every visual element.

Return ONLY a valid JSON object (no markdown, no code fences, no explanation) with this exact structure:
{
  "version": "1.0",
  "canvas": { "width": <number>, "height": <number>, "background": "<color>" },
  "elements": [
    {
      "id": "<unique_id>",
      "type": "text|image|shape|icon|group|container",
      "bounds": { "x": <number>, "y": <number>, "w": <number>, "h": <number>, "rotation": 0 },
      "zIndex": <number>,
      "style": { "fill": "<color>", "stroke": "<color>", "borderRadius": <number>, "opacity": <number> },
      "text": { "content": "<text>", "fontFamily": "<font>", "fontSize": <number>, "fontWeight": <number>, "color": "<color>", "align": "left|center|right" },
      "children": ["<child_id>"]
    }
  ],
  "fonts": [{ "name": "<font>", "googleFont": "<google_font>", "confidence": 0.8, "alternatives": [] }],
  "colors": [{ "hex": "<hex>", "rgb": "<rgb>", "usage": "<description>", "name": "<name>" }]
}

Rules:
- Classify each element as: text, image, shape, icon, group, or container
- Group related elements (a button = container with shape + text child)
- Identify fonts — guess the closest Google Font match
- Extract the full color palette with hex values
- Estimate dimensions in pixels based on image proportions
- Return ONLY valid JSON, nothing else`;

/**
 * Extract JSON from Gemini's text response.
 * Handles responses wrapped in markdown code blocks.
 */
function extractJSON(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}

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

    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
      const designTree = extractJSON(rawText);
      return new Response(
        JSON.stringify({ design_tree: designTree, model: GEMINI_MODEL }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch {
      return new Response(
        JSON.stringify({
          error: "Failed to parse DesignTree JSON from Gemini response",
          raw: rawText.slice(0, 500),
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
