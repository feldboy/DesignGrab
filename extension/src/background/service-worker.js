/**
 * DesignGrab — Background Service Worker
 * Handles message routing, side panel management, and asset downloads.
 */

// Open side panel when extension icon is clicked (on supported browsers)
chrome.sidePanel?.setOptions?.({ enabled: true });

/**
 * Handle extension icon click — open side panel
 */
chrome.action.onClicked?.addListener(async (tab) => {
    try {
        await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
        // Fallback: popup will handle this
    }
});

/**
 * Handle global keyboard shortcut (Cmd+Shift+G / Ctrl+Shift+G)
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'toggle-inspector') {
        try {
            // Open side panel first
            await chrome.sidePanel.open({ tabId: tab.id });
        } catch (e) {
            // Side panel may already be open
        }
        // Toggle inspector on the page
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECT' }, (response) => {
            if (chrome.runtime.lastError) {
                // Content script not loaded — inject and retry
                injectContentScript(tab.id).then(() => {
                    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECT' });
                }).catch(() => { });
            }
        });
    }
});

/**
 * Message routing between popup, content script, and panel
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, payload } = message;

    switch (type) {
        case 'TOGGLE_INSPECT':
        case 'START_INSPECT':
        case 'STOP_INSPECT':
        case 'EXTRACT_ASSETS':
        case 'EXPORT_FULL_CONTEXT':
        case 'EXPORT_FIGMA_SVG':
        case 'EXPORT_RESPONSIVE_HTML':
        case 'GET_CHILD_ELEMENTS':
            // Forward to content script of active tab
            forwardToActiveTab(message, sendResponse);
            return true; // async response

        case 'DOWNLOAD_FILE':
            // Download a file using the downloads API (bypasses CORS)
            handleDownload(payload);
            sendResponse({ success: true });
            break;

        case 'FETCH_ASSET':
            // Fetch an asset via background (bypasses CORS)
            fetchAsset(payload.url).then(data => {
                sendResponse({ success: true, data });
            }).catch(err => {
                sendResponse({ success: false, error: err.message });
            });
            return true; // async response

        case 'AI_EXPORT':
        case 'FIGMA_EXPORT':
            // Call Gemini API from service worker
            handleAIExport(payload, type === 'FIGMA_EXPORT').then(result => {
                sendResponse(result);
            }).catch(err => {
                sendResponse({ error: err.message });
            });
            return true; // async response

        case 'AI_DESCRIBE_COMPONENT':
            // AI-powered component description for recreation prompts
            handleAIDescribe(payload).then(result => {
                sendResponse(result);
            }).catch(err => {
                sendResponse({ error: err.message });
            });
            return true; // async response

        case 'OPEN_SIDE_PANEL':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => { });
                }
            });
            sendResponse({ success: true });
            break;

        case 'ELEMENT_PINNED':
        case 'INSPECT_MODE_CHANGED':
        case 'ASSETS_EXTRACTED':
            // Broadcast to all extension pages (panel, popup)
            chrome.runtime.sendMessage(message).catch(() => { });
            break;

        default:
            break;
    }
});

/**
 * Forward a message to the content script of the active tab
 */
function forwardToActiveTab(message, sendResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            sendResponse({ error: 'No active tab' });
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
                // Content script might not be loaded yet — inject it
                injectContentScript(tabs[0].id).then(() => {
                    // Retry the message
                    chrome.tabs.sendMessage(tabs[0].id, message, (retryResponse) => {
                        sendResponse(retryResponse || { error: 'Content script not responding' });
                    });
                }).catch(err => {
                    sendResponse({ error: err.message });
                });
            } else {
                sendResponse(response);
            }
        });
    });
}

/**
 * Inject content script into a tab
 */
async function injectContentScript(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
    } catch (err) {
        console.error('[DesignGrab] Failed to inject content script:', err);
        throw err;
    }
}

/**
 * Download a file using chrome.downloads API
 */
function handleDownload({ url, filename }) {
    chrome.downloads.download({
        url,
        filename: filename || getFilenameFromUrl(url),
        saveAs: false
    }, (downloadId) => {
        if (chrome.runtime.lastError) {
            console.error('[DesignGrab] Download failed:', chrome.runtime.lastError);
        }
    });
}

/**
 * Fetch an asset via the background script (bypasses CORS)
 */
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

/**
 * Extract filename from URL
 */
function getFilenameFromUrl(url) {
    try {
        const pathname = new URL(url).pathname;
        const parts = pathname.split('/');
        return parts[parts.length - 1] || 'download';
    } catch {
        return 'download';
    }
}

/**
 * Build a rich prompt for React/Vue AI export using full design context
 */
function buildComponentPrompt(context, framework) {
    const frameworkName = framework === 'vue' ? 'Vue 3 (Composition API)' : 'React';
    const fileExt = framework === 'vue' ? '.vue' : '.tsx';

    const { html, css, layout, colors, fonts, tailwindConfig, animations } = context;

    let prompt = `You are a senior ${frameworkName} developer. Convert the following HTML+CSS into a pixel-perfect, production-ready ${frameworkName} component.

CRITICAL: Use the exact design tokens provided below — do NOT approximate colors, fonts, or sizes.

## Source HTML
${(html || '').slice(0, 8000)}

## Source CSS
${(css || '').slice(0, 4000)}`;

    // Design tokens: Colors
    if (colors) {
        prompt += `\n\n## Design Tokens — Colors`;
        if (colors.palette?.length) {
            prompt += `\nPalette (use these exact values):`;
            for (const c of colors.palette.slice(0, 12)) {
                prompt += `\n- ${c.hex} (${c.name || 'unnamed'}, used ${c.count}x)`;
            }
        }
        if (colors.backgrounds?.length) prompt += `\nBackground colors: ${colors.backgrounds.join(', ')}`;
        if (colors.textColors?.length) prompt += `\nText colors: ${colors.textColors.join(', ')}`;
        if (colors.accentColors?.length) prompt += `\nAccent colors: ${colors.accentColors.join(', ')}`;
    }

    // Typography
    if (fonts) {
        prompt += `\n\n## Design Tokens — Typography`;
        if (fonts.fonts?.length) {
            prompt += `\nFont families:`;
            for (const f of fonts.fonts.slice(0, 5)) {
                const usage = [f.usage?.headings && 'headings', f.usage?.body && 'body', f.usage?.code && 'code'].filter(Boolean).join(', ');
                prompt += `\n- "${f.family}" (weights: ${f.weights.join(', ')}${usage ? `, used for: ${usage}` : ''})`;
            }
        }
        if (fonts.fontScale) {
            prompt += `\nType scale:`;
            for (const [level, value] of Object.entries(fonts.fontScale)) {
                prompt += `\n- ${level}: ${value}`;
            }
        }
    }

    // Layout structure
    if (layout) {
        if (layout.structuralHTML) {
            prompt += `\n\n## Layout Structure (Tailwind)
${layout.structuralHTML.slice(0, 3000)}`;
        }
        if (layout.ascii) {
            prompt += `\n\nASCII layout:\n${layout.ascii.slice(0, 1500)}`;
        }
    }

    // Animations
    if (animations?.items?.length) {
        prompt += `\n\n## Animations`;
        for (const anim of animations.items.slice(0, 5)) {
            if (anim.type === 'keyframe') {
                prompt += `\n- Keyframe "${anim.name}" on ${anim.element}: duration ${anim.duration}, timing ${anim.timingFunction}`;
            } else if (anim.type === 'transition') {
                prompt += `\n- Transition on ${anim.element}: ${anim.transition}`;
            }
        }
        if (animations.keyframesCSS) {
            prompt += `\n\nKeyframes CSS:\n${animations.keyframesCSS.slice(0, 2000)}`;
        }
    }

    // Tailwind config
    if (tailwindConfig) {
        prompt += `\n\n## Tailwind Config (use these tokens in your component)
${tailwindConfig.slice(0, 3000)}`;
    }

    prompt += `\n\n## Requirements
- ${framework === 'react' ? 'Use TypeScript with proper prop types' : 'Use TypeScript with defineProps'}
- Use Tailwind CSS for all styling (no inline styles or CSS files)
- Use the EXACT color values from the palette above (not approximations)
- Use the EXACT font families and sizes from the typography scale
- Replicate the layout structure from Layout DNA
- Include animation keyframes/transitions if present above
- Make text content and images configurable via props with sensible defaults
- Responsive design (mobile-first)
- Semantic HTML with aria labels
- ${framework === 'react' ? 'Export as default function component' : 'Use <script setup lang="ts"> syntax'}
- Output ONLY the component code, no explanations

Output the complete ${fileExt} file:`;

    return prompt;
}

/**
 * Build a Figma-specific prompt that outputs ONLY pasteable SVG
 */
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
${(html || '').slice(0, 12000)}

## Source CSS (exact computed styles for every element)
${(css || '').slice(0, 8000)}`;

    if (colors) {
        prompt += `\n\n## Extracted Color Palette`;
        if (colors.backgrounds?.length) prompt += `\nBackgrounds: ${colors.backgrounds.join(', ')}`;
        if (colors.textColors?.length) prompt += `\nText colors: ${colors.textColors.join(', ')}`;
        if (colors.accentColors?.length) prompt += `\nAccent colors: ${colors.accentColors.join(', ')}`;
        if (colors.palette?.length) {
            for (const c of colors.palette.slice(0, 15)) {
                prompt += `\n- ${c.hex} (${c.name || 'unnamed'}, ${c.count}x)`;
            }
        }
    }

    if (fonts) {
        prompt += `\n\n## Typography`;
        if (fonts.fonts?.length) {
            for (const f of fonts.fonts.slice(0, 5)) {
                prompt += `\n- font-family: "${f.family}", weights: ${f.weights.join(', ')}`;
            }
        }
        if (fonts.fontScale) {
            for (const [level, value] of Object.entries(fonts.fontScale)) {
                prompt += `\n- ${level}: ${value}`;
            }
        }
    }

    if (layout?.ascii) {
        prompt += `\n\n## Layout Tree\n${layout.ascii.slice(0, 2000)}`;
    }

    prompt += `\n\nOutput ONLY the raw SVG now. No text before or after. Start with <svg, end with </svg>.`;

    return prompt;
}

/**
 * Handle AI export — call Google Gemini API
 * API key is loaded from chrome.storage.local (set via extension config or env.js)
 */
const GEMINI_MODEL = 'gemini-3-flash-preview';

async function getGeminiApiKey() {
    const data = await chrome.storage.local.get(['geminiApiKey']);
    if (data.geminiApiKey) return data.geminiApiKey;

    // Fallback: try loading from bundled env config
    try {
        const { GEMINI_API_KEY } = await import('../config/env.js');
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
            return GEMINI_API_KEY;
        }
    } catch (e) {
        // env.js not found — expected if not configured
    }

    return null;
}

async function handleAIExport(payload, isFigma = false) {
    const { context, html, css, layout, framework = 'react' } = payload;

    // Check subscription — only pro/lifetime can use AI exports
    const storageData = await chrome.storage.local.get(['plan', 'userId']);
    const plan = storageData.plan || 'free';
    if (!storageData.userId) {
        return { error: 'Sign in with Google to use AI exports.' };
    }
    if (plan === 'free') {
        return { error: 'AI exports require a Pro or Lifetime subscription. Upgrade in Settings.' };
    }

    // Support both old (html/css only) and new (full context) payloads
    const hasContext = context && context.html;
    if (!hasContext && !html) {
        return { error: 'Missing html parameter' };
    }

    // Get API key securely
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
        return { error: 'Gemini API key not configured. Set it in extension settings.' };
    }

    let prompt;
    if (isFigma) {
        prompt = buildFigmaPrompt(hasContext ? context : { html, css, layout });
    } else if (hasContext) {
        prompt = buildComponentPrompt(context, framework);
    } else {
        // Fallback: old-style minimal prompt (backwards compat)
        const frameworkName = framework === 'vue' ? 'Vue 3 (Composition API)' : 'React';
        const fileExt = framework === 'vue' ? '.vue' : '.tsx';
        prompt = `You are a senior ${frameworkName} developer. Convert the following HTML+CSS into a clean, production-ready ${frameworkName} component.

Requirements:
- ${framework === 'react' ? 'Use TypeScript with proper prop types' : 'Use TypeScript with defineProps'}
- Use Tailwind CSS for all styling
- Make text/images configurable via props
- Responsive, semantic HTML, aria labels
- ${framework === 'react' ? 'Export as default function component' : 'Use <script setup lang="ts"> syntax'}
- Output ONLY the component code

HTML:\n${html.slice(0, 8000)}\n\nCSS:\n${(css || '').slice(0, 4000)}
${layout ? `\nLayout:\n${layout.slice(0, 2000)}` : ''}

Output the complete ${fileExt} file:`;
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: isFigma ? 16384 : 8192,
                },
            }),
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    let code = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if present
    code = code.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');

    // For Figma exports, extract only the raw SVG — strip any surrounding text/markdown
    if (isFigma) {
        const svgMatch = code.match(/<svg[\s\S]*<\/svg>/i);
        if (svgMatch) {
            code = svgMatch[0];
        }
    }

    return { code, framework: isFigma ? 'figma' : framework, model: GEMINI_MODEL };
}

/**
 * Handle AI component description — generates a natural language prompt for recreation
 */
async function handleAIDescribe(payload) {
    const { context } = payload;
    if (!context?.html) {
        return { error: 'Missing component context' };
    }

    const storageData = await chrome.storage.local.get(['plan', 'userId']);
    const plan = storageData.plan || 'free';
    if (!storageData.userId) {
        return { error: 'Sign in with Google to use AI features.' };
    }
    if (plan === 'free') {
        return { error: 'AI features require a Pro or Lifetime subscription. Upgrade in Settings.' };
    }

    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
        return { error: 'Gemini API key not configured. Set it in extension settings.' };
    }

    const prompt = buildDescribePrompt(context);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 4096 },
            }),
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    let description = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    description = description.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');

    return { description, mode: 'ai-prompt', model: GEMINI_MODEL };
}

/**
 * Build prompt for AI component description
 */
function buildDescribePrompt(context) {
    const { html, css, layout, colors, fonts, animations } = context;

    let prompt = `You are an expert UI/UX analyst. Analyze the following web component and write a detailed, structured natural language description that another designer or AI could use to recreate this component pixel-perfectly.

## Source HTML
${(html || '').slice(0, 8000)}

## Source CSS
${(css || '').slice(0, 5000)}`;

    if (colors) {
        prompt += `\n\n## Colors`;
        if (colors.palette?.length) {
            prompt += `\nPalette: ${colors.palette.slice(0, 12).map(c => `${c.hex} (${c.name || 'unnamed'})`).join(', ')}`;
        }
        if (colors.backgrounds?.length) prompt += `\nBackgrounds: ${colors.backgrounds.join(', ')}`;
        if (colors.textColors?.length) prompt += `\nText: ${colors.textColors.join(', ')}`;
        if (colors.accentColors?.length) prompt += `\nAccents: ${colors.accentColors.join(', ')}`;
    }

    if (fonts) {
        prompt += `\n\n## Typography`;
        if (fonts.fonts?.length) {
            for (const f of fonts.fonts.slice(0, 5)) {
                prompt += `\n- "${f.family}" weights: ${f.weights.join(', ')}`;
            }
        }
        if (fonts.fontScale) {
            for (const [level, value] of Object.entries(fonts.fontScale)) {
                prompt += `\n- ${level}: ${value}`;
            }
        }
    }

    if (layout?.structuralHTML) {
        prompt += `\n\n## Layout Structure\n${layout.structuralHTML.slice(0, 2000)}`;
    }
    if (layout?.ascii) {
        prompt += `\n\n## ASCII Layout\n${layout.ascii.slice(0, 1000)}`;
    }

    if (animations?.items?.length) {
        prompt += `\n\n## Animations`;
        for (const anim of animations.items.slice(0, 5)) {
            if (anim.type === 'keyframe') prompt += `\n- Keyframe "${anim.name}": ${anim.duration}, ${anim.timingFunction}`;
            else prompt += `\n- Transition: ${anim.transition}`;
        }
    }

    prompt += `\n\n## Output Requirements
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
