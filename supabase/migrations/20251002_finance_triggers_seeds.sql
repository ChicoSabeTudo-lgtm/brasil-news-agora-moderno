-- Helpers: updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach triggers
do $$ begin
  create trigger set_updated_at_projects
  before update on public.finance_projects
  for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_updated_at_categories
  before update on public.finance_categories
  for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_updated_at_transactions
  before update on public.finance_transactions
  for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_updated_at_contacts
  before update on public.finance_contacts
  for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- Seeds: Minimal defaults
insert into public.finance_projects (name)
values ('Portal'), ('Marketing')
on conflict do nothing;

insert into public.finance_categories (name, type)
values 
  ('Vendas', 'receita'),
  ('Patrocínio', 'receita'),
  ('Serviços', 'despesa'),
  ('Assinaturas', 'despesa'),
  ('Impostos', 'despesa')
on conflict do nothing;

