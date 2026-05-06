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
