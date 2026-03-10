# PixelForge — Integration Specification v1.0

> **Image → Editable Design Components**
> Upload any image, get editable Figma/Canva components or production code.
> Integrated as a new feature within the existing DesignGrab Chrome Extension.

| Dimension | Detail |
|-----------|--------|
| Product Name | PixelForge (feature within DesignGrab) |
| One-liner | Upload any image, get editable Figma/Canva components or production code |
| Target User | Designers editing AI-generated images (Nano Banana, Midjourney, DALL-E) |
| Input Formats | PNG, JPEG, JPG, PDF, PPTX |
| Output Formats | Figma plugin JSON, Canva App SDK, HTML/CSS/React code, SVG |
| Distribution | New tab in existing DesignGrab Chrome Extension + Supabase Edge Function |
| Existing Stack | Preact, Vite, Chrome MV3, Supabase, Stripe billing, Claude API |
| AI Core | Claude Vision API (primary reasoning) + specialized tool calls |
| Architecture | AI-native agentic pipeline — LLM reasons and orchestrates tools |

---

## 1. Integration Strategy

PixelForge is NOT a separate product. It integrates into the existing DesignGrab extension as a new "PixelForge" tab alongside the existing 10 tabs (Figma, Inspector, Assets, Colors, Fonts, Code, Layout, Anims, Library, Settings).

### 1.1 What Already Exists (Reuse)

| Existing Component | Location | Reuse For PixelForge |
|-------------------|----------|---------------------|
| Chrome Extension shell | `extension/manifest.json` | Already MV3, has all needed permissions |
| Preact UI framework | `extension/src/panel/App.jsx` | Add PixelForge as new tab in existing tab grid |
| Auth system | `extension/src/lib/auth.js` | Google OAuth already working — gate PixelForge behind Pro plan |
| Billing/Usage tracking | `extension/src/lib/billing.js`, `usageTracker.js` | Add `pixelforge_analysis` as new metered action |
| Supabase client | `extension/src/lib/supabase.js` | Already configured — use for storing analysis results |
| Claude API proxy | `supabase/functions/ai-export/index.ts` | Extend or create sibling function for Vision analysis |
| Vite build | `extension/vite.config.js` | No changes needed — new files auto-bundled |
| CSS theme | `extension/src/panel/styles/panel.css` | Reuse existing dark theme variables and component styles |
| Storage utilities | `extension/src/lib/storage.js` | Cache analysis results locally |
| Color utilities | `extension/src/lib/colorUtils.js` | Reuse for color extraction post-processing |

### 1.2 What Needs to Be Built (New)

| New Component | Location | Purpose |
|--------------|----------|---------|
| PixelForge tab UI | `extension/src/panel/components/PixelForgeTab.jsx` | Upload, preview, export UI |
| Analysis edge function | `supabase/functions/pixelforge-analyze/index.ts` | Claude Vision + tool orchestration |
| Format generators | `supabase/functions/pixelforge-generate/index.ts` | DesignTree → Figma/Canva/Code |
| DesignTree types | `extension/src/lib/designTree.js` | Shared schema for analysis results |
| Font matching util | `extension/src/lib/fontMatcher.js` | Google Fonts lookup + matching |

### 1.3 The AI-Native Pipeline

| Step | What Happens | Where It Runs |
|------|-------------|---------------|
| 1. Upload | User drops image in PixelForge tab | Extension UI (PixelForgeTab.jsx) |
| 2. Pre-process | Validate format, resize if needed | Extension (client-side via Canvas API) |
| 3. Analyze | Claude Vision decomposes image into DesignTree | Supabase Edge Function (pixelforge-analyze) |
| 4. Enrich | LLM calls tools: font detection, color extraction, icon matching | Inside the same edge function |
| 5. Generate | Convert DesignTree into target format | Supabase Edge Function (pixelforge-generate) |
| 6. Deliver | User gets copy-pasteable output in the tab | Extension UI |

---

## 2. Architecture Changes

### 2.1 Extension Changes

#### manifest.json — No Changes Needed

The existing manifest already has all required permissions:
- `activeTab`, `scripting` — already present
- `storage` — already present
- `sidePanel` — already present
- No new permissions required since image upload goes to Supabase, not a new API

#### App.jsx — Add PixelForge Tab

Add to the existing TABS array in `extension/src/panel/App.jsx`:

```jsx
// Add to TABS array (position 2, after Figma)
{ id: 'pixelforge', label: 'PixelForge', icon: '🔮', highlight: true },
```

Add the tab rendering in the content section:

```jsx
{activeTab === 'pixelforge' && (
    <PixelForgeTab />
)}
```

#### panel.css — Minimal Additions

Reuse existing styles (`.code-block-wrapper`, `.export-btn`, `.segmented-control`, `.panel-loading`, `.fade-in`). Only add PixelForge-specific styles for the upload dropzone and layer preview.

### 2.2 New Files in Extension

```
extension/src/
├── panel/components/
│   └── PixelForgeTab.jsx      # Main PixelForge UI (upload, preview, export)
├── lib/
│   ├── designTree.js          # DesignTree schema + validation helpers
│   ├── fontMatcher.js         # Google Fonts matching utility
│   └── pixelforgeApi.js       # API client for pixelforge edge functions
```

### 2.3 New Supabase Edge Functions

```
supabase/functions/
├── pixelforge-analyze/
│   └── index.ts               # Claude Vision analysis with tool_use
├── pixelforge-generate/
│   └── index.ts               # DesignTree → Figma/Canva/HTML/React
```

### 2.4 Database Changes

Add to existing `supabase/schema.sql`:

```sql
-- PixelForge analysis results (cached)
CREATE TABLE IF NOT EXISTS pixelforge_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_format TEXT NOT NULL,          -- 'png', 'jpeg', 'pdf', 'pptx'
    source_width INTEGER,
    source_height INTEGER,
    design_tree JSONB NOT NULL,           -- Full DesignTree JSON
    outputs JSONB DEFAULT '{}',           -- Generated outputs (figma, canva, html, react)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pixelforge_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own results" ON pixelforge_results
    FOR ALL USING (auth.uid() = user_id);
```

Add `pixelforge_analysis` to the usage tracking system (existing `usage_logs` table already supports arbitrary action types).

Update the `plans` table limits:

| Plan | pixelforge_analysis limit |
|------|--------------------------|
| Free | 3/month |
| Pro | 100/month |
| Lifetime | 100/month |

---

## 3. DesignTree Schema

The unified intermediate format between analysis and generation. Defined in `extension/src/lib/designTree.js`:

| Field | Type | Description |
|-------|------|-------------|
| `version` | `'1.0'` | Schema version |
| `canvas` | `{ width, height, background }` | Root canvas dimensions and background |
| `elements[]` | `DesignElement[]` | All design elements |
| `element.type` | `enum` | `text` \| `image` \| `shape` \| `icon` \| `group` \| `container` |
| `element.bounds` | `{ x, y, w, h, rotation }` | Position in px relative to canvas |
| `element.style` | `StyleObject` | Fill, stroke, shadow, borderRadius, opacity |
| `element.text` | `TextProperties?` | Content, fontFamily, fontSize, fontWeight, color, align |
| `element.children` | `string[]?` | Child element IDs (for groups/containers) |
| `element.zIndex` | `number` | Layer ordering |
| `fonts` | `FontMatch[]` | Detected fonts with Google Font equivalents |
| `colors` | `Color[]` | Extracted color palette |

---

## 4. AI Analysis Engine (Edge Function)

### 4.1 `supabase/functions/pixelforge-analyze/index.ts`

This is the brain. It receives an image (base64), sends it to Claude Vision with `tool_use`, and returns a DesignTree.

#### System Prompt Strategy

| Prompt Section | Purpose |
|---------------|---------|
| Role Definition | "You are a design decomposition expert. Analyze this image and identify every visual element." |
| Output Schema | "Return a valid DesignTree JSON matching the provided schema." |
| Element Rules | "Classify each element as: text, image, shape, icon, group, or container." |
| Font Rules | "For every text element, estimate font family and call `font_identify` for closest match." |
| Layout Rules | "Identify alignment patterns: centered, left-aligned, grid, flex." |
| Hierarchy Rules | "Group related elements. A button = container with shape + text child." |

#### Tool Definitions (Claude tool_use)

| Tool Name | Input | Output | When Called |
|-----------|-------|--------|------------|
| `font_identify` | `{ text_sample, style_hints }` | `{ font_name, google_font, confidence, alternatives[] }` | For every text element |
| `color_extract` | `{ region_description }` | `{ palette[], gradients[], dominant }` | Once per image or per region |
| `ocr_extract` | `{ region_description, language? }` | `{ text, confidence }` | When text is unclear |
| `icon_match` | `{ description }` | `{ library, icon_name, svg_suggestion }` | When small vector graphics detected |
| `validate_schema` | `{ design_tree_json }` | `{ valid, errors[] }` | Before returning final output |

#### Integration with Existing AI Export

The existing `ai-export` function uses Claude Sonnet for code generation. PixelForge analysis uses Claude Vision (same model, different capability). The edge function pattern is identical:

```typescript
// Same pattern as existing ai-export/index.ts
import Anthropic from "npm:@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

// But with vision + tool_use
const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 8192,
    tools: [...toolDefinitions],
    messages: [{
        role: "user",
        content: [
            { type: "image", source: { type: "base64", media_type, data: imageBase64 } },
            { type: "text", text: systemPrompt }
        ]
    }]
});
```

### 4.2 Font Identification Approach

Since this runs server-side in Supabase Edge Functions (Deno), we use a cascade:

1. **Claude Vision first guess** — The LLM has strong font recognition from training data
2. **Google Fonts metadata matching** — Compare Claude's guess against Google Fonts API (free, no rate limit)
3. **Confidence scoring** — High confidence if Claude is certain, lower if ambiguous
4. **Always provide alternatives** — Top 3 closest Google Fonts for every text element

### 4.3 Cost Per Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| Claude Vision (Sonnet) | ~$0.03–0.08 | Depends on image size and tool calls |
| Google Fonts API | Free | Metadata lookup only |
| Supabase Edge Function | ~$0.001 | Compute time |
| **Total per analysis** | **~$0.04–0.10** | Fits within existing Pro pricing model |

---

## 5. Format Generators (Edge Function)

### 5.1 `supabase/functions/pixelforge-generate/index.ts`

Takes a DesignTree and generates the requested output format. Can be called multiple times for different formats from the same analysis.

#### Figma Output

Generate a JavaScript snippet that users run as a Figma plugin:
- Creates Figma nodes matching the DesignTree hierarchy
- Maps styles to Figma paint/effect properties
- Includes Google Fonts loading
- User copies snippet → runs in Figma Dev Console or as a plugin

#### Canva Output

Generate Canva Apps SDK code:
- Uses `addElementAtPoint` for each element
- Supports text, images, shapes as Canva native elements
- Copyable code snippet

#### HTML/CSS Output

Reuses patterns from existing `codeExporter.js`:
- Semantic HTML5 with CSS custom properties
- Google Fonts import
- Clean, editable structure
- Option for Tailwind classes (reuse existing `tailwindGen.js` patterns)

#### React Output

Extends existing AI export pattern:
- Functional component with Tailwind
- TypeScript-ready
- Responsive breakpoints

---

## 6. Extension UI — PixelForgeTab.jsx

### 6.1 UX Flow (3 States)

**State 1: Upload**
- Drag-and-drop zone (reuse `.empty-btn` and `.fade-in` styles)
- Format validation: PNG, JPEG, JPG, PDF, PPTX
- File size limit: 10MB
- Usage check before upload (reuse `usageTracker.js`)

**State 2: Processing**
- Reuse existing `.panel-loading` and `.spinner` styles
- Show analysis steps: "Analyzing layout..." → "Detecting fonts..." → "Extracting colors..."
- Poll status from edge function (or use Supabase Realtime)

**State 3: Result**
- Canvas preview showing detected elements
- Layer panel (reuse `.inspector-section` and `.prop-row` styles)
- Format selector (reuse `.segmented-control` component pattern)
- Output panel with copy button (reuse `.code-block-wrapper` and `.code-content` styles)
- Export formats: Figma | Canva | HTML/CSS | React | SVG

### 6.2 Billing Integration

- Free plan: 3 analyses/month
- Pro plan: 100 analyses/month
- Check via existing `usageTracker.canPerformAction('pixelforge_analysis')`
- Show upgrade prompt using existing `.usage-limit-banner` styles
- Track usage via existing `usageTracker.trackAction('pixelforge_analysis')`

### 6.3 Library Integration

- Save analysis results to Library tab (reuse existing `librarySync.js`)
- Save extracted colors to Colors library
- Save detected fonts to Fonts library

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)

| Task | Details | Test Criteria |
|------|---------|---------------|
| Add PixelForge tab to App.jsx | New tab entry + import | Tab appears in grid, clickable |
| Create PixelForgeTab.jsx | Upload dropzone + 3-state UI | Can drag-drop a PNG, see loading state |
| Create pixelforge-analyze edge function | Claude Vision + basic DesignTree output | Returns valid JSON for a simple logo |
| Create designTree.js | Schema definition + validation | Validates sample DesignTree correctly |
| Add usage tracking | `pixelforge_analysis` action type | Free users limited to 3/month |

### Phase 2: Core Features (Week 2–3)

| Task | Details | Test Criteria |
|------|---------|---------------|
| Full tool_use integration | Font, color, OCR, icon tools in edge function | Handles marketing poster with 10+ elements |
| Create pixelforge-generate edge function | HTML/CSS + React generators | Generated code renders correctly |
| Result preview UI | Canvas preview + layer panel | Shows detected elements visually |
| Format selector + copy | Segmented control for output formats | One-click copy for each format |
| Figma plugin code generator | DesignTree → Figma Plugin API code | Generated code creates correct Figma nodes |

### Phase 3: Polish (Week 4)

| Task | Details | Test Criteria |
|------|---------|---------------|
| Canva SDK output | DesignTree → Canva App SDK code | Generated code works in Canva |
| PDF/PPTX support | Multi-page extraction + per-page analysis | Handles a 5-page PDF |
| Library integration | Save results, colors, fonts to Library | Items appear in Library tab |
| Error handling + edge cases | Timeout recovery, invalid images, Hebrew text | Graceful errors for all failure modes |
| Landing page update | Add PixelForge feature to index.astro | Feature visible on landing page |

---

## 8. Key Technical Decisions

### 8.1 Why Supabase Edge Functions (Not a Separate Backend)

The PixelForge spec originally proposed Bun + Hono as a separate API server. This is unnecessary because:
- DesignGrab already has Supabase Edge Functions handling Claude API calls (`ai-export`)
- Auth is already wired through Supabase — no need to build a second auth system
- Usage tracking and billing already flow through Supabase
- Edge Functions run on Deno (similar to Bun — fast, native TypeScript)
- Zero new infrastructure to deploy or maintain

### 8.2 Why Not a Separate Chrome Extension

The spec proposed a standalone extension. Integrating into DesignGrab is better because:
- Users already have DesignGrab installed — zero friction to try PixelForge
- Reuse existing auth, billing, usage tracking, library sync
- Shared UI theme and component patterns
- One extension to maintain, not two
- Cross-feature value: analyze an image → save colors to library → use in code export

### 8.3 Why Client-Side Image Pre-processing

Instead of uploading raw files to the server for normalization:
- Use Canvas API in the browser to resize images >4096px
- Convert to base64 PNG before sending to edge function
- Reduces upload size and server processing time
- PDF/PPTX: use pdf.js (client-side) to extract pages as images

### 8.4 Why No WebSocket (Use Polling or Supabase Realtime)

The original spec proposed WebSocket for progress. Simpler alternatives:
- **Option A:** Simple polling (GET status every 2s) — works fine for 10-30s analysis
- **Option B:** Supabase Realtime subscription on the results table — already available
- Both avoid the complexity of managing WebSocket connections in an edge function

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Font identification accuracy <70% | 🔴 HIGH | Claude Vision + Google Fonts cascade. Always show top 3 alternatives. |
| Complex layouts produce messy DesignTree | 🔴 HIGH | Validate output with schema, re-prompt Claude if invalid. Few-shot examples. |
| Figma paste format breaks with updates | 🟡 MEDIUM | Use Plugin API code (stable API) as primary approach. |
| Claude API latency >15s for complex images | 🟡 MEDIUM | Show progress steps. Cache results in Supabase. Use Sonnet for speed. |
| Edge function timeout (60s default) | 🟡 MEDIUM | Optimize prompt. Split complex images into regions. Increase timeout limit. |
| Cost per analysis too high at scale | 🟢 LOW | $0.04-0.10 per analysis fits Pro pricing ($9/month for 100 analyses). |
| Hebrew text OCR accuracy | 🟡 MEDIUM | Claude Vision has strong Hebrew support. Fallback to OCR tool. |

---

## 10. File-by-File Implementation Guide

### New Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `extension/src/panel/components/PixelForgeTab.jsx` | Main UI: upload, preview, export | ~300 |
| `extension/src/lib/designTree.js` | DesignTree schema + validation | ~80 |
| `extension/src/lib/pixelforgeApi.js` | API client for edge functions | ~60 |
| `extension/src/lib/fontMatcher.js` | Google Fonts matching | ~50 |
| `supabase/functions/pixelforge-analyze/index.ts` | Claude Vision analysis | ~250 |
| `supabase/functions/pixelforge-generate/index.ts` | Format generation | ~400 |

### Modified Files

| File | Change |
|------|--------|
| `extension/src/panel/App.jsx` | Add PixelForge tab to TABS array + import + render |
| `extension/src/panel/styles/panel.css` | Add dropzone + preview styles (~50 lines) |
| `extension/src/lib/usageTracker.js` | Add `pixelforge_analysis` action type |
| `supabase/schema.sql` | Add `pixelforge_results` table |
| `landing/src/pages/index.astro` | Add PixelForge feature card |

---

*PixelForge integrates into DesignGrab's existing architecture. No new infrastructure, no separate backend, no duplicate auth. Just new UI + new edge functions + Claude Vision.*
