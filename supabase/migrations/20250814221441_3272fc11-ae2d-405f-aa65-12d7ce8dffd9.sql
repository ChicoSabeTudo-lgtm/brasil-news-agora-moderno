-- Criar tabela para agendamento de posts sociais
CREATE TABLE public.social_scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'facebook', 'linkedin')),
  content TEXT NOT NULL,
  image_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  cron_job_id INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.social_scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Redators and admins can manage social posts" 
ON public.social_scheduled_posts 
FOR ALL 
USING (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Função para publicar post social agendado
CREATE OR REPLACE FUNCTION public.publish_social_post(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  -- Atualizar status para published
  UPDATE public.social_scheduled_posts
  SET status = 'published',
      published_at = now(),
      cron_job_id = null
  WHERE id = p_post_id;
  
  -- Aqui seria onde chamamos a edge function para fazer o post
  -- Por enquanto só atualizamos o status
end;
$$;

-- Função para agendar publicação social
CREATE OR REPLACE FUNCTION public.schedule_social_post(p_post_id uuid, p_when timestamp with time zone)
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
  v_job_id int;
begin
  -- Se já havia job, remove
  select cron_job_id into v_old_job from public.social_scheduled_posts where id = p_post_id;
  if v_old_job is not null then
    perform cron.unschedule(v_old_job);
  end if;

  -- Se a hora já passou, publica agora
  if p_when <= now() then
    perform public.publish_social_post(p_post_id);
    return;
  end if;

  -- Monta o comando SQL
  v_sql_command := 'SELECT public.publish_social_post(''' || p_post_id::text || '''::uuid);';
  
  -- Cria nome único para o job
  v_job_name := 'publish-social-' || p_post_id::text;
  
  -- Extrai componentes da data/hora para criar expressão cron
  v_cron_expression := 
    EXTRACT(MINUTE FROM p_when)::text || ' ' ||
    EXTRACT(HOUR FROM p_when)::text || ' ' ||
    EXTRACT(DAY FROM p_when)::text || ' ' ||
    EXTRACT(MONTH FROM p_when)::text || ' *';

  -- Agenda execução usando cron.schedule
  SELECT cron.schedule(v_job_name, v_cron_expression, v_sql_command) INTO v_job_id;

  -- Atualiza o post social com o job_id
  UPDATE public.social_scheduled_posts
  SET cron_job_id = v_job_id,
      updated_at = now()
  WHERE id = p_post_id;
end;
$$;

-- Função para cancelar agendamento social
CREATE OR REPLACE FUNCTION public.cancel_social_schedule(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare 
  v_old_job int;
begin
  select cron_job_id into v_old_job from public.social_scheduled_posts where id = p_post_id;
  if v_old_job is not null then
    perform cron.unschedule(v_old_job);
  end if;

  update public.social_scheduled_posts
  set status = 'cancelled',
      cron_job_id = null,
      updated_at = now()
  where id = p_post_id;
end;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_social_scheduled_posts_updated_at
BEFORE UPDATE ON public.social_scheduled_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();