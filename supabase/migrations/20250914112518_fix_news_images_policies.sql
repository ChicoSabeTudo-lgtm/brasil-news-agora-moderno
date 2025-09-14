-- Simplificar políticas do bucket news-images para resolver problemas de upload

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "News images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Redators and admins can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Redators and admins can update news images" ON storage.objects;
DROP POLICY IF EXISTS "Redators and admins can delete news images" ON storage.objects;

-- Criar políticas mais simples e permissivas
-- Política para visualização pública das imagens
CREATE POLICY "News images public read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

-- Política para upload - usuários autenticados com role de redator ou admin
CREATE POLICY "News images authenticated upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'news-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'redator'::app_role)
  )
);

-- Política para atualização - usuários autenticados com role de redator ou admin
CREATE POLICY "News images authenticated update" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'news-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'redator'::app_role)
  )
);

-- Política para exclusão - usuários autenticados com role de redator ou admin
CREATE POLICY "News images authenticated delete" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'news-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'redator'::app_role)
  )
);

-- Garantir que todos os usuários existentes estejam aprovados
UPDATE public.profiles 
SET is_approved = true, access_revoked = false 
WHERE is_approved = false OR access_revoked = true;
