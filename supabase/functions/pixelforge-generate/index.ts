/**
 * DesignGrab — PixelForge Generate Edge Function
 * Takes a DesignTree JSON and generates code in the requested format
 * (Figma plugin, Canva SDK, HTML, React, SVG).
 *
 * Deploy: supabase functions deploy pixelforge-generate
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VALID_FORMATS = ["figma", "canva", "html", "react", "svg"] as const;
type Format = (typeof VALID_FORMATS)[number];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- Types ---

interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  opacity?: number;
}

interface TextProps {
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  textTransform?: "none" | "uppercase" | "lowercase";
  lineHeight?: number;
  letterSpacing?: number;
  maxWidthPct?: number;
  lineCount?: number;
  hierarchy?: "hero" | "heading" | "subheading" | "body" | "caption" | "label";
}

interface DesignElement {
  id: string;
  type: "text" | "image" | "shape" | "icon" | "group" | "container";
  bounds: Bounds;
  region?: string;
  zIndex?: number;
  style?: ElementStyle;
  text?: TextProps;
  children?: string[];
}

interface FontEntry {
  name: string;
  googleFont?: string;
}

interface ColorEntry {
  hex: string;
  rgb?: string;
  usage?: string;
  name?: string;
}

interface DesignTree {
  version?: string;
  canvas: { width: number; height: number; background?: string };
  elements: DesignElement[];
  fonts?: FontEntry[];
  colors?: ColorEntry[];
}

// --- Helpers ---

/** Check if bounds appear to be percentages (0-100 range, small values) */
function looksLikePercentages(tree: DesignTree): boolean {
  if (!tree.elements.length) return false;
  const maxX = Math.max(...tree.elements.map(e => e.bounds.x));
  const maxY = Math.max(...tree.elements.map(e => e.bounds.y));
  // If max positions are <= 100, likely percentages
  return maxX <= 100 && maxY <= 100;
}

/** Convert percentage bounds to pixel bounds */
function pctToPx(bounds: Bounds, canvas: { width: number; height: number }): { x: number; y: number; w: number; h: number } {
  return {
    x: Math.round((bounds.x / 100) * canvas.width),
    y: Math.round((bounds.y / 100) * canvas.height),
    w: Math.round((bounds.w / 100) * canvas.width),
    h: Math.round((bounds.h / 100) * canvas.height),
  };
}

/** Converts "#ff0000" → { r: 1, g: 0, b: 0 } for Figma API */
function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

/** Converts "#ff0000" → "rgb(255, 0, 0)" */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgb(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255})`;
}

/** Builds a Google Fonts CSS import URL from a fonts array */
function buildFontImport(fonts: FontEntry[]): string {
  const families = fonts
    .map((f) => (f.googleFont || f.name).replace(/\s+/g, "+"))
    .filter(Boolean);
  if (!families.length) return "";
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}

/** Escapes &, <, >, ", ' for safe HTML output */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escapes special chars for SVG text content */
function escapeSvg(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Adds indentation (2 spaces per level) to each line */
function indent(str: string, level: number): string {
  const pad = "  ".repeat(level);
  return str
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

/** Resolve element children from the flat elements array */
function getChildren(tree: DesignTree, el: DesignElement): DesignElement[] {
  if (!el.children?.length) return [];
  return el.children
    .map((id) => tree.elements.find((e) => e.id === id))
    .filter(Boolean) as DesignElement[];
}


// --- Generators ---

/** Generates Figma Plugin API code (paste into Figma Dev Console) */
function generateFigmaPlugin(tree: DesignTree): string {
  const lines: string[] = [
    "// Figma Plugin API — paste into Figma Dev Console",
    "// Note: Load Google Fonts manually in Figma before running",
    "(async () => {",
  ];

  for (const el of tree.elements) {
    // Skip children that will be handled by their parent group/container
    const isChild = tree.elements.some((p) => p.children?.includes(el.id));
    if (isChild) continue;
    lines.push(indent(generateFigmaNode(tree, el), 1));
  }

  lines.push("  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);");
  lines.push("})();");
  return lines.join("\n");
}

function generateFigmaNode(tree: DesignTree, el: DesignElement): string {
  const { bounds, style } = el;
  const lines: string[] = [];
  const varName = `node_${el.id.replace(/[^a-zA-Z0-9]/g, "_")}`;

  switch (el.type) {
    case "text": {
      lines.push(`const ${varName} = figma.createText();`);
      lines.push(`await figma.loadFontAsync({ family: "${el.text?.fontFamily || "Inter"}", style: "Regular" });`);
      lines.push(`${varName}.fontName = { family: "${el.text?.fontFamily || "Inter"}", style: "Regular" };`);
      lines.push(`${varName}.fontSize = ${el.text?.fontSize || 16};`);
      lines.push(`${varName}.characters = ${JSON.stringify(el.text?.content || "")};`);
      if (el.text?.color) {
        const rgb = hexToRgb01(el.text.color);
        lines.push(`${varName}.fills = [{ type: 'SOLID', color: { r: ${rgb.r.toFixed(3)}, g: ${rgb.g.toFixed(3)}, b: ${rgb.b.toFixed(3)} } }];`);
      }
      break;
    }
    case "group": {
      const children = getChildren(tree, el);
      const childVars: string[] = [];
      for (const child of children) {
        lines.push(generateFigmaNode(tree, child));
        childVars.push(`node_${child.id.replace(/[^a-zA-Z0-9]/g, "_")}`);
      }
      if (childVars.length) {
        lines.push(`const ${varName} = figma.group([${childVars.join(", ")}], figma.currentPage);`);
      }
      break;
    }
    case "container": {
      lines.push(`const ${varName} = figma.createFrame();`);
      lines.push(`${varName}.resize(${bounds.w}, ${bounds.h});`);
      if (style?.fill) {
        const rgb = hexToRgb01(style.fill);
        lines.push(`${varName}.fills = [{ type: 'SOLID', color: { r: ${rgb.r.toFixed(3)}, g: ${rgb.g.toFixed(3)}, b: ${rgb.b.toFixed(3)} } }];`);
      }
      if (style?.borderRadius) {
        lines.push(`${varName}.cornerRadius = ${style.borderRadius};`);
      }
      const children = getChildren(tree, el);
      for (const child of children) {
        const childVar = `node_${child.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
        lines.push(generateFigmaNode(tree, child));
        lines.push(`${varName}.appendChild(${childVar});`);
      }
      break;
    }
    case "image": {
      lines.push(`// Image placeholder for: ${el.id}`);
      lines.push(`const ${varName} = figma.createRectangle();`);
      lines.push(`${varName}.resize(${bounds.w}, ${bounds.h});`);
      lines.push(`${varName}.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }];`);
      break;
    }
    default: {
      // shape, icon
      lines.push(`const ${varName} = figma.createRectangle();`);
      lines.push(`${varName}.resize(${bounds.w}, ${bounds.h});`);
      if (style?.fill) {
        const rgb = hexToRgb01(style.fill);
        lines.push(`${varName}.fills = [{ type: 'SOLID', color: { r: ${rgb.r.toFixed(3)}, g: ${rgb.g.toFixed(3)}, b: ${rgb.b.toFixed(3)} } }];`);
      }
      if (style?.borderRadius) {
        lines.push(`${varName}.cornerRadius = ${style.borderRadius};`);
      }
      if (el.type === "icon") {
        lines.push(`// Icon element — replace with actual icon SVG`);
      }
      break;
    }
  }

  // Position and opacity (skip for groups — Figma positions them automatically)
  if (el.type !== "group") {
    lines.push(`${varName}.x = ${bounds.x};`);
    lines.push(`${varName}.y = ${bounds.y};`);
    if (style?.opacity !== undefined && style.opacity < 1) {
      lines.push(`${varName}.opacity = ${style.opacity};`);
    }
  }

  return lines.join("\n");
}


/** Generates Canva Apps SDK code */
function generateCanva(tree: DesignTree): string {
  const lines: string[] = [
    "// Canva Apps SDK — use inside a Canva App",
    "// See: https://www.canva.dev/docs/apps/",
    "",
    'import { addElementAtPoint } from "@canva/design";',
    "",
    "export async function addDesignElements() {",
  ];

  for (const el of tree.elements) {
    const isChild = tree.elements.some((p) => p.children?.includes(el.id));
    if (isChild) continue;

    switch (el.type) {
      case "text":
        lines.push(indent([
          `await addElementAtPoint({`,
          `  type: "text",`,
          `  children: [${JSON.stringify(el.text?.content || "")}],`,
          `  fontSize: ${el.text?.fontSize || 16},`,
          `  fontWeight: "${el.text?.fontWeight && el.text.fontWeight >= 700 ? "bold" : "normal"}",`,
          `  color: "${el.text?.color || "#000000"}",`,
          `  top: ${el.bounds.y},`,
          `  left: ${el.bounds.x},`,
          `  width: ${el.bounds.w},`,
          `  height: ${el.bounds.h},`,
          `});`,
        ].join("\n"), 1));
        break;
      case "shape":
      case "container":
      case "icon":
        lines.push(indent([
          `await addElementAtPoint({`,
          `  type: "shape",`,
          `  paths: [{ d: "M 0 0 H ${el.bounds.w} V ${el.bounds.h} H 0 Z", fill: { color: "${el.style?.fill || "#cccccc"}" } }],`,
          `  top: ${el.bounds.y},`,
          `  left: ${el.bounds.x},`,
          `  width: ${el.bounds.w},`,
          `  height: ${el.bounds.h},`,
          `});`,
        ].join("\n"), 1));
        break;
      case "image":
        lines.push(indent([
          `// Image placeholder: ${el.id}`,
          `await addElementAtPoint({`,
          `  type: "shape",`,
          `  paths: [{ d: "M 0 0 H ${el.bounds.w} V ${el.bounds.h} H 0 Z", fill: { color: "#d4d4d4" } }],`,
          `  top: ${el.bounds.y},`,
          `  left: ${el.bounds.x},`,
          `  width: ${el.bounds.w},`,
          `  height: ${el.bounds.h},`,
          `});`,
        ].join("\n"), 1));
        break;
      default:
        break;
    }
    lines.push("");
  }

  lines.push("}");
  return lines.join("\n");
}

/** Generates a full HTML5 document */
function generateHtml(tree: DesignTree): string {
  const { canvas, fonts = [], colors = [] } = tree;
  const fontUrl = buildFontImport(fonts);
  const isPct = looksLikePercentages(tree);

  const cssVars = colors
    .map((c, i) => `  --color-${c.name?.replace(/\s+/g, "-").toLowerCase() || i}: ${c.hex};`)
    .join("\n");

  const elementStyles: string[] = [];
  const elementHtml: string[] = [];

  for (const el of tree.elements) {
    const isChild = tree.elements.some((p) => p.children?.includes(el.id));
    if (isChild) continue;
    elementStyles.push(buildCssRule(el, canvas, isPct));
    elementHtml.push(buildHtmlElement(tree, el, 2));
  }

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "  <title>DesignGrab Export</title>",
    fontUrl ? `  <link rel="stylesheet" href="${fontUrl}">` : "",
    "  <style>",
    "    :root {",
    cssVars,
    "    }",
    `    .canvas { position: relative; width: ${canvas.width}px; height: ${canvas.height}px; background: ${canvas.background || "#ffffff"}; margin: 0 auto; overflow: hidden; }`,
    ...elementStyles.map((s) => indent(s, 2)),
    "  </style>",
    "</head>",
    "<body>",
    '  <div class="canvas">',
    ...elementHtml,
    "  </div>",
    "</body>",
    "</html>",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildCssRule(el: DesignElement, canvas: { width: number; height: number }, isPct: boolean): string {
  const px = isPct ? pctToPx(el.bounds, canvas) : { x: el.bounds.x, y: el.bounds.y, w: el.bounds.w, h: el.bounds.h };
  const { style, text } = el;
  const props: string[] = [
    "position: absolute",
    `left: ${px.x}px`,
    `top: ${px.y}px`,
    `width: ${px.w}px`,
  ];
  // For text, use auto height with max-height to allow wrapping
  if (el.type === "text") {
    props.push(`max-height: ${px.h}px`);
  } else {
    props.push(`height: ${px.h}px`);
  }
  if (style?.fill) props.push(`background-color: ${style.fill}`);
  if (style?.borderRadius) props.push(`border-radius: ${style.borderRadius}px`);
  if (style?.opacity !== undefined && style.opacity < 1) props.push(`opacity: ${style.opacity}`);
  if (style?.stroke) props.push(`border: ${style?.strokeWidth || 1}px solid ${style.stroke}`);
  if (text) {
    if (text.fontFamily) props.push(`font-family: '${text.fontFamily}', sans-serif`);
    if (text.fontSize) props.push(`font-size: ${text.fontSize}px`);
    if (text.fontWeight) props.push(`font-weight: ${text.fontWeight}`);
    if (text.color) props.push(`color: ${text.color}`);
    if (text.align) props.push(`text-align: ${text.align}`);
    if (text.textTransform && text.textTransform !== "none") props.push(`text-transform: ${text.textTransform}`);
    if (text.lineHeight) props.push(`line-height: ${text.lineHeight}`);
    if (text.letterSpacing) props.push(`letter-spacing: ${text.letterSpacing}px`);
    props.push("word-wrap: break-word");
    props.push("overflow-wrap: break-word");
  }
  return `.el-${el.id.replace(/[^a-zA-Z0-9]/g, "-")} { ${props.join("; ")}; }`;
}

function buildHtmlElement(tree: DesignTree, el: DesignElement, depth: number): string {
  const cls = `el-${el.id.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const pad = "  ".repeat(depth);

  if (el.type === "text") {
    return `${pad}<span class="${cls}">${escapeHtml(el.text?.content || "")}</span>`;
  }

  const children = getChildren(tree, el);
  if (!children.length) {
    return `${pad}<div class="${cls}"></div>`;
  }

  const inner = children.map((c) => buildHtmlElement(tree, c, depth + 1)).join("\n");
  return `${pad}<div class="${cls}">\n${inner}\n${pad}</div>`;
}


/** Generates a React functional component */
function generateReact(tree: DesignTree): string {
  const { canvas, fonts = [] } = tree;
  const fontUrl = buildFontImport(fonts);
  const isPct = looksLikePercentages(tree);

  const lines: string[] = [
    'import React from "react";',
    "",
    fontUrl ? `// Add to your HTML head: <link rel="stylesheet" href="${fontUrl}">` : "",
    "",
    "interface DesignComponentProps {",
  ];

  // Collect text props with defaults
  const textEls = tree.elements.filter((el) => el.type === "text" && el.text?.content);
  for (const el of textEls) {
    const propName = `text_${el.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
    lines.push(`  ${propName}?: string;`);
  }
  lines.push("}");
  lines.push("");

  // Build default props
  const defaults: string[] = [];
  for (const el of textEls) {
    const propName = `text_${el.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
    defaults.push(`  ${propName} = ${JSON.stringify(el.text?.content || "")}`);
  }

  lines.push(`export default function DesignComponent({`);
  if (defaults.length) {
    lines.push(defaults.join(",\n"));
  }
  lines.push(`}: DesignComponentProps) {`);
  lines.push(`  return (`);
  lines.push(`    <div className="relative mx-auto overflow-hidden" style={{ width: ${canvas.width}, height: ${canvas.height}, background: "${canvas.background || "#ffffff"}" }}>`);

  for (const el of tree.elements) {
    const isChild = tree.elements.some((p) => p.children?.includes(el.id));
    if (isChild) continue;
    lines.push(buildReactElement(tree, el, 3, canvas, isPct));
  }

  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`}`);

  return lines.filter(Boolean).join("\n");
}

function buildReactElement(tree: DesignTree, el: DesignElement, depth: number, canvas: { width: number; height: number }, isPct: boolean): string {
  const pad = "  ".repeat(depth);
  const px = isPct ? pctToPx(el.bounds, canvas) : { x: el.bounds.x, y: el.bounds.y, w: el.bounds.w, h: el.bounds.h };
  const style: Record<string, string | number> = {
    position: "absolute",
    left: px.x,
    top: px.y,
    width: px.w,
    height: px.h,
  };

  if (el.style?.fill) style.backgroundColor = el.style.fill;
  if (el.style?.borderRadius) style.borderRadius = el.style.borderRadius;
  if (el.style?.opacity !== undefined && el.style.opacity < 1) style.opacity = el.style.opacity;
  if (el.style?.stroke) style.border = `1px solid ${el.style.stroke}`;

  if (el.text) {
    if (el.text.fontFamily) style.fontFamily = `'${el.text.fontFamily}', sans-serif`;
    if (el.text.fontSize) style.fontSize = el.text.fontSize;
    if (el.text.fontWeight) style.fontWeight = el.text.fontWeight;
    if (el.text.color) style.color = el.text.color;
    if (el.text.align) style.textAlign = el.text.align;
  }

  const styleStr = JSON.stringify(style);

  if (el.type === "text") {
    const propName = `text_${el.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
    return `${pad}<span style={${styleStr}}>{${propName}}</span>`;
  }

  const children = getChildren(tree, el);
  if (!children.length) {
    return `${pad}<div style={${styleStr}} />`;
  }

  const inner = children.map((c) => buildReactElement(tree, c, depth + 1, canvas, isPct)).join("\n");
  return `${pad}<div style={${styleStr}}>\n${inner}\n${pad}</div>`;
}

/** Generates an SVG document with foreignObject for text wrapping */
function generateSvg(tree: DesignTree): string {
  const { canvas } = tree;
  const isPct = looksLikePercentages(tree);

  // Collect Google Font families for import
  const fontFamilies = new Set<string>();
  for (const el of tree.elements) {
    if (el.text?.fontFamily) fontFamilies.add(el.text.fontFamily);
  }
  for (const f of tree.fonts || []) {
    fontFamilies.add(f.googleFont || f.name);
  }

  const lines: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">`,
    `  <defs>`,
    `    <pattern id="img-placeholder" patternUnits="userSpaceOnUse" width="16" height="16">`,
    `      <rect width="16" height="16" fill="#1a1a2e"/>`,
    `      <line x1="0" y1="0" x2="16" y2="16" stroke="#2a2a3e" stroke-width="1"/>`,
    `      <line x1="16" y1="0" x2="0" y2="16" stroke="#2a2a3e" stroke-width="1"/>`,
    `    </pattern>`,
    `  </defs>`,
  ];

  // Google Fonts CSS import via foreignObject
  if (fontFamilies.size > 0) {
    const familyStr = [...fontFamilies].map(f => f.replace(/\s+/g, "+")).join("&family=");
    lines.push(`  <defs>`);
    lines.push(`    <style>@import url('https://fonts.googleapis.com/css2?family=${familyStr}&amp;display=swap');</style>`);
    lines.push(`  </defs>`);
  }

  // Canvas background
  if (canvas.background) {
    lines.push(`  <rect width="${canvas.width}" height="${canvas.height}" fill="${canvas.background}" />`);
  }

  // Sort all elements by zIndex, flatten hierarchy for SVG
  const sorted = [...tree.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Render each element
  for (const el of sorted) {
    const px = isPct ? pctToPx(el.bounds, canvas) : { x: el.bounds.x, y: el.bounds.y, w: el.bounds.w, h: el.bounds.h };
    const svgLines = buildSvgElement(el, px, canvas);
    if (svgLines) lines.push(svgLines);
  }

  lines.push("</svg>");
  return lines.join("\n");
}

function buildSvgElement(
  el: DesignElement,
  px: { x: number; y: number; w: number; h: number },
  canvas: { width: number; height: number }
): string {
  const { style } = el;
  const fill = style?.fill || "none";
  const strokeAttr = style?.stroke ? ` stroke="${style.stroke}" stroke-width="${style?.strokeWidth || 1}"` : "";
  const opacityAttr = style?.opacity !== undefined && style.opacity < 1 ? ` opacity="${style.opacity}"` : "";
  const rx = style?.borderRadius ? ` rx="${style.borderRadius}"` : "";

  switch (el.type) {
    case "text": {
      const fontSize = el.text?.fontSize || 16;
      const fontFamily = el.text?.fontFamily || "Inter, sans-serif";
      const fontWeight = el.text?.fontWeight || 400;
      const textColor = el.text?.color || "#ffffff";
      const textAlign = el.text?.align || "left";
      const textTransform = el.text?.textTransform || "none";
      const lineHeight = el.text?.lineHeight || 1.15;
      const letterSpacing = el.text?.letterSpacing ? `letter-spacing: ${el.text.letterSpacing}px;` : "";
      const content = (el.text?.content || "").replace(/\n/g, "<br/>");

      // Use maxWidthPct if available, otherwise use element width
      const textWidth = el.text?.maxWidthPct
        ? Math.round((el.text.maxWidthPct / 100) * canvas.width)
        : px.w;

      // Calculate height — if lineCount available, use it; otherwise use element height with padding
      const estimatedHeight = el.text?.lineCount
        ? Math.ceil(el.text.lineCount * fontSize * lineHeight) + 16
        : Math.max(px.h, Math.ceil(fontSize * lineHeight * 2));

      const lines: string[] = [
        `  <foreignObject x="${px.x}" y="${px.y}" width="${textWidth}" height="${estimatedHeight}"${opacityAttr}>`,
        `    <div xmlns="http://www.w3.org/1999/xhtml" style="`,
        `      font-family: '${fontFamily}', sans-serif;`,
        `      font-size: ${fontSize}px;`,
        `      font-weight: ${fontWeight};`,
        `      color: ${textColor};`,
        `      text-align: ${textAlign};`,
        `      text-transform: ${textTransform};`,
        `      line-height: ${lineHeight};`,
        `      ${letterSpacing}`,
        `      word-wrap: break-word;`,
        `      overflow-wrap: break-word;`,
        `      margin: 0;`,
        `      padding: 0;`,
        `    ">${escapeSvg(content)}</div>`,
        `  </foreignObject>`,
      ];
      return lines.join("\n");
    }
    case "image": {
      // Crosshatch pattern placeholder with dimensions label
      const cx = px.x + px.w / 2;
      const cy = px.y + px.h / 2;
      const lines: string[] = [
        `  <rect x="${px.x}" y="${px.y}" width="${px.w}" height="${px.h}" fill="url(#img-placeholder)"${rx} stroke="#333" stroke-width="1"${opacityAttr} />`,
        `  <text x="${cx}" y="${cy}" font-family="Inter, sans-serif" font-size="12" fill="#666" text-anchor="middle" dominant-baseline="middle">${px.w}×${px.h}</text>`,
      ];
      return lines.join("\n");
    }
    case "group":
      return "";
    case "container":
    case "shape":
    case "icon":
      return `  <rect x="${px.x}" y="${px.y}" width="${px.w}" height="${px.h}" fill="${fill}"${rx}${strokeAttr}${opacityAttr} />`;
    default:
      return "";
  }
}


// --- Route map ---

const generators: Record<Format, (tree: DesignTree) => string> = {
  figma: generateFigmaPlugin,
  canva: generateCanva,
  html: generateHtml,
  react: generateReact,
  svg: generateSvg,
};

// --- Handler ---

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { design_tree, format } = await req.json();

    if (!design_tree) {
      return new Response(
        JSON.stringify({ error: "Missing design_tree parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!format || !VALID_FORMATS.includes(format as Format)) {
      return new Response(
        JSON.stringify({
          error: `Invalid format. Must be one of: ${VALID_FORMATS.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const generator = generators[format as Format];

    try {
      const code = generator(design_tree as DesignTree);
      return new Response(
        JSON.stringify({ code, format }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (genErr) {
      return new Response(
        JSON.stringify({
          error: `Generator failed for format "${format}"`,
          details: (genErr as Error).message,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
