-- Contacts (clients/suppliers) and link to transactions
do $$ begin
  create type public.finance_contact_type as enum ('cliente','fornecedor');
exception when duplicate_object then null; end $$;

create table if not exists public.finance_contacts (
  id uuid primary key default gen_random_uuid(),
  type public.finance_contact_type not null,
  name text not null,
  document text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_transactions
  add column if not exists contact_id uuid references public.finance_contacts(id) on delete set null;

create index if not exists idx_finance_contacts_type on public.finance_contacts(type);
create index if not exists idx_finance_transactions_contact on public.finance_transactions(contact_id);

alter table public.finance_contacts enable row level security;

do $$ begin
  create policy "finance contacts read" on public.finance_contacts for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "finance contacts write" on public.finance_contacts for all to authenticated using (
    public.has_role('admin') or public.has_role('redator')
  ) with check (
    public.has_role('admin') or public.has_role('redator')
  );
exception when duplicate_object then null; end $$;

