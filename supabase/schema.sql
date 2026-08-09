-- Scorpio Rising — auth + journal schema
-- Run this in the Supabase SQL editor (or via supabase db push).

-- 1) Profiles (1:1 with auth.users). Holds the birth chart + place.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  birth_date date,
  birth_time text,            -- HH:MM or null
  birth_place text,           -- raw string the user typed
  chart jsonb,               -- full ChartSummary from calculateChart()
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Journal entries (one per written entry).
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- 3) AI reflections, one per entry.
create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  model text,
  created_at timestamptz default now()
);

create index if not exists entries_user_idx on public.entries(user_id, created_at desc);
create index if not exists readings_entry_idx on public.readings(entry_id);

-- 4) Row Level Security — every row is visible only to its owner.
alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.readings enable row level security;

drop policy if exists "profiles own" on public.profiles;
create policy "profiles own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "entries own" on public.entries;
create policy "entries own" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "readings own" on public.readings;
create policy "readings own" on public.readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5) Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
