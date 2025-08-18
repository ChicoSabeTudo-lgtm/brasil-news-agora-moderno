-- Verificar se as funções has_role estão funcionando corretamente
-- e melhorar as políticas RLS da tabela social_scheduled_posts

-- Primeiro, vamos verificar se a função has_role está definida corretamente
-- e garantir que as políticas estão usando auth.uid() corretamente

-- Atualizar políticas RLS para serem mais específicas
DROP POLICY IF EXISTS "Redators and admins can view all social posts" ON public.social_scheduled_posts;
DROP POLICY IF EXISTS "Redators and admins can insert social posts" ON public.social_scheduled_posts;
DROP POLICY IF EXISTS "Redators and admins can update social posts" ON public.social_scheduled_posts;
DROP POLICY IF EXISTS "Redators and admins can delete social posts" ON public.social_scheduled_posts;

-- Recriar políticas com verificação mais robusta
CREATE POLICY "Redators and admins can view all social posts" 
ON public.social_scheduled_posts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
);

CREATE POLICY "Redators and admins can insert social posts" 
ON public.social_scheduled_posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
);

CREATE POLICY "Redators and admins can update social posts" 
ON public.social_scheduled_posts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
);

CREATE POLICY "Redators and admins can delete social posts" 
ON public.social_scheduled_posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
);