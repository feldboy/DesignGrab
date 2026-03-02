# DesignGrab Chrome Extension — Phase 3 Implementation Plan

This plan details the implementation steps for Phase 3: Freemium & Polish. Phase 1 (Core MVP) and Phase 2 (Analysis & Export) are complete. This phase introduces user limits, cloud saving, and a freemium model using Supabase and Stripe.

## User Review Required

> [!IMPORTANT]
> The next step requires setting up a Supabase project and grabbing API keys. I will write the code to integrate it, but you will need to provide the `SUPABASE_URL` and `SUPABASE_ANON_KEY` once we begin execution.

---

## Proposed Changes

### 1. Supabase Initialization & Auth

#### [NEW] [supabase.js](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/lib/supabase.js)
- Initialize Supabase client using `@supabase/supabase-js`.
- Implements wrappers for Auth (Sign In, Sign Up, Sign Out).
- Uses Chrome extension local storage for session persistence as cookies are unreliable in extensions.

#### [MODIFY] [service-worker.js](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/background/service-worker.js)
- Add listeners for Auth state changes.
- Sync auth state tightly with `chrome.storage.local`.

### 2. Usage Tracking & Limits

#### [NEW] [usageTracker.js](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/lib/usageTracker.js)
- Tracks feature usage (e.g., "Code Export", "Tailwind Export").
- Enforces monthly limits for free users (e.g., 20 code exports/month).
- Syncs local usage counts with Supabase database to prevent trivial bypasses (clearing local storage).

#### [MODIFY] [CodeTab.jsx](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/panel/components/CodeTab.jsx)
- Intercept the export action.
- Check `usageTracker` limits before triggering extraction.
- Show an "Upgrade to Pro" overlay/banner if out of credits.

### 3. Cloud Library (Saved Assets)

#### [NEW] [LibraryTab.jsx](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/panel/components/LibraryTab.jsx)
- A new panel tab where users can view saved colors, fonts, and SVGs.
- Fetches data from a Supabase `saved_assets` table.

#### [MODIFY] [App.jsx](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/panel/App.jsx)
- Add "Library" to the tab navigation.
- Add an "Account/Auth" header section for logging in.

#### [MODIFY] [ColorsTab.jsx](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/panel/components/ColorsTab.jsx) & others
- Add a "Save" or "❤️" icon next to colors/fonts to save them to the cloud library.

### 4. UI Polish & Keyboard Shortcuts

#### [MODIFY] [index.js](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/content/index.js)
- Implement global keyboard shortcuts (e.g., `Cmd+Shift+I`) to toggle inspect mode from the page.

#### [MODIFY] [styles.css](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/content/styles.css) & [panel.css](file:///Users/yaronfeldboy/Documents/copystyle/extension/src/panel/styles/panel.css)
- Add smooth transitions, better loading spinners, and error animations.

---

## Verification Plan

### Database Setup
- Create a Supabase project.
- Create tables: `users`, `usage_logs`, `saved_assets`.
- Configure Row Level Security (RLS) so users can only read/write their own data.

### Extension Testing
1. **Auth**: Sign up, log out, log back in via the extension side panel. Verify session persists across extension reloads.
2. **Limits**: Perform 20 code exports. Verify the 21st export is blocked and shows the upgrade UI.
3. **Saving**: Save a color. Switch computers (or clear local storage), log in, and verify the color is in the Library tab.
4. **Shortcuts**: Press `Cmd+Shift+I` to rapidly toggle the inspector.
