-- Drop the existing function first
DROP FUNCTION IF EXISTS public.schedule_post_publish(uuid, timestamp with time zone);

-- Create the corrected function that uses pg_cron properly
CREATE OR REPLACE FUNCTION public.schedule_post_publish(p_post_id uuid, p_when timestamp with time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_old_job int;
  v_sql_command text;
  v_cron_expression text;
  v_job_name text;
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

  -- Monta o comando SQL
  v_sql_command := 'SELECT public.publish_post(''' || p_post_id::text || '''::uuid);';
  
  -- Cria nome único para o job
  v_job_name := 'publish-post-' || p_post_id::text;
  
  -- Extrai componentes da data/hora para criar expressão cron
  v_cron_expression := 
    EXTRACT(MINUTE FROM p_when)::text || ' ' ||
    EXTRACT(HOUR FROM p_when)::text || ' ' ||
    EXTRACT(DAY FROM p_when)::text || ' ' ||
    EXTRACT(MONTH FROM p_when)::text || ' *';

  -- Agenda execução usando cron.schedule
  INSERT INTO cron.job (schedule, command, nodename, nodeport, database, username, active, jobname)
  VALUES (
    v_cron_expression,
    v_sql_command,
    'localhost',
    5432,
    current_database(),
    current_user,
    true,
    v_job_name
  );

  -- Pega o job_id que foi criado
  SELECT jobid INTO v_old_job FROM cron.job WHERE jobname = v_job_name ORDER BY jobid DESC LIMIT 1;

  -- Atualiza a notícia com o status e job_id
  UPDATE public.news
  SET status = 'scheduled',
      scheduled_publish_at = p_when,
      cron_job_id = v_old_job
  WHERE id = p_post_id;
end;
$$;