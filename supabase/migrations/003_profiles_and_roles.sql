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
