-- ============================================================
-- BOZA REKO — migrace 013 (spustit v Supabase SQL Editoru)
-- Plně idempotentní — bezpečné spustit i opakovaně.
-- Řeší 3 věci z klientských připomínek:
--   1) Rozpočet je viditelný pro klienta v jeho zakázce (v každém stavu kromě konceptu 'draft')
--   2) Realtime pro chat (project_messages) — zprávy se propisují bez ručního obnovení
--   3) Cashflow lze vést i bez zakázky (project_id smí být NULL) → funguje volba „Bez zakázky"
-- SQL Editor: https://supabase.com/dashboard/project/wvbqolbydldauhgfmtdd/sql/new
-- ============================================================

-- Jistota, že helper existuje (bypass RLS, žádná rekurze) — kdyby migrace 009 neproběhla.
create or replace function is_project_client(pid uuid) returns boolean as $$
  select exists (select 1 from projects where id = pid and client_id = auth.uid());
$$ language sql security definer stable;

-- 1) ROZPOČET VIDITELNÝ PRO KLIENTA ---------------------------------
-- Dřív: klient viděl rozpočet jen ve stavu sent/accepted/rejected → prakticky nikdy.
-- Nově: klient vidí rozpočet SVÉ zakázky v jakémkoli stavu kromě rozpracovaného konceptu ('draft').
drop policy if exists "budget_client" on budgets;
create policy "budget_client" on budgets for select
  using (status <> 'draft' and is_project_client(project_id));

-- 2) REALTIME PRO CHAT ----------------------------------------------
-- Přidá tabulku zpráv do realtime publikace (když už tam je, tiše přeskočí).
do $$ begin
  alter publication supabase_realtime add table project_messages;
exception when duplicate_object then null; end $$;

-- 3) CASHFLOW BEZ ZAKÁZKY -------------------------------------------
-- Uvolní NOT NULL, aby šel uložit záznam „Bez zakázky" (project_id = NULL).
alter table cashflow alter column project_id drop not null;
