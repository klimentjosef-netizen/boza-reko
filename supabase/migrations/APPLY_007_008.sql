-- ============================================================
-- BOZA REKO — migrace k aplikaci (spustit v Supabase SQL Editoru)
-- Plně idempotentní — bezpečné spustit i opakovaně (dropuje staré i nové názvy politik).
--   007 Komunikace (zprávy) · 008 Reference RLS · 009 RLS fix (SECURITY DEFINER helpery)
-- ============================================================

-- HELPER FUNKCE (bypass RLS, žádná rekurze)
create or replace function is_owner() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'owner');
$$ language sql security definer stable;

create or replace function is_staff() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('owner','estimator'));
$$ language sql security definer stable;

create or replace function is_project_member(pid uuid) returns boolean as $$
  select exists (select 1 from project_members where project_id = pid and profile_id = auth.uid());
$$ language sql security definer stable;

create or replace function is_project_client(pid uuid) returns boolean as $$
  select exists (select 1 from projects where id = pid and client_id = auth.uid());
$$ language sql security definer stable;

-- PROFILES
drop policy if exists "select_own" on profiles;
drop policy if exists "owner_select_all" on profiles;
drop policy if exists "update_own" on profiles;
drop policy if exists "owner_update_all" on profiles;
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_select_owner" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_update_owner" on profiles;
drop policy if exists "profiles_insert_owner" on profiles;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_select_owner" on profiles for select using (is_owner());
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_update_owner" on profiles for update using (is_owner()) with check (is_owner());
create policy "profiles_insert_owner" on profiles for insert with check (is_owner());

-- PROJECTS
drop policy if exists "owner_all" on projects;
drop policy if exists "client_select" on projects;
drop policy if exists "worker_select" on projects;
drop policy if exists "projects_owner_all" on projects;
drop policy if exists "projects_client_select" on projects;
drop policy if exists "projects_worker_select" on projects;
create policy "projects_owner_all" on projects for all using (is_owner()) with check (is_owner());
create policy "projects_client_select" on projects for select using (client_id = auth.uid());
create policy "projects_worker_select" on projects for select using (is_project_member(id));

-- PROJECT_MEMBERS (byla rekurze)
drop policy if exists "members_owner" on project_members;
drop policy if exists "members_read" on project_members;
create policy "members_owner" on project_members for all using (is_owner()) with check (is_owner());
create policy "members_read" on project_members for select
  using (profile_id = auth.uid() or is_project_client(project_id));

-- MILESTONES
drop policy if exists "milestone_owner" on milestones;
drop policy if exists "milestone_client" on milestones;
drop policy if exists "milestone_worker" on milestones;
create policy "milestone_owner" on milestones for all using (is_owner()) with check (is_owner());
create policy "milestone_client" on milestones for select using (is_project_client(project_id));
create policy "milestone_worker" on milestones for all using (is_project_member(project_id)) with check (is_project_member(project_id));

-- PROJECT_PHOTOS
drop policy if exists "photos_owner" on project_photos;
drop policy if exists "photos_client" on project_photos;
drop policy if exists "photos_worker" on project_photos;
create policy "photos_owner" on project_photos for all using (is_owner()) with check (is_owner());
create policy "photos_client" on project_photos for select using (is_project_client(project_id));
create policy "photos_worker" on project_photos for all using (is_project_member(project_id)) with check (is_project_member(project_id));

-- BUDGETS
drop policy if exists "budget_owner" on budgets;
drop policy if exists "budget_client" on budgets;
create policy "budget_owner" on budgets for all using (is_staff()) with check (is_staff());
create policy "budget_client" on budgets for select
  using (status in ('sent','accepted','rejected') and is_project_client(project_id));

-- CASHFLOW
drop policy if exists "cashflow_owner" on cashflow;
create policy "cashflow_owner" on cashflow for all using (is_owner()) with check (is_owner());

-- REFERENCES (jen majitel spravuje)
drop policy if exists "admin_all" on references_projects;
drop policy if exists "owner_manage" on references_projects;
drop policy if exists "select_published" on references_projects;
drop policy if exists "references_select_published" on references_projects;
drop policy if exists "references_owner_manage" on references_projects;
create policy "references_select_published" on references_projects for select using (published = true);
create policy "references_owner_manage" on references_projects for all using (is_owner()) with check (is_owner());

-- KOMUNIKACE (zprávy)
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
  select is_staff() or is_project_client(pid) or is_project_member(pid);
$$ language sql security definer stable;

drop policy if exists "messages_select" on project_messages;
create policy "messages_select" on project_messages for select using (can_access_project(project_id));
drop policy if exists "messages_insert" on project_messages;
create policy "messages_insert" on project_messages for insert with check (can_access_project(project_id) and sender_id = auth.uid());
drop policy if exists "messages_delete_own" on project_messages;
create policy "messages_delete_own" on project_messages for delete using (sender_id = auth.uid() or is_owner());
drop policy if exists "reads_all_own" on message_reads;
create policy "reads_all_own" on message_reads for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table project_messages;
exception when duplicate_object then null; end $$;
