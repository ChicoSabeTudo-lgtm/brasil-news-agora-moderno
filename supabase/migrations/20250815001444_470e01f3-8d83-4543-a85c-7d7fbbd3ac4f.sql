-- Criar função para limpar posts sociais antigos (mais de 48 horas)
CREATE OR REPLACE FUNCTION public.cleanup_old_social_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Deletar posts publicados há mais de 48 horas
  DELETE FROM public.social_scheduled_posts 
  WHERE status = 'published' 
    AND published_at < now() - interval '48 hours';
  
  -- Deletar posts cancelados há mais de 48 horas
  DELETE FROM public.social_scheduled_posts 
  WHERE status = 'cancelled' 
    AND updated_at < now() - interval '48 hours';
    
  -- Deletar posts que falharam há mais de 48 horas
  DELETE FROM public.social_scheduled_posts 
  WHERE status = 'failed' 
    AND updated_at < now() - interval '48 horas';
END;
$$;