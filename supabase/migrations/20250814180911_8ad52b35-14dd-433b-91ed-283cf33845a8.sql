-- Primeiro, verificar se pg_cron já está habilitado (deve estar conforme informado)
create extension if not exists pg_cron;

-- Adicionar colunas necessárias na tabela news
alter table public.news
  add column if not exists status text not null default 'draft',
  add column if not exists cron_job_id int;

-- Função que publica um post específico
create or replace function public.publish_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.news
     set is_published = true,
         published_at = now(),
         status = 'published',
         cron_job_id = null
   where id = p_post_id;
end;
$$;

-- Função que agenda publicação no pg_cron
create or replace function public.schedule_post_publish(p_post_id uuid, p_when timestamptz)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_interval interval;
  v_job_id int;
  v_old_job int;
  v_sql_command text;
begin
  -- Se já havia job, remove
  select cron_job_id into v_old_job from public.news where id = p_post_id;
  if v_old_job is not null then
    perform cron.unschedule(v_old_job);
  end if;

  -- Se a hora já passou, publica agora
  if p_when <= now() then
    perform public.publish_post(p_post_id);
    return;
  end if;

  v_interval := (p_when - now());
  
  -- Monta o comando SQL
  v_sql_command := 'select public.publish_post(''' || p_post_id::text || '''::uuid);';

  -- Agenda execução única
  select cron.schedule_in(
           'publish-post-' || p_post_id::text,
           v_interval,
           v_sql_command
         )
    into v_job_id;

  update public.news
     set status = 'scheduled',
         scheduled_publish_at = p_when,
         cron_job_id = v_job_id
   where id = p_post_id;
end;
$$;

-- Função para cancelar agendamento
create or replace function public.cancel_post_schedule(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old_job int;
begin
  select cron_job_id into v_old_job from public.news where id = p_post_id;
  if v_old_job is not null then
    perform cron.unschedule(v_old_job);
  end if;

  update public.news
     set status = 'draft',
         scheduled_publish_at = null,
         cron_job_id = null
   where id = p_post_id;
end;
$$;