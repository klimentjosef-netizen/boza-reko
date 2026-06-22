-- ============================================================
-- BOZA REKO — 011: Tabulka poptávek (leads) — chyběla v DB
-- Spustit v Supabase SQL Editoru (idempotentní). Na konci reload schema cache.
-- ============================================================
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  reconstruction_type text,
  description text,
  calculator_result jsonb,
  status text default 'new',
  created_at timestamptz default now()
);

alter table leads enable row level security;

drop policy if exists "insert_public" on leads;
drop policy if exists "select_auth" on leads;
drop policy if exists "leads_insert_public" on leads;
drop policy if exists "leads_select_owner" on leads;
drop policy if exists "leads_update_owner" on leads;

-- Veřejný formulář může vkládat; číst/měnit jen majitel
create policy "leads_insert_public" on leads for insert with check (true);
create policy "leads_select_owner" on leads for select using (is_owner());
create policy "leads_update_owner" on leads for update using (is_owner()) with check (is_owner());

-- Donutí PostgREST načíst aktuální schéma (jinak "Could not find the table")
notify pgrst, 'reload schema';
