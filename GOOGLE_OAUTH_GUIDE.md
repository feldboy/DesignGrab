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

## Step 3: Enable Google Auth Platform & Configure Branding

> ⚠️ **Google updated their console in 2025.** The old "OAuth consent screen" wizard is now split
> across multiple pages under **Google Auth Platform**. If you still see the old wizard, the
> steps are similar — just follow the fields as described below.

### 3a. Open Google Auth Platform

1. In the left sidebar of Google Cloud Console, scroll down to **APIs & Services**
2. You should see **Google Auth Platform** (or **OAuth consent screen** in older UI)
   - Direct link (new UI): https://console.cloud.google.com/auth/branding
   - Direct link (old UI): https://console.cloud.google.com/apis/credentials/consent
3. If prompted to **"Get started"** or **"Configure consent screen"**, click it
4. If asked to choose **Internal** vs **External**:
   - Select **External** (allows any Google account to sign in, not just your organization)
   - Click **Create**

### 3b. Branding Page

This is where you set your app's public identity.

1. Go to **Google Auth Platform → Branding**
   - Direct link: https://console.cloud.google.com/auth/branding
2. Fill in these fields:
   - **App name**: `DesignGrab`
   - **User support email**: select your email from the dropdown
     - If your email doesn't appear, you may need to use the email of the account you're logged in with
   - **App logo**: optional — you can upload `extension/src/assets/icons/icon-128.png` (must be ≤1MB, square, ideally 120×120px)
3. Under **App domain** (all optional during development):
   - **Application home page**: `https://designgrab.app` (or leave blank)
   - **Application privacy policy link**: `https://designgrab.app/privacy` (or leave blank)
   - **Application terms of service link**: leave blank
4. Under **Authorized domains**:
   - Click **Add domain**
   - Type `designgrab.app` and press Enter (only needed if you filled in URLs above)
5. Under **Developer contact information**:
   - Enter your email address
6. Click **Save**

### 3c. Audience Page

This controls who can use your app.

1. Go to **Google Auth Platform → Audience**
   - Direct link: https://console.cloud.google.com/auth/audience
2. Under **User type**, confirm it says **External**
3. Under **Publishing status**, it will say **Testing**
   - This is fine for now — only test users can sign in during testing
4. Under **Test users**:
   - Click **Add users**
   - Enter your own Google email address (e.g., `you@gmail.com`)
   - Click **Save**
5. You can add up to 100 test users during development

> ℹ️ While in "Testing" mode, only the emails you add here can sign in.
> Before launching publicly, you'll click **Publish App** on this page (see Step 8).

### 3d. Data Access (Scopes) Page

This tells Google what data your app will request.

1. Go to **Google Auth Platform → Data Access**
   - Direct link: https://console.cloud.google.com/auth/scopes
2. Click **Add or Remove Scopes**
3. In the search/filter box, search for each of these and check them:

   | Scope | API | Description |
   |---|---|---|
   | `openid` | OpenID Connect | Authenticate with your Google identity |
   | `.../auth/userinfo.email` | Google People API | See your primary email address |
   | `.../auth/userinfo.profile` | Google People API | See your personal info (name, picture) |

   > 💡 **Tip:** If you can't find them by searching, look under "Google APIs" or filter by
   > "Google Identity". These are non-sensitive scopes and don't require extended verification.

4. Click **Update** (at the bottom of the scope selector)
5. Click **Save**

### 3e. Verify Everything Is Set

Before moving on, confirm:
- ✅ Branding page shows your app name and email
- ✅ Audience page shows "External" + your test email
- ✅ Data Access page shows 3 scopes (openid, email, profile)

---

## Step 4: Create OAuth Client ID for Chrome Extension

> In the new Google Auth Platform UI, clients are under **Google Auth Platform → Clients**.
> In the old UI, they're under **APIs & Services → Credentials**.

1. Navigate to the Clients page:
   - **New UI**: Go to **Google Auth Platform → Clients**
     - Direct link: https://console.cloud.google.com/auth/clients
   - **Old UI**: Go to **APIs & Services → Credentials**
     - Direct link: https://console.cloud.google.com/apis/credentials
2. Click **+ Create Client** (new UI) or **+ Create Credentials → OAuth client ID** (old UI)
3. Fill in the form:
   - **Application type**: select `Chrome extension` from the dropdown
   - **Name**: `DesignGrab Extension`
   - **Item ID**: paste your extension ID from Step 1
     - It looks like: `abcdefghijklmnopqrstuvwxyz123456` (32 lowercase letters)
     - ⚠️ Just the ID — NOT the full `chrome-extension://...` URL
4. Click **Create**
5. A dialog will show your credentials:
   - **Client ID**: something like `123456789012-abcdefg.apps.googleusercontent.com`
   - **Client secret**: shown but NOT needed for Chrome extensions
6. **Copy the Client ID** and save it somewhere — you'll need it in Steps 5 and 6

> 💡 You can always find your Client ID later by going back to the Clients/Credentials page
> and clicking on "DesignGrab Extension".

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

This step connects Supabase to Google so it can verify the OAuth tokens from the extension.

> ⚠️ **Important:** You need to create a SECOND OAuth client in Google Cloud — a "Web application"
> type — because Supabase requires a Client Secret, and Chrome extension OAuth clients don't have one.

### 6a. Create a Web Application OAuth Client in Google Cloud

1. Go back to Google Cloud Console → **Clients** (or **Credentials**)
   - https://console.cloud.google.com/auth/clients
2. Click **+ Create Client** (or **+ Create Credentials → OAuth client ID**)
3. Fill in:
   - **Application type**: select `Web application`
   - **Name**: `DesignGrab Web (for Supabase)`
4. Under **Authorized redirect URIs**, click **+ Add URI** and enter:
   ```
   https://lgueqndrxxkcssjclyxp.supabase.co/auth/v1/callback
   ```
5. Click **Create**
6. You'll see both a **Client ID** and **Client Secret** — **copy BOTH**

> You now have TWO OAuth clients in Google Cloud:
>
> | Client | Type | Purpose |
> |---|---|---|
> | DesignGrab Extension | Chrome extension | Used by `chrome.identity` in the extension |
> | DesignGrab Web | Web application | Provides Client Secret for Supabase |

### 6b. Enable Google in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (the one at `lgueqndrxxkcssjclyxp`)
3. In the left sidebar, click **Authentication**
4. Click **Providers** (under Configuration)
5. Scroll down to find **Google** → click to expand it
6. Toggle the switch to **Enabled**
7. Fill in the fields:
   - **Client ID (for oauth)**: paste the Client ID from the **Web application** client (Step 6a)
   - **Client Secret (for oauth)**: paste the Client Secret from the **Web application** client (Step 6a)
8. Look for **Authorized Client IDs** (sometimes labeled "for Android, One Tap" or similar):
   - Paste the **Chrome Extension** Client ID from Step 4 here
   - This is critical — it tells Supabase to also accept tokens from your Chrome extension
9. Click **Save**

### 6c. Verify the Config

Your Supabase Google provider should now show:
- ✅ Enabled
- ✅ Client ID = Web application client ID
- ✅ Client Secret = Web application client secret
- ✅ Authorized Client IDs = Chrome extension client ID

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
