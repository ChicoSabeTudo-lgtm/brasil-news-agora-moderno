-- Primeiro vamos verificar se o bucket news-images tem RLS habilitado
-- E criar uma política mais permissiva para testar

-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Allow public read access to news images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own news images" ON storage.objects;  
DROP POLICY IF EXISTS "Allow users to delete their own news images" ON storage.objects;

-- Criar política mais simples e permissiva para o bucket news-images
CREATE POLICY "news-images-public-read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "news-images-auth-upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images');

CREATE POLICY "news-images-auth-update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images');

CREATE POLICY "news-images-auth-delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images');