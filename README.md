# DesignGrab

Extract any website's design in seconds. Colors, fonts, CSS, SVGs, and AI-powered React/Vue/Tailwind code export.

## What It Does

DesignGrab is a Chrome Extension that lets you inspect, extract, and export design tokens from any website:

- **Inspector** — Hover on any element to see computed styles, spacing, colors, fonts
- **Color Extraction** — Full page color palette with WCAG contrast audit
- **Font Analysis** — Detect all fonts, weights, sources, and typography scale
- **Asset Extraction** — Download images, SVGs, Lottie animations, videos
- **Layout DNA** — Visualize Flexbox/Grid structure and generate structural HTML
- **Code Export** — Clean HTML+CSS or Tailwind. AI-powered React TSX and Vue SFC generation
- **Figma Export** — AI-generated SVG you can paste directly into Figma
- **Animation Capture** — CSS keyframes, transitions, scroll-triggered effects
- **Design Library** — Save and sync colors, fonts, and assets across devices

## Project Structure

```
designgrab/
├── extension/          # Chrome Extension (Manifest V3)
│   ├── src/
│   │   ├── content/    # Content scripts (inspector, extractors, analyzers)
│   │   ├── panel/      # Side Panel UI (Preact)
│   │   ├── popup/      # Extension popup
│   │   ├── background/ # Service worker
│   │   └── lib/        # Shared utilities (auth, storage, sync, billing)
│   ├── vite.config.js
│   └── package.json
├── landing/            # Marketing website (Astro)
│   └── src/pages/      # index, pricing, privacy
├── supabase/           # Backend
│   ├── schema.sql      # Database schema
│   └── functions/      # Edge functions (ai-export, stripe-checkout, stripe-webhook)
└── designgrab-spec.md  # Full product spec
```

## Development

### Extension

```bash
cd extension
npm install
npm run dev      # Dev mode with watch
npm run build    # Production build → extension/dist/
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/dist/` folder

### Landing Page

```bash
cd landing
npm install
npm run dev      # Dev server at localhost:4321
npm run build    # Static build → landing/dist/
```

### Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Deploy edge functions: `supabase functions deploy`
4. Update credentials in `extension/src/lib/supabase.js`

## Tech Stack

- **Extension**: Vite + Preact + Vanilla JS, Chrome Manifest V3, Shadow DOM isolation
- **Landing**: Astro (static)
- **Backend**: Supabase (auth, database, edge functions)
- **Payments**: Stripe
- **AI**: Claude API (user provides their own Anthropic API key)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+G` / `Ctrl+Shift+G` | Open side panel + toggle inspector |
| `Cmd+Shift+E` / `Ctrl+Shift+E` | Toggle inspect mode |
| `ESC` | Stop inspecting |

## License

All rights reserved.
