-- Reference / portfolio projects
create table references_projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  type text not null, -- koupelna, kuchyn, byt, dum, svj
  description text,
  area_m2 numeric,
  duration_days integer,
  location text,
  year integer,
  cover_image text, -- URL to main image
  images text[] default '{}', -- array of image URLs
  published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table references_projects enable row level security;

-- Public can read published references
create policy "select_published" on references_projects
  for select using (published = true);

-- Authenticated users (admin) can do everything
create policy "admin_all" on references_projects
  for all using (auth.role() = 'authenticated');

-- ============================================

-- User profiles with roles
create type user_role as enum ('owner', 'worker', 'client', 'estimator');

create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  email text,
  role user_role not null default 'client',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can read their own profile
create policy "select_own" on profiles
  for select using (auth.uid() = id);

-- Owners can read all profiles
create policy "owner_select_all" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

-- Users can update their own profile
create policy "update_own" on profiles
  for update using (auth.uid() = id);

-- Owners can update any profile
create policy "owner_update_all" on profiles
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================

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

-- ============================================

-- AI-generated budgets (Božáček)
create type budget_status as enum ('draft', 'review', 'approved', 'sent', 'accepted', 'rejected');

create table budgets (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  status budget_status default 'draft',
  -- Input parameters for AI
  apartment_type text, -- e.g. "3+1"
  quality_level text, -- standard, premium, vip
  area_m2 numeric,
  ai_prompt_params jsonb, -- full params sent to AI
  -- Generated content
  items jsonb default '[]', -- array of budget line items
  total_net numeric default 0, -- bez DPH
  total_gross numeric default 0, -- s DPH (21%)
  margin_percent numeric default 0,
  notes text,
  -- Metadata
  created_by uuid references profiles(id),
  reviewed_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cashflow entries per project
create type cashflow_type as enum ('income', 'expense');

create table cashflow (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  type cashflow_type not null,
  amount numeric not null,
  description text not null,
  category text, -- material, labor, subcontractor, client_payment, etc.
  date date not null default current_date,
  invoice_number text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- RLS
alter table budgets enable row level security;
alter table cashflow enable row level security;

-- Budgets: owners & estimators full access
create policy "budget_owner" on budgets
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('owner', 'estimator'))
  );

-- Clients can see approved/sent budgets for their projects
create policy "budget_client" on budgets
  for select using (
    status in ('sent', 'accepted', 'rejected')
    and exists (select 1 from projects where id = budgets.project_id and client_id = auth.uid())
  );

-- Cashflow: only owners
create policy "cashflow_owner" on cashflow
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );
