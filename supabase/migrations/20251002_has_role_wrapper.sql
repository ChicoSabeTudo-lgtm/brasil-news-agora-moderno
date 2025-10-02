-- Provide a one-argument wrapper for has_role to match policies that call public.has_role('admin')
do $$ begin
  create or replace function public.has_role(_role public.app_role)
  returns boolean
  language sql
  stable
  as $$
    select public.has_role(auth.uid(), _role);
  $$;
end $$;

