/**
 * PixelForge — Analyze Edge Function
 * Takes a base64 image, sends to Claude Vision API, returns a DesignTree JSON.
 *
 * Deploy: supabase functions deploy pixelforge-analyze
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

const DESIGN_TREE_TOOL = {
  name: "create_design_tree",
  description:
    "Analyze the UI screenshot and return a structured DesignTree representing every visual element, its styles, layout, and hierarchy.",
  input_schema: {
    type: "object" as const,
    required: ["elements", "canvas"],
    properties: {
      canvas: {
        type: "object" as const,
        description: "Overall canvas/artboard info",
        required: ["width", "height", "backgroundColor"],
        properties: {
          width: { type: "number" as const },
          height: { type: "number" as const },
          backgroundColor: {
            type: "string" as const,
            description: "CSS color value",
          },
        },
      },
      fonts: {
        type: "array" as const,
        description: "All fonts detected in the design",
        items: {
          type: "object" as const,
          required: ["family"],
          properties: {
            family: { type: "string" as const },
            weights: {
              type: "array" as const,
              items: { type: "string" as const },
            },
            category: {
              type: "string" as const,
              enum: ["serif", "sans-serif", "monospace", "display", "handwriting"],
            },
          },
        },
      },
      colors: {
        type: "array" as const,
        description: "Color palette extracted from the design",
        items: {
          type: "object" as const,
          required: ["hex", "role"],
          properties: {
            hex: { type: "string" as const, description: "#RRGGBB format" },
            role: {
              type: "string" as const,
              enum: [
                "primary",
                "secondary",
                "accent",
                "background",
                "text",
                "border",
                "shadow",
                "other",
              ],
            },
            opacity: { type: "number" as const },
          },
        },
      },
      elements: {
        type: "array" as const,
        description: "Flat list of all UI elements in the design",
        items: {
          type: "object" as const,
          required: ["id", "type", "bounds", "styles"],
          properties: {
            id: { type: "string" as const },
            parentId: {
              type: "string" as const,
              description: "ID of parent element, null for root",
            },
            type: {
              type: "string" as const,
              enum: [
                "container",
                "text",
                "image",
                "button",
                "input",
                "icon",
                "divider",
                "card",
                "nav",
                "header",
                "footer",
                "list",
                "link",
                "badge",
                "avatar",
                "shape",
              ],
            },
            tag: {
              type: "string" as const,
              description: "Suggested HTML tag (div, h1, p, img, button, etc.)",
            },
            bounds: {
              type: "object" as const,
              required: ["x", "y", "width", "height"],
              properties: {
                x: { type: "number" as const },
                y: { type: "number" as const },
                width: { type: "number" as const },
                height: { type: "number" as const },
              },
            },
            styles: {
              type: "object" as const,
              properties: {
                backgroundColor: { type: "string" as const },
                color: { type: "string" as const },
                fontSize: { type: "number" as const },
                fontWeight: { type: "string" as const },
                fontFamily: { type: "string" as const },
                lineHeight: { type: "number" as const },
                letterSpacing: { type: "number" as const },
                textAlign: { type: "string" as const },
                borderRadius: { type: "number" as const },
                border: { type: "string" as const },
                boxShadow: { type: "string" as const },
                opacity: { type: "number" as const },
                padding: { type: "string" as const },
                margin: { type: "string" as const },
                display: { type: "string" as const },
                flexDirection: { type: "string" as const },
                justifyContent: { type: "string" as const },
                alignItems: { type: "string" as const },
                gap: { type: "number" as const },
                overflow: { type: "string" as const },
              },
            },
            content: {
              type: "string" as const,
              description:
                "Text content for text elements, alt text for images, label for buttons",
            },
            src: {
              type: "string" as const,
              description:
                "Placeholder description for images (e.g. 'hero-image', 'logo', 'avatar')",
            },
          },
        },
      },
    },
  },
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
    const { image, format, width, height } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing image parameter (base64)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Detect media type from base64 header or default to png
    let mediaType = "image/png";
    let base64Data = image;
    if (image.startsWith("data:")) {
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        mediaType = match[1];
        base64Data = match[2];
      }
    }

    const systemPrompt = `You are a pixel-perfect UI analysis engine. Analyze the uploaded screenshot and extract every visual element into a structured DesignTree.

Rules:
- Identify ALL visible elements: text, images, buttons, inputs, icons, containers, cards, navbars, etc.
- Estimate exact pixel positions and sizes based on the image dimensions (${width || "unknown"}x${height || "unknown"}).
- Extract all colors as hex values. Identify their roles (primary, secondary, background, text, etc.).
- Identify all fonts (family, weight, size). Make best guesses for common web fonts.
- Capture layout relationships: which elements are children of which containers.
- For flex/grid layouts, specify direction, alignment, gap, etc.
- Be thorough — miss nothing visible in the design.
- Use the create_design_tree tool to return the structured result.`;

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
        system: systemPrompt,
        tools: [DESIGN_TREE_TOOL],
        tool_choice: { type: "tool", name: "create_design_tree" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: `Analyze this UI screenshot${width && height ? ` (${width}x${height}px)` : ""}. Extract every element, color, font, and layout detail into a DesignTree using the create_design_tree tool.`,
              },
            ],
          },
        ],
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

    // Extract the tool use result
    const toolUse = data.content?.find(
      (block: { type: string }) => block.type === "tool_use"
    );
    if (!toolUse) {
      return new Response(
        JSON.stringify({
          error: "Claude did not return a DesignTree",
          raw: data.content,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const designTree = toolUse.input;

    return new Response(
      JSON.stringify({
        designTree,
        model: CLAUDE_MODEL,
        usage: data.usage,
      }),
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
