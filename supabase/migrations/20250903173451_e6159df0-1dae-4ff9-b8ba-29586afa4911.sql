-- Limpar políticas conflitantes do bucket news-images e implementar políticas corretas

-- Primeiro, remover todas as políticas existentes para o bucket news-images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images to news-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Redators and admins can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "News images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "news-images-auth-upload" ON storage.objects;
DROP POLICY IF EXISTS "news-images-public-read" ON storage.objects;

-- Criar políticas específicas e consistentes para o bucket news-images

-- Política para visualização pública das imagens
CREATE POLICY "News images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

-- Política para upload - apenas redatores e admins aprovados
CREATE POLICY "Redators and admins can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'news-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'redator'::app_role)
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND access_revoked = false
  )
);

-- Política para atualização - apenas redatores e admins aprovados
CREATE POLICY "Redators and admins can update news images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'news-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'redator'::app_role)
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND access_revoked = false
  )
);

-- Política para exclusão - apenas redatores e admins aprovados
CREATE POLICY "Redators and admins can delete news images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'news-images' 
  AND auth.uid() IS NOT NULL
  AND (
    public.has_role(auth.uid(), 'admin'::app_role) 
    OR public.has_role(auth.uid(), 'redator'::app_role)
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND access_revoked = false
  )
);