-- ===============================================
-- CORREÇÕES DE PERMISSÕES PARA REDATORES
-- ===============================================
-- Execute este script no SQL Editor do Supabase
-- para permitir que redatores editem notícias de outras pessoas

-- 1. Remover política restritiva atual de UPDATE
DROP POLICY IF EXISTS "Redators can update their own news, admins can update all" ON public.news;

-- 2. Criar nova política que permite redatores editar todas as notícias
CREATE POLICY "Redators and admins can update all news" 
ON public.news 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);

-- 3. Remover política restritiva de DELETE
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;

-- 4. Criar nova política que permite redatores excluir notícias
CREATE POLICY "Redators and admins can delete news" 
ON public.news 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'news' 
ORDER BY policyname;

-- ===============================================
-- RESULTADO ESPERADO:
-- ===============================================
-- Você deve ver as seguintes políticas:
-- - "Redators and admins can update all news" (UPDATE)
-- - "Redators and admins can delete news" (DELETE)
-- - "News are publicly viewable when published" (SELECT)
-- - "Authenticated users can view all news" (SELECT)
-- - "Redators and admins can create news" (INSERT)
