-- DesignGrab — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Profiles table (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' references public.plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Usage logs — tracks every metered action
create table if not exists public.usage_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('download', 'code_export', 'design_system', 'ai_export')),
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.usage_logs enable row level security;

create policy "Users can read own usage"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on public.usage_logs for insert
  with check (auth.uid() = user_id);

-- Index for fast monthly count queries
create index if not exists idx_usage_logs_user_month
  on public.usage_logs (user_id, created_at);

-- 3. Saved items — synced library (colors, fonts, SVGs, images)
-- Uses text PK to match extension-generated IDs (lib_<timestamp>_<random>)
create table if not exists public.saved_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('color', 'font', 'svg', 'image')),
  name text not null default '',
  data jsonb not null default '{}',
  source_url text default '',
  created_at timestamptz not null default now()
);

alter table public.saved_items enable row level security;

create policy "Users can read own saved items"
  on public.saved_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved items"
  on public.saved_items for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved items"
  on public.saved_items for delete
  using (auth.uid() = user_id);

create index if not exists idx_saved_items_user
  on public.saved_items (user_id, type);

-- 4. Helper: count usage for current month
create or replace function public.get_monthly_usage(p_user_id uuid, p_action text)
returns integer
language sql
stable
security definer
as $$
  select count(*)::integer
  from public.usage_logs
  where user_id = p_user_id
    and action = p_action
    and created_at >= date_trunc('month', now());
$$;

-- 5. Updated_at auto-refresh for profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 6. Plans — editable plan limits (manage from Supabase Dashboard)
-- Use -1 for unlimited. Edit rows in the Dashboard to change limits instantly.
create table if not exists public.plans (
  id text primary key,                       -- 'free', 'pro', 'lifetime'
  name text not null,
  price_cents integer not null default 0,
  billing_period text default 'monthly',     -- 'monthly', 'one_time', null
  downloads_limit integer not null default 15,
  code_exports_limit integer not null default 5,
  design_systems_limit integer not null default 3,
  ai_exports_limit integer not null default 0,
  pixelforge_analyses_limit integer not null default 1,
  is_active boolean not null default true,
  display_order integer not null default 0,
  features jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

-- Anyone can read plans (needed by extension + landing page)
create policy "Anyone can read active plans"
  on public.plans for select
  using (true);

-- Only service_role can modify plans (via Supabase Dashboard or API)
-- No insert/update/delete policies for anon/authenticated = admin-only writes

-- Auto-update updated_at on plans
create trigger plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- Seed default plans
insert into public.plans (id, name, price_cents, billing_period, downloads_limit, code_exports_limit, design_systems_limit, ai_exports_limit, pixelforge_analyses_limit, is_active, display_order, features)
values
  ('free', 'Free', 0, null, 15, 5, 3, 0, 1, true, 1,
   '["15 asset downloads/mo", "5 code exports/mo", "3 design system exports/mo", "1 PixelForge analysis/mo", "Basic inspector"]'::jsonb),
  ('pro', 'Pro', 1200, 'monthly', 2000, -1, -1, 50, -1, true, 2,
   '["2,000 asset downloads/mo", "Unlimited code exports", "Unlimited design systems", "50 AI exports/mo", "Unlimited PixelForge", "Priority support"]'::jsonb),
  ('lifetime', 'Lifetime', 9900, 'one_time', 2000, -1, -1, 50, -1, true, 3,
   '["Everything in Pro", "One-time payment", "Founder badge", "Lifetime updates"]'::jsonb)
on conflict (id) do nothing;

-- 7. Waitlist — early access signups from landing page
create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Allow anonymous inserts for the landing page form
alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- Only service_role can read waitlist (admin/dashboard)
create policy "Service role can read waitlist"
  on public.waitlist for select
  using (auth.role() = 'service_role');
