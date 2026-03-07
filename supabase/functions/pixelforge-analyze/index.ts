/**
 * DesignGrab — PixelForge Analyze Edge Function
 * Receives a base64 image, sends it to Claude Vision API with tool_use,
 * and returns a DesignTree JSON for the image-to-design pipeline.
 *
 * Deploy: supabase functions deploy pixelforge-analyze
 * Requires: ANTHROPIC_API_KEY set in Supabase secrets
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const CLAUDE_MODEL = "claude-sonnet-4-6";
const MAX_TOOL_ITERATIONS = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a design decomposition expert. Analyze this image and identify every visual element.

Return a valid DesignTree JSON with this structure:
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
  "fonts": [{ "name": "<font>", "googleFont": "<google_font>", "confidence": <0-1>, "alternatives": [] }],
  "colors": [{ "hex": "<hex>", "rgb": "<rgb>", "usage": "<description>", "name": "<name>" }]
}

Rules:
- Classify each element as: text, image, shape, icon, group, or container
- Group related elements (a button = container with shape + text child)
- Use font_identify tool for every text element you find
- Use color_extract tool once for the overall color palette
- Use ocr_extract if any text is unclear or hard to read
- Estimate dimensions in pixels based on image proportions
- After all tool calls, return ONLY the final valid JSON DesignTree`;


/** Claude tool definitions for design analysis */
const toolDefinitions = [
  {
    name: "font_identify",
    description: "Identify the closest Google Font match for detected text",
    input_schema: {
      type: "object" as const,
      properties: {
        text_sample: {
          type: "string",
          description: "A sample of the text to identify the font for",
        },
        style_hints: {
          type: "string",
          description:
            "Visual hints about the font style (e.g. bold, serif, rounded)",
        },
      },
      required: ["text_sample"],
    },
  },
  {
    name: "color_extract",
    description: "Extract color palette from a region",
    input_schema: {
      type: "object" as const,
      properties: {
        region_description: {
          type: "string",
          description: "Description of the region to extract colors from",
        },
      },
      required: ["region_description"],
    },
  },
  {
    name: "ocr_extract",
    description: "Extract text content from a region",
    input_schema: {
      type: "object" as const,
      properties: {
        region_description: {
          type: "string",
          description: "Description of the region containing text",
        },
        language: {
          type: "string",
          description: "Expected language of the text (e.g. en, he, ar)",
        },
      },
      required: ["region_description"],
    },
  },
  {
    name: "icon_match",
    description: "Match a visual element to an icon library",
    input_schema: {
      type: "object" as const,
      properties: {
        description: {
          type: "string",
          description: "Visual description of the icon element",
        },
      },
      required: ["description"],
    },
  },
];

/**
 * Generate a mock tool result based on the tool name and input.
 * These stubs guide Claude's analysis — real tool backends can replace them later.
 */
function generateToolResult(
  toolName: string,
  input: Record<string, string>
): string {
  switch (toolName) {
    case "font_identify":
      return JSON.stringify({
        font_name: input.text_sample,
        google_font: "Inter",
        confidence: 0.8,
        alternatives: ["Roboto", "Open Sans"],
      });

    case "color_extract":
      return JSON.stringify({
        palette: ["#000000", "#ffffff", "#6366f1"],
        dominant: "#ffffff",
      });

    case "ocr_extract":
      return JSON.stringify({
        text: input.region_description,
        confidence: 0.9,
      });

    case "icon_match":
      return JSON.stringify({
        library: "lucide",
        icon_name: "circle",
        svg_suggestion: "<svg></svg>",
      });

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

/**
 * Extract JSON from Claude's text response.
 * Handles responses wrapped in markdown code blocks.
 */
function extractJSON(text: string): unknown {
  // Try stripping markdown code fences first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}


// deno-lint-ignore no-explicit-any
type ClaudeMessage = { role: string; content: any };

serve(async (req) => {
  // CORS preflight
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

    // Build initial messages with the image + system prompt
    const messages: ClaudeMessage[] = [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type, data: image },
          },
          { type: "text", text: systemPrompt },
        ],
      },
    ];

    // Tool-use loop — Claude may request tools multiple times
    let iteration = 0;

    while (iteration < MAX_TOOL_ITERATIONS) {
      iteration++;

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
          tools: toolDefinitions,
          messages,
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

      // If Claude is done (no more tool calls), extract the final text
      if (data.stop_reason === "end_turn") {
        const textBlock = data.content?.find(
          // deno-lint-ignore no-explicit-any
          (block: any) => block.type === "text"
        );
        const rawText = textBlock?.text || "";

        try {
          const designTree = extractJSON(rawText);
          return new Response(
            JSON.stringify({ design_tree: designTree, model: CLAUDE_MODEL }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch {
          return new Response(
            JSON.stringify({
              error: "Failed to parse DesignTree JSON from Claude response",
              raw: rawText.slice(0, 500),
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // Claude wants to use tools — process each tool_use block
      if (data.stop_reason === "tool_use") {
        // Append Claude's assistant message (contains tool_use blocks)
        messages.push({ role: "assistant", content: data.content });

        // Build tool_result responses for every tool_use in this turn
        // deno-lint-ignore no-explicit-any
        const toolResults = data.content
          // deno-lint-ignore no-explicit-any
          .filter((block: any) => block.type === "tool_use")
          // deno-lint-ignore no-explicit-any
          .map((block: any) => ({
            type: "tool_result",
            tool_use_id: block.id,
            content: generateToolResult(block.name, block.input),
          }));

        messages.push({ role: "user", content: toolResults });
        continue;
      }

      // Unexpected stop_reason — try to extract text anyway
      const fallbackText =
        // deno-lint-ignore no-explicit-any
        data.content?.find((block: any) => block.type === "text")?.text || "";
      if (fallbackText) {
        try {
          const designTree = extractJSON(fallbackText);
          return new Response(
            JSON.stringify({ design_tree: designTree, model: CLAUDE_MODEL }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch {
          // Fall through to loop end
        }
      }
    }

    // Exhausted tool iterations without a final answer
    return new Response(
      JSON.stringify({
        error: "Max tool iterations reached without final response",
      }),
      {
        status: 500,
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
