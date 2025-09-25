-- Corrigir permissões para redatores poderem editar notícias de outras pessoas
-- Remover a política restritiva atual
DROP POLICY IF EXISTS "Redators can update their own news, admins can update all" ON public.news;

-- Criar nova política que permite redatores editar todas as notícias
CREATE POLICY "Redators and admins can update all news" 
ON public.news 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);

-- Também permitir que redatores excluam notícias (se necessário)
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;

CREATE POLICY "Redators and admins can delete news" 
ON public.news 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);

