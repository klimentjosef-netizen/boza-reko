-- ============================================================
-- BOZA REKO — 010: Push notifikace (úložiště odběrů)
-- Spustit v Supabase SQL Editoru (idempotentní).
-- ============================================================
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  endpoint text unique not null,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz default now()
);
create index if not exists push_subscriptions_profile_idx on push_subscriptions (profile_id);

alter table push_subscriptions enable row level security;

drop policy if exists "push_own" on push_subscriptions;
create policy "push_own" on push_subscriptions
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
