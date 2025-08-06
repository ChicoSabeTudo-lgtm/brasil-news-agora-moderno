-- Criar políticas para o bucket news-images permitir uploads de usuários autenticados

-- Política para permitir visualização de imagens (leitura)
CREATE POLICY "Allow public read access to news images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

-- Política para permitir upload de imagens por usuários autenticados
CREATE POLICY "Allow authenticated users to upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Allow users to update their own news images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários deletem suas próprias imagens
CREATE POLICY "Allow users to delete their own news images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'news-images' 
  AND auth.role() = 'authenticated'
);