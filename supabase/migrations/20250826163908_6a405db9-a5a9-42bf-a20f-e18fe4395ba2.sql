-- Verificar e corrigir as políticas RLS para social_scheduled_posts
-- Permitir que qualquer usuário autenticado veja os posts (não apenas redatores/admins)

-- Remover política restritiva atual para SELECT
DROP POLICY IF EXISTS "Redators and admins can view all social posts" ON public.social_scheduled_posts;

-- Criar nova política mais permissiva para SELECT
CREATE POLICY "Authenticated users can view social posts" ON public.social_scheduled_posts
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Verificar política para INSERT - ela deve estar correta, mas vamos recriar
DROP POLICY IF EXISTS "Redators and admins can insert social posts" ON public.social_scheduled_posts;

CREATE POLICY "Redators and admins can insert social posts" ON public.social_scheduled_posts
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY (ARRAY['redator'::app_role, 'admin'::app_role])
  )
);