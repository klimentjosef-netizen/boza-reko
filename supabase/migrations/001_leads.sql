create table leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  reconstruction_type text,
  description text,
  calculator_result jsonb,
  created_at timestamptz default now(),
  status text default 'new'
);

alter table leads enable row level security;

create policy "insert_public" on leads for insert with check (true);
create policy "select_auth" on leads for select using (auth.role() = 'authenticated');
