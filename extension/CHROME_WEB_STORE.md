# Chrome Web Store Listing — DesignGrab

## Extension Name
DesignGrab — Design Inspector & Code Exporter

## Short Description (132 chars max)
Extract any website's design in seconds. Colors, fonts, CSS, SVGs, and AI-powered React/Vue/Tailwind code export.

## Detailed Description

**DesignGrab** lets you inspect, extract, and export design tokens from any website — all from a convenient side panel.

**What you can do:**

**Inspector** — Click any element to see its full computed styles: colors, fonts, spacing, borders, shadows, and more. Copy any value with one click.

**Color Extraction** — Auto-detect every color on a page, grouped by role (backgrounds, text, accents). Includes accessibility contrast checks for WCAG compliance.

**Font Analysis** — Detect all font families, weights, and sources. See the complete typography scale with usage breakdown across headings, body, and code.

**Code Export** — Export any element as clean HTML+CSS or Tailwind HTML. AI-powered export generates production-ready React TSX and Vue SFC components.

**Asset Extraction** — Find every image, SVG, video, and Lottie animation on a page. Download assets or copy SVG code instantly.

**Layout Analysis** — Understand any page's structure with DOM tree visualization, flexbox/grid property display, and structural HTML analysis.

**Animation Capture** — Extract CSS keyframe animations, transitions, and Lottie files with full timing and easing details.

**Figma Export** — AI-powered SVG generation you can paste directly into Figma, preserving colors, typography, and layout.

**Design Library** — Save colors, fonts, SVGs, and images from any site into your personal library. Build your design system as you browse.

**Keyboard Shortcut** — Press Cmd+Shift+G (Mac) or Ctrl+Shift+G (Windows) to instantly toggle the inspector.

**Privacy First** — All data stays in your browser. No tracking, no data collection. Your API keys are stored locally and never sent to our servers.

---

## Category
Developer Tools

## Language
English

## Website
https://designgrab.app

## Support Email
support@designgrab.app

---

## Screenshot Descriptions (for 1280x800 or 640x400 screenshots)

1. **Inspector Tab** — "Inspect any element. See computed styles, spacing, colors, and fonts at a glance."
2. **Colors Tab** — "Extract every color from a page. Backgrounds, text, accents — with accessibility checks."
3. **Code Tab (HTML+CSS)** — "Export clean HTML and CSS from any element. One click to copy."
4. **Code Tab (AI React)** — "AI-powered React component generation. Production-ready TSX with Tailwind."
5. **Assets Tab** — "Find and download every image, SVG, and video on any page."

---

## Justification for Permissions

### activeTab
Required to read the DOM and computed styles of the page the user is actively inspecting. Only activated when the user explicitly clicks the extension icon or uses the keyboard shortcut.

### scripting
Required to inject the inspector overlay and element analysis scripts into the active tab when the user initiates an inspection.

### storage
Required to save user preferences, the design library (saved colors, fonts, assets), usage tracking for freemium limits, and the user's API key — all stored locally.

### downloads
Required to allow users to download extracted assets (images, SVGs) from pages they are inspecting.

### sidePanel
Required to display the DesignGrab panel alongside web pages, providing the primary user interface for all inspection and extraction features.

### host_permissions (<all_urls>)
Required to enable inspection on any website the user chooses to analyze. The extension only reads page data when explicitly activated by the user.

---

## Privacy Practices (for CWS Developer Dashboard)

### Single Purpose Description
DesignGrab inspects and extracts design tokens (colors, fonts, CSS, assets) from websites and exports them as code.

### Data Usage
- **Personally identifiable information**: Not collected
- **Health information**: Not collected
- **Financial and payment information**: Not collected (Stripe handles payments externally)
- **Authentication information**: Stored locally only (optional Supabase auth)
- **Personal communications**: Not collected
- **Location**: Not collected
- **Web history**: Not collected
- **User activity**: Not collected
- **Website content**: Processed locally in the browser, never transmitted to our servers

### Certification
- This extension does not sell user data
- This extension does not use data for purposes unrelated to the extension's functionality
- This extension does not use data for creditworthiness or lending purposes
