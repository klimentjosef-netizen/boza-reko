-- ============================================
-- Komunikace: zprávy u projektů (klient ↔ pracovník ↔ majitel)
-- ============================================

create table if not exists project_messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete set null,
  body text not null,
  attachment_url text,
  created_at timestamptz default now()
);

create index if not exists project_messages_project_idx on project_messages (project_id, created_at);

-- Sledování přečtení (pro počty nepřečtených zpráv)
create table if not exists message_reads (
  profile_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  last_read_at timestamptz default now(),
  primary key (profile_id, project_id)
);

alter table project_messages enable row level security;
alter table message_reads enable row level security;

-- Pomocná funkce: má uživatel přístup k projektu?
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

-- Zprávy: čtení i psaní pro účastníky projektu
create policy "messages_select" on project_messages
  for select using (can_access_project(project_id));

create policy "messages_insert" on project_messages
  for insert with check (can_access_project(project_id) and sender_id = auth.uid());

create policy "messages_delete_own" on project_messages
  for delete using (sender_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'owner'));

-- Read tracking: každý spravuje jen své záznamy
create policy "reads_all_own" on message_reads
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
