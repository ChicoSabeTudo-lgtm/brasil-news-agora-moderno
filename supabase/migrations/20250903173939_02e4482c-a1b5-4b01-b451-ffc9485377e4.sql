-- Remover as políticas conflitantes restantes para news-images
DROP POLICY IF EXISTS "Authenticated users can delete news images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update news images" ON storage.objects;
DROP POLICY IF EXISTS "news_images_public_select" ON storage.objects;

-- Criar as políticas corretas para news-images
CREATE POLICY "news_images_public_select" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "news_images_approved_upload" 
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

CREATE POLICY "news_images_approved_update" 
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

CREATE POLICY "news_images_approved_delete" 
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