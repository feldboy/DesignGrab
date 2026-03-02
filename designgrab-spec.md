# DesignGrab — Chrome Extension Development Spec

> **מטרה:** בניית Chrome Extension שמאפשר חילוץ עיצוב, assets, וקוד מכל אתר בלחיצה אחת.
> **מודל:** שכפול והרחבה של MiroMiro (miromiro.app) עם פיצ'רים מבדלים.
> **כלי פיתוח:** Claude Code

---

## 1. Product Overview

### What It Does
Chrome extension שרץ על כל אתר ומאפשר:
- Hover על כל אלמנט → צפייה מיידית ב-CSS, צבעים, פונטים, מידות, spacing
- הורדת כל תמונה, SVG, Lottie animation בלחיצה
- חילוץ color palette ו-font stack של כל דף
- Export של section שלם כ-HTML+CSS נקי
- יצירת Tailwind config אוטומטית מ-design tokens
- **פיצ'ר מבדל:** AI-powered export ל-React component דרך Claude API
- **פיצ'ר מבדל:** Layout DNA — חילוץ Flexbox/Grid structure, לא רק styles

### Target Users
- Frontend developers
- UI/UX designers
- No-code builders
- Freelancers שבונים אתרים ללקוחות
- Agencies

### Business Model (Freemium)
| Plan | Price | Limits |
|------|-------|--------|
| Free | $0 | 15 asset downloads/mo, 5 code exports/mo, 3 design system previews/mo |
| Starter | $9/mo | 150 downloads, 30 code exports, 20 design system exports |
| Pro | $19/mo | 2000 downloads, unlimited exports, AI React export, priority support |
| Lifetime | $49 one-time | Everything in Pro, forever |

---

## 2. Tech Stack

```
Frontend (Extension):
├── Chrome Extension Manifest V3
├── Vanilla JS (content scripts — no framework, needs to be lightweight)
├── Preact (side panel UI — lightweight React alternative, ~3KB)
├── Tailwind CSS (panel styling only)
└── Vite (build tooling)

Backend (Minimal):
├── Supabase (auth + usage tracking + license management)
├── Supabase Edge Functions (payment webhooks, AI proxy)
├── Stripe (payments)
└── Claude API (AI React export feature — Pro only)

Landing Page:
├── Next.js or Astro (static)
├── Vercel (hosting)
└── Stripe Checkout (embedded)
```

---

## 3. Project Structure

```
designgrab/
├── extension/                    # Chrome Extension source
│   ├── manifest.json
│   ├── src/
│   │   ├── content/              # Content scripts (injected into pages)
│   │   │   ├── index.js          # Entry point — initializes everything
│   │   │   ├── inspector.js      # Hover inspection + overlay rendering
│   │   │   ├── extractor.js      # Asset extraction (images, SVGs, Lottie)
│   │   │   ├── colorAnalyzer.js  # Color palette extraction
│   │   │   ├── fontAnalyzer.js   # Font detection + analysis
│   │   │   ├── layoutAnalyzer.js # Layout DNA — Flex/Grid detection
│   │   │   ├── codeExporter.js   # Section → clean HTML+CSS
│   │   │   ├── tailwindGen.js    # Design tokens → tailwind.config.js
│   │   │   ├── overlay.js        # Visual overlay (spacing, dimensions)
│   │   │   └── styles.css        # Overlay/tooltip styles
│   │   │
│   │   ├── panel/                # Side Panel UI (Preact)
│   │   │   ├── index.html
│   │   │   ├── App.jsx
│   │   │   ├── components/
│   │   │   │   ├── InspectorTab.jsx
│   │   │   │   ├── AssetsTab.jsx
│   │   │   │   ├── ColorsTab.jsx
│   │   │   │   ├── FontsTab.jsx
│   │   │   │   ├── CodeExportTab.jsx
│   │   │   │   ├── LayoutTab.jsx
│   │   │   │   ├── LibraryTab.jsx
│   │   │   │   └── SettingsTab.jsx
│   │   │   └── styles/
│   │   │       └── panel.css
│   │   │
│   │   ├── popup/                # Extension popup (quick actions)
│   │   │   ├── popup.html
│   │   │   ├── popup.js
│   │   │   └── popup.css
│   │   │
│   │   ├── background/           # Service Worker
│   │   │   └── service-worker.js
│   │   │
│   │   ├── lib/                  # Shared utilities
│   │   │   ├── colorUtils.js     # RGB↔HEX↔HSL conversions
│   │   │   ├── cssUtils.js       # CSS parsing/cleaning helpers
│   │   │   ├── downloadUtils.js  # Download/clipboard helpers
│   │   │   ├── usageTracker.js   # Freemium usage counting
│   │   │   ├── auth.js           # Supabase auth integration
│   │   │   └── storage.js        # Chrome storage wrapper
│   │   │
│   │   └── assets/
│   │       └── icons/            # Extension icons (16, 32, 48, 128)
│   │
│   ├── vite.config.js
│   └── package.json
│
├── landing/                      # Marketing website
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro       # Homepage
│   │   │   ├── pricing.astro
│   │   │   └── compare-plans.astro
│   │   └── components/
│   └── package.json
│
├── supabase/                     # Backend
│   ├── migrations/
│   │   └── 001_initial.sql       # Users, subscriptions, usage tables
│   ├── functions/
│   │   ├── stripe-webhook/       # Handle payment events
│   │   ├── ai-export/            # Claude API proxy for React export
│   │   └── verify-license/       # License verification
│   └── config.toml
│
└── README.md
```

---

## 4. manifest.json

```json
{
  "manifest_version": 3,
  "name": "DesignGrab",
  "description": "Extract any website's design in seconds. Colors, fonts, CSS, SVGs, Lottie, and production-ready code.",
  "version": "1.0.0",
  "icons": {
    "16": "assets/icons/icon-16.png",
    "32": "assets/icons/icon-32.png",
    "48": "assets/icons/icon-48.png",
    "128": "assets/icons/icon-128.png"
  },
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "downloads",
    "sidePanel"
  ],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.js"],
      "css": ["src/content/styles.css"],
      "run_at": "document_idle"
    }
  ],
  "side_panel": {
    "default_path": "src/panel/index.html"
  },
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "assets/icons/icon-16.png",
      "32": "assets/icons/icon-32.png"
    }
  },
  "web_accessible_resources": [
    {
      "resources": ["src/panel/*", "assets/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 5. Core Modules — Detailed Spec

### 5.1 Inspector Module (`inspector.js`)

**מה עושה:** כשהמשתמש מפעיל inspect mode, hover על כל אלמנט מציג overlay עם כל הסגנונות.

```
Responsibilities:
- Listen to mousemove events when inspect mode is ON
- Get computedStyle for hovered element
- Render visual overlay showing:
  - Element dimensions (width × height)
  - Margin (orange)
  - Padding (green)  
  - Border (yellow)
  - Content area (blue tint)
- Show tooltip with key CSS properties
- Click to "pin" element and show full details in panel
- ESC to exit inspect mode
```

**Data structure returned on element select:**
```javascript
{
  // Element info
  tagName: "div",
  classList: ["hero-section", "flex"],
  id: "hero",
  
  // Dimensions
  dimensions: { width: 1200, height: 600 },
  box: {
    margin: { top: 0, right: 0, bottom: 40, left: 0 },
    padding: { top: 80, right: 40, bottom: 80, left: 40 },
    border: { top: 0, right: 0, bottom: 0, left: 0 }
  },
  
  // Typography (only if has text content)
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "48px",
    fontWeight: "700",
    lineHeight: "1.2",
    letterSpacing: "-0.02em",
    color: "#1a1a2e",
    textAlign: "center"
  },
  
  // Visual
  visual: {
    backgroundColor: "#ffffff",
    backgroundImage: "none",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    opacity: "1",
    overflow: "hidden"
  },
  
  // Layout (DIFFERENTIATOR — Layout DNA)
  layout: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    // OR for grid:
    gridTemplateColumns: "1fr 1fr 1fr",
    gridGap: "32px"
  },
  
  // Position
  position: {
    type: "relative",
    zIndex: "auto"
  },
  
  // Raw CSS (all computed styles, for "copy all" feature)
  rawCSS: "..."
}
```

**Key implementation notes:**
- חובה להשתמש ב-`getComputedStyle()` ולא לקרוא `element.style` (שנותן רק inline styles)
- ה-overlay צריך להיות ב-`position: fixed` עם `pointer-events: none` כדי לא לחסום interaction
- כל ה-DOM elements שאנחנו מוסיפים לדף חייבים להיות בתוך Shadow DOM כדי לא לשבור את ה-styling של האתר

### 5.2 Asset Extractor (`extractor.js`)

**מה עושה:** סורק את הדף ואוסף כל ה-assets — תמונות, SVGs, Lottie animations, וידאו.

```
Asset Types to Extract:
1. Images
   - <img> tags (src, srcset)
   - CSS background-image
   - <picture> <source> elements
   - Favicon / apple-touch-icon
   - Open Graph images
   
2. SVGs
   - Inline <svg> elements
   - <img src="*.svg">
   - CSS url() referencing .svg
   - SVG <use> references (resolve to full SVG)

3. Lottie Animations
   - <lottie-player> elements
   - <dotlottie-player> elements
   - Script-loaded lottie (intercept fetch calls to .json)
   - data-* attributes containing lottie URLs

4. Videos
   - <video> tags (src, <source>)
   - Background video iframes (YouTube/Vimeo embeds — URL only)
```

**Output format:**
```javascript
{
  images: [
    { 
      src: "https://...", 
      alt: "Hero image",
      width: 1920, 
      height: 1080, 
      format: "webp",
      size: "245KB",           // estimate from naturalWidth/Height
      location: "img-tag",     // or "bg-image", "picture"
      element: DOMElement       // reference for highlighting
    }
  ],
  svgs: [
    {
      code: "<svg ...>...</svg>",
      viewBox: "0 0 24 24",
      width: 24,
      height: 24,
      id: "icon-arrow",
      location: "inline"       // or "external"
    }
  ],
  lotties: [
    {
      src: "https://...animation.json",
      name: "hero-animation",
      playerType: "lottie-player"
    }
  ],
  videos: [
    {
      src: "https://...",
      type: "video/mp4",
      poster: "https://..."
    }
  ]
}
```

### 5.3 Color Analyzer (`colorAnalyzer.js`)

**מה עושה:** סורק כל אלמנט בדף ומחלץ את ה-color palette המלא.

```
Process:
1. Iterate ALL elements with querySelectorAll('*')
2. For each: extract color, backgroundColor, borderColor, 
   outlineColor, textDecorationColor, boxShadow colors
3. Normalize all to HEX
4. Count frequency of each color
5. Group similar colors (ΔE < 5 in LAB space)
6. Sort by frequency
7. Categorize: primary, secondary, accent, text, background, border
```

**Output:**
```javascript
{
  palette: [
    { hex: "#1a1a2e", rgb: "26,26,46", hsl: "240,28%,14%", 
      count: 342, category: "text", name: "Dark Navy" },
    { hex: "#e94560", rgb: "233,69,96", hsl: "350,78%,59%", 
      count: 28, category: "accent", name: "Coral Red" },
    // ...
  ],
  backgrounds: ["#ffffff", "#f8f9fa", "#1a1a2e"],
  textColors: ["#1a1a2e", "#6c757d", "#ffffff"],
  accentColors: ["#e94560", "#0f3460"],
  
  // WCAG Contrast checks
  contrastIssues: [
    { fg: "#6c757d", bg: "#f8f9fa", ratio: 3.8, 
      passes: { AA: false, AAA: false, AALarge: true } }
  ]
}
```

### 5.4 Font Analyzer (`fontAnalyzer.js`)

**מה עושה:** מזהה כל הפונטים בשימוש בדף + איך הם נטענים.

```
Process:
1. Scan all elements for computed fontFamily
2. Check document.fonts API for loaded fonts
3. Parse <link> tags for Google Fonts / Adobe Fonts
4. Parse @font-face rules in stylesheets
5. Map: which font is used for headings, body, code, etc.
```

**Output:**
```javascript
{
  fonts: [
    {
      family: "Inter",
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      source: "google-fonts",        // or "adobe", "self-hosted", "system"
      loadUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700",
      usage: {
        headings: true,
        body: false,
        count: 45                    // how many elements use this
      }
    },
    {
      family: "JetBrains Mono",
      weights: [400],
      source: "google-fonts",
      usage: { code: true, count: 12 }
    }
  ],
  fontScale: {
    h1: "48px / 700",
    h2: "36px / 600",
    h3: "24px / 600",
    body: "16px / 400",
    small: "14px / 400",
    code: "14px / 400"
  }
}
```

### 5.5 Layout Analyzer (`layoutAnalyzer.js`) — DIFFERENTIATOR

**מה עושה:** מזהה את ה-layout structure (Flex/Grid/Absolute) של כל section. זה מה שחסר ב-MiroMiro וזה מה שמפתחים ביקשו.

```
Process:
1. User selects a section/container
2. Walk the DOM tree of that container
3. For each element: detect display type (flex, grid, block, inline)
4. Build a layout tree structure
5. Output as:
   a. Visual diagram (ASCII or canvas)
   b. Clean structural HTML with layout classes only
   c. Tailwind layout classes
```

**Output:**
```javascript
{
  type: "flex",
  direction: "column",
  align: "center",
  justify: "space-between",
  gap: "32px",
  children: [
    {
      type: "flex",
      direction: "row",
      gap: "16px",
      children: [
        { type: "block", tag: "img", width: "50%" },
        { type: "flex", direction: "column", tag: "div", children: [...] }
      ]
    }
  ],
  
  // Clean structural HTML
  structuralHTML: `
    <div class="flex flex-col items-center justify-between gap-8">
      <div class="flex flex-row gap-4">
        <img class="w-1/2" />
        <div class="flex flex-col">...</div>
      </div>
    </div>
  `,
  
  // Tailwind classes only
  tailwindStructure: "flex flex-col items-center justify-between gap-8"
}
```

### 5.6 Code Exporter (`codeExporter.js`)

**מה עושה:** בוחרים section → מקבלים HTML+CSS נקי ומוכן לשימוש.

```
Process:
1. User clicks to select a section
2. Deep clone the element
3. Walk the clone and:
   a. Remove all data-* attributes
   b. Remove all JS event handlers
   c. Remove tracking/analytics attributes
   d. Inline critical styles OR extract to clean CSS classes
   e. Resolve relative URLs to absolute
   f. Clean class names (remove framework hashes like .css-1a2b3c)
4. Format HTML with proper indentation
5. Generate corresponding CSS (clean, no duplicates)
6. Optionally: convert to Tailwind classes
```

**Output modes:**
```
1. HTML + CSS (default)
2. HTML + Tailwind classes
3. React component (Pro — via Claude API)
4. Vue component (Pro — via Claude API)
```

### 5.7 Tailwind Generator (`tailwindGen.js`)

**מה עושה:** מייצר `tailwind.config.js` מלא מה-design tokens של הדף.

**Output:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          900: '#1e3a5f'
        },
        accent: '#e94560',
        background: '#f8f9fa',
        text: {
          primary: '#1a1a2e',
          secondary: '#6c757d'
        }
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }]
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '6px'
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0,0,0,0.1)',
        'elevated': '0 10px 25px rgba(0,0,0,0.15)'
      },
      spacing: {
        'section': '80px',
        'card-padding': '24px'
      }
    }
  }
}
```

### 5.8 AI React Export (`aiExporter.js`) — PRO FEATURE / DIFFERENTIATOR

**מה עושה:** לוקח section שלם ומייצר React component מוכן דרך Claude API.

```
Process:
1. Extract section HTML + computed CSS
2. Send to Supabase Edge Function (proxy)
3. Edge function calls Claude API with prompt:
   - "Convert this HTML+CSS to a clean React functional component 
      using Tailwind CSS. Make it responsive. Add proper TypeScript types.
      Use semantic HTML. Make images and text configurable via props."
4. Return formatted React component
```

**Prompt template:**
```
You are a senior React developer. Convert the following HTML+CSS section 
into a clean, production-ready React component.

Requirements:
- Use TypeScript with proper prop types
- Use Tailwind CSS for all styling
- Make all text content configurable via props with sensible defaults
- Make images configurable via props
- Ensure responsive design (mobile-first)
- Use semantic HTML elements
- Add aria labels for accessibility
- Export as default function component

HTML:
{extracted_html}

CSS:
{extracted_css}

Layout structure:
{layout_analysis}
```

---

## 6. Usage Tracking & Freemium Logic

### Local tracking (`usageTracker.js`)

```javascript
// Schema in chrome.storage.local
{
  "usage": {
    "month": 2,              // Current month (1-12)
    "year": 2026,
    "downloads": 7,          // Asset downloads this month
    "codeExports": 2,        // Code exports this month
    "designSystems": 1,      // Design system exports
    "aiExports": 0           // AI React exports (Pro only)
  },
  "plan": "free",            // "free" | "starter" | "pro" | "lifetime"
  "userId": null,            // Supabase user ID (null if not logged in)
  "library": []              // Saved assets (local-first)
}
```

### Limits enforcement
```
FREE:       15 downloads, 5 code exports, 3 design system, 0 AI exports
STARTER:    150 downloads, 30 code exports, 20 design system, 0 AI exports  
PRO:        2000 downloads, unlimited code/design, 50 AI exports
LIFETIME:   Same as Pro, forever
```

### When user hits limit:
1. Show non-intrusive banner in panel: "You've used 15/15 free downloads this month"
2. CTA button: "Upgrade to Starter — $9/mo"
3. Link opens landing page pricing section
4. After purchase, license key stored in chrome.storage.sync

---

## 7. Database Schema (Supabase)

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','pro','lifetime')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking (server-side backup, primary tracking is client-side)
CREATE TABLE usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,          -- 'download', 'code_export', 'design_system', 'ai_export'
  month INT NOT NULL,
  year INT NOT NULL,
  count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, action, month, year)
);

-- License keys (for offline verification)
CREATE TABLE licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  key TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,        -- NULL for lifetime
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved library items (sync across devices)
CREATE TABLE library_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,             -- 'color', 'font', 'image', 'svg', 'component'
  name TEXT,
  data JSONB NOT NULL,            -- The actual asset data
  source_url TEXT,                -- Website it was extracted from
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Shadow DOM Strategy

**חשוב מאוד:** כל ה-UI שאנחנו מוסיפים לדף (overlay, tooltip, panel) חייב להיות ב-Shadow DOM, אחרת:
- ה-CSS שלנו ישפיע על האתר
- ה-CSS של האתר ישבור את ה-UI שלנו

```javascript
// content/index.js — initialization
function initDesignGrab() {
  // Create container with Shadow DOM
  const host = document.createElement('designgrab-root');
  const shadow = host.attachShadow({ mode: 'closed' });
  
  // Inject our styles into shadow root
  const style = document.createElement('style');
  style.textContent = OVERLAY_STYLES; // from styles.css, inlined at build time
  shadow.appendChild(style);
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'dg-overlay';
  shadow.appendChild(overlay);
  
  document.body.appendChild(host);
  
  return { shadow, overlay };
}
```

---

## 9. Build Configuration (Vite)

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [preact()],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.js'),
        background: resolve(__dirname, 'src/background/service-worker.js'),
        panel: resolve(__dirname, 'src/panel/index.html'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    // Content scripts can't use ES modules
    // Must output IIFE for content.js
  }
});
```

---

## 10. Development Phases

### Phase 1 — Core MVP ✅ COMPLETE
**Goal:** Extension שעובד עם inspect mode + asset extraction בלבד.

```
Tasks:
✅ Project scaffold (Vite + Manifest V3)
✅ Shadow DOM initialization
✅ Inspector module — hover overlay with box model visualization
✅ Inspector module — click to pin + show CSS properties
✅ Inspector module — copy individual CSS values on click
✅ Overlay rendering — margin/padding/border visualization
✅ Tooltip rendering — key properties display
✅ Asset extractor — images (img tags + backgrounds)
✅ Asset extractor — SVGs (inline + external)
✅ Popup — toggle inspect mode ON/OFF
✅ Basic panel — show pinned element properties
✅ Basic panel — show extracted assets grid
```

### Phase 2 — Analysis & Export ✅ COMPLETE
**Goal:** Color/Font analysis, code export, Tailwind generation.

```
Tasks:
✅ Color analyzer — full page scan
✅ Color analyzer — palette grouping + frequency sort
✅ Color analyzer — WCAG contrast checker
✅ Font analyzer — detect all fonts + weights
✅ Font analyzer — font scale extraction
✅ Code exporter — section → clean HTML + CSS
✅ Code exporter — HTML formatting + CSS deduplication
✅ Tailwind generator — colors, fonts, spacing → config
✅ Layout analyzer — Flex/Grid structure detection
✅ Panel — Colors tab with palette display + copy
✅ Panel — Fonts tab with font list + usage
✅ Panel — Code export tab with preview + copy
```

### Phase 3 — Freemium & Polish ✅ COMPLETE
**Goal:** Usage tracking, paywall, library, polish.

```
Tasks:
✅ Usage tracker — monthly counting in chrome.storage
✅ Usage tracker — limit enforcement + upgrade prompts
✅ Supabase setup — auth, profiles, usage tables
✅ Stripe integration — checkout sessions, webhooks (edge functions)
✅ License verification — key validation flow (auth.js + billing.js)
✅ Library — save colors, fonts, SVGs locally
✅ Library — sync to Supabase for logged-in users (librarySync.js)
✅ Lottie extractor — detect and download animations
✅ Video extractor — list page videos
✅ Keyboard shortcuts (Cmd+Shift+E toggle, ESC exit)
✅ Polish — animations, transitions, loading states (panel.css)
✅ Error handling — graceful failure on restricted sites
✅ Animations tab — CSS keyframes, scroll-triggered, transitions
✅ Figma SVG export — export elements as SVG for Figma
```

### Phase 4 — AI Features & Launch 🔥 IN PROGRESS
**Goal:** AI React export, landing page, Chrome Web Store launch.

```
Tasks:
✅ Supabase Edge Function — Claude API proxy (ai-export/)
✅ AI exporter — section → React component (via Claude API)
✅ AI exporter — section → Vue component (via Claude API)
✅ Panel — AI export tab with loading + preview (CodeTab.jsx)
✅ Landing page — build with Astro (index.astro + privacy.astro)
✅ Landing page — pricing page with full feature comparison table
□ Landing page — feature detail components (demo visuals)
□ Chrome Web Store assets — screenshots, promo images
□ Chrome Web Store submission ($5 fee)
□ Product Hunt launch preparation
✅ README + documentation
```

---

## 11. Key Technical Challenges & Solutions

### Challenge 1: Sites with Shadow DOM
**Problem:** Some sites (e.g., built with Web Components) use Shadow DOM, making `querySelectorAll('*')` miss elements.
**Solution:** Recursively walk shadowRoots:
```javascript
function walkAllElements(root, callback) {
  const elements = root.querySelectorAll('*');
  elements.forEach(el => {
    callback(el);
    if (el.shadowRoot) walkAllElements(el.shadowRoot, callback);
  });
}
```

### Challenge 2: Performance on large pages
**Problem:** Scanning 10,000+ elements for colors/fonts is slow.
**Solution:** Use `requestIdleCallback` + chunk processing. Show partial results progressively.

### Challenge 3: CORS on external assets
**Problem:** Can't download cross-origin images directly.
**Solution:** Use background service worker with `fetch()` which bypasses CORS in extensions (with `host_permissions`).

### Challenge 4: CSS specificity in cleanup
**Problem:** Extracted CSS has framework-specific selectors (`.css-1a2b3c`).
**Solution:** Map computed styles to clean semantic class names. Strip hashed selectors.

### Challenge 5: Responsive design information
**Problem:** Can only see current viewport styles, not breakpoints.
**Solution:** Parse `<link>` stylesheets for `@media` queries. Show detected breakpoints in panel.

---

## 12. Chrome Web Store Requirements

```
Listing Requirements:
- Name: DesignGrab (check availability first)
- Category: Developer Tools
- Screenshots: 5+ (1280×800 or 640×400)
- Promo images: 440×280 (small), 920×680 (large)
- Detailed description (up to 16,000 chars)
- Privacy policy URL (required)
- Single purpose description (required for review)

Review Notes:
- Must justify <all_urls> permission (needed for content script injection)
- Must justify downloads permission
- Must justify storage permission
- Privacy policy must describe data handling
- No remote code execution (all code bundled)
- Content Security Policy compliant
```

---

## 13. Files to Create First (Claude Code Start Order)

```
Priority order for initial scaffold:

1. extension/package.json
2. extension/vite.config.js  
3. extension/manifest.json
4. extension/src/content/index.js (Shadow DOM init + message handling)
5. extension/src/content/inspector.js (core hover logic)
6. extension/src/content/overlay.js (visual overlay rendering)
7. extension/src/content/styles.css (overlay styles)
8. extension/src/background/service-worker.js (message routing)
9. extension/src/popup/popup.html + popup.js (toggle button)
10. extension/src/lib/colorUtils.js (HEX/RGB/HSL conversions)
```

> **הערה ל-Claude Code:** התחל מהשלד הבסיסי — manifest + content script + inspect mode. 
> וודא שה-extension נטען בלי שגיאות לפני שממשיכים לפיצ'רים נוספים.
> בדוק ב-chrome://extensions עם Developer Mode.

---

## 14. Competitive Advantages Summary

| Feature | MiroMiro | DesignGrab |
|---------|----------|------------|
| Inspect Mode | ✅ | ✅ |
| Asset Download | ✅ | ✅ |
| SVG Extract | ✅ | ✅ |
| Lottie Export | ✅ (Pro) | ✅ (Pro) |
| Color Palette | ✅ | ✅ + WCAG audit |
| Font Analysis | ✅ | ✅ + font scale |
| Code Export | ✅ (Pro) | ✅ (Pro) |
| Tailwind Config | ✅ (Pro) | ✅ (Pro) |
| **Layout DNA** | ❌ | ✅ Flex/Grid structure |
| **AI React Export** | ❌ | ✅ (Pro) via Claude API |
| **AI Vue Export** | ❌ | ✅ (Pro) via Claude API |
| **Responsive Info** | ❌ | ✅ Breakpoint detection |
| Library | ✅ | ✅ + cloud sync |
| Pricing | €9-€24/mo | $9-$19/mo (cheaper) |
| Lifetime | €49 | $49 |
