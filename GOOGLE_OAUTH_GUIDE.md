# Google OAuth Setup Guide — DesignGrab Chrome Extension

> Step-by-step guide to connect Google Sign-In with your DesignGrab extension and Supabase backend.

---

## Prerequisites

Before you start, make sure you have:
- A **Google account** (for Google Cloud Console access)
- Your **Supabase project** running at `https://lgueqndrxxkcssjclyxp.supabase.co`
- The DesignGrab extension **built** (`cd extension && npm run build`)
- The extension **loaded in Chrome** in Developer Mode

---

## Step 1: Get Your Chrome Extension ID

You need this ID before creating the Google OAuth client.

1. Open Chrome and go to `chrome://extensions`
2. Toggle **Developer mode** ON (top-right switch)
3. Click **Load unpacked** → select the `extension/dist` folder
4. Find **DesignGrab** in the list
5. Copy the **ID** — it looks like: `abcdefghijklmnopqrstuvwxyz123456`

> ⚠️ This ID is unique to your local install. If you delete and reload the extension, it may change. For production (Chrome Web Store), you'll get a permanent ID.

---

## Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project dropdown** (top-left, next to "Google Cloud")
3. Click **New Project**
   - Project name: `DesignGrab`
   - Organization: leave default
4. Click **Create**
5. Make sure the new project is **selected** in the dropdown

---

## Step 3: Configure the OAuth Consent Screen

Google requires a consent screen before you can create credentials.

1. In Google Cloud Console, go to **APIs & Services → OAuth consent screen**
   - Direct URL: https://console.cloud.google.com/apis/credentials/consent
2. Select **External** (allows any Google account to sign in)
3. Click **Create**
4. Fill in the form:
   - **App name**: `DesignGrab`
   - **User support email**: your email
   - **App logo**: optional (upload your 128px icon if you want)
   - **App domain**: leave blank for now (or enter `designgrab.app` if you own it)
   - **Developer contact email**: your email
5. Click **Save and Continue**
6. **Scopes** page:
   - Click **Add or Remove Scopes**
   - Search for and check these 3 scopes:
     - `openid`
     - `email` (`.../auth/userinfo.email`)
     - `profile` (`.../auth/userinfo.profile`)
   - Click **Update**
   - Click **Save and Continue**
7. **Test users** page:
   - Click **Add Users**
   - Add your own Google email address
   - Click **Save and Continue**

> ℹ️ While in "Testing" mode, only the test users you add can sign in. To allow anyone, you'll need to **Publish** the app later (Step 7).

---

## Step 4: Create OAuth Client ID for Chrome Extension

1. Go to **APIs & Services → Credentials**
   - Direct URL: https://console.cloud.google.com/apis/credentials
2. Click **+ Create Credentials → OAuth client ID**
3. Fill in:
   - **Application type**: `Chrome extension`
   - **Name**: `DesignGrab Extension`
   - **Item ID**: paste your extension ID from Step 1 (e.g., `abcdefghijklmnopqrstuvwxyz123456`)
4. Click **Create**
5. A dialog shows your credentials:
   - **Client ID**: something like `123456789-abcdef.apps.googleusercontent.com`
   - You do NOT need the client secret for Chrome extensions
6. **Copy the Client ID** — you'll need it in the next two steps

---

## Step 5: Update manifest.json with Your Client ID

Open `extension/manifest.json` and replace the placeholder:

**Find this block (line 20-27):**
```json
"oauth2": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
        "openid",
        "email",
        "profile"
    ]
},
```

**Replace with your actual Client ID:**
```json
"oauth2": {
    "client_id": "123456789-abcdef.apps.googleusercontent.com",
    "scopes": [
        "openid",
        "email",
        "profile"
    ]
},
```

Then rebuild the extension:
```bash
cd extension
npm run build
```

Then reload in Chrome:
1. Go to `chrome://extensions`
2. Find DesignGrab
3. Click the **reload ↻** button

---

## Step 6: Configure Google Provider in Supabase

This tells Supabase to accept Google OAuth tokens.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`lgueqndrxxkcssjclyxp`)
3. Navigate to **Authentication → Providers** (left sidebar)
4. Find **Google** in the provider list
5. Toggle it **ON**
6. Fill in:
   - **Client ID**: paste the same Client ID from Step 4
   - **Client Secret**: 
     - Go back to Google Cloud Console → Credentials
     - You need to create a **Web application** OAuth client (in addition to the Chrome extension one):
       1. Click **+ Create Credentials → OAuth client ID**
       2. Application type: **Web application**
       3. Name: `DesignGrab Web`
       4. Authorized redirect URIs: add `https://lgueqndrxxkcssjclyxp.supabase.co/auth/v1/callback`
       5. Click **Create**
       6. Copy the **Client Secret** from this web client
     - Paste the Client Secret into Supabase
   - **Authorized Client IDs**: paste your Chrome Extension Client ID here too (this allows the extension's tokens to be accepted)
7. Click **Save**

> ⚠️ You need TWO OAuth clients in Google Cloud:
> 1. **Chrome extension** type — used by `chrome.identity.getAuthToken()` in the extension
> 2. **Web application** type — provides the Client Secret that Supabase needs
>
> Both should use the same project and consent screen.

---

## Step 7: Test the Complete Flow

### 7a. Basic Sign-In Test

1. Open any website in Chrome (e.g., `https://example.com`)
2. Click the DesignGrab extension icon → open side panel
3. Go to the **Settings** tab
4. Click **"Sign in with Google"**
5. A Google sign-in popup should appear
6. Select your Google account
7. After signing in, you should see:
   - Your email displayed
   - Plan badge showing "Free"
   - Usage statistics

### 7b. Verify in Supabase

1. Go to Supabase Dashboard → **Authentication → Users**
2. You should see your Google email listed as a new user
3. Go to **Table Editor → profiles**
4. Verify a row exists with your user ID and `plan = 'free'`

### 7c. Test Sign-Out

1. In the Settings tab, click **Sign Out**
2. Verify you're returned to the sign-in screen
3. The Google cached token should be cleared

---

## Step 8: Publish the OAuth App (Before Launch)

While developing, only test users can sign in. Before launching publicly:

1. Go to Google Cloud Console → **OAuth consent screen**
2. Click **Publish App**
3. Google will review your app (may take a few days for unverified apps)
4. For faster approval:
   - Keep only the 3 basic scopes (`openid`, `email`, `profile`) — these don't require extended review
   - Fill in all consent screen fields completely
   - Add a privacy policy URL (`https://designgrab.app/privacy`)

---

## Troubleshooting

### "Authorization failed" or blank popup
- Verify the extension ID in Google Cloud matches your actual extension ID at `chrome://extensions`
- Make sure you rebuilt (`npm run build`) and reloaded the extension after changing manifest.json

### "Could not get email from Google account"
- Check that the `email` scope is listed in both manifest.json and the Google Cloud OAuth consent screen

### Sign-in works but no profile in Supabase
- Check that the `create_profile_on_signup` trigger exists in your database (see `supabase/schema.sql`)
- Verify RLS policies on the `profiles` table allow inserts

### "Cloud features not configured"
- This means `supabase.js` has placeholder values. Verify that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set to your actual project credentials

---

## Code Architecture Reference

```
Sign-In Flow:
┌─────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│  Settings Tab   │───▶│  auth.js             │───▶│  Google OAuth      │
│  (UI button)    │    │  signInWithGoogle()   │    │  chrome.identity   │
└─────────────────┘    └──────────────────────┘    └────────────────────┘
                              │                           │
                              │ token                     │ getAuthToken()
                              ▼                           │
                       ┌──────────────────────┐           │
                       │  Google userinfo API  │◀──────────┘
                       │  (get email, name)    │
                       └──────────────────────┘
                              │
                              ▼
                       ┌──────────────────────┐    ┌────────────────────┐
                       │  Supabase Auth       │───▶│  profiles table    │
                       │  signInWithIdToken() │    │  (plan, stripe_id) │
                       │  or fallback email   │    └────────────────────┘
                       └──────────────────────┘
                              │
                              ▼
                       ┌──────────────────────┐
                       │  chrome.storage      │
                       │  (userId, plan)       │
                       └──────────────────────┘
```

### Key Files

| File | What It Does |
|---|---|
| `extension/manifest.json` | Contains `oauth2.client_id` and `identity` permission |
| `extension/src/lib/auth.js` | `signInWithGoogle()` — gets token, exchanges with Supabase |
| `extension/src/lib/supabase.js` | Supabase client with Chrome storage adapter for sessions |
| `extension/src/panel/components/SettingsTab.jsx` | "Sign in with Google" button + account display |
| `extension/src/lib/storage.js` | Chrome storage wrapper (persists userId, plan) |
| `supabase/schema.sql` | profiles table + auto-create trigger |
