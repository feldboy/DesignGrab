import { G as GEMINI_MODEL$1, a as GEMINI_API_KEY } from "./assets/env-sw2aQK8W.js";
chrome.sidePanel?.setOptions?.({ enabled: true });
chrome.action.onClicked?.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
  }
});
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "toggle-inspector") {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
    }
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_INSPECT" }, (response) => {
      if (chrome.runtime.lastError) {
        injectContentScript(tab.id).then(() => {
          chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_INSPECT" });
        }).catch(() => {
        });
      }
    });
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;
  switch (type) {
    case "TOGGLE_INSPECT":
    case "START_INSPECT":
    case "STOP_INSPECT":
    case "EXTRACT_ASSETS":
    case "EXPORT_FULL_CONTEXT":
    case "EXPORT_FIGMA_SVG":
    case "EXPORT_RESPONSIVE_HTML":
    case "GET_CHILD_ELEMENTS":
      forwardToActiveTab(message, sendResponse);
      return true;
    case "DOWNLOAD_FILE":
      handleDownload(payload);
      sendResponse({ success: true });
      break;
    case "FETCH_ASSET":
      fetchAsset(payload.url).then((data) => {
        sendResponse({ success: true, data });
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    case "AI_EXPORT":
    case "FIGMA_EXPORT":
      handleAIExport(payload, type === "FIGMA_EXPORT").then((result) => {
        sendResponse(result);
      }).catch((err) => {
        sendResponse({ error: err.message });
      });
      return true;
    case "AI_DESCRIBE_COMPONENT":
      handleAIDescribe(payload).then((result) => {
        sendResponse(result);
      }).catch((err) => {
        sendResponse({ error: err.message });
      });
      return true;
    case "OPEN_SIDE_PANEL":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => {
          });
        }
      });
      sendResponse({ success: true });
      break;
    case "ELEMENT_PINNED":
    case "INSPECT_MODE_CHANGED":
    case "ASSETS_EXTRACTED":
      chrome.runtime.sendMessage(message).catch(() => {
      });
      break;
  }
});
function forwardToActiveTab(message, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      sendResponse({ error: "No active tab" });
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
      if (chrome.runtime.lastError) {
        injectContentScript(tabs[0].id).then(() => {
          chrome.tabs.sendMessage(tabs[0].id, message, (retryResponse) => {
            sendResponse(retryResponse || { error: "Content script not responding" });
          });
        }).catch((err) => {
          sendResponse({ error: err.message });
        });
      } else {
        sendResponse(response);
      }
    });
  });
}
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (err) {
    console.error("[DesignGrab] Failed to inject content script:", err);
    throw err;
  }
}
function handleDownload({ url, filename }) {
  chrome.downloads.download({
    url,
    filename: filename || getFilenameFromUrl(url),
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error("[DesignGrab] Download failed:", chrome.runtime.lastError);
    }
  });
}
async function fetchAsset(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
function getFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    return parts[parts.length - 1] || "download";
  } catch {
    return "download";
  }
}
function buildComponentPrompt(context, framework) {
  const frameworkName = framework === "vue" ? "Vue 3 (Composition API)" : "React";
  const fileExt = framework === "vue" ? ".vue" : ".tsx";
  const { html, css, layout, colors, fonts, tailwindConfig, animations } = context;
  let prompt = `You are a senior ${frameworkName} developer. Convert the following HTML+CSS into a pixel-perfect, production-ready ${frameworkName} component.

CRITICAL: Use the exact design tokens provided below — do NOT approximate colors, fonts, or sizes.

## Source HTML
${(html || "").slice(0, 8e3)}

## Source CSS
${(css || "").slice(0, 4e3)}`;
  if (colors) {
    prompt += `

## Design Tokens — Colors`;
    if (colors.palette?.length) {
      prompt += `
Palette (use these exact values):`;
      for (const c of colors.palette.slice(0, 12)) {
        prompt += `
- ${c.hex} (${c.name || "unnamed"}, used ${c.count}x)`;
      }
    }
    if (colors.backgrounds?.length) prompt += `
Background colors: ${colors.backgrounds.join(", ")}`;
    if (colors.textColors?.length) prompt += `
Text colors: ${colors.textColors.join(", ")}`;
    if (colors.accentColors?.length) prompt += `
Accent colors: ${colors.accentColors.join(", ")}`;
  }
  if (fonts) {
    prompt += `

## Design Tokens — Typography`;
    if (fonts.fonts?.length) {
      prompt += `
Font families:`;
      for (const f of fonts.fonts.slice(0, 5)) {
        const usage = [f.usage?.headings && "headings", f.usage?.body && "body", f.usage?.code && "code"].filter(Boolean).join(", ");
        prompt += `
- "${f.family}" (weights: ${f.weights.join(", ")}${usage ? `, used for: ${usage}` : ""})`;
      }
    }
    if (fonts.fontScale) {
      prompt += `
Type scale:`;
      for (const [level, value] of Object.entries(fonts.fontScale)) {
        prompt += `
- ${level}: ${value}`;
      }
    }
  }
  if (layout) {
    if (layout.structuralHTML) {
      prompt += `

## Layout Structure (Tailwind)
${layout.structuralHTML.slice(0, 3e3)}`;
    }
    if (layout.ascii) {
      prompt += `

ASCII layout:
${layout.ascii.slice(0, 1500)}`;
    }
  }
  if (animations?.items?.length) {
    prompt += `

## Animations`;
    for (const anim of animations.items.slice(0, 5)) {
      if (anim.type === "keyframe") {
        prompt += `
- Keyframe "${anim.name}" on ${anim.element}: duration ${anim.duration}, timing ${anim.timingFunction}`;
      } else if (anim.type === "transition") {
        prompt += `
- Transition on ${anim.element}: ${anim.transition}`;
      }
    }
    if (animations.keyframesCSS) {
      prompt += `

Keyframes CSS:
${animations.keyframesCSS.slice(0, 2e3)}`;
    }
  }
  if (tailwindConfig) {
    prompt += `

## Tailwind Config (use these tokens in your component)
${tailwindConfig.slice(0, 3e3)}`;
  }
  prompt += `

## Requirements
- ${framework === "react" ? "Use TypeScript with proper prop types" : "Use TypeScript with defineProps"}
- Use Tailwind CSS for all styling (no inline styles or CSS files)
- Use the EXACT color values from the palette above (not approximations)
- Use the EXACT font families and sizes from the typography scale
- Replicate the layout structure from Layout DNA
- Include animation keyframes/transitions if present above
- Make text content and images configurable via props with sensible defaults
- Responsive design (mobile-first)
- Semantic HTML with aria labels
- ${framework === "react" ? "Export as default function component" : 'Use <script setup lang="ts"> syntax'}
- Output ONLY the component code, no explanations

Output the complete ${fileExt} file:`;
  return prompt;
}
function buildFigmaPrompt(context) {
  const { html, css, layout, colors, fonts, animations } = context;
  let prompt = `You are a pixel-perfect SVG recreation expert. Convert the following web component into a single SVG that visually matches the original as closely as possible. The SVG will be pasted into Figma.

CRITICAL OUTPUT RULES:
- Output ONLY the raw SVG code. Nothing else. No markdown, no explanations, no backticks, no commentary, no instructions.
- The very first character of your output must be "<svg" and the very last must be "</svg>".
- Respond in English only. No other languages.

## Pixel-Perfect Recreation Rules:
- Study the CSS carefully. Every element has exact computed styles — use them ALL.
- Match exact dimensions: read width, height, max-width, min-height from the CSS.
- Match exact positions: use the padding, margin, gap, flex-direction, align-items, justify-content values from CSS to calculate x,y positions.
- Match exact colors: use the exact background-color, color, border-color values from CSS. Do NOT approximate.
- Match exact typography: use the exact font-family, font-size, font-weight, line-height, letter-spacing, text-align, text-transform from CSS.
- Match exact borders: border-radius (use rx/ry), border width, border color.
- Match exact shadows: recreate box-shadow using SVG <filter> with <feDropShadow> or <feGaussianBlur>.
- Match exact backgrounds: gradients (use <linearGradient>/<radialGradient>), background images (use <image> with the actual URL).
- Preserve all text content exactly as it appears in the HTML.

## SVG Technical Requirements for Figma:
- Set viewBox to "0 0 W H" where W and H match the component's rendered dimensions from CSS
- Use <g> groups with transform="translate(x,y)" for layout positioning
- Use <rect> for backgrounds, containers, cards, buttons
- Use <text> with font-family, font-size, font-weight, fill for all text (Figma converts to editable text layers)
- Use <image href="URL" /> for actual images (use the resolved URLs from the HTML src attributes)
- Use <clipPath> for overflow:hidden containers
- Use <defs> for reusable gradients, filters, clip paths
- Name groups with id attributes matching the element's role (e.g., id="header", id="nav", id="card-1")

## Source HTML (the complete element tree)
${(html || "").slice(0, 12e3)}

## Source CSS (exact computed styles for every element)
${(css || "").slice(0, 8e3)}`;
  if (colors) {
    prompt += `

## Extracted Color Palette`;
    if (colors.backgrounds?.length) prompt += `
Backgrounds: ${colors.backgrounds.join(", ")}`;
    if (colors.textColors?.length) prompt += `
Text colors: ${colors.textColors.join(", ")}`;
    if (colors.accentColors?.length) prompt += `
Accent colors: ${colors.accentColors.join(", ")}`;
    if (colors.palette?.length) {
      for (const c of colors.palette.slice(0, 15)) {
        prompt += `
- ${c.hex} (${c.name || "unnamed"}, ${c.count}x)`;
      }
    }
  }
  if (fonts) {
    prompt += `

## Typography`;
    if (fonts.fonts?.length) {
      for (const f of fonts.fonts.slice(0, 5)) {
        prompt += `
- font-family: "${f.family}", weights: ${f.weights.join(", ")}`;
      }
    }
    if (fonts.fontScale) {
      for (const [level, value] of Object.entries(fonts.fontScale)) {
        prompt += `
- ${level}: ${value}`;
      }
    }
  }
  if (layout?.ascii) {
    prompt += `

## Layout Tree
${layout.ascii.slice(0, 2e3)}`;
  }
  prompt += `

Output ONLY the raw SVG now. No text before or after. Start with <svg, end with </svg>.`;
  return prompt;
}
const GEMINI_MODEL = GEMINI_MODEL$1;
async function getGeminiApiKey() {
  const data = await chrome.storage.local.get(["geminiApiKey"]);
  if (data.geminiApiKey) return data.geminiApiKey;
  {
    return GEMINI_API_KEY;
  }
}
async function handleAIExport(payload, isFigma = false) {
  const { context, html, css, layout, framework = "react" } = payload;
  const storageData = await chrome.storage.local.get(["plan", "userId"]);
  const plan = storageData.plan || "free";
  if (!storageData.userId) {
    return { error: "Sign in with Google to use AI exports." };
  }
  if (plan === "free") {
    return { error: "AI exports require a Pro or Lifetime subscription. Upgrade in Settings." };
  }
  const hasContext = context && context.html;
  if (!hasContext && !html) {
    return { error: "Missing html parameter" };
  }
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    return { error: "Gemini API key not configured. Set it in extension settings." };
  }
  let prompt;
  if (isFigma) {
    prompt = buildFigmaPrompt(hasContext ? context : { html, css, layout });
  } else if (hasContext) {
    prompt = buildComponentPrompt(context, framework);
  } else {
    const frameworkName = framework === "vue" ? "Vue 3 (Composition API)" : "React";
    const fileExt = framework === "vue" ? ".vue" : ".tsx";
    prompt = `You are a senior ${frameworkName} developer. Convert the following HTML+CSS into a clean, production-ready ${frameworkName} component.

Requirements:
- ${framework === "react" ? "Use TypeScript with proper prop types" : "Use TypeScript with defineProps"}
- Use Tailwind CSS for all styling
- Make text/images configurable via props
- Responsive, semantic HTML, aria labels
- ${framework === "react" ? "Export as default function component" : 'Use <script setup lang="ts"> syntax'}
- Output ONLY the component code

HTML:
${html.slice(0, 8e3)}

CSS:
${(css || "").slice(0, 4e3)}
${layout ? `
Layout:
${layout.slice(0, 2e3)}` : ""}

Output the complete ${fileExt} file:`;
  }
  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 55e3);
  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: isFigma ? 16384 : 8192
          }
        }),
        signal: controller.signal
      }
    );
  } catch (err) {
    clearTimeout(fetchTimeout);
    if (err.name === "AbortError") {
      throw new Error("Gemini API request timed out. Please try again.");
    }
    throw err;
  }
  clearTimeout(fetchTimeout);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }
  const result = await response.json();
  let code = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  code = code.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");
  if (isFigma) {
    const svgMatch = code.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      code = svgMatch[0];
    }
  }
  return { code, framework: isFigma ? "figma" : framework, model: GEMINI_MODEL };
}
async function handleAIDescribe(payload) {
  const { context } = payload;
  if (!context?.html) {
    return { error: "Missing component context" };
  }
  const storageData = await chrome.storage.local.get(["plan", "userId"]);
  const plan = storageData.plan || "free";
  if (!storageData.userId) {
    return { error: "Sign in with Google to use AI features." };
  }
  if (plan === "free") {
    return { error: "AI features require a Pro or Lifetime subscription. Upgrade in Settings." };
  }
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    return { error: "Gemini API key not configured. Set it in extension settings." };
  }
  const prompt = buildDescribePrompt(context);
  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 55e3);
  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4096 }
        }),
        signal: controller.signal
      }
    );
  } catch (err) {
    clearTimeout(fetchTimeout);
    if (err.name === "AbortError") {
      throw new Error("Gemini API request timed out. Please try again.");
    }
    throw err;
  }
  clearTimeout(fetchTimeout);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }
  const result = await response.json();
  let description = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  description = description.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");
  return { description, mode: "ai-prompt", model: GEMINI_MODEL };
}
function buildDescribePrompt(context) {
  const { html, css, layout, colors, fonts, animations } = context;
  let prompt = `You are an expert UI/UX analyst. Analyze the following web component and write a detailed, structured natural language description that another designer or AI could use to recreate this component pixel-perfectly.

## Source HTML
${(html || "").slice(0, 8e3)}

## Source CSS
${(css || "").slice(0, 5e3)}`;
  if (colors) {
    prompt += `

## Colors`;
    if (colors.palette?.length) {
      prompt += `
Palette: ${colors.palette.slice(0, 12).map((c) => `${c.hex} (${c.name || "unnamed"})`).join(", ")}`;
    }
    if (colors.backgrounds?.length) prompt += `
Backgrounds: ${colors.backgrounds.join(", ")}`;
    if (colors.textColors?.length) prompt += `
Text: ${colors.textColors.join(", ")}`;
    if (colors.accentColors?.length) prompt += `
Accents: ${colors.accentColors.join(", ")}`;
  }
  if (fonts) {
    prompt += `

## Typography`;
    if (fonts.fonts?.length) {
      for (const f of fonts.fonts.slice(0, 5)) {
        prompt += `
- "${f.family}" weights: ${f.weights.join(", ")}`;
      }
    }
    if (fonts.fontScale) {
      for (const [level, value] of Object.entries(fonts.fontScale)) {
        prompt += `
- ${level}: ${value}`;
      }
    }
  }
  if (layout?.structuralHTML) {
    prompt += `

## Layout Structure
${layout.structuralHTML.slice(0, 2e3)}`;
  }
  if (layout?.ascii) {
    prompt += `

## ASCII Layout
${layout.ascii.slice(0, 1e3)}`;
  }
  if (animations?.items?.length) {
    prompt += `

## Animations`;
    for (const anim of animations.items.slice(0, 5)) {
      if (anim.type === "keyframe") prompt += `
- Keyframe "${anim.name}": ${anim.duration}, ${anim.timingFunction}`;
      else prompt += `
- Transition: ${anim.transition}`;
    }
  }
  prompt += `

## Output Requirements
Write a comprehensive recreation prompt with these sections:
1. **Component Overview** — What type of component is this? (card, hero, nav, form, etc.) What is its purpose?
2. **Structure & Hierarchy** — Describe the DOM structure, nesting, and semantic elements
3. **Layout System** — Flex or grid? Direction, alignment, gap values, wrapping behavior
4. **Dimensions & Spacing** — Exact widths, heights, padding, margins in px
5. **Colors** — List every color used with exact hex values and where each is applied
6. **Typography** — Font families, sizes, weights, line heights, letter spacing for each text element
7. **Borders & Shadows** — Border radius, widths, colors, box shadows with exact values
8. **Interaction States** — Hover, focus, active states with exact property changes and transitions
9. **Responsive Behavior** — How should this adapt to different screen sizes?
10. **Images & Icons** — Describe any images, icons, or SVGs and their sizing/positioning

Be specific with every value. Use exact pixel values and hex colors. Do not generalize.`;
  return prompt;
}
