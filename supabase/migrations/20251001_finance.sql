-- Finance schema: projects, categories, transactions, attachments
-- Enums
do $$ begin
  create type public.finance_tx_type as enum ('receita','despesa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.finance_tx_status as enum ('Pendente','Pago','Atrasado');
exception when duplicate_object then null; end $$;

-- Projects
create table if not exists public.finance_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories (by type)
create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.finance_tx_type not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions
create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  type public.finance_tx_type not null,
  description text not null,
  value numeric(12,2) not null check (value >= 0),
  due_date date not null,
  pay_date date,
  status public.finance_tx_status not null default 'Pendente',
  supplier text,
  project_id uuid references public.finance_projects(id) on delete set null,
  category_id uuid references public.finance_categories(id) on delete set null,
  method text,
  receipt_url text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_finance_transactions_due on public.finance_transactions(due_date);
create index if not exists idx_finance_transactions_type on public.finance_transactions(type);
create index if not exists idx_finance_transactions_status on public.finance_transactions(status);

-- Attachments
create table if not exists public.finance_attachments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.finance_transactions(id) on delete cascade,
  url text not null,
  path text,
  name text,
  mime_type text,
  size_bytes integer,
  created_at timestamptz not null default now()
);
create index if not exists idx_finance_attachments_tx on public.finance_attachments(transaction_id);

-- RLS policies
alter table public.finance_projects enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_attachments enable row level security;

-- Read for authenticated
do $$ begin
  create policy "finance read all" on public.finance_projects for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "finance read all c" on public.finance_categories for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "finance read all t" on public.finance_transactions for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "finance read all a" on public.finance_attachments for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- Write for admin or redator
do $$ begin
  create policy "finance write projects" on public.finance_projects for all to authenticated using (
    public.has_role('admin') or public.has_role('redator')
  ) with check (
    public.has_role('admin') or public.has_role('redator')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "finance write categories" on public.finance_categories for all to authenticated using (
    public.has_role('admin') or public.has_role('redator')
  ) with check (
    public.has_role('admin') or public.has_role('redator')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "finance write transactions" on public.finance_transactions for all to authenticated using (
    public.has_role('admin') or public.has_role('redator')
  ) with check (
    public.has_role('admin') or public.has_role('redator')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "finance write attachments" on public.finance_attachments for all to authenticated using (
    public.has_role('admin') or public.has_role('redator')
  ) with check (
    public.has_role('admin') or public.has_role('redator')
  );
exception when duplicate_object then null; end $$;

-- Storage bucket for attachments (public read)
insert into storage.buckets (id, name, public)
values ('finance-attachments','finance-attachments', true)
on conflict (id) do nothing;

-- Storage RLS (allow read to all, write to admin/redator)
do $$ begin
  create policy "finance bucket read" on storage.objects for select using (bucket_id = 'finance-attachments');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "finance bucket write" on storage.objects for insert to authenticated with check (
    bucket_id = 'finance-attachments' and (public.has_role('admin') or public.has_role('redator'))
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "finance bucket update" on storage.objects for update to authenticated using (
    bucket_id = 'finance-attachments' and (public.has_role('admin') or public.has_role('redator'))
  ) with check (
    bucket_id = 'finance-attachments'
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "finance bucket delete" on storage.objects for delete to authenticated using (
    bucket_id = 'finance-attachments' and (public.has_role('admin') or public.has_role('redator'))
  );
exception when duplicate_object then null; end $$;

