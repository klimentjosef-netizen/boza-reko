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
