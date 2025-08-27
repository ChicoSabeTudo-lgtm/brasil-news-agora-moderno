-- Corrigir políticas RLS para social_scheduled_posts usando a função has_role()
-- Isso deve resolver os problemas de inserção e visualização

-- Remover todas as políticas atuais
DROP POLICY IF EXISTS "Authenticated users can view social posts" ON public.social_scheduled_posts;
DROP POLICY IF EXISTS "Redators and admins can view all social posts" ON public.social_scheduled_posts;
DROP POLICY IF EXISTS "Redators and admins can insert social posts" ON public.social_scheduled_posts;
DROP POLICY IF EXISTS "Redators and admins can update social posts" ON public.social_scheduled_posts;
DROP POLICY IF EXISTS "Redators and admins can delete social posts" ON public.social_scheduled_posts;

-- Criar políticas usando a função has_role() para evitar problemas de recursão
CREATE POLICY "Authenticated users can view social posts" ON public.social_scheduled_posts
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Redators and admins can insert social posts" ON public.social_scheduled_posts
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'redator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Redators and admins can update social posts" ON public.social_scheduled_posts
FOR UPDATE 
USING (
  has_role(auth.uid(), 'redator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Redators and admins can delete social posts" ON public.social_scheduled_posts
FOR DELETE 
USING (
  has_role(auth.uid(), 'redator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);