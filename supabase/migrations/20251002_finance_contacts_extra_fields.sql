-- Extra optional fields for contacts UI
alter table public.finance_contacts
  add column if not exists company text,
  add column if not exists contact_person text;

