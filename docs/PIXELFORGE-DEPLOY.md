# PixelForge — Deployment Guide

## What needs to be done

PixelForge has two Supabase Edge Functions that need to be deployed, and a SQL update to run.
Without these, the PixelForge tab in the extension won't work (uploads will fail with a network error).

---

## 1. Update Plan Limits (SQL)

Run this in **Supabase Dashboard → SQL Editor → New Query**:

```sql
-- Update PixelForge daily limits (free = 1/day, pro = 10/day, lifetime = 10/day)
UPDATE public.plans SET pixelforge_analyses_limit = 1 WHERE id = 'free';
UPDATE public.plans SET pixelforge_analyses_limit = 10 WHERE id = 'pro';
UPDATE public.plans SET pixelforge_analyses_limit = 10 WHERE id = 'lifetime';
```

> If sections 8-10 from `schema.sql` were already run (pixelforge_results table, usage_logs constraint, pixelforge_analyses_limit column), you only need the UPDATE statements above.
> If NOT already run, run sections 8-10 from `supabase/schema.sql` first, then the UPDATEs above.

---

## 2. Verify Secrets

The `pixelforge-analyze` function uses the Anthropic API (Claude). Make sure the secret is set:

```bash
supabase secrets list
```

You should see `ANTHROPIC_API_KEY` in the list. If it's missing:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

> The existing `ai-export` function already uses this key, so it should already be configured.

---

## 3. Deploy Edge Functions

From the project root (where the `supabase/` folder is):

```bash
# Deploy the image analysis function (calls Claude Vision API)
supabase functions deploy pixelforge-analyze

# Deploy the code generation function (converts DesignTree → code)
supabase functions deploy pixelforge-generate
```

Both functions are in:
- `supabase/functions/pixelforge-analyze/index.ts`
- `supabase/functions/pixelforge-generate/index.ts`

---

## 4. Verify Deployment

After deploying, check that both functions appear in:
**Supabase Dashboard → Edge Functions**

You should see:
- `pixelforge-analyze` — Takes a base64 image, sends to Claude Vision, returns a DesignTree JSON
- `pixelforge-generate` — Takes a DesignTree, generates code in the requested format (HTML, React, Figma, Canva, SVG)

---

## How It Works

1. User uploads an image in the PixelForge tab
2. Extension sends the base64 image to `pixelforge-analyze` edge function
3. `pixelforge-analyze` calls Claude (`claude-sonnet-4-6`) with the image + tool definitions
4. Claude analyzes the image and returns a DesignTree JSON (elements, fonts, colors, layout)
5. User picks an output format (HTML, React, Figma, Canva, SVG) and clicks Generate
6. Extension sends the DesignTree to `pixelforge-generate` edge function
7. `pixelforge-generate` converts the DesignTree to code and returns it

---

## Troubleshooting

**"Edge function not found" error:**
- Functions haven't been deployed yet. Run the deploy commands above.

**"ANTHROPIC_API_KEY not configured" error:**
- The secret is missing. Run `supabase secrets set ANTHROPIC_API_KEY=...`

**"Claude API error: 401":**
- The API key is invalid or expired. Get a new one from console.anthropic.com

**"Claude API error: 429":**
- Rate limited. Wait a minute and try again.

**Function deploys but returns 500:**
- Check function logs: `supabase functions logs pixelforge-analyze`
