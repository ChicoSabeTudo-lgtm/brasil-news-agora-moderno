-- Criar bucket para posts sociais/Instagram
INSERT INTO storage.buckets (id, name, public) 
VALUES ('social-posts', 'social-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket social-posts
-- Permitir visualização pública
CREATE POLICY "Social posts images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'social-posts');

-- Permitir que redatores e admins façam upload
CREATE POLICY "Redators and admins can upload social posts images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'social-posts' 
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('redator', 'admin')
    )
  )
);

-- Permitir que redatores e admins deletem suas próprias imagens
CREATE POLICY "Redators and admins can delete their own social posts images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'social-posts' 
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('redator', 'admin')
    )
  )
);