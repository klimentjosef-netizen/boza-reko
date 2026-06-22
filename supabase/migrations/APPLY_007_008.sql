-- ============================================================
-- BOZA REKO — nové migrace k aplikaci (spustit jednou v Supabase SQL Editoru)
-- Bezpečné spustit i opakovaně (idempotentní).
-- ============================================================

-- ---------- 007: Komunikace (zprávy u projektů) ----------
create table if not exists project_messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete set null,
  body text not null,
  attachment_url text,
  created_at timestamptz default now()
);
create index if not exists project_messages_project_idx on project_messages (project_id, created_at);

create table if not exists message_reads (
  profile_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  last_read_at timestamptz default now(),
  primary key (profile_id, project_id)
);

alter table project_messages enable row level security;
alter table message_reads enable row level security;

create or replace function can_access_project(pid uuid)
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('owner','estimator')
  ) or exists (
    select 1 from projects where id = pid and client_id = auth.uid()
  ) or exists (
    select 1 from project_members where project_id = pid and profile_id = auth.uid()
  );
$$ language sql security definer stable;

drop policy if exists "messages_select" on project_messages;
create policy "messages_select" on project_messages
  for select using (can_access_project(project_id));

drop policy if exists "messages_insert" on project_messages;
create policy "messages_insert" on project_messages
  for insert with check (can_access_project(project_id) and sender_id = auth.uid());

drop policy if exists "messages_delete_own" on project_messages;
create policy "messages_delete_own" on project_messages
  for delete using (sender_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

drop policy if exists "reads_all_own" on message_reads;
create policy "reads_all_own" on message_reads
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Realtime pro živý chat
do $$ begin
  alter publication supabase_realtime add table project_messages;
exception when duplicate_object then null; end $$;

-- ---------- 008: Zpřísnění RLS referencí (jen majitel spravuje) ----------
drop policy if exists "admin_all" on references_projects;
drop policy if exists "owner_manage" on references_projects;
create policy "owner_manage" on references_projects
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  ) with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );
