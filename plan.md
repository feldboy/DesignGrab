# Implementation Plan: Google OAuth + Subscription-Based AI Feature Gating

## 1. Requirements Restated

**Google OAuth Integration:** Replace the current email/password-only auth system with Google Sign-In using `chrome.identity` API. Users click "Sign in with Google" and get authenticated via their Google account, which creates/links a Supabase user.

**Subscription-Based AI Feature Gating:** Before any AI export (React, Vue, Figma SVG via Gemini), check the user's subscription tier. Free users get 0 AI exports. Pro/Lifetime users get 50/month. Enforce this both before calling the Gemini API (pre-check) and after (record usage). Non-logged-in users are prompted to sign in.

## 2. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| `chrome.identity` requires Google Cloud OAuth client ID | Blocks feature | Set up OAuth consent screen + client ID in Google Cloud Console |
| Supabase doesn't natively support Chrome extension OAuth flow | Medium | Use `signInWithIdToken` — pass Google ID token to Supabase which verifies it server-side |
| Default plan is hardcoded to `'pro'` in `storage.js` line 65 | Critical — users bypass all limits | Fix to default to `'free'` |
| AI export pre-check is currently skipped in `CodeTab.jsx` | AI limits not enforced | Fix the conditional to always run `checkLimit('ai_export')` for AI mode |
| Hardcoded Gemini API key has no server-side rate limiting | Abuse risk | Subscription gating + local usage tracking provides first layer; server-side proxy is future work |

## 3. Implementation Plan

### Step 1: Add `identity` permission to manifest.json
**File:** `extension/manifest.json`
- Add `"identity"` to the `permissions` array
- Add `"oauth2"` section with the Google Cloud OAuth client ID and scopes (`openid`, `email`, `profile`)
- **Dependency:** Requires a Google Cloud OAuth client ID (user must create one at console.cloud.google.com)

### Step 2: Fix default plan from `'pro'` to `'free'`
**File:** `extension/src/lib/storage.js`
- Change line 65: `plan: data.plan || 'pro'` → `plan: data.plan || 'free'`
- This ensures new/anonymous users are properly gated

### Step 3: Add Google Sign-In to auth.js
**File:** `extension/src/lib/auth.js`
- Add new `signInWithGoogle()` function that:
  1. Calls `chrome.identity.getAuthToken({ interactive: true })` to get a Google OAuth token
  2. Fetches user info from Google's tokeninfo endpoint to get the ID token
  3. Calls `supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })`
  4. Fetches plan from `profiles` table
  5. Stores `userId` and `plan` in chrome.storage
- Add `googleSignOut()` that also calls `chrome.identity.removeCachedAuthToken()`
- Keep existing `signIn`/`signUp` as fallback (optional — or remove entirely if going Google-only)

### Step 4: Update SettingsTab.jsx — Replace email/password with Google Sign-In
**File:** `extension/src/panel/components/SettingsTab.jsx`
- Replace the email/password form with a single "Sign in with Google" button
- Remove `authMode`, `email`, `password` state variables
- Keep the account display (email, plan badge, sign out) for logged-in users
- Keep the usage section and upgrade button
- Update sign-out to call the new `googleSignOut()`

### Step 5: Fix AI export usage gating in CodeTab.jsx
**File:** `extension/src/panel/components/CodeTab.jsx`
- Fix the `exportElement()` function to properly check AI limits:
  - Before AI export: run `checkLimit('ai_export')` — if not allowed, show upgrade prompt
  - If user is not logged in at all: show "Sign in to use AI exports" message
- Remove the old `hasApiKey`-based conditional (already done)
- Add auth state check: if not logged in and trying AI export, prompt sign-in

### Step 6: Gate AI exports in service-worker.js
**File:** `extension/src/background/service-worker.js`
- Before calling Gemini API, read `plan` from `chrome.storage.local`
- If plan is `'free'` or `'starter'`, return `{ error: 'AI_UPGRADE_REQUIRED' }`
- This provides a second enforcement layer (defense in depth)

### Step 7: Enable Google provider in Supabase
**Action:** Supabase Dashboard configuration
- Go to Supabase Dashboard → Authentication → Providers → Google
- Enable Google provider
- Add the same Google Cloud OAuth client ID and secret
- This allows `signInWithIdToken` to work

## 4. Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth flow | `chrome.identity` API + Supabase `signInWithIdToken` | Chrome's identity API handles the Google OAuth popup natively — no redirect URLs, no web server needed. Supabase verifies the Google token server-side. |
| Keep email/password? | Remove — Google-only | Simpler UX, one click sign-in, reduces code surface. Google accounts cover 99% of Chrome users. |
| Where to enforce AI limits | Both CodeTab (UI) and service-worker (API) | Defense in depth — UI prevents unnecessary API calls, service worker prevents bypass |
| Default plan | `'free'` | Users must authenticate and subscribe to access AI features |
| Usage tracking | Keep local-first approach | Already works, no infrastructure changes needed. Server-side enforcement is future work. |

## 5. Files Changed Summary

| File | Change |
|---|---|
| `extension/manifest.json` | Add `identity` permission + `oauth2` config |
| `extension/src/lib/storage.js` | Default plan → `'free'` |
| `extension/src/lib/auth.js` | Add `signInWithGoogle()`, `googleSignOut()`, remove email/password functions |
| `extension/src/panel/components/SettingsTab.jsx` | Replace auth form with Google button, simplify state |
| `extension/src/panel/components/CodeTab.jsx` | Add proper AI limit pre-check + sign-in prompt |
| `extension/src/background/service-worker.js` | Add plan check before Gemini API call |
