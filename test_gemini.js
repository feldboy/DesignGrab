const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash-exp";

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

TEXT BLOCKS (CRITICAL):
- For long text that spans multiple lines, set "lineCount" to the number of visible lines
- Set "maxWidthPct" to the percentage of canvas width the text occupies
- Set "hierarchy" to one of: "hero" (largest/most prominent), "heading", "subheading", "body", "caption", "label"
- Copy text EXACTLY as shown — preserve quotes, dashes, capitalization
- For text with line breaks, include \\n between lines

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

// create simple 1x1 base64 transparent png
const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function run() {
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
                                mime_type: "image/png",
                                data: imageBase64,
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
        console.error("ERROR", response.status);
        console.error(await response.text());
    } else {
        console.log("SUCCESS");
        console.log(await response.json());
    }
}

run().catch(console.error);
