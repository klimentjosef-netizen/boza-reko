-- ============================================================
-- BOZA REKO — migrace 014 (spustit v Supabase SQL Editoru)
-- Plně idempotentní — bezpečné spustit i opakovaně.
-- Řeší:
--   1) Dva rozpočty na zakázku: interní (naše náklady) vs. klientský (marže v cenách)
--   2) PŘÍSNÁ ochrana: interní rozpočet vidí JEN majitel. Klient ani pracovník nikdy.
--   3) Odstranění role „rozpočtář" (estimator) z logiky (is_staff = jen majitel)
-- SQL Editor: https://supabase.com/dashboard/project/wvbqolbydldauhgfmtdd/sql/new
-- ============================================================

-- Helpery (jistota, že existují) --------------------------------------
create or replace function is_owner() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'owner');
$$ language sql security definer stable;

create or replace function is_project_client(pid uuid) returns boolean as $$
  select exists (select 1 from projects where id = pid and client_id = auth.uid());
$$ language sql security definer stable;

-- „staff" = nově jen majitel (rozpočtář byl zrušen)
create or replace function is_staff() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'owner');
$$ language sql security definer stable;

-- 1) Sloupec audience + bezpečné ošetření STÁVAJÍCÍCH rozpočtů ---------
-- Nový sloupec: 'internal' (naše náklady) | 'client' (pro klienta).
-- Stávající rozpočty obsahují naše nákladové ceny → označíme je jako INTERNÍ
-- (uvidí je jen majitel). Klientskou verzi vytvoří majitel znovu přes Božáčka.
-- Blok se provede jen při PRVNÍM přidání sloupce → idempotentní (nepřepíše nové rozpočty).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'budgets' and column_name = 'audience'
  ) then
    alter table budgets add column audience text not null default 'client';
    update budgets set audience = 'internal';
  end if;
end $$;

-- 2) RLS pro rozpočty -------------------------------------------------
drop policy if exists "budget_owner" on budgets;
drop policy if exists "budget_client" on budgets;

-- Majitel: plný přístup ke VŠEM rozpočtům (interní i klientské).
create policy "budget_owner" on budgets for all
  using (is_owner()) with check (is_owner());

-- Klient: JEN klientský rozpočet své zakázky (a ne rozpracovaný koncept).
-- Interní rozpočet (audience='internal') tato politika nikdy nepustí.
create policy "budget_client" on budgets for select
  using (audience = 'client' and status <> 'draft' and is_project_client(project_id));

-- Pracovník nemá na rozpočty žádnou politiku → nevidí ani interní, ani klientský.
