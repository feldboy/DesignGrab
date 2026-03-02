-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run — all statements are idempotent

-- Plans table — editable plan limits (manage from Supabase Dashboard → Table Editor)
-- Use -1 for unlimited. Edit rows in the Dashboard to change limits instantly.
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_cents integer not null default 0,
  billing_period text default 'monthly',
  downloads_limit integer not null default 15,
  code_exports_limit integer not null default 5,
  design_systems_limit integer not null default 3,
  ai_exports_limit integer not null default 0,
  is_active boolean not null default true,
  display_order integer not null default 0,
  features jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

-- Drop + recreate policies to avoid "already exists" errors
drop policy if exists "Anyone can read active plans" on public.plans;
create policy "Anyone can read active plans"
  on public.plans for select
  using (true);

drop trigger if exists plans_updated_at on public.plans;
create trigger plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

insert into public.plans (id, name, price_cents, billing_period, downloads_limit, code_exports_limit, design_systems_limit, ai_exports_limit, is_active, display_order, features)
values
  ('free', 'Free', 0, null, 15, 5, 3, 0, true, 1,
   '["15 asset downloads/mo", "5 code exports/mo", "3 design system exports/mo", "Basic inspector"]'::jsonb),
  ('pro', 'Pro', 1200, 'monthly', 2000, -1, -1, 50, true, 2,
   '["2,000 asset downloads/mo", "Unlimited code exports", "Unlimited design systems", "50 AI exports/mo", "Priority support"]'::jsonb),
  ('lifetime', 'Lifetime', 9900, 'one_time', 2000, -1, -1, 50, true, 3,
   '["Everything in Pro", "One-time payment", "Founder badge", "Lifetime updates"]'::jsonb)
on conflict (id) do nothing;

-- Replace hardcoded plan check with FK to plans table (so Dashboard edits work)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_plan_fkey') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_fkey FOREIGN KEY (plan) REFERENCES public.plans(id);
  END IF;
END $$;

