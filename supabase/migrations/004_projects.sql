-- Reconstruction projects
create type project_status as enum ('draft', 'offer', 'active', 'paused', 'completed', 'cancelled');

create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_id uuid references profiles(id),
  type text not null, -- koupelna, kuchyn, byt, dum, svj
  status project_status default 'draft',
  address text,
  area_m2 numeric,
  description text,
  start_date date,
  end_date date,
  budget_net numeric, -- bez DPH
  budget_gross numeric, -- s DPH
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project milestones
create table milestones (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  completed_at timestamptz,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Project photos
create table project_photos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  url text not null,
  caption text,
  phase text, -- before, during, after
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Project team members (workers assigned to project)
create table project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  role text default 'worker', -- worker, lead, supervisor
  created_at timestamptz default now(),
  unique(project_id, profile_id)
);

-- RLS
alter table projects enable row level security;
alter table milestones enable row level security;
alter table project_photos enable row level security;
alter table project_members enable row level security;

-- Owners see all projects
create policy "owner_all" on projects
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

-- Clients see their own projects
create policy "client_select" on projects
  for select using (client_id = auth.uid());

-- Workers see projects they're assigned to
create policy "worker_select" on projects
  for select using (
    exists (select 1 from project_members where project_id = projects.id and profile_id = auth.uid())
  );

-- Milestones: same access as parent project
create policy "milestone_owner" on milestones
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

create policy "milestone_client" on milestones
  for select using (
    exists (select 1 from projects where id = milestones.project_id and client_id = auth.uid())
  );

create policy "milestone_worker" on milestones
  for select using (
    exists (select 1 from project_members where project_id = milestones.project_id and profile_id = auth.uid())
  );

-- Photos: same pattern
create policy "photos_owner" on project_photos
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

create policy "photos_client" on project_photos
  for select using (
    exists (select 1 from projects where id = project_photos.project_id and client_id = auth.uid())
  );

create policy "photos_worker" on project_photos
  for all using (
    exists (select 1 from project_members where project_id = project_photos.project_id and profile_id = auth.uid())
  );

-- Project members: owners manage, others read
create policy "members_owner" on project_members
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

create policy "members_read" on project_members
  for select using (
    exists (select 1 from project_members pm where pm.project_id = project_members.project_id and pm.profile_id = auth.uid())
    or exists (select 1 from projects where id = project_members.project_id and client_id = auth.uid())
  );
